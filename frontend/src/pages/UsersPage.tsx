import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Card,
  CardTitle,
  CardBody,
  Form,
  FormGroup,
  TextInput,
  Modal,
  Badge,
} from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { getToken } from '../auth';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface User {
  id: string;
  email: string;
  username: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = getToken();

  if (!token) {
    return (
      <>
        <Title headingLevel="h1" size="xl">Users</Title>
        <p>Authentication required to view users</p>
      </>
    );
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${ALLOWED_HOST}:3000/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) return;
    if (!token) return;
    setIsLoading(true);
    try {
      await fetch(`${ALLOWED_HOST}:3000/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
        }),
      });
      setFormData({ email: '', password: '', username: '' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
    }
    setIsLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    if (!token) return;
    try {
      await fetch(`${ALLOWED_HOST}:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title headingLevel="h1" size="xl">Users</Title>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Add User
        </Button>
      </div>

      <Card>
        <CardTitle>User List</CardTitle>
        <CardBody>
          <Table variant="compact" isStriped aria-label="Users table">
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Username</Th>
                <Th>Created</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => (
                <Tr key={user.id}>
                  <Td>{user.email}</Td>
                  <Td>{user.username || <Badge isRead={false}>No username</Badge>}</Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <Button
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
              {users.length === 0 && (
                <Tr>
                  <Td colSpan={4} style={{ textAlign: 'center' }}>
                    No users found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Modal
        title="Add New User"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="50%"
      >
        <div style={{ padding: '16px' }}>
          <Form>
            <FormGroup label="Email" isRequired fieldId="email">
              <TextInput
                id="email"
                value={formData.email}
                onChange={(_, val) => setFormData({ ...formData, email: val })}
                type="email"
                placeholder="user@example.com"
              />
            </FormGroup>
            <FormGroup label="Username" fieldId="username">
              <TextInput
                id="username"
                value={formData.username}
                onChange={(_, val) => setFormData({ ...formData, username: val })}
                placeholder="Optional"
              />
            </FormGroup>
            <FormGroup label="Password" isRequired fieldId="password">
              <TextInput
                id="password"
                value={formData.password}
                onChange={(_, val) => setFormData({ ...formData, password: val })}
                type="password"
              />
            </FormGroup>
          </Form>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateUser} isLoading={isLoading}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}