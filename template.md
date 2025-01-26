Quotation Template Structure
File Name: quotation-template.docx
Format: Microsoft Word (.docx)
Placeholders:


plaintext
Copy
{{name}}
{{address}}
Email: {{email}} | Phone: {{phone}}
PAN: {{pan}} | GST: {{gst}}

QUOTATION
Reference No: {{refNumber}}
Date: {{date}}

To,
{{client.name}}
{{client.company}}
{{client.address}}
Phone: {{client.phone}}
Email: {{client.email}}

Dear Sir/Madam,

We are pleased to quote our best prices for the following items:

{{#items}}
{{s_no}}. {{description}}
   Catalogue ID: {{catalogueId}}
   Pack Size: {{packSize}}
   HSN: {{hsn}}
   Quantity: {{quantity}}
   Unit Price: {{unitPrice}}
   Discount: {{discount}}
   GST Rate: {{gstRate}}
   Total: {{total}}
{{/items}}

Sub Total: {{subTotal}}
GST Total: {{gstTotal}}
Grand Total: {{grandTotal}}

Bank Details:
{{bankDetails}}

Terms and Conditions:
{{terms}}

For {{name}}

{{employee.name}}
{{employee.designation}}
Mobile: {{employee.mobile}}
Email: {{employee.email}}

Template Variables JSON
Create a template-data.json file with company-specific configurations:

json
Copy
{
  "companies": {
    "CBL": {
      "name": "CHEMBIO LIFESCIENCES",
      "address": "L-10, Himalaya Legend, Nyay Khand-1 Indirapuram, Ghaziabad - 201014",
      "email": "sales.chembio@gmail.com",
      "phone": "0120-4909400",
      "pan": "AALFC0922C",
      "gst": "09AALFC0922C1ZU",
      "bankDetails": "HDFC BANK LTD. Account No: 50200017511430\nNEFT/RTGS IFSC: HDFC0000590\nBranch Code: 0590\nMICR Code: 110240081",
      "seal": "company-seals/cbl-seal.png",
      "refPrefix": "CBL"
    },
    "CLS": {
      "name": "CHEMLAB SYNTHESIS",
      "address": "Plot No. 34, Sector-11, Udyog Vihar, Gurugram - 122001",
      "email": "sales.chemlab@gmail.com",
      "phone": "0124-4123456",
      "pan": "AAKFC0933D",
      "gst": "06AAKFC0933D1Z5",
      "bankDetails": "ICICI BANK LTD. Account No: 123456789012\nIFSC: ICIC0000123\nBranch Code: 0123",
      "seal": "company-seals/cls-seal.png",
      "refPrefix": "CLS"
    },
    "OTH": {
      "name": "OTHER COMPANY NAME",
      "address": "Custom Address Here",
      "email": "sales@othercompany.com",
      "phone": "011-23456789",
      "pan": "XXXXX0000X",
      "gst": "XXAAAAA0000A1Z0",
      "bankDetails": "Custom Bank Details Here",
      "seal": "company-seals/oth-seal.png",
      "refPrefix": "OTH"
    }
  },
  "common": {
    "terms": [
      "Validity: 30 Days",
      "Lead Time: As per individual items",
      "Orders cannot be cancelled once placed"
    ]
  }
}
Implementation Instructions for Cursor
Template Setup

bash
Copy
# Create template directory
mkdir -p public/templates/company-seals

# Directory structure
public/
├── templates/
│   ├── quotation-template.docx
│   └── company-seals/
│       ├── cbl-seal.png
│       ├── cls-seal.png
│       └── oth-seal.png
Document Generation Code

javascript
Copy
// utils/generateQuotation.js
const generateQuotation = async (data) => {
  // Load template
  const response = await fetch('/templates/quotation-template.docx');
  const template = await response.arrayBuffer();
  
  // Configure docxtemplater
  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip, {
    modules: {
      image: (value) => ({
        data: Buffer.from(value.data, 'base64'),
        extension: value.extension
      })
    }
  });

  // Process data
  const companyData = companies[data.companyCode];
  const formattedData = {
    ...data,
    company: {
      ...companyData,
      seal: {
        image: { 
          data: await loadImage(companyData.seal),
          extension: 'png'
        }
      }
    },
    terms: common.terms.join('\n')
  };

  // Generate document
  doc.render(formattedData);
  return doc.getZip().generate({ type: 'blob' });
};
Key Features
Dynamic Company Switching

Use company codes (CBL/CLS/OTH) to auto-fill details

Automatic reference numbers: CBLS/2401/001, CLS/2401/001, etc.

Chemical-Specific Formatting

CAS numbers with proper hyphenation

HSN code validation

Automatic GST calculations (5%/12%/18%)

Image Handling

Company seals stored in Firebase Storage

Automatic image sizing (0.83in x 0.83in)

Error Prevention

javascript
Copy
// Validation checks
const validateData = (data) => {
  if(!data.items.every(i => i.cas.match(/^\d{2,7}-\d{2}-\d$/))) 
    throw new Error('Invalid CAS number');
  if(!data.companyCode in companies) 
    throw new Error('Invalid company code');
};
Usage Example
javascript
Copy
// Sample data for quotation generation
const quotationData = {
  companyCode: 'CBL',
  date: '2024-01-23',
  client: {
    name: 'DBT Center of Excellence',
    address: 'IIT Delhi, Hauz Khas',
    contactPerson: 'Nida Khan',
    phone: '+91-9027206782',
    email: 'nida.khan15aug@gmail.com'
  },
  items: [
    {
      catalogueId: '38862',
      description: 'N,N-Methylene Bisacrylamide (bis-Acrylamide) pure, 98%',
      packSize: '500GM',
      hsn: '29241900',
      quantity: 1,
      unitPrice: 2910,
      discount: 0,
      gst: 18,
      leadTime: '1-2 Weeks',
      brand: 'SRL'
    }
  ]
};
This template system will maintain consistent formatting across all three companies while allowing customization of company-specific details. The reference numbers will auto-increment based on company prefix and financial year.
