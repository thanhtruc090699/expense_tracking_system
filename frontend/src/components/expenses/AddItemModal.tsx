import { useState, useEffect } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (itemData: AddItemFormData) => Promise<void>;
  onEdit?: (itemId: string, itemData: AddItemFormData) => Promise<void>;
  editingItem?: EditingItemData | null;
  categories: CategoryOption[];
}

export interface AddItemFormData {
  itemName: string;
  unitPrice: string;
  quantity: string;
  categoryId: string;
}

export interface EditingItemData {
  id: string;
  itemName: string;
  unitPrice: string;
  quantity: string;
  categoryId: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export function AddItemModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  editingItem,
  categories,
}: AddItemModalProps) {
  const [form, setForm] = useState<AddItemFormData>({
    itemName: '',
    unitPrice: '',
    quantity: '1',
    categoryId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        itemName: editingItem.itemName,
        unitPrice: editingItem.unitPrice,
        quantity: editingItem.quantity,
        categoryId: editingItem.categoryId,
      });
    } else {
      setForm({
        itemName: '',
        unitPrice: '',
        quantity: '1',
        categoryId: '',
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async () => {
    if (!form.itemName || !form.unitPrice || !form.categoryId) return;
    
    setIsSubmitting(true);
    
    try {
      if (editingItem && onEdit) {
        await onEdit(editingItem.id, form);
      } else {
        await onAdd(form);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="add-item-modal-overlay" onClick={onClose}>
      <div
        className="add-item-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-item-modal-header">
          <h2 className="add-item-modal-title">
            {editingItem ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            className="add-item-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12" stroke="#0A0A0A" strokeWidth="1.33" strokeLinecap="round" />
              <path d="M4 4L12 12" stroke="#0A0A0A" strokeWidth="1.33" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="add-item-modal-form">
          {/* Item Name */}
          <div className="add-item-modal-field">
            <label className="add-item-modal-label">Item Name</label>
            <input
              type="text"
              placeholder="Enter item name"
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="add-item-modal-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Unit Price */}
          <div className="add-item-modal-field">
            <label className="add-item-modal-label">Unit Price (€)</label>
            <input
              type="number"
              placeholder="0.00"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
              step="0.01"
              min="0"
              className="add-item-modal-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity */}
          <div className="add-item-modal-field">
            <label className="add-item-modal-label">Quantity</label>
            <input
              type="number"
              placeholder="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              min="1"
              step="1"
              className="add-item-modal-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="add-item-modal-field">
            <label className="add-item-modal-label">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="add-item-modal-select"
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="add-item-modal-actions">
          <button
            className="add-item-modal-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="add-item-modal-btn-save"
            onClick={handleSubmit}
            disabled={isSubmitting || !form.itemName || !form.unitPrice || !form.categoryId}
          >
            {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
