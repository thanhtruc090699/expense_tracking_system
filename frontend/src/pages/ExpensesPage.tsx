import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import type { Expense, ExpenseItem } from '../types/expense';
import './ExpensesPage.css';
import '../components/expenses/TransactionDetailSheet.css';
import '../components/expenses/EditExpenseModal.css';
import { TransactionDetailSheet } from '../components/expenses/TransactionDetailSheet';
import type { AddItemFormData, EditingItemData } from '../components/expenses/AddItemModal';
import { AddItemModal } from '../components/expenses/AddItemModal';
import { EditExpenseModal } from '../components/expenses/EditExpenseModal';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { Edit, Trash2 } from 'lucide-react';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

type FilterType = 'all' | 'month' | 'week';
type PendingDelete =
  | { type: 'expense'; id: string }
  | { type: 'item'; id: string }
  | null;

const EXPENSES_PER_PAGE = 50;

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [validatingExpenseIds, setValidatingExpenseIds] = useState<Set<string>>(new Set());
  
  // Detail sheet state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  
  // Add/Edit item modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItemData | null>(null);
  
  // Edit expense modal state
  const [isEditExpenseModalOpen, setIsEditExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
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

  const fetchExpenses = async (
    filter: FilterType = 'all',
    newOffset: number = 0,
    append: boolean = false,
    categoryId: string = selectedCategoryId,
  ) => {
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

      if (categoryId) {
        params.set('categoryId', categoryId);
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
    fetchExpenses('all', newOffset, true, selectedCategoryId);
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
    fetchExpenses(activeFilter, 0, false, selectedCategoryId);
    fetchCategories();
    
    const recentlyScanned = sessionStorage.getItem('recentlyScannedExpenseIds');
    if (recentlyScanned) {
      const ids = JSON.parse(recentlyScanned);
      setValidatingExpenseIds(new Set(ids));
      ids.forEach((id: string) => {
        pollLisaValidation(id);
      });
    }
  }, [activeFilter]);

  const pollLisaValidation = async (expenseId: string, maxAttempts = 30) => {
    const token = getToken();
    if (!token) return;

    let attempts = 0;
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const res = await fetch(`${ALLOWED_HOST}:3000/expenses/${expenseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const expense = await res.json();
          
          if (expense.note?.includes('Lisa validation:') || attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setValidatingExpenseIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(expenseId);
              sessionStorage.setItem('recentlyScannedExpenseIds', JSON.stringify([...newSet]));
              return newSet;
            });
            
            setExpenses(prev => 
              prev.map(e => e.id === expenseId ? expense : e)
            );
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
        }
      }
    }, 2000);

    setTimeout(() => clearInterval(pollInterval), maxAttempts * 2000);
  };

  const fetchExpenseWithItems = async (expenseId: string) => {
    const token = getToken();
    if (!token) {
      console.error('No token found');
      return;
    }

    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const expense = await res.json();
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
    const token = getToken();
    if (!token) return;

    await fetch(`${ALLOWED_HOST}:3000/expense-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await refreshExpenseItems();
    setPendingDelete(null);
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

  const handleEditExpense = async (data: { merchantName: string; note: string; expenseDate: string }) => {
    if (!editingExpense) return;
    
    const token = getToken();
    if (!token) return;

    try {
      let merchantId: string | undefined;
      
      // Check if merchant name matches an existing merchant
      const trimmedName = data.merchantName.trim();
      const lowercaseName = trimmedName.toLowerCase();
      
      // Fetch all merchants to find exact match
      const merchantsRes = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      let existingMerchantId: string | null = null;
      
      if (merchantsRes.ok) {
        const merchants = await merchantsRes.json();
        const exactMatch = merchants.find(
          (m: { id: string; name: string }) => m.name.toLowerCase() === lowercaseName
        );
        
        if (exactMatch) {
          existingMerchantId = exactMatch.id;
        }
      }
      
      // If no exact match, create new merchant
      if (!existingMerchantId && trimmedName) {
        const createMerchantRes = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: trimmedName }),
        });

        if (createMerchantRes.ok) {
          const merchantData = await createMerchantRes.json();
          merchantId = merchantData.id;
        }
      } else if (existingMerchantId) {
        merchantId = existingMerchantId;
      }

      const updatePayload: {
        totalAmount: number;
        expenseDate: string;
        isRecurring: boolean;
        merchantId?: string;
        note?: string | null;
      } = {
        totalAmount: editingExpense.totalAmount,
        expenseDate: new Date(data.expenseDate).toISOString(),
        isRecurring: editingExpense.isRecurring,
        ...(merchantId && { merchantId }),
        ...(data.note !== undefined && { note: data.note || null }),
      };

      const res = await fetch(`${ALLOWED_HOST}:3000/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        fetchExpenses(activeFilter, 0, false, selectedCategoryId);
      }
    } catch (err) {
      console.error('Failed to edit expense:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`${ALLOWED_HOST}:3000/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchExpenses(activeFilter, 0, false, selectedCategoryId);
      setPendingDelete(null);
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
        <div className="filter-tab-row">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('all');
              setSelectedCategoryId('');
              setShowCategoryMenu(false);
            }}
          >
            All
          </button>
          <button
            className={`filter-tab ${activeFilter === 'month' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('month');
              setShowCategoryMenu(false);
            }}
          >
            Month
          </button>
          <button
            className={`filter-tab ${activeFilter === 'week' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('week');
              setShowCategoryMenu(false);
            }}
          >
            Week
          </button>
          <div className="category-filter">
            <button
              className={`filter-tab category-filter-button ${
                selectedCategoryId ? 'active' : ''
              }`}
              onClick={() => setShowCategoryMenu((open) => !open)}
            >
              Category
            </button>
            {showCategoryMenu && (
              <div className="category-filter-menu">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className="category-filter-option"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setShowCategoryMenu(false);
                    }}
                  >
                    {category.name === 'Clothing / Apparel'
                      ? 'Clothing'
                      : category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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

              <div className="expense-actions-row">
                {expense.isRecurring && (
                  <span className="expense-badge recurring">Recurring</span>
                )}
                {validatingExpenseIds.has(expense.id) && (
                  <span className="expense-badge validating">Lisa validating...</span>
                )}
                {!validatingExpenseIds.has(expense.id) && expense.note?.includes('Lisa validation: valid') && (
                  <span className="expense-badge validated">✓ Lisa validated</span>
                )}
                {!validatingExpenseIds.has(expense.id) && expense.note?.includes('Lisa validation: needs_review') && (
                  <span className="expense-badge needs-review">Lisa needs review</span>
                )}
                {expense.note && !expense.note.includes('Lisa validation:') && (
                  <span className="expense-note">{expense.note}</span>
                )}
                <div className="expense-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="expense-action-btn edit"
                    onClick={() => {
                      setEditingExpense(expense);
                      setIsEditExpenseModalOpen(true);
                    }}
                    title="Edit expense"
                  >
                    <Edit size={18} strokeWidth={2} />
                  </button>
                  <button
                    className="expense-action-btn delete"
                    onClick={() => {
                      setPendingDelete({ type: 'expense', id: expense.id });
                    }}
                    title="Delete expense"
                  >
                    <Trash2 size={18} strokeWidth={2} />
                  </button>
                </div>
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
        onDeleteItem={(itemId) => setPendingDelete({ type: 'item', id: itemId })}
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

      <EditExpenseModal
        isOpen={isEditExpenseModalOpen}
        onClose={() => {
          setIsEditExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleEditExpense}
        expense={editingExpense}
      />
      <ConfirmDeleteDialog
        isOpen={pendingDelete !== null}
        title={
          pendingDelete?.type === 'item'
            ? 'Delete transaction item?'
            : 'Delete transaction?'
        }
        message={
          pendingDelete?.type === 'item'
            ? 'This item will be removed from the transaction.'
            : 'This transaction and its items will be removed.'
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.type === 'item') {
            return handleDeleteItem(pendingDelete.id);
          }
          return handleDelete(pendingDelete.id);
        }}
      />
    </div>
  );
}
