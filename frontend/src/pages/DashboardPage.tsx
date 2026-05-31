import { useState, useEffect } from 'react';
import { Card, CardTitle, CardBody, Title, Icon } from '@patternfly/react-core';
import { FileInvoiceIcon, CheckCircleIcon, DollarSignIcon } from '@patternfly/react-icons';
import { getToken } from '../auth';

const ALLOWED_HOST = import.meta.env.VITE_ALLOWED_HOSTS ?? '';

interface Expense {
  id: string;
  totalAmount: number;
  expenseDate: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, count: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      
      try {
        const res = await fetch(`${ALLOWED_HOST}:3000/expenses`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const expenses: Expense[] = await res.json();
        
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const total = expenses.reduce((sum, e) => sum + Number(e.totalAmount), 0);
        const thisMonthTotal = expenses
          .filter(e => new Date(e.expenseDate) >= thisMonthStart)
          .reduce((sum, e) => sum + Number(e.totalAmount), 0);
        
        setStats({ total, count: expenses.length, thisMonth: thisMonthTotal });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Title headingLevel="h1" size="xl">Dashboard</Title>
      <p>Welcome to BillBuddy - your personal expense tracker</p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>Total Expenses</CardTitle>
          <CardBody>
            <Icon status="info"><FileInvoiceIcon /></Icon> ${stats.total.toFixed(2)}
          </CardBody>
        </Card>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>This Month</CardTitle>
          <CardBody>
            <Icon status="success"><DollarSignIcon /></Icon> ${stats.thisMonth.toFixed(2)}
          </CardBody>
        </Card>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>Transactions</CardTitle>
          <CardBody>
            <Icon status="success"><CheckCircleIcon /></Icon> {stats.count}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
