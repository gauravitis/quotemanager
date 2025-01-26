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
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
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
import './Clients.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    address: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Set up real-time listener for clients collection
    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
    }, (error) => {
      console.error("Error fetching clients:", error);
      setError("Failed to load clients");
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        clientName: client.clientName || '',
        companyName: client.companyName || '',
        address: client.address || '',
        email: client.email || '',
        phone: client.phone || '',
      });
    } else {
      setFormData({
        clientName: '',
        companyName: '',
        address: '',
        email: '',
        phone: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
    setFormData({
      clientName: '',
      companyName: '',
      address: '',
      email: '',
      phone: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const clientData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), clientData);
      } else {
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'clients', clientId));
      } catch (err) {
        console.error('Error deleting client:', err);
        setError('Failed to delete client. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="clients-page">
      {error && (
        <Alert severity="error" className="error-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box className="header-actions">
        <Typography variant="h5" className="section-title">
          Manage Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="add-button"
        >
          Add Client
        </Button>
      </Box>

      <Grid container spacing={3} className="clients-grid">
        {clients.map((client) => (
          <Grid item xs={12} md={6} lg={4} key={client.id}>
            <Card className="client-card">
              <CardContent>
                <Box className="card-header">
                  <Typography variant="h6">{client.clientName}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(client)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(client.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                {client.companyName && (
                  <Box className="info-item">
                    <BusinessIcon fontSize="small" />
                    <Typography variant="body2">{client.companyName}</Typography>
                  </Box>
                )}
                {client.address && (
                  <Box className="info-item">
                    <LocationIcon fontSize="small" />
                    <Typography variant="body2">{client.address}</Typography>
                  </Box>
                )}
                {client.email && (
                  <Box className="info-item">
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{client.email}</Typography>
                  </Box>
                )}
                {client.phone && (
                  <Box className="info-item">
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{client.phone}</Typography>
                  </Box>
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
          {editingClient ? 'Edit Client' : 'Add New Client'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="form-grid">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company/Institute Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={3}
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
              />
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
              editingClient ? 'Update Client' : 'Save Client'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Clients; 