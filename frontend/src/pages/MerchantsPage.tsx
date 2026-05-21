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

  const fetchMerchants = async () => {
    const token = getToken();
    if (!token) return;
    
    try {
      const res = await fetch('http://10.0.0.2:3000/merchants', {
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
    if (!confirm('Are you sure?')) return;
    const token = getToken();
    if (!token) return;
    
    try {
      await fetch(`${ALLOWED_HOST}:3000/merchants/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMerchants();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (!getToken()) {
    return <Title headingLevel="h1">Merchants</Title>;
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">Merchants</Title>
      <p>Manage your merchants</p>

      <Card>
        <CardBody>
          <Table variant="compact" isStriped>
            <Thead>
              <Tr><Th>Name</Th><Th>Business</Th><Th>Created</Th><Th>Actions</Th></Tr>
            </Thead>
            <Tbody>
              {merchants.map((m) => (
                <Tr key={m.id}>
                  <Td>{m.name}</Td>
                  <Td>{m.business || '-'}</Td>
                  <Td>{new Date(m.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Button variant="danger" icon={<TrashIcon />} onClick={() => handleDelete(m.id)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
              {merchants.length === 0 && <Tr><Td colSpan={4} style={{ textAlign: 'center' }}>No merchants</Td></Tr>}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );
}
