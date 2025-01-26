import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import './CompanyProfile.css';

function CompanyProfile() {
  const [companies, setCompanies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    email: '',
    phone: '',
    pan: '',
    gst: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: '',
    },
    sealImage: null,
  });

  useEffect(() => {
    // Set up real-time listener for companies collection
    const unsubscribe = onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesData);
    }, (error) => {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies");
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        companyName: company.companyName || '',
        address: company.address || '',
        email: company.email || '',
        phone: company.phone || '',
        pan: company.pan || '',
        gst: company.gst || '',
        bankDetails: company.bankDetails || {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
          accountType: '',
        },
        sealImage: company.sealImage || null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCompany(null);
    setFormData({
      companyName: '',
      address: '',
      email: '',
      phone: '',
      pan: '',
      gst: '',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountType: '',
      },
      sealImage: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const bankField = name.split('.')[1];
      setFormData({
        ...formData,
        bankDetails: {
          ...formData.bankDetails,
          [bankField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        setError("Image size should be less than 1MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          sealImage: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ['companyName', 'address', 'email', 'phone', 'pan', 'gst'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      const companyData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingCompany) {
        // Update existing company
        await updateDoc(doc(db, 'companies', editingCompany.id), companyData);
      } else {
        // Add new company
        await addDoc(collection(db, 'companies'), {
          ...companyData,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving company:', err);
      setError('Failed to save company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'companies', companyId));
      } catch (err) {
        console.error('Error deleting company:', err);
        setError('Failed to delete company. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="company-profile">
      {error && (
        <Alert severity="error" className="error-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box className="header-actions">
        <Typography variant="h5" className="section-title">
          Manage Companies
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="add-button"
        >
          Add Company
        </Button>
      </Box>

      <Grid container spacing={3} className="companies-grid">
        {companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.id}>
            <Card className="company-card">
              <CardContent>
                <Box className="card-header">
                  <Typography variant="h6">{company.companyName}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(company)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(company.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {company.address}
                </Typography>
                <Typography variant="body2">
                  GST: {company.gst}
                </Typography>
                {company.sealImage && (
                  <img 
                    src={company.sealImage} 
                    alt="Company Seal" 
                    className="seal-preview"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="form-grid">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={formData.pan}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GST"
                name="gst"
                value={formData.gst}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" className="section-subtitle">
                Bank Account Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Name"
                name="bank.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Number"
                name="bank.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IFSC Code"
                name="bank.ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Account Type"
                name="bank.accountType"
                value={formData.bankDetails.accountType}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" className="section-subtitle">
                Company Seal
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Maximum size: 1MB
              </Typography>
              <Box className="upload-section">
                <input
                  type="file"
                  accept="image/*"
                  id="seal-upload"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="seal-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Upload Seal Image
                  </Button>
                </label>
                {formData.sealImage && (
                  <img 
                    src={formData.sealImage} 
                    alt="Seal Preview" 
                    className="seal-preview"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              editingCompany ? 'Update Company' : 'Save Company'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CompanyProfile; 