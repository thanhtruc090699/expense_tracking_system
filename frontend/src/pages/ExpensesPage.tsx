import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Card,
  CardBody,
  Badge,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { TrashIcon } from '@patternfly/react-icons';
import { getToken } from '../auth';

interface Expense {
  id: string;
  userId: string;
  merchantId: string | null;
  totalAmount: number;
  expenseDate: string;
  isRecurring: boolean;
  note: string | null;
  createdAt: string;
  merchant?: { name: string } | null;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('http://10.0.0.2:3000/expenses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`http://10.0.0.2:3000/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const token = getToken();
  
  if (!token) {
    return (
      <>
        <Title headingLevel="h1" size="xl">Expenses</Title>
        <p>Authentication required</p>
      </>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">Expenses</Title>
      <p>Track your expenses</p>

      <Card>
        <CardBody>
          <Table variant="compact" isStriped aria-label="Expenses table">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Merchant</Th>
                <Th>Amount</Th>
                <Th>Recurring</Th>
                <Th>Note</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.map((expense) => (
                <Tr key={expense.id}>
                  <Td>{new Date(expense.expenseDate).toLocaleDateString()}</Td>
                  <Td>{expense.merchant?.name || 'N/A'}</Td>
                  <Td>${Number(expense.totalAmount).toFixed(2)}</Td>
                  <Td>
                    {expense.isRecurring ? (
                      <Badge color="blue">Yes</Badge>
                    ) : (
                      <Badge isRead>No</Badge>
                    )}
                  </Td>
                  <Td>{expense.note || '-'}</Td>
                  <Td>
                    <Button
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => handleDelete(expense.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
              {expenses.length === 0 && (
                <Tr>
                  <Td colSpan={6} style={{ textAlign: 'center' }}>
                    No expenses found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
