import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { getToken } from "../auth";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { withExpenseRevalidation } from "../utils/cacheRevalidation";
import "../styles/BudgetsPage.css";

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? "";

interface Category {
  id: string;
  name: string;
}

interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  notifyThreshold: number;
  endDate: string | null;
  createdAt: string;
  category?: Category | null;
}

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

type FormMode = "create" | "edit";

const parseMoneyValue = (value: string) => Number(value.replace(",", "."));

const getMonthEnd = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const isSameMonth = (dateValue: string | null, month: Date) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
};

const formatCurrency = (value: number) => `€${value.toFixed(2)}`;

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spendingSummary, setSpendingSummary] =
    useState<SpendingSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const monthLabel = selectedMonth.toLocaleString("default", {
    month: "long",
  });

  const budgetsForMonth = useMemo(
    () => budgets.filter((budget) => isSameMonth(budget.endDate, selectedMonth)),
    [budgets, selectedMonth],
  );

  const usedByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    spendingSummary?.categoryBreakdown.forEach((category) => {
      totals.set(category.categoryId, category.amount);
    });
    return totals;
  }, [spendingSummary]);

  const usedCategoryIds = useMemo(
    () =>
      new Set(
        budgetsForMonth
          .map((budget) => budget.categoryId)
          .filter((categoryId): categoryId is string => Boolean(categoryId)),
      ),
    [budgetsForMonth],
  );

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.id === editingBudget?.categoryId ||
          !usedCategoryIds.has(category.id),
      ),
    [categories, editingBudget?.categoryId, usedCategoryIds],
  );

  const fetchBudgetPageData = async (month: Date) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const monthParam = new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
      ).toISOString();

      const [budgetsRes, categoriesRes, spendingRes] = await Promise.all([
        fetch(`${ALLOWED_HOST}:3000/budgets`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${ALLOWED_HOST}:3000/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${ALLOWED_HOST}:3000/expenses/spendingSummary?month=${encodeURIComponent(
            monthParam,
          )}`,
          withExpenseRevalidation({
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      ]);

      if (budgetsRes.ok) {
        const data = await budgetsRes.json();
        setBudgets(Array.isArray(data) ? data : []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }

      if (spendingRes.ok) {
        setSpendingSummary(await spendingRes.json());
      } else {
        setSpendingSummary(null);
      }
    } catch (err) {
      console.error("Failed to fetch budget data:", err);
      setSpendingSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetPageData(selectedMonth);
  }, [selectedMonth]);

  const goToPreviousMonth = () => {
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    setSelectedMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const resetForm = () => {
    setSelectedCategoryId("");
    setBudgetLimit("");
    setWarningThreshold(80);
    setEditingBudget(null);
    setFormMode(null);
    setFormError(null);
    setSaving(false);
  };

  const openCreateForm = () => {
    setSelectedCategoryId("");
    setBudgetLimit("");
    setWarningThreshold(80);
    setEditingBudget(null);
    setFormError(null);
    setFormMode("create");
  };

  const openEditForm = (budget: Budget) => {
    setSelectedCategoryId(budget.categoryId ?? "");
    setBudgetLimit(String(budget.amount));
    setWarningThreshold(Number(budget.notifyThreshold));
    setEditingBudget(budget);
    setFormError(null);
    setFormMode("edit");
  };

  const handleSubmitBudget = async () => {
    const token = getToken();
    if (!token) {
      setFormError("Please log in to manage budgets.");
      return;
    }

    const limitValue = parseMoneyValue(budgetLimit);
    if (!selectedCategoryId || !budgetLimit || Number.isNaN(limitValue)) {
      setFormError("Please choose a category and enter a valid limit.");
      return;
    }

    if (limitValue <= 0) {
      setFormError("Limit must be greater than 0.");
      return;
    }

    const payload = {
      categoryId: selectedCategoryId,
      amount: limitValue,
      notifyThreshold: warningThreshold,
      endDate: getMonthEnd(selectedMonth).toISOString(),
    };

    setSaving(true);
    setFormError(null);

    try {
      const endpoint =
        formMode === "edit" && editingBudget
          ? `${ALLOWED_HOST}:3000/budgets/${editingBudget.id}`
          : `${ALLOWED_HOST}:3000/budgets`;
      const response = await fetch(endpoint, {
        method: formMode === "edit" ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to save budget.");
      }

      resetForm();
      fetchBudgetPageData(selectedMonth);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save budget.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${ALLOWED_HOST}:3000/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteBudgetId(null);
      fetchBudgetPageData(selectedMonth);
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6fa] dark:bg-[#121212]">
        <div className="mx-auto flex min-h-screen max-w-[430px] items-center justify-center px-5">
          <p className="font-inter text-[#101828] dark:text-white">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6fa] pb-24 font-inter dark:bg-[#121212]">
      <div className="mx-auto min-h-screen max-w-[430px] overflow-x-hidden">
      <section className="h-[142px] bg-brand-green px-7 pt-[38px] text-white">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border-0 bg-transparent p-0 text-white transition-transform hover:scale-105 active:scale-95"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft size={42} />
          </button>

          <h1 className="m-0 font-arimo text-[28px] font-extrabold tracking-normal text-white">
            {monthLabel}
          </h1>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border-0 bg-transparent p-0 text-white transition-transform hover:scale-105 active:scale-95"
            onClick={goToNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight size={42} />
          </button>
        </div>
      </section>

      <section
        className={`min-h-[calc(100vh_-_142px)] px-5 py-6 ${
          budgetsForMonth.length === 0 ? "flex items-stretch" : ""
        }`}
      >
        {budgetsForMonth.length > 0 ? (
          <>
            <div className="mb-5 flex items-center justify-between gap-3.5">
              <h2 className="m-0 font-arimo text-[21px] font-extrabold tracking-normal text-[#0a0a0a] dark:text-white">
                Budget Categories
              </h2>

              <button
                type="button"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-[10px] border-0 bg-brand-green px-[17px] py-[11px] text-[15px] font-bold text-white shadow-[0_8px_16px_rgba(30,81,40,0.18)] transition-all hover:-translate-y-px hover:bg-[#17421f] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
                onClick={openCreateForm}
                disabled={availableCategories.length === 0}
                title="Add budget"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {budgetsForMonth.map((budget) => {
                const limit = Number(budget.amount);
                const used = budget.categoryId
                  ? usedByCategory.get(budget.categoryId) ?? 0
                  : 0;
                const percent = limit > 0 ? (used / limit) * 100 : 0;
                const threshold = Number(budget.notifyThreshold);
                const isDanger = percent >= 100;
                const isWarning = percent >= threshold && percent < 100;
                const barClass = isDanger
                  ? "bg-[#ff2d3d]"
                  : isWarning
                    ? "bg-[#ff6900]"
                    : "bg-brand-green";
                const usedClass = isDanger
                  ? "text-[#e7000b]"
                  : isWarning
                    ? "text-[#ff4d00]"
                    : "text-[#4a5565]";

                return (
                  <article
                    className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:translate-y-0 dark:bg-[#1e1e1e]"
                    key={budget.id}
                  >
                    <div className="flex items-start justify-between gap-3.5">
                      <div>
                        <h3 className="m-0 mb-2.5 font-arimo text-[18px] font-bold text-[#0a0a0a] dark:text-white">
                          {budget.category?.name || "Total"}
                        </h3>
                        <p className="m-0 text-base leading-snug text-[#687386] dark:text-gray-300">
                          {formatCurrency(used)} of {formatCurrency(limit)}
                        </p>
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-[#039855] transition-all hover:bg-[rgba(3,152,85,0.1)] active:scale-95"
                          onClick={() => openEditForm(budget)}
                          aria-label="Edit budget"
                          title="Edit budget"
                        >
                          <Edit size={18} strokeWidth={2} />
                        </button>

                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-0 bg-transparent p-1.5 text-[#dc3545] transition-all hover:bg-[rgba(220,53,69,0.1)] active:scale-95"
                          onClick={() => setDeleteBudgetId(budget.id)}
                          aria-label="Delete budget"
                          title="Delete budget"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-[22px] h-2.5 w-full overflow-hidden rounded-full bg-[#e5e7eb]">
                      <div
                        className={`h-full rounded-full ${barClass}`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>

                    <p className={`m-0 mt-3 text-base font-medium leading-snug ${usedClass}`}>
                      {isDanger
                        ? `${percent.toFixed(1)}% used (${formatCurrency(
                            used - limit,
                          )} over budget)`
                        : `${percent.toFixed(1)}% used`}
                    </p>

                    {isWarning && (
                      <div className="mt-[18px] flex min-h-[46px] items-center justify-center gap-2.5 rounded-full bg-[#ffedd5] px-3.5 py-2 text-center text-[15px] font-extrabold leading-tight text-[#a83800]">
                        <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-transparent text-brand-yellow">
                          <AlertCircle size={20} />
                        </span>
                        Approaching limit ({threshold}%)
                      </div>
                    )}

                    {isDanger && (
                      <div className="mt-[18px] flex min-h-[46px] items-center justify-center gap-2.5 rounded-full bg-[#ff3b30] px-3.5 py-2 text-center text-[15px] font-extrabold leading-tight text-white">
                        <span className="flex h-[26px] min-w-[26px] items-center justify-center rounded-full bg-white text-[#ff3b30]">
                          <AlertCircle size={20} />
                        </span>
                        You've exceeded the limit
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex min-h-[calc(100vh_-_340px)] w-full flex-col items-center justify-center gap-7 text-center">
            <p className="m-0 font-inter text-xl font-medium leading-[1.28] text-[#9696a6]">
              You don't have a budget.
              <br />
              Let's make one so you in control.
            </p>
            <button
              type="button"
              className="min-h-[58px] w-full max-w-[360px] rounded-[14px] border-0 bg-brand-green font-inter text-lg font-bold text-white shadow-[0_8px_16px_rgba(30,81,40,0.18)] transition-all hover:-translate-y-px hover:bg-[#17421f] active:translate-y-0"
              onClick={openCreateForm}
              title="Create a budget"
            >
              Create a budget
            </button>
          </div>
        )}
      </section>
      </div>

      {formMode && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-7 before:absolute before:inset-0 before:bg-black/40"
          onClick={() => {
            if (!saving) resetForm();
          }}
        >
          <section
            className="relative max-h-[calc(100vh_-_56px)] w-[min(320px,calc(100vw_-_56px))] max-w-[90%] overflow-y-auto rounded-[20px] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[budgetModalSlideIn_200ms_ease-out] dark:bg-[#1e1e1e]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between">
              <h1
                id="budget-form-title"
                className="m-0 font-arimo text-lg font-bold tracking-normal text-[#0a0a0a] dark:text-white"
              >
                {formMode === "edit" ? "Edit Monthly Budget" : "Set Monthly Budget"}
              </h1>

              <button
                type="button"
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border-0 bg-[#f3f4f6] text-[#364153] transition-colors hover:bg-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={resetForm}
                disabled={saving}
                aria-label="Close budget form"
                title="Close"
              >
                <X size={22} />
              </button>
            </div>

            <p className="m-0 mb-[18px] text-sm leading-snug text-[#4a5565] dark:text-gray-300">
              Set spending limits per category to stay on track
            </p>

            <label className="mb-2 block text-sm font-medium text-[#344054] dark:text-gray-200">
              Category
            </label>
            <div className="relative">
              <select
                className={`mb-4 h-10 w-full appearance-none rounded-lg border border-[#d1d5dc] bg-white px-3 pr-11 font-arimo text-sm outline-none transition-[border-color,box-shadow] focus:border-brand-green focus:shadow-[0_0_0_3px_rgba(30,81,40,0.1)] dark:bg-[#1e1e1e] dark:text-white ${
                  selectedCategoryId ? "text-[#20242b]" : "text-[#9498a8]"
                }`}
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-5 -translate-y-1/2 text-[#20242b] dark:text-white"
                size={20}
                strokeWidth={2.25}
              />
            </div>

            <label className="mb-2 block text-sm font-medium text-[#344054] dark:text-gray-200">
              Limit (€)
            </label>
            <input
              className="mb-4 h-10 w-full rounded-lg border border-[#d1d5dc] bg-white px-3 font-arimo text-sm text-[#0a0a0a] outline-none transition-[border-color,box-shadow] placeholder:text-[#888] focus:border-brand-green focus:shadow-[0_0_0_3px_rgba(30,81,40,0.1)] dark:bg-[#1e1e1e] dark:text-white"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
            />

            <div className="mb-2.5 flex items-center justify-between text-sm font-medium text-[#344054] dark:text-gray-200">
              <span>Warning Threshold</span>
              <strong className="text-brand-green">{warningThreshold}%</strong>
            </div>

            <input
              className="mb-2.5 w-full accent-brand-green"
              type="range"
              min="0"
              max="100"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
            />

            <p className="m-0 mb-4 text-[13px] leading-snug text-[#667085] dark:text-gray-400">
              Get warned when you reach this % of your limit
            </p>

            {formError && (
              <p className="m-0 mb-[18px] text-sm leading-snug text-[#e7000b]">
                {formError}
              </p>
            )}

            <div className="mt-[18px] flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-[#d1d5dc] bg-transparent px-4 py-3 font-inter text-sm font-semibold text-[#364153] transition-all hover:bg-[#f9fafb] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200"
                onClick={resetForm}
                disabled={saving}
                title="Cancel"
              >
                Cancel
              </button>

              <button
                type="button"
                className="flex-1 rounded-lg border-0 bg-brand-green px-4 py-3 font-inter text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleSubmitBudget}
                disabled={saving || availableCategories.length === 0}
                title={formMode === "edit" ? "Save budget" : "Add budget"}
              >
                {saving ? "Saving..." : formMode === "edit" ? "Save" : "Add"}
              </button>
            </div>
          </section>
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={deleteBudgetId !== null}
        title="Delete budget?"
        message="This monthly budget category will be removed."
        onCancel={() => setDeleteBudgetId(null)}
        onConfirm={() => {
          if (deleteBudgetId) {
            return handleDelete(deleteBudgetId);
          }
        }}
      />
    </main>
  );
}
