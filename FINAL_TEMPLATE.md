# Final Quotation Template Instructions

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
{{bankDetails}}

Terms and Conditions:
{{terms}}

For {{name}}
```

3. Save this as "template.txt"
4. Open Microsoft Word
5. Go to File -> Open
6. Browse to and open your template.txt file
7. Format the document nicely:
   - Add appropriate spacing
   - Use proper fonts (e.g., Arial or Times New Roman)
   - Add bold/italic formatting where needed
   - Align text appropriately (e.g., center the company name)
   - Add any company logo if needed
8. Go to File -> Save As
9. Navigate to the public/templates folder
10. Save as "quotation-template.docx" (Word Document)
11. Close Word completely

Important Notes:
- Type all curly braces manually: { and }
- Make sure there are no extra spaces inside the tags
- The {{#items}} and {{/items}} tags are required for the items loop
- Save as a regular .docx file, not a template
