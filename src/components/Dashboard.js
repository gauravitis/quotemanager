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
  useTheme,
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
} from '@mui/icons-material';
import '../styles/Dashboard.css';

// Placeholder components for each route
const CompanyProfile = () => <div className="page-container"><h2>Company Profile</h2></div>;
const EmployeeProfile = () => <div className="page-container"><h2>Employee Profile</h2></div>;
const Items = () => <div className="page-container"><h2>Items</h2></div>;
const Clients = () => <div className="page-container"><h2>Clients</h2></div>;
const QuoteCreator = () => <div className="page-container"><h2>Quote Creator</h2></div>;
const Quotations = () => <div className="page-container"><h2>Quotations</h2></div>;
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
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <div className="sidebar">
      <div className="sidebar-header">
        <Typography variant="h6" className="sidebar-title">
          ChemBio CRM
        </Typography>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleMenuClick(item.path)}
            className={location.pathname.includes(item.path) ? 'active-menu-item' : ''}
          >
            <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
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
          paper: 'drawer-paper',
        }}
        className="desktop-drawer"
      >
        {drawer}
      </Drawer>

      <Box className="content">
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