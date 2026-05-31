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

interface Budget {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  notifyThreshold: number;
  endDate: string | null;
  createdAt: string;
  category?: { name: string } | null;
}

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

  const fetchBudgets = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch(`${ALLOWED_HOST}/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(await res.json());
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/budgets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBudgets();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!getToken()) return <Title headingLevel="h1">Budgets</Title>;
  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">Budgets</Title>
      <p>Manage your budgets</p>

      <Card>
        <CardBody>
          <Table variant="compact" isStriped>
            <Thead>
              <Tr><Th>Category</Th><Th>Amount</Th><Th>Threshold</Th><Th>End Date</Th><Th>Actions</Th></Tr>
            </Thead>
            <Tbody>
              {budgets.map((b) => (
                <Tr key={b.id}>
                  <Td>{b.category?.name || 'Total'}</Td>
                  <Td>${Number(b.amount).toFixed(2)}</Td>
                  <Td>{Number(b.notifyThreshold).toFixed(0)}%</Td>
                  <Td>{b.endDate ? new Date(b.endDate).toLocaleDateString() : 'No limit'}</Td>
                  <Td>
                    <Button variant="danger" icon={<TrashIcon />} onClick={() => handleDelete(b.id)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
              {budgets.length === 0 && <Tr><Td colSpan={5} style={{ textAlign: 'center' }}>No budgets</Td></Tr>}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
