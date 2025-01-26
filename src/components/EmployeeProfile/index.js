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
import './EmployeeProfile.css';

function EmployeeProfile() {
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    mobile: '',
    email: '',
  });

  useEffect(() => {
    // Set up real-time listener for employees collection
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeesData);
    }, (error) => {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        employeeName: employee.employeeName || '',
        mobile: employee.mobile || '',
        email: employee.email || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({
      employeeName: '',
      mobile: '',
      email: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      const requiredFields = ['employeeName', 'mobile', 'email'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate email format
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Validate mobile number
      if (!validateMobile(formData.mobile)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }

      const employeeData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (editingEmployee) {
        await updateDoc(doc(db, 'employees', editingEmployee.id), employeeData);
      } else {
        await addDoc(collection(db, 'employees'), {
          ...employeeData,
          createdAt: new Date().toISOString(),
        });
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Failed to save employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'employees', employeeId));
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Failed to delete employee. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="employee-profile">
      {error && (
        <Alert severity="error" className="error-alert" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box className="header-actions">
        <Typography variant="h5" className="section-title">
          Manage Employees
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          className="add-button"
        >
          Add Employee
        </Button>
      </Box>

      <Grid container spacing={3} className="employees-grid">
        {employees.map((employee) => (
          <Grid item xs={12} md={6} lg={4} key={employee.id}>
            <Card className="employee-card">
              <CardContent>
                <Box className="card-header">
                  <Typography variant="h6">{employee.employeeName}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDialog(employee)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box className="contact-info">
                  <Box className="info-item">
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{employee.mobile}</Typography>
                  </Box>
                  <Box className="info-item">
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{employee.email}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} className="form-grid">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employee Name"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                variant="outlined"
                required
                inputProps={{ maxLength: 10 }}
                helperText="Enter 10-digit mobile number"
              />
            </Grid>
            <Grid item xs={12}>
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
              editingEmployee ? 'Update Employee' : 'Save Employee'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default EmployeeProfile; 