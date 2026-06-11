import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getFullName } from "../auth";
import { AskAIInput } from "../components/AskAIInput";
import { ProfileAvatar } from "../components/ProfileAvatar";
import billbuddyLogo from "../assets/billbuddy.svg";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

interface SpendingSummary {
  month: string;
  totalAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

interface ExpenseSummary {
  month: string;
  totalAmount: number;
  transactionCount: number;
  averageTransactionAmount: number;
  topTransactions: Array<{
    id: string;
    totalAmount: number;
    expenseDate: string;
    note: string | null;
    merchant?: { name: string } | null;
  }>;
}

const CATEGORY_COLORS = [
  "#FB2C36",
  "#2B7FFF",
  "#00C950",
  "#F0B100",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#FF8C42",
  "#A8E6CF",
  "#DCEDC1",
];
const OTHERS_COLOR = "#99A1AF";

const getIconForMerchant = (name: string) => {
  const lower = name?.toLowerCase() || "";
  if (lower.includes("amazon")) return "📦";
  if (lower.includes("walmart") || lower.includes("target")) return "🛒";
  if (lower.includes("shell") || lower.includes("gas")) return "⛽";
  if (lower.includes("starbucks") || lower.includes("coffee")) return "☕";
  if (lower.includes("restaurant")) return "🍽️";
  return "💳";
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const displayName = getFullName() || "User";
  const [chartView, setChartView] = useState<"pie" | "detail">("pie");

  useEffect(() => {
    const fetchSummary = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        const monthParam = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [summaryRes, spendingRes] = await Promise.all([
          fetch(
            `${ALLOWED_HOST}:3000/expenses/summary?month=${encodeURIComponent(monthParam)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${ALLOWED_HOST}:3000/expenses/spendingSummary?month=${encodeURIComponent(monthParam)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setSummary(data);
        }

        if (spendingRes.ok) {
          const data = await spendingRes.json();
          setSpendingSummary(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6fa] dark:bg-[#121212] flex items-center justify-center">
        <p className="text-[#101828] dark:text-white font-inter">Loading...</p>
      </main>
    );
  }

  const totalAmount = summary?.totalAmount ?? 0;
  const transactionCount = summary?.transactionCount ?? 0;
  const averageTransaction = summary?.averageTransactionAmount ?? 0;
  const topTransactions = summary?.topTransactions ?? [];
  const categoryBreakdown = spendingSummary?.categoryBreakdown ?? [];

  const chartData = categoryBreakdown.map((cat, idx) => {
    const isOthers = cat.categoryName.toLowerCase() === "others";
    return {
      name: cat.categoryName,
      value: cat.amount,
      percentage: cat.percentage,
      color: isOthers ? OTHERS_COLOR : CATEGORY_COLORS[idx % (CATEGORY_COLORS.length - 1)],
    };
  });

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f5f6fa] dark:bg-[#121212] pb-[100px]">
      <div className="max-w-[430px] mx-auto px-5 pt-3">
        {/* Header */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={billbuddyLogo} alt="BillBuddy" className="h-12 w-auto" />
              <div className="inline-flex items-center gap-1">
                <span className="text-2xl font-bold text-black dark:text-white tracking-tight font-arimo">
                  Bill
                </span>
                <span className="text-2xl font-bold text-brand-green dark:text-green-400 tracking-tight font-arimo">
                  Buddy
                </span>
              </div>
            </div>
            <button 
              className="border-none bg-transparent p-0 m-0 cursor-pointer inline-block leading-none"
              onClick={() => navigate("/profile")}
            >
              <ProfileAvatar name={displayName} size={56} />
            </button>
          </div>

          <div className="mb-4">
            <h1 className="text-xl font-semibold text-black dark:text-white tracking-tight font-inter m-0">
              Welcome Back, {displayName.split(" ")[0]}!
            </h1>
          </div>

          <div className="mt-3.5">
            <AskAIInput />
          </div>
        </section>

        {/* Stats Row */}
        <section className="mt-2 mb-7">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
            {/* Total Spending */}
            <div className="shrink-0 w-36 rounded-2xl bg-white dark:bg-[#1e1e1e] p-4 border-[1.5px] border-[#dedede] dark:border-gray-700">
              <p className="text-xs font-medium text-[#101828] dark:text-gray-300 font-inter">
                Total Spend This Month
              </p>
              <p className="text-lg font-bold mt-1 text-black dark:text-white font-arimo">
                €{totalAmount.toFixed(2)}
              </p>
              {transactionCount > 0 && (
                <span className="text-xs font-medium mt-1 inline-block px-1.5 py-0.5 rounded-full text-red-500">
                  {transactionCount} transactions
                </span>
              )}
            </div>

            {/* Transactions */}
            <div className="shrink-0 w-36 rounded-2xl bg-gradient-to-br from-brand-blue to-blue-400 p-4 text-white shadow-md">
              <p className="text-xs font-medium opacity-85 font-inter">
                Transactions
              </p>
              <p className="text-lg font-bold mt-1 font-arimo">
                {transactionCount}
              </p>
              <span className="text-xs font-medium mt-1 inline-block px-1.5 py-0.5 rounded-full bg-white/20">
                This month
              </span>
            </div>

            {/* Average Cost */}
            <div className="shrink-0 w-36 rounded-2xl bg-gradient-to-br from-brand-yellow to-amber-400 p-4 text-white shadow-md">
              <p className="text-xs font-medium opacity-85 font-inter">
                Avg Cost
              </p>
              <p className="text-lg font-bold mt-1 font-arimo">
                €{averageTransaction.toFixed(2)}
              </p>
              <span className="text-xs font-medium mt-1 inline-block px-1.5 py-0.5 rounded-full bg-white/20">
                Per transaction
              </span>
            </div>
          </div>
        </section>

        {/* Spending by Category Chart */}
        <section 
          className="rounded-[10px] bg-white dark:bg-[#1e1e1e] p-5 mb-7 cursor-pointer shadow-lg relative"
          onClick={() => setChartView(prev => prev === "pie" ? "detail" : "pie")}
        >
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-semibold text-[#101828] dark:text-white font-inter">
              Spending by Category
            </h3>
            <span className="text-[10.5px] font-medium text-[#030213] dark:text-gray-300 bg-[#ECEEF2] dark:bg-gray-700 rounded-[6.75px] px-2 py-0.5 font-inter">
              {currentMonth}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Custom SVG Donut Chart */}
            <div className="shrink-0 relative" style={{ width: chartView === "pie" ? 160 : 120, height: chartView === "pie" ? 160 : 120 }}>
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {chartData.reduce((acc, item, idx) => {
                  const startAngle = acc.currentAngle;
                  const angle = (item.percentage / 100) * 360;
                  const endAngle = startAngle + angle;
                  
                  const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
                  const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
                  const x2 = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
                  const y2 = 50 + 40 * Math.sin(Math.PI * endAngle / 180);
                  
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  
                  const innerX1 = 50 + (chartView === "pie" ? 28 : 22) * Math.cos(Math.PI * startAngle / 180);
                  const innerY1 = 50 + (chartView === "pie" ? 28 : 22) * Math.sin(Math.PI * startAngle / 180);
                  const innerX2 = 50 + (chartView === "pie" ? 28 : 22) * Math.cos(Math.PI * endAngle / 180);
                  const innerY2 = 50 + (chartView === "pie" ? 28 : 22) * Math.sin(Math.PI * endAngle / 180);
                  
                  acc.paths.push(
                    <path
                      key={idx}
                      d={`M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${(chartView === "pie" ? 28 : 22)} ${(chartView === "pie" ? 28 : 22)} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                  );
                  
                  acc.currentAngle = endAngle;
                  return acc;
                }, { paths: [] as JSX.Element[], currentAngle: 0 }).paths}
              </svg>
              {chartView === "pie" && chartData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center transform rotate-90">
                    <p className="text-xs font-bold text-black dark:text-white font-arimo">
                      €{totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2.5 justify-center flex-1 min-w-0">
              {chartData.length > 0 ? (
                chartData.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <div className="flex flex-col min-w-0">
                      {chartView === "pie" ? (
                        <>
                          <span className="text-[10px] font-medium text-[#364153] dark:text-gray-300 leading-none font-inter truncate">
                            {item.percentage.toFixed(1)}%
                          </span>
                          <span className="text-[8px] text-[#6A7282] dark:text-gray-400 leading-none mt-0.5 font-inter truncate">
                            {item.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-medium text-[#364153] dark:text-gray-300 leading-none font-inter truncate">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] font-bold text-black dark:text-white leading-none font-arimo">
                              €{item.value.toFixed(2)}
                            </span>
                            <span className="text-[8px] text-[#6A7282] dark:text-gray-400 leading-none font-inter">
                              ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#667085] dark:text-gray-400 font-inter">
                  No expenses this month
                </p>
              )}
              {chartData.length > 6 && (
                <p className="text-[9px] text-[#6A7282] dark:text-gray-400 font-inter">
                  +{chartData.length - 6} more categories
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="mb-7">
          <div className="flex items-center justify-between mb-5.5">
            <h2 className="text-sm font-bold text-[#101828] dark:text-white m-0 font-arimo">
              Recent Transactions
            </h2>
            <button className="text-[12px] font-medium text-brand-green dark:text-green-400 font-inter border-none bg-transparent cursor-pointer">
              View All
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {topTransactions.length > 0 ? (
              topTransactions.map((transaction) => (
                <article 
                  className="flex items-center gap-3.5 bg-[#F9FAFB] dark:bg-[#1e1e1e] rounded-[12.75px] px-2.5 py-2.5"
                  key={transaction.id}
                >
                  <div
                    className="w-9 h-9 rounded-[12.75px] bg-white dark:bg-[#2a2a2a] flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.1)",
                    }}
                  >
                    <span className="text-base leading-none">
                      {getIconForMerchant(transaction.merchant?.name || "")}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[12px] font-medium text-[#101828] dark:text-white leading-snug font-inter">
                      {transaction.merchant?.name || transaction.note || "Unknown"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-[#0A0A0A] dark:text-gray-300 border border-black/10 dark:border-gray-600 rounded-[6.75px] px-2 py-0.5 leading-tight font-inter">
                        {new Date(transaction.expenseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-[#101828] dark:text-white shrink-0 font-arimo">
                    -€{transaction.totalAmount.toFixed(2)}
                  </span>
                </article>
              ))
            ) : (
              <p className="text-sm text-[#667085] dark:text-gray-400 font-inter">
                No transactions this month
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
