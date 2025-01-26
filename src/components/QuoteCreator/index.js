import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { generateQuotation } from '../../utils/generateQuotation';
import './styles.css';

// HSN-GST mapping
const hsnGstMapping = {
  '28': '18', // Inorganic chemicals
  '29': '18', // Organic chemicals
  '30': '12', // Pharmaceutical products
  '32': '18', // Dyes, pigments
  '38': '18', // Miscellaneous chemical products
  '39': '18', // Plastics and articles thereof
};

// Default payment terms
const defaultPaymentTerms = [
  "50% advance payment along with the purchase order and balance before dispatch of material.",
  "100% advance payment along with the purchase order.",
  "Payment within 30 days from the date of invoice.",
  "Payment within 45 days from the date of invoice."
];

function QuoteCreator() {
  // State for form data
  const [formData, setFormData] = useState({
    company: '',
    companyName: '',
    employee: '',
    employeeData: null,
    client: '',
    clientData: null,
    referenceNumber: '',
    items: [{
      catalogueId: '',
      description: '',
      packSize: '',
      quantity: '',
      hsn: '',
      price: '',
      discountPercentage: '',
      discountedPrice: '',
      expandedRate: '',
      gstRate: '',
      gstValue: '',
      total: '',
      leadTime: '',
      brand: ''
    }],
    paymentTerms: defaultPaymentTerms[0],
    notes: '',
  });

  // State for data from other collections
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [allItems, setAllItems] = useState([]); // For storing all items from database
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for new item dialog
  const [openNewItemDialog, setOpenNewItemDialog] = useState(false);
  const [newItemData, setNewItemData] = useState(null);

  // State for reference number
  const [lastReferenceNumber, setLastReferenceNumber] = useState(null);

  // State for saved quote
  const [savedQuote, setSavedQuote] = useState(null);

  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    // Set up real-time listener for companies
    const unsubscribeCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Companies fetched (real-time):', companiesData);
      setCompanies(companiesData);
    }, (error) => {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies");
    });

    // Set up real-time listener for employees
    const unsubscribeEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Employees fetched (real-time):', employeesData);
      setEmployees(employeesData);
    }, (error) => {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    });

    // Set up real-time listener for clients
    const unsubscribeClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Clients fetched (real-time):', clientsData);
      setClients(clientsData);
    }, (error) => {
      console.error("Error fetching clients:", error);
      setError("Failed to load clients");
    });

    // Fetch items on component mount
    const fetchItems = async () => {
      try {
        const itemsSnapshot = await getDocs(collection(db, 'items'));
        const itemsData = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllItems(itemsData);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();

    // Cleanup subscriptions
    return () => {
      unsubscribeCompanies();
      unsubscribeEmployees();
      unsubscribeClients();
    };
  }, []);

  // Generate reference number based on selected company
  const generateReferenceNumber = async (companyId) => {
    if (!companyId) return '';

    try {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of current year
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      // Get company details
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      if (!companyDoc.exists()) {
        throw new Error('Company not found');
      }

      const companyData = companyDoc.data();
      // Check company name for prefix
      const companyName = companyData.companyName || '';
      const prefix = companyName.toLowerCase().includes('chembio') ? 'CBLS' : 'CLS';

      // Query for last quote number for the current year (not financial year)
      const quotesRef = collection(db, 'quotes');
      const q = query(
        quotesRef,
        where('company.id', '==', companyId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      let nextNumber = 1;

      if (!snapshot.empty) {
        const lastQuote = snapshot.docs[0].data();
        // Only increment if it's from the same year and month
        if (lastQuote.referenceNumber && 
            lastQuote.referenceNumber.includes(`${prefix}/${year}${month}`)) {
          const lastNumber = parseInt(lastQuote.referenceNumber.split('/').pop()) || 0;
          nextNumber = lastNumber + 1;
        }
      }

      const paddedNumber = String(nextNumber).padStart(3, '0');
      const referenceNumber = `${prefix}/${year}${month}/${paddedNumber}`;
      
      console.log('Generated Reference Number:', {
        companyName,
        prefix,
        year,
        month,
        nextNumber,
        referenceNumber
      });

      return referenceNumber;

    } catch (err) {
      console.error('Error generating reference number:', err);
      setError('Failed to generate reference number. Please try again.');
      return '';
    }
  };

  // Handle company selection
  const handleCompanyChange = async (event, newValue) => {
    try {
      setLoading(true);
      setError(null);
      
      if (newValue) {
        console.log('Selected company:', newValue);
        // Generate reference number first
        const refNumber = await generateReferenceNumber(newValue.id);
        
        // Then update form data with both company and reference number
        setFormData(prev => ({
          ...prev,
          company: newValue.id,
          referenceNumber: refNumber,
          companyData: {
            id: newValue.id,
            name: newValue.name || newValue.companyName,
            companyName: newValue.name || newValue.companyName,
            address: newValue.address,
            email: newValue.email,
            phone: newValue.phone,
            gst: newValue.gst,
            pan: newValue.pan,
            bankDetails: newValue.bankDetails || {}
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          company: '',
          referenceNumber: '',
          companyData: null
        }));
      }
    } catch (err) {
      console.error('Error handling company change:', err);
      setError('Failed to update company selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle client selection and auto-fill
  const handleClientChange = async (event, newValue) => {
    if (newValue) {
      try {
        const clientDoc = await getDoc(doc(db, 'clients', newValue.id));
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          setFormData(prev => ({
            ...prev,
            client: newValue.id,
            clientData: {
              id: newValue.id,
              name: clientData.clientName,
              company: clientData.companyName,
              address: clientData.address,
              email: clientData.email,
              phone: clientData.phone,
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('Failed to load client details. Please try again.');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        client: '',
        clientData: null
      }));
    }
  };

  // Handle employee selection
  const handleEmployeeChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        employee: newValue.id,
        employeeData: {
          id: newValue.id,
          name: newValue.employeeName,
          email: newValue.email,
          mobile: newValue.mobile,
          designation: newValue.designation || 'Sales Executive'
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        employee: '',
        employeeData: null
      }));
    }
  };

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Calculate values if price, quantity, discount, or GST changes
    if (['price', 'quantity', 'discountPercentage', 'gstRate'].includes(field)) {
      const item = newItems[index];
      const price = parseFloat(item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const discountPercentage = parseFloat(item.discountPercentage) || 0;
      const gstRate = parseFloat(item.gstRate) || 0;

      // Calculate discounted price
      const discountAmount = (price * discountPercentage) / 100;
      item.discountedPrice = (price - discountAmount).toFixed(2);

      // Calculate expanded rate (discounted price * quantity)
      const expandedRate = item.discountedPrice * quantity;
      item.expandedRate = expandedRate.toFixed(2);

      // Calculate GST value
      item.gstValue = ((expandedRate * gstRate) / 100).toFixed(2);

      // Calculate total
      item.total = (expandedRate + parseFloat(item.gstValue)).toFixed(2);
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // Handle adding new item to quote
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        catalogueId: '',
        description: '',
        packSize: '',
        quantity: '',
        hsn: '',
        price: '',
        discountPercentage: '',
        discountedPrice: '',
        expandedRate: '',
        gstRate: '',
        gstValue: '',
        total: '',
        leadTime: '',
        brand: ''
      }]
    }));
  };

  // Handle removing item from quote
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Handle downloading quote
  const handleDownloadQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.company || !formData.employee || !formData.client || !formData.referenceNumber) {
        throw new Error('Please fill in all required fields (Company, Employee, Client, Reference Number)');
      }

      if (!formData.items || formData.items.length === 0) {
        throw new Error('Please add at least one item to the quote');
      }

      // Get company data
      const companyDoc = companies.find(company => company.id === formData.company);
      console.log('Selected company:', formData.company);
      console.log('Available companies:', companies);
      console.log('Found company document:', companyDoc);
      console.log('Form data company details:', formData.companyData);
      
      if (!companyDoc) {
        throw new Error('Company data not found');
      }

      // Prepare company data with explicit logging
      const companyData = {
        name: formData.companyData?.name || companyDoc?.name || 'COMPANY NAME NOT FOUND',
        companyName: formData.companyData?.companyName || companyDoc?.name || 'COMPANY NAME NOT FOUND',
        address: formData.companyData?.address || companyDoc?.address || '',
        email: formData.companyData?.email || companyDoc?.email || '',
        phone: formData.companyData?.phone || companyDoc?.phone || '',
        gst: formData.companyData?.gst || companyDoc?.gst || '',
        pan: formData.companyData?.pan || companyDoc?.pan || '',
        bankDetails: {
          accountName: formData.companyData?.bankDetails?.accountName || companyDoc?.bankDetails?.accountName || '',
          accountNumber: formData.companyData?.bankDetails?.accountNumber || companyDoc?.bankDetails?.accountNumber || '',
          bankName: formData.companyData?.bankDetails?.bankName || companyDoc?.bankDetails?.bankName || '',
          branch: formData.companyData?.bankDetails?.branch || companyDoc?.bankDetails?.branch || '',
          ifscCode: formData.companyData?.bankDetails?.ifscCode || companyDoc?.bankDetails?.ifscCode || ''
        }
      };

      console.log('Final company data being passed:', JSON.stringify(companyData, null, 2));

      // Prepare quote data
      const quoteData = {
        ...formData,
        client: {
          name: formData.clientData?.name || '',
          company: formData.clientData?.company || '',
          address: formData.clientData?.address || '',
          phone: formData.clientData?.phone || '',
          email: formData.clientData?.email || ''
        },
        employee: {
          name: formData.employeeData?.name || '',
          designation: formData.employeeData?.designation || '',
          mobile: formData.employeeData?.mobile || '',
          email: formData.employeeData?.email || ''
        },
        items: formData.items.map(item => ({
          ...item,
          total: Number(item.total || 0).toFixed(2),
          price: Number(item.price || 0).toFixed(2),
          gstValue: Number(item.gstValue || 0).toFixed(2)
        })),
        subtotal: calculateTotals().subtotal.toFixed(2),
        totalGST: calculateTotals().totalGST.toFixed(2),
        grandTotal: calculateTotals().grandTotal.toFixed(2),
        createdAt: new Date()
      };

      console.log('Preparing to generate quotation with data:', JSON.stringify({ quoteData, companyDoc }, null, 2));

      // Generate quotation
      await generateQuotation(quoteData, companyData);

    } catch (error) {
      console.error('Error downloading quote:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: `Error downloading quote: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle creating new quote
  const handleCreateNew = () => {
    setSavedQuote(null);
    setFormData({
      company: '',
      companyName: '',
      employee: '',
      employeeData: null,
      client: '',
      clientData: null,
      referenceNumber: '',
      items: [{
        catalogueId: '',
        description: '',
        packSize: '',
        quantity: '',
        hsn: '',
        price: '',
        discountPercentage: '',
        discountedPrice: '',
        expandedRate: '',
        gstRate: '',
        gstValue: '',
        total: '',
        leadTime: '',
        brand: ''
      }],
      paymentTerms: defaultPaymentTerms[0],
      notes: '',
    });
  };

  // Handle item selection from autocomplete
  const handleItemSelect = (index, selectedItem) => {
    if (!selectedItem) return;

    const gstRate = getGSTRateFromHSN(selectedItem.hsn);
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = {
        ...items[index],
        catalogueId: selectedItem.catalogueId,
        description: selectedItem.description,
        packSize: selectedItem.packSize,
        hsn: selectedItem.hsn,
        brand: selectedItem.brand,
        price: selectedItem.price || items[index].price,
        gstRate: gstRate,
        quantity: '1', // Default quantity
        discountPercentage: '0', // Default discount
        discountedPrice: selectedItem.price, // Initial discounted price is same as price
      };

      // Calculate initial values
      const price = parseFloat(selectedItem.price) || 0;
      const quantity = 1;
      const gstRateValue = parseFloat(gstRate) || 18;

      // Calculate expanded rate (price * quantity since no initial discount)
      const expandedRate = price * quantity;
      
      // Calculate GST value
      const gstValue = (expandedRate * gstRateValue) / 100;
      
      // Update calculated fields
      items[index] = {
        ...items[index],
        expandedRate: expandedRate.toFixed(2),
        gstValue: gstValue.toFixed(2),
        total: (expandedRate + gstValue).toFixed(2)
      };

      return { ...prev, items };
    });
  };

  const handleSaveQuote = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.company || !formData.employee || !formData.client || !formData.referenceNumber) {
        throw new Error('Please fill in all required fields (Company, Employee, Client, Reference Number)');
      }

      if (!formData.items || formData.items.length === 0) {
        throw new Error('Please add at least one item to the quote');
      }

      // Calculate totals
      const totals = calculateTotals();

      // Create quote data object
      const quoteData = {
        referenceNumber: formData.referenceNumber,
        company: { id: formData.company, name: formData.companyName },
        employee: { id: formData.employee, name: formData.employeeData.name },
        client: { id: formData.client, name: formData.clientData.name },
        items: formData.items.map(item => ({
          catalogueId: item.catalogueId,
          description: item.description,
          packSize: item.packSize,
          quantity: parseFloat(item.quantity) || 0,
          hsn: item.hsn,
          price: parseFloat(item.price) || 0,
          discountPercentage: parseFloat(item.discountPercentage) || 0,
          discountedPrice: parseFloat(item.discountedPrice) || 0,
          expandedRate: parseFloat(item.expandedRate) || 0,
          gstRate: parseFloat(item.gstRate) || 0,
          gstValue: parseFloat(item.gstValue) || 0,
          total: parseFloat(item.total) || 0,
          leadTime: item.leadTime,
          brand: item.brand
        })),
        subtotal: totals.subtotal,
        totalGST: totals.totalGST,
        grandTotal: totals.grandTotal,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        createdAt: serverTimestamp(),
        status: 'draft'
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'quotes'), quoteData);
      console.log('Quote saved with ID:', docRef.id);

      // Show success message
      setSavedQuote(quoteData);
      setSnackbar({
        open: true,
        message: 'Quote saved successfully!',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error saving quote:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: `Error saving quote: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;

    formData.items.forEach(item => {
      const expandedRate = parseFloat(item.expandedRate) || 0;
      const gstValue = parseFloat(item.gstValue) || 0;
      
      subtotal += expandedRate;
      totalGST += gstValue;
    });

    const grandTotal = subtotal + totalGST;

    return {
      subtotal,
      totalGST,
      grandTotal
    };
  };

  const getGSTRateFromHSN = (hsn) => {
    // HSN code to GST rate mapping
    const hsnGSTMap = {
      // Common HSN codes and their GST rates
      '28142000': 18, // For Ammonia Solution
      '29': 18,      // Chapter 29 - Organic chemicals
      '28': 18,      // Chapter 28 - Inorganic chemicals
      '38': 18,      // Chapter 38 - Chemical products
      // Add more HSN codes and their GST rates as needed
    };

    // First try exact match
    if (hsnGSTMap[hsn]) {
      return hsnGSTMap[hsn];
    }

    // If no exact match, try matching the chapter (first 2 digits)
    const chapter = hsn.substring(0, 2);
    return hsnGSTMap[chapter] || 18; // Default to 18% if no match found
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Show success view after saving
  if (savedQuote) {
    return (
      <Box p={3}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="success.main">
            Quote Created Successfully!
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            Reference Number: {savedQuote.referenceNumber}
          </Typography>
          
          <Box mt={3} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadQuote}
              startIcon={<SaveIcon />}
            >
              Download Quote
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleCreateNew}
            >
              Create New Quote
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <div className="quote-creator">
      <Typography variant="h5" className="page-title">
        Create Quote
      </Typography>

      {error && (
        <Box mb={3}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Paper className="quote-form" elevation={3}>
          {/* Quote Header */}
          <Box mb={4}>
            <Typography variant="h6" className="section-title" gutterBottom>
              Quote Details
            </Typography>
            <Grid container spacing={3}>
              {/* Company Selection */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={companies}
                  getOptionLabel={(option) => option.companyName || ''}
                  value={companies.find(company => company.id === formData.company) || null}
                  onChange={handleCompanyChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Company"
                      variant="outlined"
                      error={!formData.company && error}
                      helperText={!formData.company && error ? 'Company is required' : ''}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      color: '#333',
                      backgroundColor: '#fff',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}>
                      {option.companyName}
                    </Box>
                  )}
                  PaperComponent={({ children, ...other }) => (
                    <Paper
                      {...other}
                      sx={{
                        backgroundColor: '#fff',
                        color: '#333',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {children}
                    </Paper>
                  )}
                />
              </Grid>

              {/* Employee Selection */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => option.employeeName || ''}
                  onChange={handleEmployeeChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Employee"
                      variant="outlined"
                      error={!formData.employee && error}
                      helperText={!formData.employee && error ? 'Employee is required' : ''}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      color: '#333',
                      backgroundColor: '#fff',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}>
                      {option.employeeName}
                    </Box>
                  )}
                  PaperComponent={({ children, ...other }) => (
                    <Paper
                      {...other}
                      sx={{
                        backgroundColor: '#fff',
                        color: '#333',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {children}
                    </Paper>
                  )}
                />
              </Grid>

              {/* Reference Number */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  value={formData.referenceNumber}
                  disabled
                  variant="outlined"
                />
              </Grid>

              {/* Client Selection */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={clients}
                  getOptionLabel={(option) => option.clientName || ''}
                  onChange={handleClientChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Client"
                      variant="outlined"
                      error={!formData.client && error}
                      helperText={!formData.client && error ? 'Client is required' : ''}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ 
                      color: '#333',
                      backgroundColor: '#fff',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}>
                      {`${option.clientName} - ${option.companyName}`}
                    </Box>
                  )}
                  PaperComponent={({ children, ...other }) => (
                    <Paper
                      {...other}
                      sx={{
                        backgroundColor: '#fff',
                        color: '#333',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {children}
                    </Paper>
                  )}
                />
              </Grid>

              {/* Client Details (auto-filled) */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company/Institute"
                  value={formData.clientData?.company || ''}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.clientData?.address || ''}
                  disabled
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.clientData?.email || ''}
                  disabled
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.clientData?.phone || ''}
                  disabled
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Items Section */}
          <Box mb={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" className="section-title">
                Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddItem}
                startIcon={<AddIcon />}
              >
                Add Item
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Catalogue ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Pack Size</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>HSN</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Lead Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={allItems}
                          getOptionLabel={(option) => option.catalogueId || ''}
                          value={allItems.find(i => i.catalogueId === item.catalogueId) || null}
                          onChange={(event, newValue) => handleItemSelect(index, newValue)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              error={!item.catalogueId}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={item.description}
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.packSize}
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          variant="outlined"
                          size="small"
                          InputProps={{
                            inputProps: { min: 1 }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.hsn}
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.brand}
                          variant="outlined"
                          size="small"
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={item.leadTime}
                          onChange={(e) => handleItemChange(index, 'leadTime', e.target.value)}
                          variant="outlined"
                          size="small"
                          placeholder="e.g., 2-3 weeks"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newItems = [...formData.items];
                              newItems.splice(index + 1, 0, { ...item });
                              setFormData(prev => ({ ...prev, items: newItems }));
                            }}
                            color="primary"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Price Details Panel */}
            {formData.items.map((item, index) => (
              <Paper key={index} sx={{ mt: 2, p: 2 }} elevation={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Unit Price"
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Discount %"
                      type="number"
                      value={item.discountPercentage}
                      onChange={(e) => handleItemChange(index, 'discountPercentage', e.target.value)}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: <span style={{ marginLeft: 8 }}>%</span>,
                        inputProps: { min: 0, max: 100, step: 0.01 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Discounted Price"
                      value={item.discountedPrice}
                      variant="outlined"
                      size="small"
                      disabled
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="GST %"
                      value={item.gstRate}
                      variant="outlined"
                      size="small"
                      disabled
                      InputProps={{
                        endAdornment: <span style={{ marginLeft: 8 }}>%</span>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="GST Value"
                      value={item.gstValue}
                      variant="outlined"
                      size="small"
                      disabled
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Total"
                      value={item.total}
                      variant="outlined"
                      size="small"
                      disabled
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 8 }}>₹</span>
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>

          {/* Payment Terms and Notes */}
          <Box>
            <Typography variant="h6" className="section-title" gutterBottom>
              Terms and Notes
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    label="Payment Terms"
                  >
                    {defaultPaymentTerms.map((term, index) => (
                      <MenuItem key={index} value={term}>
                        {term}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Special Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Save Button */}
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSaveQuote}
            >
              Save Quote
            </Button>
          </Box>
        </Paper>
      )}

      {/* Item Dialog */}
      <Dialog
        open={openNewItemDialog}
        onClose={() => setOpenNewItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Item
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="form-grid">
            {/* Catalogue ID with auto-complete */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={allItems}
                getOptionLabel={(option) => option.catalogueId || ''}
                value={allItems.find(item => item.catalogueId === newItemData?.catalogueId) || null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    // Pre-fill form with existing item data
                    setNewItemData({
                      ...newValue,
                      quantity: 1,
                      discountPercentage: 0,
                    });
                  } else {
                    setNewItemData({
                      catalogueId: '',
                      description: '',
                      packSize: '',
                      price: '',
                      hsn: '',
                      cas: '',
                      brand: '',
                      gstRate: '',
                      quantity: 1,
                      discountPercentage: 0,
                      leadTime: '',
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Catalogue ID"
                    variant="outlined"
                    onChange={(e) => {
                      if (!params.inputProps.value) {
                        setNewItemData(prev => ({
                          ...prev,
                          catalogueId: e.target.value
                        }));
                      }
                    }}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newItemData?.description || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>

            {/* Pack Size */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pack Size"
                name="packSize"
                value={newItemData?.packSize || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  packSize: e.target.value
                }))}
                variant="outlined"
              />
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={newItemData?.quantity || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  quantity: e.target.value,
                }))}
                variant="outlined"
              />
            </Grid>

            {/* HSN Code */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsn"
                value={newItemData?.hsn || ''}
                onChange={(e) => {
                  const hsn = e.target.value;
                  // Try to find GST rate
                  let gstRate = '';
                  if (hsn.length >= 2) {
                    const chapter = hsn.substring(0, 2);
                    gstRate = hsnGstMapping[chapter] || '';
                  }
                  setNewItemData(prev => ({
                    ...prev,
                    hsn,
                    gstRate: gstRate.toString()
                  }));
                }}
                variant="outlined"
              />
            </Grid>

            {/* Unit Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Price"
                name="price"
                type="number"
                value={newItemData?.price || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  price: e.target.value
                }))}
                variant="outlined"
                InputProps={{
                  startAdornment: '₹',
                }}
              />
            </Grid>

            {/* Discount % */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discount %"
                name="discountPercentage"
                type="number"
                value={newItemData?.discountPercentage || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  discountPercentage: e.target.value
                }))}
                variant="outlined"
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>

            {/* GST Rate (read-only) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST Rate"
                value={newItemData?.gstRate ? `${newItemData.gstRate}%` : ''}
                variant="outlined"
                disabled
              />
            </Grid>

            {/* Lead Time */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lead Time"
                name="leadTime"
                value={newItemData?.leadTime || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  leadTime: e.target.value
                }))}
                variant="outlined"
              />
            </Grid>

            {/* Brand */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={newItemData?.brand || ''}
                onChange={(e) => setNewItemData(prev => ({
                  ...prev,
                  brand: e.target.value
                }))}
                variant="outlined"
              />
            </Grid>

            {/* Calculated Values */}
            {newItemData && newItemData.price && newItemData.quantity && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Discounted Price"
                    value={`₹${(parseFloat(newItemData.price) * (1 - (parseFloat(newItemData.discountPercentage || 0) / 100))).toFixed(2)}`}
                    variant="outlined"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Expanded Price"
                    value={`₹${(parseFloat(newItemData.price) * (1 - (parseFloat(newItemData.discountPercentage || 0) / 100)) * parseFloat(newItemData.quantity)).toFixed(2)}`}
                    variant="outlined"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Total (with GST)"
                    value={`₹${(parseFloat(newItemData.price) * (1 - (parseFloat(newItemData.discountPercentage || 0) / 100)) * parseFloat(newItemData.quantity) * (1 + (parseFloat(newItemData.gstRate || 0) / 100))).toFixed(2)}`}
                    variant="outlined"
                    disabled
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewItemDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                items: [...prev.items, newItemData]
              }));
              setOpenNewItemDialog(false);
              setNewItemData(null);
            }}
            color="primary" 
            variant="contained"
            disabled={!newItemData?.catalogueId || !newItemData?.price}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default QuoteCreator;