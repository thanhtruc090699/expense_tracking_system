import { useEffect } from 'react';
import type { Expense, ExpenseItem } from '../../types/expense';
import { PieChart } from './PieChart';
import { getCategoryColor } from '../../utils/categoryColors';

interface TransactionDetailSheetProps {
  expense: Expense | null;
  items: ExpenseItem[];
  onClose: () => void;
  onAddItem: () => void;
  onEditItem: (item: ExpenseItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function TransactionDetailSheet({
  expense,
  items,
  onClose,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: TransactionDetailSheetProps) {
  if (!expense) {
    return null;
  }

  const categoryBreakdown = items.reduce(
    (acc, item) => {
      const category = item.categoryName || 'Other';
      acc[category] = (acc[category] || 0) + parseFloat(item.totalPrice);
      return acc;
    },
    {} as Record<string, number>
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.totalPrice),
    0
  );
  
  const categories = Object.entries(categoryBreakdown).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);

  return (
    <div className="transaction-detail-backdrop" onClick={onClose}>
      <div
        className="transaction-detail-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="transaction-detail-header">
          <div className="transaction-detail-drag-handle" />
          <div className="transaction-detail-title-row">
            <h2 className="transaction-detail-title">{expense.merchant?.name || 'Transaction'}</h2>
            <button className="transaction-detail-close" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15" stroke="#0A0A0A" strokeWidth="1.67" strokeLinecap="round" />
                <path d="M5 5L15 15" stroke="#0A0A0A" strokeWidth="1.67" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="transaction-detail-content">
          {/* Amount + Date */}
          <div className="transaction-detail-amount-section">
            <h3 className="transaction-detail-total">€{Number(expense.totalAmount).toFixed(2)}</h3>
            <p className="transaction-detail-date">
              {new Date(expense.expenseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Category Breakdown */}
          {categories.length > 0 && (
            <div className="transaction-detail-category-breakdown">
              <h3 className="transaction-detail-section-title">Category Breakdown</h3>
              <div className="transaction-detail-chart-container">
                <PieChart data={categoryBreakdown} size={120} />
                <div className="transaction-detail-category-legend">
                  {categories.map(([cat, amount]: [string, number]) => {
                    const percentage = Math.round((amount / totalAmount) * 100);
                    return (
                      <div key={cat} className="transaction-detail-category-item">
                        <span 
                          className="transaction-detail-category-dot"
                          style={{ backgroundColor: getCategoryColor(cat) }}
                        />
                        <span className="transaction-detail-category-name">{cat}</span>
                        <span className="transaction-detail-category-percentage">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="transaction-detail-items-section">
            <div className="transaction-detail-items-header">
              <h3 className="transaction-detail-section-title">Items ({items.length})</h3>
              <button className="transaction-detail-add-btn" onClick={onAddItem}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.33337 8H12.6667" stroke="white" strokeWidth="1.33" strokeLinecap="round" />
                  <path d="M8 3.3335V12.6668" stroke="white" strokeWidth="1.33" strokeLinecap="round" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="transaction-detail-items-list">
              {items.map((item) => (
                <div key={item.id} className="transaction-detail-item">
                  <div className="transaction-detail-item-info">
                    <p className="transaction-detail-item-name">{item.itemName}</p>
                    <p className="transaction-detail-item-category">
                      {item.quantity}x €{Number(item.unitPrice).toFixed(2)} • {item.categoryName || 'Uncategorized'}
                    </p>
                  </div>
                  <div className="transaction-detail-item-actions">
                    <p className="transaction-detail-item-price">
                      €{Number(item.totalPrice).toFixed(2)}
                    </p>
                    <div className="transaction-detail-item-buttons">
                      <button
                        className="transaction-detail-item-btn-edit"
                        onClick={() => onEditItem(item)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M14.116 4.54126C14.4685 4.18888 14.6665 3.71091 14.6666 3.2125C14.6666 2.71409 14.4687 2.23607 14.1163 1.8836C13.7639 1.53112 13.286 1.33307 12.7876 1.33301C12.2892 1.33295 11.8111 1.53088 11.4587 1.88326L2.56133 10.7826C2.40654 10.9369 2.29207 11.127 2.228 11.3359L1.34733 14.2373C1.3301 14.2949 1.3288 14.3562 1.34356 14.4145C1.35833 14.4728 1.38861 14.5261 1.43119 14.5686C1.47378 14.6111 1.52708 14.6413 1.58544 14.656C1.64379 14.6707 1.70504 14.6693 1.76266 14.6519L4.66466 13.7719C4.87344 13.7084 5.06345 13.5947 5.218 13.4406L14.116 4.54126Z" stroke="#4A5565" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 3.3335L12.6667 6.00016" stroke="#4A5565" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="transaction-detail-item-btn-delete"
                        onClick={() => onDeleteItem(item.id)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 4H14" stroke="#E7000B" strokeWidth="1.33" strokeLinecap="round" />
                          <path d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3334 14.6667H4.66671C4.00004 14.6667 3.33337 14 3.33337 13.3333V4" stroke="#E7000B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5.33337 4.00016V2.66683C5.33337 2.00016 6.00004 1.3335 6.66671 1.3335H9.33337C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016" stroke="#E7000B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6.66663 7.3335V11.3335" stroke="#E7000B" strokeWidth="1.33" strokeLinecap="round" />
                          <path d="M9.33337 7.3335V11.3335" stroke="#E7000B" strokeWidth="1.33" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="transaction-detail-empty-items">
                  <p>No items in this expense</p>
                  <button className="transaction-detail-add-first-btn" onClick={(e) => { e.stopPropagation(); onAddItem(); }}>
                    Add your first item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
