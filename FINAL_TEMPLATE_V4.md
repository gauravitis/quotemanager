# Final Quotation Template

1. Open Notepad (not Word)
2. Type the following template EXACTLY as shown (do not copy-paste):

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
Account Name: {{bankDetails.accountName}}
Account Number: {{bankDetails.accountNumber}}
Bank Name: {{bankDetails.bankName}}
Branch: {{bankDetails.branch}}
IFSC Code: {{bankDetails.ifscCode}}

Terms and Conditions:
{{terms}}

For {{name}}

Prepared By:
{{employee.name}}
{{employee.designation}}
{{employee.phone}}
{{employee.email}}
```

3. Save this as "template.txt"
4. Open Microsoft Word
5. Go to File -> Open
6. Browse to and open your template.txt file
7. Format the document nicely:
   - Center align the company name at the top
   - Make company name BOLD and larger font (16pt)
   - Add proper spacing between sections
   - Make headings (QUOTATION, Bank Details, etc.) bold
   - Right-align the "For [Company Name]" at the bottom
8. Go to File -> Save As
9. Navigate to the public/templates folder
10. Save as "quotation-template.docx" (Word Document)
11. Close Word completely
