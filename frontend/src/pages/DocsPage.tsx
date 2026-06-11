export function DocsPage() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">API Documentation</h1>
      <iframe
        src="/api-docs.html"
        className="docs-iframe"
        title="API Documentation"
      />
    </div>
  );
}
