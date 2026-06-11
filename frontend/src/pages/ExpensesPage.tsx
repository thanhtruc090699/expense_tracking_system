import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import './ExpensesPage.css';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface Expense {
  id: string;
  userId: string;
  merchantId: string | null;
  totalAmount: number;
  expenseDate: string;
  isRecurring: boolean;
  note: string | null;
  createdAt: string;
  merchant?: { name: string } | null;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/expenses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${ALLOWED_HOST}:3000/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const token = getToken();

  if (!token) {
    return (
      <div className="expenses-page">
        <h1>Expenses</h1>
        <p>Authentication required</p>
      </div>
    );
  }

  if (loading) return <div className="expenses-loading">Loading...</div>;

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h1>Expenses</h1>
        <p>Track your expenses</p>
      </div>

      <div className="expense-list">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div className="expense-card" key={expense.id}>
              <div className="expense-main">
                <div className="expense-info">
                  <span className="expense-merchant">{expense.merchant?.name || 'No merchant'}</span>
                  <span className="expense-date">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </span>
                </div>
                <span className="expense-amount">€{Number(expense.totalAmount).toFixed(2)}</span>
              </div>

              <div className="expense-meta">
                {expense.isRecurring && (
                  <span className="expense-badge recurring">Recurring</span>
                )}
                {expense.note && (
                  <span className="expense-note">{expense.note}</span>
                )}
                <button
                  className="expense-delete-btn"
                  onClick={() => handleDelete(expense.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="expenses-empty">
            <p>No expenses found</p>
          </div>
        )}
      </div>
    </div>
  );
}
