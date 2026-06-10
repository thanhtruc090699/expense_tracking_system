import { useState, useEffect } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { getToken } from "../auth";
import "../styles/BudgetsPage.css";

interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  notifyThreshold: number;
  endDate: string | null;
  createdAt: string;
  category?: { name: string } | null;
  usedAmount?: number;
}

const demoBudgets: Budget[] = [
  {
    id: "1",
    userId: "demo",
    categoryId: "groceries",
    amount: 140,
    notifyThreshold: 80,
    endDate: null,
    createdAt: "",
    category: { name: "Groceries" },
    usedAmount: 148.4,
  },
  {
    id: "2",
    userId: "demo",
    categoryId: "restaurant",
    amount: 200,
    notifyThreshold: 80,
    endDate: null,
    createdAt: "",
    category: { name: "Restaurant" },
    usedAmount: 74.7,
  },
  {
    id: "3",
    userId: "demo",
    categoryId: "transportation",
    amount: 150,
    notifyThreshold: 80,
    endDate: null,
    createdAt: "",
    category: { name: "Transportation" },
    usedAmount: 125.75,
  },
];

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

  const fetchBudgets = async () => {
    const token = getToken();

    if (!token) {
      setBudgets(demoBudgets);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${ALLOWED_HOST}/budgets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setBudgets(data);
      } else {
        setBudgets(demoBudgets);
      }
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setBudgets(demoBudgets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    const token = getToken();

    if (!token) {
      setBudgets((prev) => prev.filter((budget) => budget.id !== id));
      return;
    }

    try {
      await fetch(`${ALLOWED_HOST}/budgets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchBudgets();
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  if (loading) {
    return (
      <main className="budget-page">
        <p className="budget-loading">Loading...</p>
      </main>
    );
  }

  return (
    <main className="budget-page">
      <section className="budget-green-area">
        <div className="budget-ai-row">
          <div className="budget-ai-icon">
            <Bot size={26} />
          </div>

          <div className="budget-ai-input">Ask AI Assistant...</div>
        </div>

        <div className="budget-month-row">
          <button type="button" className="budget-month-btn">
            <ChevronLeft size={42} />
          </button>

          <h1>April</h1>

          <button type="button" className="budget-month-btn">
            <ChevronRight size={42} />
          </button>
        </div>
      </section>

      <section className="budget-white-sheet">
        <div className="budget-head-row">
          <h2>Budget Categories</h2>

          <button type="button" className="budget-add-button">
            + Add
          </button>
        </div>

        <div className="budget-card-list">
          {budgets.map((budget) => {
            const limit = Number(budget.amount);
            const used = budget.usedAmount ?? limit * 0.75;
            const percent = limit > 0 ? (used / limit) * 100 : 0;

            const isDanger = percent >= 100;
            const isWarning = percent >= 75 && percent < 100;

            const colorClass = isDanger
              ? "danger"
              : isWarning
              ? "warning"
              : "safe";

            return (
              <article className="budget-card" key={budget.id}>
                <div className="budget-card-top">
                  <div>
                    <h3>{budget.category?.name || "Total"}</h3>
                    <p className="budget-money">
                      €{used.toFixed(2)} of €{limit.toFixed(2)}
                    </p>
                  </div>

                  <div className="budget-icons">
                    <button type="button" className="budget-icon-btn">
                      <Pencil size={23} />
                    </button>

                    <button
                      type="button"
                      className="budget-icon-btn delete"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 size={23} />
                    </button>
                  </div>
                </div>

                <div className="budget-bar">
                  <div
                    className={`budget-bar-fill ${colorClass}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <p className={`budget-used ${colorClass}`}>
                  {isDanger
                    ? `${percent.toFixed(1)}% used (€${(used - limit).toFixed(
                        2
                      )} over budget)`
                    : `${percent.toFixed(1)}% used`}
                </p>

                {isDanger && (
                  <div className="budget-warning">
                    <span>
                      <AlertCircle size={20} />
                    </span>
                    You&apos;ve exceed the limit
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}