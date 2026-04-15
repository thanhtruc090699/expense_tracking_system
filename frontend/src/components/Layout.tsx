import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  Masthead,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  MastheadContent,
  Nav,
  NavItem,
  NavList,
  Button,
  Icon,
} from '@patternfly/react-core';
import { BarsIcon, HomeIcon, FileInvoiceIcon, CogIcon, CameraIcon, UsersIcon, ChatIcon } from '@patternfly/react-icons';
import logo from '../assets/billbuddy.svg';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const onSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { groupId: 'main', itemId: 'dashboard', title: 'Dashboard', icon: <Icon><HomeIcon /></Icon> },
    { groupId: 'main', itemId: 'bills', title: 'Bills', icon: <Icon><FileInvoiceIcon /></Icon> },
    { groupId: 'main', itemId: 'ocr', title: 'OCR Test', icon: <Icon><CameraIcon /></Icon> },
    { groupId: 'main', itemId: 'lisa', title: 'LISA Chat', icon: <Icon><ChatIcon /></Icon> },
    { groupId: 'main', itemId: 'users', title: 'Users', icon: <Icon><UsersIcon /></Icon> },
    { groupId: 'main', itemId: 'settings', title: 'Settings', icon: <Icon><CogIcon /></Icon> },
  ];

  const onNavSelect = (_event: React.FormEvent<HTMLDivElement>, result: { itemId: number | string }) => {
    const itemId = result.itemId;
    const navItem = navItems.find((item) => item.itemId === itemId);
    if (navItem) {
      navigate(`/${navItem.itemId === 'dashboard' ? '' : navItem.itemId}`);
    }
  };

  const PageNav = (
    <Nav onSelect={onNavSelect} aria-label="Nav">
      <NavList>
        {navItems.map((item) => (
          <NavItem
            key={item.itemId}
            itemId={item.itemId}
            isActive={location.pathname === `/${item.itemId}` || (item.itemId === 'dashboard' && location.pathname === '/')}
            icon={item.icon}
          >
            {item.title}
          </NavItem>
        ))}
      </NavList>
    </Nav>
  );

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <Button
            variant="plain"
            onClick={onSidebarToggle}
            aria-label="Global navigation"
          >
            <BarsIcon />
          </Button>
        </MastheadToggle>
        <MastheadBrand href="/dashboard" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
          <img src={logo} alt="BillBuddy" style={{ height: '30px', cursor: 'pointer' }} />
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent />
    </Masthead>
  );

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen} id="default-sidebar">
      <PageSidebarBody>{PageNav}</PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      <PageSection>{children}</PageSection>
    </Page>
  );
}