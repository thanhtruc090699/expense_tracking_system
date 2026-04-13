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

  const fetchBills = async () => {
    try {
      const res = await fetch('http://10.0.0.2:3000/bills');
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    try {
      await fetch(`http://10.0.0.2:3000/bills/${id}`, { method: 'DELETE' });
      fetchBills();
    } catch (err) {
      console.error('Failed to delete bill:', err);
    }
  };

  return (
    <>
      <Title headingLevel="h1" size="xl">Bills</Title>
      <p>Manage and track your bills</p>

      <Card>
        <CardTitle>Bill List</CardTitle>
        <CardBody>
          <Table variant="compact" aria-label="Bills table">
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