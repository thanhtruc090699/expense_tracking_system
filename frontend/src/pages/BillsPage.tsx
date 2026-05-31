import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Card,
  CardTitle,
  CardBody,
  Badge,
} from '@patternfly/react-core';
import { TrashIcon, EyeIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { getToken } from '../auth';

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
  const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? ''

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
      <>
        <Title headingLevel="h1" size="xl">Bills</Title>
        <p>Authentication required to view bills</p>
      </>
    );
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Title headingLevel="h1" size="xl">Bills</Title>
      <p>Manage and track your bills</p>

      <Card>
        <CardTitle>Bill List</CardTitle>
        <CardBody>
          <Table variant="compact" isStriped aria-label="Bills table">
            <Thead>
              <Tr>
                <Th>File URL</Th>
                <Th>File Type</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bills.map((bill) => (
                <>
                  <Tr key={bill.id}>
                    <Td>{bill.fileUrl}</Td>
                    <Td>{bill.fileType}</Td>
                    <Td>
                      {bill.isDuplicate ? (
                        <Badge isRead>Duplicate</Badge>
                      ) : (
                        <Badge isRead={false}>New</Badge>
                      )}
                    </Td>
                    <Td>{new Date(bill.createdAt).toLocaleDateString()}</Td>
                    <Td>
                      <Button
                        variant="secondary"
                        icon={<EyeIcon />}
                        onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        icon={<TrashIcon />}
                        onClick={() => handleDeleteBill(bill.id)}
                        style={{ marginLeft: '8px' }}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                  {expandedBillId === bill.id && (
                    <Tr key={`${bill.id}-expand`}>
                      <Td colSpan={5}>
                        <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          <strong>Bill Details:</strong>
                          <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(bill, null, 2)}
                          </pre>
                        </div>
                      </Td>
                    </Tr>
                  )}
                </>
              ))}
              {bills.length === 0 && (
                <Tr>
                  <Td colSpan={5} style={{ textAlign: 'center' }}>
                    No bills found
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