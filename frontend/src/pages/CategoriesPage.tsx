import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { TrashIcon } from '@patternfly/react-icons';
import { getToken } from '../auth';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (!confirm('Are you sure?')) return;
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!getToken()) return <Title headingLevel="h1">Categories</Title>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">Categories</Title>
      <p>Manage expense categories</p>

      <Card>
        <CardBody>
          <Table variant="compact" isStriped>
            <Thead>
              <Tr><Th>Icon</Th><Th>Name</Th><Th>Created</Th><Th>Actions</Th></Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.icon || '📁'}</Td>
                  <Td>{c.name}</Td>
                  <Td>{new Date(c.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Button variant="danger" icon={<TrashIcon />} onClick={() => handleDelete(c.id)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
              {categories.length === 0 && <Tr><Td colSpan={4} style={{ textAlign: 'center' }}>No categories</Td></Tr>}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
