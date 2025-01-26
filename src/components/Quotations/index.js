import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { db } from '../../firebase';
import { 
  collection, 
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { generateQuotation } from '../../utils/generateQuotation';
import './Quotations.css';

function Quotations() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);

  useEffect(() => {
    // Set up real-time listener for quotes collection
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
      }));
      setQuotes(quotesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching quotes:", error);
      setError("Failed to load quotes");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await deleteDoc(doc(db, 'quotes', quoteId));
      } catch (err) {
        console.error('Error deleting quote:', err);
        setError('Failed to delete quote');
      }
    }
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setOpenViewDialog(true);
  };

  const handleDownloadQuote = async (quote) => {
    try {
      await generateQuotation(quote);
    } catch (err) {
      console.error('Error downloading quote:', err);
      setError('Failed to download quote');
    }
  };

  const handlePrintQuote = (quote) => {
    // Implement print functionality
    console.log('Print quote:', quote);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Quotations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reference Number</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>{quote.referenceNumber}</TableCell>
                <TableCell>{quote.company.name}</TableCell>
                <TableCell>{quote.client.name}</TableCell>
                <TableCell>{quote.createdAt}</TableCell>
                <TableCell>₹{Number(quote.grandTotal).toFixed(2)}</TableCell>
                <TableCell>{quote.status}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewQuote(quote)} title="View">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDownloadQuote(quote)} title="Download">
                    <DownloadIcon />
                  </IconButton>
                  <IconButton onClick={() => handlePrintQuote(quote)} title="Print">
                    <PrintIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteQuote(quote.id)} title="Delete">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Quote View Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Quote Details - {selectedQuote?.referenceNumber}
        </DialogTitle>
        <DialogContent>
          {selectedQuote && (
            <Box>
              {/* Company Details */}
              <Typography variant="h6" gutterBottom>Company Details</Typography>
              <Typography>Name: {selectedQuote.company.name}</Typography>

              {/* Client Details */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Client Details</Typography>
              <Typography>Name: {selectedQuote.client.name}</Typography>
              <Typography>Company: {selectedQuote.client.company}</Typography>
              <Typography>Address: {selectedQuote.client.address}</Typography>
              <Typography>Email: {selectedQuote.client.email}</Typography>
              <Typography>Phone: {selectedQuote.client.phone}</Typography>

              {/* Items */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Unit Price</TableCell>
                      <TableCell>GST</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedQuote.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                        <TableCell>{item.gstRate}%</TableCell>
                        <TableCell>₹{Number(item.total).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Totals */}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography>Subtotal: ₹{Number(selectedQuote.subtotal).toFixed(2)}</Typography>
                <Typography>Total GST: ₹{Number(selectedQuote.totalGST).toFixed(2)}</Typography>
                <Typography variant="h6">
                  Grand Total: ₹{Number(selectedQuote.grandTotal).toFixed(2)}
                </Typography>
              </Box>

              {/* Terms and Notes */}
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Terms and Notes</Typography>
              <Typography>Payment Terms: {selectedQuote.paymentTerms}</Typography>
              {selectedQuote.notes && (
                <Typography>Notes: {selectedQuote.notes}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrintQuote(selectedQuote)} color="primary">
            Print
          </Button>
          <Button onClick={() => setOpenViewDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Quotations;
