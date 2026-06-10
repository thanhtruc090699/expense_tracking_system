import { useState, useEffect } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  AlertCircle,
  ArrowLeft,
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

  const [showCreateBudgetScreen, setShowCreateBudgetScreen] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const [editBudgetId, setEditBudgetId] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [scheduledPayment, setScheduledPayment] = useState("");

  const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

  const isEditMode = editBudgetId !== null;

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

  const parseMoneyValue = (value: string) => {
    return Number(value.replace(",", "."));
  };

  const resetForm = () => {
    setSelectedCategory("");
    setBudgetLimit("");
    setWarningThreshold(80);
    setScheduledPayment("");
    setEditBudgetId(null);
  };

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

  const handleStartEdit = (budget: Budget) => {
    setEditBudgetId(budget.id);
    setSelectedCategory(budget.category?.name || "");
    setBudgetLimit(String(budget.amount));
    setWarningThreshold(budget.notifyThreshold);
    setScheduledPayment(String(budget.usedAmount ?? 0));
    setShowBudgetForm(true);
    setShowCreateBudgetScreen(false);
  };

  const handleSubmitBudget = () => {
    const limitValue = parseMoneyValue(budgetLimit);
    const scheduledValue = parseMoneyValue(scheduledPayment || "0");

    if (!selectedCategory || !budgetLimit || Number.isNaN(limitValue)) {
      alert("Please choose a category and enter a valid limit.");
      return;
    }

    if (isEditMode && editBudgetId) {
      setBudgets((prev) =>
        prev.map((budget) =>
          budget.id === editBudgetId
            ? {
                ...budget,
                categoryId: selectedCategory.toLowerCase(),
                amount: limitValue,
                notifyThreshold: warningThreshold,
                category: { name: selectedCategory },
                usedAmount: Number.isNaN(scheduledValue) ? 0 : scheduledValue,
              }
            : budget
        )
      );
    } else {
      const newBudget: Budget = {
        id: crypto.randomUUID(),
        userId: "demo",
        categoryId: selectedCategory.toLowerCase(),
        amount: limitValue,
        notifyThreshold: warningThreshold,
        endDate: null,
        createdAt: new Date().toISOString(),
        category: { name: selectedCategory },
        usedAmount: Number.isNaN(scheduledValue) ? 0 : scheduledValue,
      };

      setBudgets((prev) => [newBudget, ...prev]);
    }

    resetForm();
    setShowBudgetForm(false);
    setShowCreateBudgetScreen(false);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowBudgetForm(false);

    if (!isEditMode) {
      setShowCreateBudgetScreen(true);
    }
  };

  if (loading) {
    return (
      <main className="budget-page">
        <p className="budget-loading">Loading...</p>
      </main>
    );
  }

  if (showBudgetForm) {
    return (
      <main className="budget-page">
        <section className="budget-form-sheet">
          <h1>{isEditMode ? "Edit Monthly Budget" : "Set Monthly Budget"}</h1>

          <p className="budget-form-subtitle">
            Set spending limits per category to stay on track
          </p>

          <label className="budget-form-label">Category</label>
          <select
            className="budget-form-input"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value=""></option>
            <option value="Groceries">Groceries</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Transportation">Transportation</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
            <option value="Entertainment">Entertainment</option>
          </select>

          <label className="budget-form-label">Limit (€)</label>
          <input
            className="budget-form-input"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
          />

          <div className="budget-threshold-row">
            <span>Warning Threshold</span>
            <strong>{warningThreshold}%</strong>
          </div>

          <input
            className="budget-range"
            type="range"
            min="0"
            max="100"
            value={warningThreshold}
            onChange={(e) => setWarningThreshold(Number(e.target.value))}
          />

          <p className="budget-help-text">
            Get warned when you reach this % of your limit
          </p>

          <label className="budget-form-label">Scheduled Payment (€)</label>
          <input
            className="budget-form-input"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={scheduledPayment}
            onChange={(e) => setScheduledPayment(e.target.value)}
          />

          <p className="budget-help-text">
            Planned/expected spending for this category
          </p>

          <div className="budget-form-actions">
            <button
              type="button"
              className="budget-cancel-button"
              onClick={handleCancelForm}
            >
              Cancel
            </button>

            <button
              type="button"
              className="budget-form-add-button"
              onClick={handleSubmitBudget}
            >
              {isEditMode ? "Save" : "Add"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (showCreateBudgetScreen) {
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
            <button
              type="button"
              className="budget-month-btn"
              onClick={() => setShowCreateBudgetScreen(false)}
            >
              <ArrowLeft size={42} />
            </button>

            <h1>April</h1>

            <button type="button" className="budget-month-btn">
              <ChevronRight size={42} />
            </button>
          </div>
        </section>

        <section className="budget-empty-sheet">
          <div className="budget-empty-content">
            <p>
              You don&apos;t have a budget.
              <br />
              Let&apos;s make one so you in control.
            </p>
          </div>

          <button
            type="button"
            className="budget-create-button"
            onClick={() => setShowBudgetForm(true)}
          >
            Create a budget
          </button>
        </section>
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

          <button
            type="button"
            className="budget-add-button"
            onClick={() => setShowCreateBudgetScreen(true)}
          >
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
                    <button
                      type="button"
                      className="budget-icon-btn"
                      onClick={() => handleStartEdit(budget)}
                    >
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