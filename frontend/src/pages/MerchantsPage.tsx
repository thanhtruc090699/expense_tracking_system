import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import './MerchantsPage.css';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface Merchant {
  id: string;
  name: string;
  business: string | null;
  createdAt: string;
}

export function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMerchantId, setDeleteMerchantId] = useState<string | null>(null);

  const fetchMerchants = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/merchants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMerchants(await res.json());
    } catch (err) {
      console.error('Failed to fetch merchants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/merchants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteMerchantId(null);
      fetchMerchants();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!getToken()) {
    return <div className="merchants-page"><h1>Merchants</h1></div>;
  }

  if (loading) return <div className="merchants-loading">Loading...</div>;

  return (
    <div className="merchants-page">
      <div className="merchants-header">
        <h1>Merchants</h1>
        <p>Manage your merchants</p>
      </div>

      <div className="merchants-list">
        {merchants.length > 0 ? (
          merchants.map((m) => (
            <div className="merchant-card" key={m.id}>
              <div className="merchant-info">
                <span className="merchant-name">{m.name}</span>
                <span className="merchant-business">{m.business || 'No business info'}</span>
                <span className="merchant-created">
                  Added: {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                className="merchant-delete-btn"
                onClick={() => setDeleteMerchantId(m.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="merchants-empty">
            <p>No merchants found</p>
          </div>
        )}
      </div>
      <ConfirmDeleteDialog
        isOpen={deleteMerchantId !== null}
        title="Delete merchant?"
        message="This merchant will be removed if no transactions still depend on it."
        onCancel={() => setDeleteMerchantId(null)}
        onConfirm={() => {
          if (deleteMerchantId) {
            return handleDelete(deleteMerchantId);
          }
        }}
      />
    </div>
  );
}
