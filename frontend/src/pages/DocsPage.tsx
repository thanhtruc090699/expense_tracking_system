import { Title } from '@patternfly/react-core';

export function DocsPage() {
  return (
    <div style={{ height: '100%' }}>
      <Title headingLevel="h1" size="xl" style={{ marginBottom: '16px' }}>API Documentation</Title>
      <iframe
        src="/api-docs.html"
        style={{ width: '100%', height: 'calc(100vh - 150px)', border: '1px solid #ccc', borderRadius: '4px' }}
        title="API Documentation"
      />
    </div>
  );
}
