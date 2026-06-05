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

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

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
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  const fetchExpenses = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/expenses`, {
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
      await fetch(`${ALLOWED_HOST}:3000/expenses/${id}`, {
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
        <Title headingLevel="h1" size="xl">
          Expenses
        </Title>
        <p>Authentication required</p>
      </>
    );
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">
        Expenses
      </Title>
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

      <Button
        variant="primary"
        onClick={() => setShowAddExpense(true)}
        style={{
          position: 'fixed',
         bottom: '120px',
        right: '32px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          fontSize: '28px',
          zIndex: 1000,
        }}
      >
        +
      </Button>

      {showAddExpense && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: 'white',
              width: '500px',
              borderRadius: '20px',
              padding: '24px',
            }}
          >
            <Title headingLevel="h2">Add Expense</Title>

            <div style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
              <Button
                variant={activeTab === 'scan' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('scan')}
              >
                Receipt Scan
              </Button>

              <Button
                variant={activeTab === 'manual' ? 'primary' : 'secondary'}
                onClick={() => setActiveTab('manual')}
              >
                Manual Entry
              </Button>
            </div>

            {activeTab === 'scan' && (
              <div>
                <p>Upload your receipt here.</p>
                <Button variant="secondary">Choose File</Button>
              </div>
            )}

            {activeTab === 'manual' && (
              <div>
                <p>Manual expense form comes here.</p>
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowAddExpense(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}