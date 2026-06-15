import { useState, useEffect } from 'react';
import { getToken } from '../auth';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import './CategoriesPage.css';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

  const fetchCategories = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(await res.json());
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!getToken()) return <div className="categories-page"><h1>Categories</h1></div>;
  if (loading) return <div className="categories-loading">Loading...</div>;

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Categories</h1>
        <p>Manage expense categories</p>
      </div>

      <div className="categories-list">
        {categories.length > 0 ? (
          categories.map((c) => (
            <div className="category-card" key={c.id}>
              <div className="category-left">
                <span className="category-icon">{c.icon || '📁'}</span>
                <div className="category-info">
                  <span className="category-name">{c.name}</span>
                  <span className="category-created">
                    Created: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                className="category-delete-btn"
                onClick={() => setDeleteCategoryId(c.id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="categories-empty">
            <p>No categories found</p>
          </div>
        )}
      </div>
      <ConfirmDeleteDialog
        isOpen={deleteCategoryId !== null}
        title="Delete category?"
        message="This category will be removed if it is not used by transactions or budgets."
        onCancel={() => setDeleteCategoryId(null)}
        onConfirm={() => {
          if (deleteCategoryId) {
            return handleDelete(deleteCategoryId);
          }
        }}
      />
    </div>
  );
}
