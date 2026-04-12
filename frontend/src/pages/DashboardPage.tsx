import { Card, CardTitle, CardBody, Title, Icon } from '@patternfly/react-core';
import { FileInvoiceIcon, CheckCircleIcon } from '@patternfly/react-icons';

export function DashboardPage() {
  return (
    <>
      <Title headingLevel="h1" size="xl">Dashboard</Title>
      <p>Welcome to BillBuddy - your personal bill management assistant</p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>Total Bills</CardTitle>
          <CardBody>
            <Icon status="info"><FileInvoiceIcon /></Icon> 12
          </CardBody>
        </Card>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>Total Spent</CardTitle>
          <CardBody>
            <Icon status="success"><FileInvoiceIcon /></Icon> $1,234.56
          </CardBody>
        </Card>
        <Card style={{ minWidth: '200px' }}>
          <CardTitle>Paid Bills</CardTitle>
          <CardBody>
            <Icon status="success"><CheckCircleIcon /></Icon> 8
          </CardBody>
        </Card>
      </div>
    </>
  );
}