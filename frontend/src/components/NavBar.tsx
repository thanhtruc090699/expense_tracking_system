import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import { getToken } from "../auth";

import {
  House,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Plus,
  Upload,
} from "lucide-react";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Health",
  "Entertainment",
  "Bills",
  "Other",
];

export default function NavBar() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [repeat, setRepeat] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setScanError(null);
  };

  const handleScanFile = async () => {
    if (!selectedFile) {
      setScanError('Please select a file first');
      return;
    }

    const token = getToken();
    if (!token) {
      setScanError('Not authenticated. Please log in.');
      return;
    }

    setScanning(true);
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('lang', 'eng');
      formData.append('psm', '6');
      formData.append('oem', '1');
      formData.append('min_conf', '30');
      formData.append('pdf_mode', 'auto');

      const response = await fetch(`${ALLOWED_HOST}:3000/ocr/process-invoice`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.ok && result.data) {
        setShowAddExpense(false);
        navigate('/expenses');
      } else {
        setScanError('Failed to process invoice');
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Failed to scan invoice');
    } finally {
      setScanning(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="bottom-nav-wrapper">
        <svg className="nav-bg" viewBox="0 0 460 80" preserveAspectRatio="none">
          <path
            d="M 24,0 L 190,0 C 200,0 202,4 205,10 C 212,28 226,40 230,40 C 234,40 248,28 255,10 C 258,4 260,0 270,0 L 436,0 C 449,0 460,11 460,24 L 460,56 C 460,69 449,80 436,80 L 24,80 C 11,80 0,69 0,56 L 0,24 C 0,11 11,0 24,0 Z"
            fill="white"
          />
        </svg>

        <div className="bottom-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <House size={26} strokeWidth={2} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <ArrowLeftRight size={24} />
            <span>Transaction</span>
          </NavLink>

          <button
            className="add-btn"
            type="button"
            onClick={() => setShowAddExpense(true)}
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>

          <NavLink
            to="/budgets"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <PieChart size={24} />
            <span>Budget</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <BarChart3 size={24} />
            <span>Analytics</span>
          </NavLink>
        </div>
      </div>

      {showAddExpense && (
        <div className="expense-overlay">
          <div className="expense-sheet">
            <div className="sheet-handle" />

            <div className="expense-tabs">
              <button
                className={activeTab === "scan" ? "tab active-tab" : "tab"}
                type="button"
                onClick={() => setActiveTab("scan")}
              >
                Receipt Scan
              </button>

              <button
                className={activeTab === "manual" ? "tab active-tab" : "tab"}
                type="button"
                onClick={() => setActiveTab("manual")}
              >
                Manual Entry
              </button>
            </div>

            {activeTab === "scan" && (
              <>
                <div className="upload-box">
                  <div className="upload-icon">
                    <Upload size={30} />
                  </div>

                  <h3>Drag and drop files here</h3>
                  <p>or</p>

                  <button 
                    className="browse-btn" 
                    type="button"
                    onClick={handleBrowseClick}
                    disabled={scanning}
                  >
                    Browse Files
                  </button>

                  {selectedFile && (
                    <small style={{ color: '#2d5b2d', marginTop: '8px' }}>
                      Selected: {selectedFile.name}
                    </small>
                  )}

                  <small>Upload up to 5 files (max 10MB each)</small>
                </div>

                {scanError && (
                  <div style={{ 
                    margin: '12px 0', 
                    padding: '10px', 
                    background: '#ffe6e6', 
                    color: '#cc0000', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {scanError}
                  </div>
                )}

                <button 
                  className="save-btn" 
                  type="button"
                  onClick={handleScanFile}
                  disabled={scanning || !selectedFile}
                  style={{
                    opacity: scanning || !selectedFile ? 0.6 : 1,
                    cursor: scanning || !selectedFile ? 'not-allowed' : 'pointer'
                  }}
                >
                  {scanning ? 'Processing...' : 'Scan File'}
                </button>
              </>
            )}

            {activeTab === "manual" && (
              <>
                <div className="manual-card">
                  <input className="expense-input" placeholder="Amount €" />

                  <select
                    className="expense-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Category</option>

                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <div className="date-row">
                    <input
                      className="expense-input small"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />

                    <input
                      className="expense-input small"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>

                  <input className="expense-input" placeholder="Description" />

                  <div className="repeat-row">
                    <div>
                      <strong>Repeat</strong>
                      <p>Repeat transaction</p>
                    </div>

                    <button
                      className={repeat ? "switch on" : "switch"}
                      type="button"
                      onClick={() => setRepeat(!repeat)}
                    >
                      <span />
                    </button>
                  </div>
                </div>

                <button className="save-btn" type="button">
                  Save
                </button>
              </>
            )}

            <button
              className="close-sheet-btn"
              type="button"
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