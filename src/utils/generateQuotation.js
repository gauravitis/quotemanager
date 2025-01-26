import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { db } from '../firebase';
import { 
  doc, 
  getDoc 
} from 'firebase/firestore';

// Company configuration
const companies = {
  CBLS: {
    name: "CHEMBIO LIFESCIENCES",
    address: "L-10, Himalaya Legend, Nyay Khand-1 Indirapuram, Ghaziabad - 201014",
    email: "sales.chembio@gmail.com",
    phone: "0120-4909400",
    pan: "AALFC0922C",
    gst: "09AALFC0922C1ZU",
    bankDetails: `HDFC BANK LTD.
Account No: 50200017511430
NEFT/RTGS IFSC: HDFC0000590
Branch Code: 0590
MICR Code: 110240081`
  },
  CBLP: {
    name: "CHEMBIO LIFESCIENCES PVT. LTD.",
    address: "L-10, Himalaya Legend, Nyay Khand-1 Indirapuram, Ghaziabad - 201014",
    email: "sales.chembio@gmail.com",
    phone: "0120-4909400",
    pan: "AALFC0922C",
    gst: "09AALFC0922C1ZU",
    bankDetails: `HDFC BANK LTD.
Account No: 50200017511430
NEFT/RTGS IFSC: HDFC0000590
Branch Code: 0590
MICR Code: 110240081`
  },
  CLS: {
    name: "CHEMLAB SYNTHESIS",
    address: "Plot No. 34, Sector-11, Udyog Vihar, Gurugram - 122001",
    email: "sales.chemlab@gmail.com",
    phone: "0124-4123456",
    pan: "AAKFC0933D",
    gst: "06AAKFC0933D1Z5",
    bankDetails: `ICICI BANK LTD.
Account No: 123456789012
IFSC: ICIC0000123
Branch Code: 0123`
  }
};

// Common terms and conditions
const commonTerms = [
  "1. Validity: 30 Days from the date of quotation",
  "2. Payment Terms: As specified in the quotation",
  "3. Delivery: Ex-works, as per lead time mentioned against each item",
  "4. Prices are subject to change without prior notice",
  "5. GST will be charged extra as applicable",
  "6. Orders cannot be cancelled once placed"
].join('\n');

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatItems = (items) => {
  return items.map((item, index) => ({
    sno: (index + 1).toString(),
    catid: item.catalogueId || '',
    desc: item.description || '',
    packSize: item.packSize || '',
    quantity: item.quantity?.toString() || '',
    hsn: item.hsn || '',
    unitRate: formatCurrency(item.price || 0),
    discountedRate: formatCurrency(item.discountedPrice || 0),
    expandedRate: formatCurrency((item.discountedPrice * item.quantity) || 0),
    gstPercent: item.gstRate?.toString() + '%' || '0%',
    gstValue: formatCurrency(item.gstValue || 0),
    total: formatCurrency(item.total || 0),
    leadTime: item.leadTime || '',
    brand: item.brand || ''
  }));
};

const loadCompanySeal = async (companyPrefix, quoteData) => {
  try {
    // Get the company document from Firestore
    const companyDoc = await getDoc(doc(db, 'companies', quoteData.company.id));
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }

    // Get the seal from the company document
    const sealImage = companyDoc.data().sealImage;
    if (!sealImage) {
      console.warn('No seal image found for company');
      return null;
    }

    // The seal is already in base64 format in the company document
    return sealImage.split(',')[1]; // Remove the data:image/png;base64, prefix
  } catch (error) {
    console.error('Error loading company seal:', error);
    return null;
  }
};

export const generateQuotation = async (quoteData, companyData) => {
  try {
    console.log('Starting quotation generation with data:', JSON.stringify({ quoteData, companyData }, null, 2));
    
    if (!quoteData || !companyData) {
      throw new Error('Quote data or company data is missing');
    }

    console.log('Company Data:', JSON.stringify(companyData, null, 2));
    console.log('Company Name:', companyData.name);

    // Prepare data for template
    const formattedItems = formatItems(quoteData.items || []);
    
    const templateData = {
      // Company Details
      name: companyData.name || 'COMPANY NAME MISSING',
      companyName: companyData.name || 'COMPANY NAME MISSING',
      address: companyData.address || '',
      email: companyData.email || '',
      phone: companyData.phone || '',
      pan: companyData.pan || '',
      gst: companyData.gst || '',

      // Bank Details (expanded to individual fields)
      'bankDetails.accountName': companyData.bankDetails?.accountName || '',
      'bankDetails.accountNumber': companyData.bankDetails?.accountNumber || '',
      'bankDetails.bankName': companyData.bankDetails?.bankName || '',
      'bankDetails.branch': companyData.bankDetails?.branch || '',
      'bankDetails.ifscCode': companyData.bankDetails?.ifscCode || '',

      // Quote Details
      refNumber: quoteData.referenceNumber || '',
      date: formatDate(quoteData.createdAt || new Date()),

      // Client Details
      'client.name': quoteData.client?.name || '',
      'client.company': quoteData.client?.company || '',
      'client.address': quoteData.client?.address || '',
      'client.phone': quoteData.client?.phone || '',
      'client.email': quoteData.client?.email || '',

      // Employee Details
      'employee.name': quoteData.employee?.name || '',
      'employee.designation': quoteData.employee?.designation || '',
      'employee.phone': quoteData.employee?.phone || '',
      'employee.email': quoteData.employee?.email || '',

      // Items Table
      items: formattedItems.map((item, index) => ({
        s_no: index + 1,
        description: item.description || '',
        catalogueId: item.catalogueId || '',
        packSize: item.packSize || '',
        hsn: item.hsn || '',
        quantity: item.quantity || '',
        unitPrice: formatCurrency(item.price || 0),
        discount: formatCurrency(item.discountedPrice || 0),
        gstRate: `${item.gstRate || 0}%`,
        total: formatCurrency(item.total || 0)
      })),

      // Totals
      subTotal: formatCurrency(quoteData.subtotal || 0),
      gstTotal: formatCurrency(quoteData.totalGST || 0),
      grandTotal: formatCurrency(quoteData.grandTotal || 0),

      // Terms and Notes
      terms: [
        quoteData.paymentTerms || '',
        quoteData.notes || ''
      ].filter(Boolean).join('\n\n')
    };

    console.log('Template data prepared:', JSON.stringify(templateData, null, 2));

    try {
      const response = await fetch('/templates/quotation-template.docx');
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
      }
      
      const templateContent = await response.arrayBuffer();
      if (!templateContent || templateContent.byteLength === 0) {
        throw new Error('Template file is empty');
      }

      console.log('Template file loaded, size:', templateContent.byteLength, 'bytes');
      
      const zip = new PizZip(templateContent);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        },
        parser: (tag) => {
          console.log('Parsing tag:', tag);
          return {
            get: (scope) => {
              console.log('Getting value for tag:', tag, 'from scope:', scope);
              return scope[tag] || '';
            }
          };
        },
        nullGetter: () => ''
      });

      // Log the template content for debugging
      const templateText = zip.files['word/document.xml'].asText();
      console.log('Template XML content:', templateText);

      // Render the document with data
      doc.render(templateData);

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // Generate filename
      const filename = `Test_Quote_${Date.now()}.docx`;
      
      // Save file
      saveAs(out, filename);
      
      return filename;
    } catch (error) {
      console.error('Error generating quotation:', error);
      if (error.properties && error.properties.errors) {
        console.error('Template Error Details:', JSON.stringify(error.properties.errors, null, 2));
      }
      throw new Error(`Failed to generate quotation: ${error.message}`);
    }
  } catch (error) {
    console.error('Error generating quotation:', error);
    if (error.properties && error.properties.errors) {
      console.error('Template Error:', error.properties.errors);
      console.error('Template Error Details:', JSON.stringify(error.properties.errors, null, 2));
    }
    throw new Error(`Failed to generate quotation: ${error.message}`);
  }
};
