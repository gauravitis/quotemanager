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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
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
import './Items.css';

// Comprehensive HSN codes and their GST rates for chemicals and pharmaceuticals
const hsnGstMapping = {
  // Chapter 28: Inorganic chemicals
  '28': 18, // General inorganic chemicals
  '2801': 18, // Fluorine, chlorine, bromine and iodine
  '2804': 18, // Hydrogen, rare gases and other non-metals
  '2805': 18, // Alkali or alkaline-earth metals
  '2806': 18, // Hydrogen chloride and sulphuric acids
  '2807': 18, // Sulphuric acid
  '2808': 18, // Nitric acid
  '2809': 18, // Phosphorus pentoxide and phosphoric acids
  
  // Chapter 29: Organic chemicals
  '29': 18, // General organic chemicals
  '2901': 18, // Acyclic hydrocarbons
  '2902': 18, // Cyclic hydrocarbons
  '2903': 18, // Halogenated derivatives
  '2904': 18, // Sulphonated, nitrated derivatives
  '2905': 18, // Acyclic alcohols
  '2906': 18, // Cyclic alcohols
  '2907': 18, // Phenols
  '2908': 18, // Halogenated, sulphonated derivatives of phenols
  '2909': 18, // Ethers and their derivatives
  
  // Chapter 30: Pharmaceutical products
  '30': 12, // General pharmaceutical products
  '3001': 12, // Glands and other organs
  '3002': 5,  // Blood, antisera, vaccines
  '3003': 12, // Medicaments (bulk)
  '3004': 12, // Medicaments (measured doses)
  '3005': 12, // Wadding, gauze, bandages
  '3006': 12, // Pharmaceutical goods
  
  // Chapter 32: Dyes, pigments, paints
  '32': 18, // General dyes and paints
  '3201': 18, // Tanning extracts
  '3202': 18, // Synthetic tanning substances
  '3203': 18, // Coloring matter
  '3204': 18, // Synthetic organic coloring matter
  
  // Chapter 38: Chemical products
  '38': 18, // Miscellaneous chemical products
  '3801': 18, // Artificial graphite
  '3802': 18, // Activated carbon
  '3803': 18, // Tall oil
  '3804': 18, // Residual lyes
  '3808': 18, // Insecticides, fungicides
  '3809': 18, // Finishing agents
  '3810': 18, // Pickling preparations for metal surfaces
  '3811': 18, // Anti-knock preparations
  '3812': 18, // Prepared rubber accelerators
  '3813': 18, // Fire extinguisher preparations
  '3814': 18, // Organic composite solvents
  '3815': 18, // Reaction initiators
  
  // Chapter 39: Plastics and articles
  '39': 18, // Plastics and plastic products
  '3901': 18, // Polymers of ethylene
  '3902': 18, // Polymers of propylene
  '3903': 18, // Polymers of styrene
  '3904': 18, // Polymers of vinyl chloride
};

function Items() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [availableBrands, setAvailableBrands] = useState([]);
  const [formData, setFormData] = useState({
    catalogueId: '',
    description: '',
    packSize: '',
    price: '',
    hsn: '',
    cas: '',
    brand: '',
    gstRate: '',
  });

  useEffect(() => {
    // Set up real-time listener for items collection
    const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsData);
      
      // Extract unique brands
      const brands = [...new Set(itemsData.map(item => item.brand).filter(Boolean))];
      setAvailableBrands(brands.sort());
      
      // Apply initial filtering
      filterItems(itemsData, selectedBrand);
    }, (error) => {
      console.error("Error fetching items:", error);
      setError("Failed to load items");
    });

    return () => unsubscribe();
  }, [selectedBrand]);

  const filterItems = (itemsList, brand) => {
    if (brand === 'all') {
      setFilteredItems(itemsList);
    } else {
      setFilteredItems(itemsList.filter(item => item.brand === brand));
    }
  };

  const handleBrandChange = (event) => {
    setSelectedBrand(event.target.value);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        catalogueId: item.catalogueId || '',
        description: item.description || '',
        packSize: item.packSize || '',
        price: item.price || '',
        hsn: item.hsn || '',
        cas: item.cas || '',
        brand: item.brand || '',
        gstRate: item.gstRate || '',
      });
    } else {
      setFormData({
        catalogueId: '',
        description: '',
        packSize: '',
        price: '',
        hsn: '',
        cas: '',
        brand: '',
        gstRate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      catalogueId: '',
      description: '',
      packSize: '',
      price: '',
      hsn: '',
      cas: '',
      brand: '',
      gstRate: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If HSN is being changed, try to find corresponding GST rate
    if (name === 'hsn') {
      // Try exact match first
      let gstRate = hsnGstMapping[value];
      
      // If no exact match, try matching by chapter (first 2 digits)
      if (!gstRate && value.length >= 2) {
        const chapter = value.substring(0, 2);
        gstRate = hsnGstMapping[chapter];
      }
      
      // If no match found, try matching by first 4 digits
      if (!gstRate && value.length >= 4) {
        const subheading = value.substring(0, 4);
        gstRate = hsnGstMapping[subheading];
      }

      setFormData(prev => ({
        ...prev,
        [name]: value,
        gstRate: gstRate ? gstRate.toString() : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only catalogueId is required
      if (!formData.catalogueId) {
        setError('Catalogue ID is required');
        return;
      }

      const itemData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'items', editingItem.id), itemData);
      } else {
        await addDoc(collection(db, 'items'), {
          ...itemData,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving item:', err);
      setError('Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'items', itemId));
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="items-page">
      {error && (
        <Alert severity="error" className="error-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box className="header-actions">
        <Typography variant="h5" className="section-title">
          Manage Items
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControl variant="outlined" className="brand-filter">
            <InputLabel>Filter by Brand</InputLabel>
            <Select
              value={selectedBrand}
              onChange={handleBrandChange}
              label="Filter by Brand"
              className="brand-select"
            >
              <MenuItem value="all">All Brands</MenuItem>
              {availableBrands.map((brand) => (
                <MenuItem key={brand} value={brand}>{brand}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            className="add-button"
          >
            Add Item
          </Button>
        </Stack>
      </Box>

      {selectedBrand !== 'all' && (
        <Typography variant="h6" className="brand-title">
          {selectedBrand} Products
        </Typography>
      )}

      <Grid container spacing={3} className="items-grid">
        {filteredItems.map((item) => (
          <Grid item xs={12} md={6} lg={4} key={item.id}>
            <Card className="item-card">
              <CardContent>
                <Box className="card-header">
                  <Typography variant="h6">{item.catalogueId}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" className="description">
                  {item.description}
                </Typography>
                <Grid container spacing={1} className="item-details">
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Pack Size: {item.packSize}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Price: ₹{item.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Brand: {item.brand}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      HSN: {item.hsn}
                      {item.gstRate && ` (${item.gstRate}% GST)`}
                    </Typography>
                  </Grid>
                  {item.cas && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        CAS: {item.cas}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
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
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="form-grid">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Catalogue ID"
                name="catalogueId"
                value={formData.catalogueId}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pack Size"
                name="packSize"
                value={formData.packSize}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  startAdornment: '₹',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsn"
                value={formData.hsn}
                onChange={handleInputChange}
                variant="outlined"
                helperText={formData.gstRate ? `GST Rate: ${formData.gstRate}%` : 'Enter HSN code for GST rate'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CAS Number"
                name="cas"
                value={formData.cas}
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
              editingItem ? 'Update Item' : 'Save Item'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Items; 