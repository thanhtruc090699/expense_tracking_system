import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getToken } from '../../auth';

interface Merchant {
  id: string;
  name: string;
}

interface EditExpenseData {
  merchantName: string;
  note: string;
  expenseDate: string;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditExpenseData) => Promise<void>;
  expense: {
    id: string;
    merchant?: { name: string } | null;
    note: string | null;
    expenseDate: string;
  } | null;
}

export function EditExpenseModal({ isOpen, onClose, onSubmit, expense }: EditExpenseModalProps) {
  const [merchantName, setMerchantName] = useState('');
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense && isOpen) {
      setMerchantName(expense.merchant?.name || '');
      setNote(expense.note || '');
      const date = new Date(expense.expenseDate);
      setExpenseDate(date.toISOString().split('T')[0]);
    }
  }, [expense, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMerchants();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!merchantName.trim()) {
      setFilteredMerchants([]);
      setShowDropdown(false);
      return;
    }

    const searchTimeout = setTimeout(() => {
      const query = merchantName.toLowerCase().trim();
      const matches = merchants.filter((m) =>
        m.name.toLowerCase().includes(query)
      );
      
      const exactMatch = matches.find(
        (m) => m.name.toLowerCase() === query
      );

      setFilteredMerchants(matches.slice(0, 5));
      setShowDropdown(true);

      if (!exactMatch && query.length > 0) {
        setShowDropdown(true);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [merchantName, merchants]);

  const fetchMerchants = async () => {
    const token = getToken();
    if (!token) {
      console.warn('No token found for fetching merchants');
      return;
    }

    const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';
    const response = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched merchants:', data.length);
      setMerchants(data);
    } else {
      console.error('Failed to fetch merchants, status:', response.status);
    }
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setMerchantName(merchant.name);
    setSelectedMerchantId(merchant.id);
    setShowDropdown(false);
  };

  const handleMerchantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMerchantName(e.target.value);
    setSelectedMerchantId(null);
  };

  const handleMerchantInputFocus = () => {
    if (merchantName.trim()) {
      setShowDropdown(true);
    }
  };

  const handleSubmit = async () => {
    if (!merchantName || !expenseDate) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        merchantName,
        note,
        expenseDate,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExactMerchantMatch = () => {
    const query = merchantName.toLowerCase().trim();
    return merchants.some((m) => m.name.toLowerCase() === query);
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="edit-expense-modal-overlay" onClick={onClose}>
      <div
        className="edit-expense-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="edit-expense-modal-header">
          <h2 className="edit-expense-modal-title">Edit Expense</h2>
          <button
            className="edit-expense-modal-close"
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
        <div className="edit-expense-modal-form">
          {/* Merchant Name */}
          <div className="edit-expense-modal-field has-dropdown">
            <label className="edit-expense-modal-label">Merchant Name</label>
            <div className="edit-expense-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="edit-expense-modal-input"
                placeholder="Search or create merchant"
                value={merchantName}
                onChange={handleMerchantInputChange}
                onFocus={handleMerchantInputFocus}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>

            {showDropdown && (
              <div className="edit-expense-dropdown">
                {filteredMerchants.length > 0 && filteredMerchants.map((merchant) => (
                  <button
                    key={merchant.id}
                    className="edit-expense-dropdown-item"
                    onClick={() => handleMerchantSelect(merchant)}
                    type="button"
                  >
                    <span>{merchant.name}</span>
                    {selectedMerchantId === merchant.id && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                ))}
                {!hasExactMerchantMatch() && (
                  <button
                    className="edit-expense-dropdown-item create-new"
                    onClick={() => setSelectedMerchantId(null)}
                    type="button"
                  >
                    <span>Create new: <strong>{merchantName}</strong></span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="edit-expense-modal-field">
            <label className="edit-expense-modal-label">Description</label>
            <textarea
              className="edit-expense-modal-textarea"
              placeholder="Add a description..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Date */}
          <div className="edit-expense-modal-field">
            <label className="edit-expense-modal-label">Date</label>
            <input
              type="date"
              className="edit-expense-modal-input"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="edit-expense-modal-actions">
          <button
            className="edit-expense-modal-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="edit-expense-modal-btn-save"
            onClick={handleSubmit}
            disabled={isSubmitting || !merchantName || !expenseDate}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
