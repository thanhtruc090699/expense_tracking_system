import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import type { Expense, ExpenseItem } from '../types/expense';
import './ExpensesPage.css';
import '../components/expenses/TransactionDetailSheet.css';
import { TransactionDetailSheet } from '../components/expenses/TransactionDetailSheet';
import type { AddItemFormData, EditingItemData } from '../components/expenses/AddItemModal';
import { AddItemModal } from '../components/expenses/AddItemModal';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

type FilterType = 'all' | 'month' | 'week';

const EXPENSES_PER_PAGE = 50;

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Detail sheet state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  
  // Add/Edit item modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItemData | null>(null);
  
  // Categories state
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const fetchCategories = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchExpenses = async (filter: FilterType = 'all', newOffset: number = 0, append: boolean = false) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    if (!append) {
      setLoading(true);
    }

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
      } else if (filter === 'all') {
        params.set('limit', EXPENSES_PER_PAGE.toString());
        params.set('offset', newOffset.toString());
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
      
      if (append) {
        setExpenses(prev => [...prev, ...data]);
      } else {
        setExpenses(data);
      }
      
      setHasMore(data.length === EXPENSES_PER_PAGE);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreExpenses = () => {
    if (loading || !hasMore || activeFilter !== 'all') return;
    
    const newOffset = offset + EXPENSES_PER_PAGE;
    setOffset(newOffset);
    fetchExpenses('all', newOffset, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (activeFilter !== 'all') return;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreExpenses();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, activeFilter, offset]);

  useEffect(() => {
    setExpenses([]);
    setOffset(0);
    setHasMore(true);
    fetchExpenses(activeFilter, 0, false);
    fetchCategories();
  }, [activeFilter]);

  const fetchExpenseWithItems = async (expenseId: string) => {
    console.log('[DEBUG] Clicking expense:', expenseId);
    const token = getToken();
    if (!token) {
      console.error('[DEBUG] No token found');
      return;
    }

    try {
      console.log('[DEBUG] Fetching expense details...');
      const res = await fetch(`${ALLOWED_HOST}:3000/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const expense = await res.json();
        console.log('[DEBUG] Got expense:', expense.merchant?.name);
        setSelectedExpense(expense);
        
        const itemsRes = await fetch(`${ALLOWED_HOST}:3000/expense-items?expenseId=${expenseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (itemsRes.ok) {
          const items = await itemsRes.json();
          
          const itemsWithCategories = await Promise.all(
            items.map(async (item: ExpenseItem & { categoryId: string | null }) => {
              if (item.categoryId) {
                const catRes = await fetch(`${ALLOWED_HOST}:3000/categories/${item.categoryId}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (catRes.ok) {
                  const category = await catRes.json();
                  return { ...item, categoryName: category.name };
                }
              }
              return { ...item, categoryName: null };
            })
          );
          
          setExpenseItems(itemsWithCategories);
        }
      }
    } catch (err) {
      console.error('Failed to fetch expense details:', err);
    }
  };

  const handleAddItem = async (itemData: AddItemFormData) => {
    const token = getToken();
    if (!token || !selectedExpense) return;

    const totalPrice = (parseFloat(itemData.unitPrice) * parseInt(itemData.quantity)).toFixed(2);

    await fetch(`${ALLOWED_HOST}:3000/expense-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        expenseId: selectedExpense.id,
        itemName: itemData.itemName,
        unitPrice: itemData.unitPrice,
        quantity: parseInt(itemData.quantity),
        totalPrice: totalPrice,
        categoryId: itemData.categoryId || null,
      }),
    });

    await refreshExpenseItems();
    setIsAddItemModalOpen(false);
  };

  const handleEditItem = async (itemId: string, itemData: AddItemFormData) => {
    const token = getToken();
    if (!token) return;

    const totalPrice = (parseFloat(itemData.unitPrice) * parseInt(itemData.quantity)).toFixed(2);

    await fetch(`${ALLOWED_HOST}:3000/expense-items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        itemName: itemData.itemName,
        unitPrice: itemData.unitPrice,
        quantity: parseInt(itemData.quantity),
        totalPrice: totalPrice,
        categoryId: itemData.categoryId || null,
      }),
    });

    await refreshExpenseItems();
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    
    const token = getToken();
    if (!token) return;

    await fetch(`${ALLOWED_HOST}:3000/expense-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await refreshExpenseItems();
  };

  const refreshExpenseItems = async () => {
    if (!selectedExpense) return;
    
    const token = getToken();
    if (!token) return;

    try {
      const itemsRes = await fetch(`${ALLOWED_HOST}:3000/expense-items?expenseId=${selectedExpense.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        
        const itemsWithCategories = await Promise.all(
          items.map(async (item: ExpenseItem & { categoryId: string | null }) => {
            if (item.categoryId) {
              const catRes = await fetch(`${ALLOWED_HOST}:3000/categories/${item.categoryId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (catRes.ok) {
                const category = await catRes.json();
                return { ...item, categoryName: category.name };
              }
            }
            return { ...item, categoryName: null };
          })
        );
        
        setExpenseItems(itemsWithCategories);
        
        const totalAmount = itemsWithCategories.reduce(
          (sum: number, item) => sum + parseFloat(item.totalPrice),
          0
        );
        
        setSelectedExpense((prev: Expense | null) => prev ? { ...prev, totalAmount } : null);
      }
    } catch (err) {
      console.error('Failed to refresh items:', err);
    }
  };

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

      fetchExpenses(activeFilter, 0, false);
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
            <div 
              className="expense-card clickable" 
              key={expense.id}
              onClick={() => fetchExpenseWithItems(expense.id)}
            >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(expense.id);
                  }}
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

      {loading && expenses.length > 0 && activeFilter === 'all' && (
        <div className="expenses-loading-more">Loading more...</div>
      )}

      {!hasMore && expenses.length > 0 && activeFilter === 'all' && (
        <div className="expenses-end-message">No more expenses to load</div>
      )}

      <TransactionDetailSheet
        expense={selectedExpense}
        items={expenseItems}
        onClose={() => {
          setSelectedExpense(null);
          setExpenseItems([]);
        }}
        onAddItem={() => setIsAddItemModalOpen(true)}
        onEditItem={(item) => {
          setEditingItem({
            id: item.id,
            itemName: item.itemName,
            unitPrice: item.unitPrice,
            quantity: item.quantity.toString(),
            categoryId: item.categoryId || '',
          });
          setIsAddItemModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
      />

      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setEditingItem(null);
        }}
        onAdd={handleAddItem}
        onEdit={handleEditItem}
        editingItem={editingItem}
        categories={categories}
      />
    </div>
  );
}
