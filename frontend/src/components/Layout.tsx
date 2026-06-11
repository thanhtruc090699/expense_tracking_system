import NavBar from './NavBar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-container">
      <div className="main-wrapper">
        <main className="mobile-content">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <NavBar />
      </div>
    </div>
  );
}
