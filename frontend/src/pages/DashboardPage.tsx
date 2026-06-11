import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";
import { getToken, getFullName } from "../auth";
import { AskAIInput } from "../components/AskAIInput";
import { ProfileAvatar } from "../components/ProfileAvatar";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

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

const colorHexCodes = ["#ff2d3d", "#2f80ed", "#06c956", "#f4b400", "#9aa4b2"];

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
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(getFullName() || "User");

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

        const res = await fetch(
          `${ALLOWED_HOST}:3000/expenses/summary?month=${encodeURIComponent(monthParam)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setSummary(data);
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
      <main className="dashboard-page">
        <p>Loading...</p>
      </main>
    );
  }

  const totalAmount = summary?.totalAmount ?? 0;
  const transactionCount = summary?.transactionCount ?? 0;
  const topTransactions = summary?.topTransactions ?? [];

  const chartItems = topTransactions.slice(0, 5).map((t, i) => ({
    name: t.merchant?.name || t.note || "Unknown",
    amount: `€${t.totalAmount.toFixed(2)}`,
    percent: `${((t.totalAmount / totalAmount) * 100).toFixed(0)}%`,
    color: colorHexCodes[i % colorHexCodes.length],
  }));

  const chartGradients = chartItems.map((item, idx, arr) => {
    const start = idx === 0 ? 0 : arr.slice(0, idx).reduce((sum, it, i) => {
      return sum + ((it.amount.replace(/[^\d.]/g, '') / totalAmount) * 360);
    }, 0);
    const end = start + ((item.amount.replace(/[^\d.]/g, '') / totalAmount) * 360);
    return `${item.color} ${start.toFixed(0)}deg ${end.toFixed(0)}deg`;
  }).join(', ');

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div className="dashboard-header-top">
          <h1>Welcome Back, {displayName.split(' ')[0]}!</h1>

          <button 
            className="profile-image-btn"
            onClick={() => navigate("/profile")}
          >
            <div className="profile-image">
              <ProfileAvatar name={displayName} size={72} />
            </div>
          </button>
        </div>

        <div className="dashboard-ai-area">
          <AskAIInput />
        </div>
      </section>

      <section className="stats-scroll">
        <article className="stat-card large">
          <h2>Total Spend This Month</h2>
          <strong>€{totalAmount.toFixed(2)}</strong>
          {transactionCount > 0 && (
            <p className="red-text">{transactionCount} transactions</p>
          )}
        </article>

        <article className="stat-card small">
          <h2>Transactions</h2>
          <strong>{transactionCount}</strong>
          <p>This month</p>
        </article>
      </section>

      <section className="category-card">
        <div className="category-card-header">
          <h2>Top Expenses</h2>
          <span>This Month</span>
        </div>

        <div className="chart-layout">
          <div 
            className="donut-chart"
            style={{ background: `conic-gradient(${chartGradients})` }}
          >
            <div className="donut-hole" />
          </div>

          <div className="chart-legend">
            {chartItems.length > 0 ? (
              chartItems.map((item, idx) => (
                <div className="legend-item" key={idx}>
                  <div className="legend-name-row">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span className="legend-name">{item.name}</span>
                  </div>

                  <div className="legend-money">
                    <strong>{item.amount}</strong>
                    <p>{item.percent}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No expenses this month</p>
            )}
          </div>
        </div>
      </section>

      <section className="recent-section">
        <div className="recent-header">
          <h2>Recent Transactions</h2>
          <button type="button">View All</button>
        </div>

        <div className="transaction-list">
          {topTransactions.length > 0 ? (
            topTransactions.map((transaction) => (
              <article className="transaction-card" key={transaction.id}>
                <div className="transaction-left">
                  <div className="transaction-icon">
                    {getIconForMerchant(transaction.merchant?.name || "")}
                  </div>

                  <div>
                    <h3>{transaction.merchant?.name || transaction.note || "Unknown"}</h3>

                    <div className="transaction-meta">
                      <span>{new Date(transaction.expenseDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <strong>-€{transaction.totalAmount.toFixed(2)}</strong>
              </article>
            ))
          ) : (
            <p>No transactions this month</p>
          )}
        </div>
      </section>
    </main>
  );
}