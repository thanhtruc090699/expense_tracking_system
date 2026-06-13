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

type FilterType = 'all' | 'month' | 'week';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const fetchExpenses = async (filter: FilterType = 'all') => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let url = `${ALLOWED_HOST}:3000/expenses`;
      const params = new URLSearchParams();

      if (filter === 'month') {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        params.set('startDate', startDate.toISOString());
        params.set('endDate', endDate.toISOString());
      } else if (filter === 'week') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        params.set('startDate', monday.toISOString());
        params.set('endDate', sunday.toISOString());
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, {
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
    fetchExpenses(activeFilter);
  }, [activeFilter]);

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

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h1>Expenses</h1>
        <p>Track your expenses</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${activeFilter === 'month' ? 'active' : ''}`}
          onClick={() => setActiveFilter('month')}
        >
          Month
        </button>
        <button
          className={`filter-tab ${activeFilter === 'week' ? 'active' : ''}`}
          onClick={() => setActiveFilter('week')}
        >
          Week
        </button>
      </div>

      {loading && <div className="expenses-loading">Loading...</div>}

      {!loading && (
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
          !loading && (
            <div className="expenses-empty">
              <p>No expenses found</p>
            </div>
          )
        )}
        </div>
      )}
    </div>
  );
}
