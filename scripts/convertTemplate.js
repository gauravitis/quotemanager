const fs = require('fs');
const path = require('path');

// Read the template file
const templatePath = path.join(__dirname, '..', 'public', 'templates', 'quotation-template.docx');
const template = fs.readFileSync(templatePath);

// Convert to base64
const base64 = template.toString('base64');

console.log('Base64 template:');
console.log(base64);
