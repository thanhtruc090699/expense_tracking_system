import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import './BillsPage.css';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface Bill {
  id: string;
  fileUrl: string;
  fileType: string;
  ocrData: object | null;
  isDuplicate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/bills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBills();
    } catch (err) {
      console.error('Failed to delete bill:', err);
    }
  };

  const token = getToken();
  
  if (!token) {
    return (
      <div className="bills-page">
        <h1>Bills</h1>
        <p>Authentication required to view bills</p>
      </div>
    );
  }

  if (loading) {
    return <div className="bills-loading">Loading...</div>;
  }

  return (
    <div className="bills-page">
      <div className="bills-header">
        <h1>Bills</h1>
        <p>Manage and track your bills</p>
      </div>

      <div className="bills-list">
        {bills.length > 0 ? (
          bills.map((bill) => (
            <div key={bill.id}>
              <div className="bill-card" onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}>
                <div className="bill-main">
                  <div className="bill-info">
                    <span className="bill-url">{bill.fileUrl}</span>
                    <span className="bill-type">{bill.fileType}</span>
                    <span className="bill-date">
                      Added: {new Date(bill.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bill-badges">
                    <span className={`bill-badge ${bill.isDuplicate ? 'duplicate' : 'new'}`}>
                      {bill.isDuplicate ? 'Duplicate' : 'New'}
                    </span>
                  </div>
                </div>
                
                <div className="bill-actions">
                  <button
                    className="bill-action-btn view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedBillId(expandedBillId === bill.id ? null : bill.id);
                    }}
                  >
                    {expandedBillId === bill.id ? 'Hide' : 'View'}
                  </button>
                  <button
                    className="bill-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBill(bill.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              {expandedBillId === bill.id && (
                <div className="bill-details">
                  <h4>Bill Details:</h4>
                  <pre>{JSON.stringify(bill, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bills-empty">
            <p>No bills found</p>
          </div>
        )}
      </div>
    </div>
  );
}
