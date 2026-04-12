import { Title, Card, CardBody, Button, ButtonVariant } from '@patternfly/react-core';

export function BillsPage() {
  const columns = ['Bill Name', 'Amount', 'Due Date', 'Status', 'Actions'];
  const rows = [
    ['Electric Bill', '$120.00', '2024-01-15', 'Pending', 'View'],
    ['Water Bill', '$45.00', '2024-01-20', 'Paid', 'View'],
    ['Internet', '$80.00', '2024-01-25', 'Pending', 'View'],
  ];

  return (
    <>
      <Title headingLevel="h1" size="xl">Bills</Title>
      <p>Manage and track your bills</p>

      <Card>
        <CardBody>
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{cell}</td>
                  ))}
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <Button variant={ButtonVariant.secondary} size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </>
  );
}