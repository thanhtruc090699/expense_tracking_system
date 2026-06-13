import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Plus, Upload, Search } from "lucide-react";
import { getToken } from "../auth";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

interface Merchant {
  id: string;
  name: string;
}

export default function NavBar() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [repeat, setRepeat] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showAddExpense && activeTab === "manual") {
      fetchMerchants();
      prefillDateTime();
    }
  }, [showAddExpense, activeTab]);

  useEffect(() => {
    if (!merchantName.trim()) {
      setFilteredMerchants([]);
      setShowDropdown(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      const query = merchantName.toLowerCase().trim();
      const matches = merchants.filter((m) =>
        m.name.toLowerCase().includes(query)
      );
      
      const exactMatch = matches.find(
        (m) => m.name.toLowerCase() === query
      );

      setFilteredMerchants(matches.slice(0, 5));
      setShowDropdown(true);

      if (!exactMatch && query.length > 0) {
        setShowDropdown(true);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [merchantName, merchants]);

  const fetchMerchants = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMerchants(data);
      }
    } catch (err) {
      console.error("Failed to fetch merchants:", err);
    }
  };

  const prefillDateTime = () => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().slice(0, 5));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setScanError(null);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleScanFile = async () => {
    if (!selectedFile) {
      setScanError("Please select a file first");
      return;
    }

    const token = getToken();
    if (!token) {
      setScanError("Not authenticated. Please log in.");
      return;
    }

    setScanning(true);
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("lang", "eng");
      formData.append("psm", "6");
      formData.append("oem", "1");
      formData.append("min_conf", "30");
      formData.append("pdf_mode", "auto");

      const response = await fetch(
        `${ALLOWED_HOST}:3000/ocr/process-invoice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.ok && result.data) {
        setShowAddExpense(false);
        navigate("/expenses");
      } else {
        setScanError("Failed to process invoice");
      }
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Failed to scan invoice"
      );
    } finally {
      setScanning(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setMerchantName(merchant.name);
    setSelectedMerchantId(merchant.id);
    setShowDropdown(false);
  };

  const handleMerchantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMerchantName(e.target.value);
    setSelectedMerchantId(null);
  };

  const handleMerchantInputFocus = () => {
    if (merchantName.trim()) {
      setShowDropdown(true);
    }
  };

  const handleManualSave = async () => {
    const amountValue = parseFloat(amount.replace(",", "."));

    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setManualError("Please enter a valid amount");
      return;
    }

    if (!date) {
      setManualError("Please select a date");
      return;
    }

    const token = getToken();
    if (!token) {
      setManualError("Not authenticated. Please log in.");
      return;
    }

    setManualSaving(true);
    setManualError(null);

    try {
      const expenseDateTime = time ? `${date}T${time}` : date;

      let merchantId: string | undefined;

      if (selectedMerchantId) {
        merchantId = selectedMerchantId;
      } else if (merchantName.trim()) {
        try {
          const merchantRes = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: merchantName.trim() }),
          });

          if (merchantRes.ok) {
            const merchantData = await merchantRes.json();
            merchantId = merchantData.id;
            fetchMerchants();
          }
        } catch (err) {
          console.error("Failed to create merchant, continuing without:", err);
        }
      }

      const expensePayload = {
        totalAmount: amountValue,
        expenseDate: expenseDateTime,
        isRecurring: repeat,
        note: description || undefined,
        ...(merchantId && { merchantId }),
      };

      const expenseRes = await fetch(`${ALLOWED_HOST}:3000/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expensePayload),
      });

      if (!expenseRes.ok) {
        const errorData = await expenseRes.json();
        throw new Error(errorData.message || "Failed to create expense");
      }

      setShowAddExpense(false);
      resetForm();
      navigate("/expenses");
    } catch (err) {
      setManualError(
        err instanceof Error ? err.message : "Failed to save expense"
      );
    } finally {
      setManualSaving(false);
    }
  };

  const resetForm = () => {
    setMerchantName("");
    setDate("");
    setTime("");
    setAmount("");
    setDescription("");
    setRepeat(false);
    setSelectedMerchantId(null);
    setFilteredMerchants([]);
    setShowDropdown(false);
    setManualError(null);
  };

  const hasExactMerchantMatch = () => {
    const query = merchantName.toLowerCase().trim();
    return merchants.some((m) => m.name.toLowerCase() === query);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[79px] z-[999]">
        <svg
          viewBox="0 0 375 79"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M188 55C207.882 55 224 38.8823 224 19C224 17.0988 223.853 15.2321 223.569 13.4105C222.602 7.20823 226.711 0 222.988 0H367C371.418 0 375 3.58172 375 8V79H0V8C0 3.58172 3.58172 0 8 0H143.012C149.289 0 153.398 7.20824 152.431 13.4105C152.147 15.2321 152 17.0988 152 19C152 38.8823 168.118 55 188 55Z"
            fill="#FCFCFC"
            className="dark:fill-[#1e1e1e]"
          />
        </svg>

        <div className="relative z-10 h-full flex items-end pb-3 px-7">
          <div className="flex w-full items-end justify-between">
            <NavLink
              to="/dashboard"
              className="flex flex-col items-center gap-0.5 min-w-[40px] group"
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M27.67 13.56L25.67 11.74L18 4.78001C17.45 4.28806 16.7379 4.01608 16 4.01608C15.2621 4.01608 14.55 4.28806 14 4.78001L6.35 11.78L4.35 13.6C4.21533 13.7367 4.12281 13.9092 4.08348 14.097C4.04415 14.2847 4.05967 14.4799 4.12819 14.6591C4.19671 14.8383 4.31534 14.994 4.46992 15.1077C4.6245 15.2213 4.80851 15.2881 5 15.3C5.25329 15.2886 5.49278 15.1813 5.67 15L6 14.7V25C6 25.7957 6.31607 26.5587 6.87868 27.1213C7.44129 27.6839 8.20435 28 9 28H23C23.7957 28 24.5587 27.6839 25.1213 27.1213C25.6839 26.5587 26 25.7957 26 25V14.74L26.33 15.04C26.5134 15.2067 26.7522 15.2994 27 15.3C27.2016 15.2995 27.3984 15.238 27.5645 15.1237C27.7305 15.0094 27.8582 14.8475 27.9306 14.6594C28.0031 14.4712 28.0169 14.2655 27.9704 14.0694C27.9239 13.8732 27.8192 13.6956 27.67 13.56Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
              </svg>
              <span className="text-[10px] font-medium text-[#C6C6C6] group-[.active]:text-brand-green dark:text-gray-500 dark:group-[.active]:text-white">
                Home
              </span>
            </NavLink>

            <NavLink
              to="/expenses"
              className="flex flex-col items-center gap-0.5 min-w-[40px] group"
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M20.13 17.93V18.93C20.13 19.5866 20.0007 20.2368 19.7494 20.8434C19.4981 21.45 19.1298 22.0012 18.6655 22.4655C18.2013 22.9298 17.6501 23.2981 17.0434 23.5494C16.4368 23.8007 15.7866 23.93 15.13 23.93H11.87C11.8546 24.4769 11.6899 25.0091 11.3938 25.4692C11.0977 25.9292 10.6814 26.2995 10.19 26.54C9.78018 26.7448 9.32816 26.8509 8.87001 26.85C8.19228 26.854 7.53316 26.6284 7.00001 26.21L3.29001 23.3C2.92868 23.0196 2.63625 22.6602 2.43508 22.2495C2.23392 21.8387 2.12933 21.3874 2.12933 20.93C2.12933 20.4726 2.23392 20.0213 2.43508 19.6105C2.63625 19.1998 2.92868 18.8404 3.29001 18.56L7.00001 15.65C7.44701 15.2933 7.98666 15.0717 8.55539 15.0115C9.12411 14.9512 9.6982 15.0548 10.21 15.31C10.8915 15.636 11.4164 16.2184 11.67 16.93H19.1C19.2338 16.926 19.3671 16.9489 19.4919 16.9973C19.6167 17.0458 19.7305 17.1188 19.8266 17.2121C19.9227 17.3053 19.999 17.4169 20.0511 17.5403C20.1032 17.6636 20.1301 17.7961 20.13 17.93Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
                <path
                  d="M29.87 11.07C29.8701 11.5273 29.7656 11.9786 29.5646 12.3894C29.3635 12.8002 29.0712 13.1595 28.71 13.44L25 16.35C24.4594 16.7701 23.7946 16.9987 23.11 17C22.6519 17.0009 22.1999 16.8948 21.79 16.69C21.1085 16.364 20.5836 15.7817 20.33 15.07H12.87C12.6048 15.07 12.3505 14.9647 12.1629 14.7771C11.9754 14.5896 11.87 14.3352 11.87 14.07V13.07C11.87 11.7439 12.3968 10.4722 13.3345 9.53448C14.2722 8.5968 15.5439 8.07001 16.87 8.07001H20.13C20.1422 7.51096 20.3104 6.96644 20.6156 6.4979C20.9208 6.02935 21.3509 5.65543 21.8573 5.41834C22.3637 5.18124 22.9263 5.0904 23.4817 5.15608C24.037 5.22175 24.5629 5.44132 25 5.79001L28.71 8.70001C29.0712 8.98051 29.3635 9.33987 29.5646 9.75063C29.7656 10.1614 29.8701 10.6127 29.87 11.07Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
              </svg>
              <span className="text-[10px] font-medium text-[#C6C6C6] group-[.active]:text-brand-green dark:text-gray-500 dark:group-[.active]:text-white">
                Transaction
              </span>
            </NavLink>

            <div className="flex flex-col items-center" style={{ marginBottom: 22, marginRight: 10 }}>
              <button
                onClick={() => setShowAddExpense(true)}
                className="w-14 h-14 rounded-full flex items-center justify-center bg-brand-green hover:bg-[#1a4522] transition-transform hover:scale-106 shadow-lg"
                aria-label="Add transaction"
              >
                <Plus size={28} strokeWidth={2.5} className="text-white" />
              </button>
            </div>

            <NavLink
              to="/budgets"
              className="flex flex-col items-center gap-0.5 min-w-[40px] group"
            >
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M28 15H17V4C19.8412 4.22837 22.5083 5.46063 24.5239 7.47614C26.5394 9.49166 27.7716 12.1588 28 15Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
                <path
                  d="M28 17C27.801 19.2756 26.9566 21.4471 25.566 23.2594C24.1754 25.0716 22.2965 26.4493 20.15 27.2306C18.0035 28.0119 15.6786 28.1643 13.4484 27.6699C11.2183 27.1755 9.1756 26.0549 7.56038 24.4396C5.94515 22.8244 4.82449 20.7817 4.33009 18.5516C3.83569 16.3214 3.98809 13.9965 4.76938 11.85C5.55067 9.7035 6.92839 7.82457 8.74065 6.43401C10.5529 5.04346 12.7244 4.19905 15 4V16C15 16.2652 15.1054 16.5196 15.2929 16.7071C15.4804 16.8946 15.7348 17 16 17H28Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
              </svg>
              <span className="text-[10px] font-medium text-[#C6C6C6] group-[.active]:text-brand-green dark:text-gray-500 dark:group-[.active]:text-white">
                Budget
              </span>
            </NavLink>

            <NavLink
              to="/analytics"
              className="flex flex-col items-center gap-0.5 min-w-[40px] group"
            >
              <svg width="27" height="27" viewBox="0 0 27 27" fill="none">
                <path
                  d="M1.6875 18.5625C1.6875 18.1149 1.86529 17.6857 2.18176 17.3693C2.49822 17.0528 2.92745 16.875 3.375 16.875H6.75C7.19755 16.875 7.62677 17.0528 7.94324 17.3693C8.25971 17.6857 8.4375 18.1149 8.4375 18.5625V23.625C8.4375 24.0726 8.25971 24.5018 7.94324 24.8182C7.62677 25.1347 7.19755 25.3125 6.75 25.3125H3.375C2.92745 25.3125 2.49822 25.1347 2.18176 24.8182C1.86529 24.5018 1.6875 24.0726 1.6875 23.625V18.5625ZM10.125 11.8125C10.125 11.3649 10.3028 10.9357 10.6193 10.6193C10.9357 10.3028 11.3649 10.125 11.8125 10.125H15.1875C15.6351 10.125 16.0643 10.3028 16.3807 10.6193C16.6972 10.9357 16.875 11.3649 16.875 11.8125V23.625C16.875 24.0726 16.6972 24.5018 16.3807 24.8182C16.0643 25.1347 15.6351 25.3125 15.1875 25.3125H11.8125C11.3649 25.3125 10.9357 25.1347 10.6193 24.8182C10.3028 24.5018 10.125 24.0726 10.125 23.625V11.8125ZM18.5625 3.375C18.5625 2.92745 18.7403 2.49822 19.0568 2.18176C19.3732 1.86529 19.8024 1.6875 20.25 1.6875H23.625C24.0726 1.6875 24.5018 1.86529 24.8182 2.18176C25.1347 2.49822 25.3125 2.92745 25.3125 3.375V23.625C25.3125 24.0726 25.1347 24.5018 24.8182 24.8182C24.5018 25.1347 24.0726 25.3125 23.625 25.3125H20.25C19.8024 25.3125 19.3732 25.1347 19.0568 24.8182C18.7403 24.5018 18.5625 24.0726 18.5625 23.625V3.375Z"
                  className="fill-[#C6C6C6] group-[.active]:fill-brand-green dark:group-[.active]:fill-white"
                />
              </svg>
              <span className="text-[10px] font-medium text-[#C6C6C6] group-[.active]:text-brand-green dark:text-gray-500 dark:group-[.active]:text-white">
                Analytics
              </span>
            </NavLink>
          </div>
        </div>
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-[9999]">
          <div className="relative w-full max-w-[430px] bg-white dark:bg-[#1e1e1e] rounded-[28px] p-4 m-4">
            <div className="w-[38px] h-1 bg-[#8b8b96] rounded-full mx-auto mb-4" />

            <div className="bg-[#f1f0f8] dark:bg-[#2a2a2a] rounded-full p-1 flex mb-8">
              <button
                className={`flex-1 py-3 px-4 rounded-full font-bold transition-all ${
                  activeTab === "scan"
                    ? "bg-brand-green text-white shadow-md"
                    : "text-brand-green dark:text-white"
                }`}
                onClick={() => setActiveTab("scan")}
              >
                Receipt Scan
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-full font-bold transition-all ${
                  activeTab === "manual"
                    ? "bg-brand-green text-white shadow-md"
                    : "text-brand-green dark:text-white"
                }`}
                onClick={() => setActiveTab("manual")}
              >
                Manual Entry
              </button>
            </div>

            {activeTab === "scan" && (
              <>
                <div className="border-2 border-dashed border-[#d6d9e3] dark:border-gray-600 rounded-xl h-[220px] flex flex-col items-center justify-center text-[#2c3340] dark:text-gray-200 gap-2.5">
                  <div className="w-[58px] h-[58px] rounded-full bg-[#eef0f5] dark:bg-gray-700 flex items-center justify-center text-[#667085] dark:text-gray-300">
                    <Upload size={30} />
                  </div>
                  <h3 className="font-semibold">Drag and drop files here</h3>
                  <p className="text-sm">or</p>
                  <button
                    className="text-[#667085] dark:text-gray-300 bg-white dark:bg-[#1e1e1e] border border-[#ddd] dark:border-gray-600 rounded px-3.5 py-2 text-sm"
                    onClick={handleBrowseClick}
                    disabled={scanning}
                  >
                    Browse Files
                  </button>
                  {selectedFile && (
                    <small className="text-[#2d5b2d] dark:text-green-400 mt-2">
                      Selected: {selectedFile.name}
                    </small>
                  )}
                  <small className="text-xs text-gray-500">
                    Upload up to 5 files (max 10MB each)
                  </small>
                </div>

                {scanError && (
                  <div className="m-3 p-2.5 bg-[#ffe6e6] dark:bg-red-900/30 text-[#cc0000] dark:text-red-400 rounded text-sm">
                    {scanError}
                  </div>
                )}

                <button
                  className="block mx-auto mt-7 w-[180px] h-[60px] bg-brand-green text-white rounded-xl text-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  onClick={handleScanFile}
                  disabled={scanning || !selectedFile}
                >
                  {scanning ? "Processing..." : "Scan File"}
                </button>
              </>
            )}

            {activeTab === "manual" && (
              <>
                <div className="bg-white dark:bg-[#2a2a2a] rounded-3xl p-3.5 shadow-lg">
                  <input
                    className="w-full h-[54px] border border-[#edf0f7] dark:border-gray-600 rounded-xl px-5 text-lg mb-2 bg-white dark:bg-[#1e1e1e] text-[#20242b] dark:text-white placeholder:text-[#9498a8]"
                    placeholder="Amount €"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="relative mb-2">
                    <div className="relative">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9498a8]"
                        size={20}
                      />
                      <input
                        className="w-full h-[54px] border border-[#edf0f7] dark:border-gray-600 rounded-xl pl-12 pr-5 text-lg bg-white dark:bg-[#1e1e1e] text-[#20242b] dark:text-white placeholder:text-[#9498a8]"
                        placeholder="Merchant name"
                        value={merchantName}
                        onChange={handleMerchantInputChange}
                        onFocus={handleMerchantInputFocus}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                      />
                    </div>

                    {showDropdown && filteredMerchants.length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#2a2a2a] border border-[#edf0f7] dark:border-gray-600 rounded-xl shadow-lg overflow-hidden z-50">
                        {filteredMerchants.map((merchant) => (
                          <button
                            key={merchant.id}
                            className="w-full px-5 py-3 text-left hover:bg-[#f1f0f8] dark:hover:bg-[#3a3a3a] flex items-center justify-between"
                            onClick={() => handleMerchantSelect(merchant)}
                          >
                            <span className="text-[#20242b] dark:text-white">
                              {merchant.name}
                            </span>
                            {selectedMerchantId === merchant.id && (
                              <span className="text-brand-green">✓</span>
                            )}
                          </button>
                        ))}
                        {!hasExactMerchantMatch() && (
                          <button
                            className="w-full px-5 py-3 text-left hover:bg-[#f1f0f8] dark:hover:bg-[#3a3a3a] border-t border-[#edf0f7] dark:border-gray-600"
                            onClick={() => setSelectedMerchantId(null)}
                          >
                            <span className="text-[#20242b] dark:text-white">
                              Create new: <strong>{merchantName}</strong>
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3.5 text-[#9498a8]">
                    <input
                      className="flex-1 h-[54px] border border-[#edf0f7] dark:border-gray-600 rounded-xl px-5 text-lg bg-white dark:bg-[#1e1e1e] text-[#20242b] dark:text-white"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                    <input
                      className="flex-1 h-[54px] border border-[#edf0f7] dark:border-gray-600 rounded-xl px-5 text-lg bg-white dark:bg-[#1e1e1e] text-[#20242b] dark:text-white"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>

                  <input
                    className="w-full h-[54px] border border-[#edf0f7] dark:border-gray-600 rounded-xl px-5 text-lg mt-2 bg-white dark:bg-[#1e1e1e] text-[#20242b] dark:text-white placeholder:text-[#9498a8]"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <strong className="text-lg">Repeat</strong>
                      <p className="text-[#9498a8] text-sm m-0">
                        Repeat transaction
                      </p>
                    </div>
                    <button
                      className={`w-14 h-[30px] rounded-full p-[3px] transition-colors ${
                        repeat ? "bg-brand-green" : "bg-[#cfcfcf] dark:bg-gray-600"
                      }`}
                      onClick={() => setRepeat(!repeat)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition-transform ${
                          repeat ? "translate-x-[26px]" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {manualError && (
                  <div className="m-3 p-2.5 bg-[#ffe6e6] dark:bg-red-900/30 text-[#cc0000] dark:text-red-400 rounded text-sm">
                    {manualError}
                  </div>
                )}

                <button
                  className="block mx-auto mt-7 w-[180px] h-[60px] bg-brand-green text-white rounded-xl text-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  onClick={handleManualSave}
                  disabled={manualSaving}
                >
                  {manualSaving ? "Saving..." : "Save"}
                </button>
              </>
            )}

            <button
              className="block mx-auto mt-4 text-[#777] dark:text-gray-400 bg-transparent border-none cursor-pointer"
              onClick={() => setShowAddExpense(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
