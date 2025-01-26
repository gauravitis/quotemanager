import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  ListItemButton,
} from '@mui/material';
import {
  Business,
  Person,
  Inventory,
  People,
  Description,
  LocalShipping,
  Payment,
  Menu as MenuIcon,
  Create,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import CompanyProfile from '../CompanyProfile';
import EmployeeProfile from '../EmployeeProfile';
import Items from '../Items';
import Clients from '../Clients';
import QuoteCreator from '../QuoteCreator';
import Quotations from '../Quotations';
import './Dashboard.css';

// Placeholder components for each route
const DispatchStatus = () => <div className="page-container"><h2>Dispatch Status</h2></div>;
const PaymentsStatus = () => <div className="page-container"><h2>Payments Status</h2></div>;

const menuItems = [
  { text: 'Company Profile', icon: <Business />, path: 'company' },
  { text: 'Employee Profile', icon: <Person />, path: 'employee' },
  { text: 'Items', icon: <Inventory />, path: 'items' },
  { text: 'Clients', icon: <People />, path: 'clients' },
  { text: 'Quote Creator', icon: <Create />, path: 'quote-creator' },
  { text: 'Quotations', icon: <Description />, path: 'quotations' },
  { text: 'Dispatch Status', icon: <LocalShipping />, path: 'dispatch' },
  { text: 'Payments Status', icon: <Payment />, path: 'payments' },
];

function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(`/dashboard/${path}`);
    setMobileOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const drawer = (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <Typography variant="h6" className="sidebar-title">
            ChemBio CRM
          </Typography>
        )}
        <IconButton 
          onClick={toggleCollapse} 
          className="collapse-btn"
          size="small"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </div>
      <List>
        {menuItems.map((item) => (
          <Tooltip title={isCollapsed ? item.text : ""} placement="right" key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleMenuClick(item.path)}
                className={location.pathname.includes(item.path) ? 'active-menu-item' : ''}
              >
                <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
                {!isCollapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </div>
  );

  return (
    <Box className="dashboard-container">
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        className="menu-button"
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        classes={{
          paper: 'drawer-paper',
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        classes={{
          paper: `drawer-paper ${isCollapsed ? 'collapsed' : ''}`,
        }}
        className="desktop-drawer"
      >
        {drawer}
      </Drawer>

      <Box className={`content ${isCollapsed ? 'content-expanded' : ''}`}>
        <div className="page-header">
          <Typography variant="h4" className="page-title">
            {menuItems.find(item => location.pathname.endsWith(item.path))?.text || 'Dashboard'}
          </Typography>
        </div>
        <Routes>
          <Route path="company" element={<CompanyProfile />} />
          <Route path="employee" element={<EmployeeProfile />} />
          <Route path="items" element={<Items />} />
          <Route path="clients" element={<Clients />} />
          <Route path="quote-creator" element={<QuoteCreator />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="dispatch" element={<DispatchStatus />} />
          <Route path="payments" element={<PaymentsStatus />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard; 