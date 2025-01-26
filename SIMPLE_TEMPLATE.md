# Simple Test Template

Copy this EXACT text into a new Word document (do not copy and paste from the previous template):

```
Company: {{name}}
Address: {{address}}

QUOTATION
Ref: {{refNumber}}
Date: {{date}}

Client: {{client.name}}
Company: {{client.company}}

Items:
{{#items}}
- {{description}} ({{quantity}} x {{unitPrice}} = {{total}})
{{/items}}

Total: {{grandTotal}}
```

Instructions:
1. Open a new, blank Word document
2. Type the above text MANUALLY (do not copy-paste)
3. Save it as "quotation-template.docx" in the public/templates folder
4. Make sure to type the curly braces manually: {{ and }}
