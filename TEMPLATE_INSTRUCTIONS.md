# Quotation Template Instructions

Please follow these instructions to create a new Word template file:

1. Open Microsoft Word and create a new document
2. Copy and paste the following structure, keeping the exact variable names in double curly braces:

```
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
```

3. Format the document as needed (add company logo, adjust spacing, fonts, etc.)
4. Save the file as "quotation-template.docx" in the "public/templates" folder
5. Make sure to save it as a regular Word document (.docx), not as a template (.dotx)

Important Notes:
- Keep the variable names exactly as shown (including case)
- The {{#items}} and {{/items}} tags are required for the items loop
- Don't add any extra spaces inside the {{variables}}
- Make sure to use proper quotation marks (" ") not smart quotes (" ")
