# Quote Manager Pro

<div align="center">
  <img src="public/logo192.png" alt="Quote Manager Pro Logo" width="120"/>
  
  [![GitHub license](https://img.shields.io/github/license/gauravitis/quotemanager)](https://github.com/gauravitis/quotemanager/blob/master/LICENSE)
  [![React Version](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/firebase-10.7.0-orange.svg)](https://firebase.google.com/)
</div>

## 🚀 About The Project

Quote Manager Pro is a sophisticated, enterprise-grade quotation management system designed to streamline the process of creating, managing, and tracking business quotations. Built with modern web technologies and a focus on user experience, it offers a comprehensive solution for businesses to handle their quotation workflow efficiently.

### 🌟 Key Features

- **Smart Item Management**
  - Intelligent HSN code-based GST calculation
  - Automatic price calculations with discounts
  - Real-time total computation
  - Bulk item import capabilities

- **Dynamic Quote Generation**
  - Professional PDF quotation generation
  - Customizable templates
  - Company branding integration
  - Multi-currency support

- **Client Management**
  - Comprehensive client database
  - Client history tracking
  - Quick client lookup
  - Contact information management

- **Advanced Dashboard**
  - Real-time analytics
  - Quote status tracking
  - Performance metrics
  - Conversion rate analysis

## 🛠️ Technology Stack

- **Frontend**
  - React.js 18.2.0
  - Material-UI (MUI) for modern UI components
  - React Router for navigation
  - Context API for state management

- **Backend & Database**
  - Firebase 10.7.0
  - Firestore for real-time data storage
  - Firebase Authentication
  - Cloud Functions for serverless operations

- **Development Tools**
  - Git for version control
  - npm for package management
  - ESLint for code quality
  - Prettier for code formatting

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gauravitis/quotemanager.git
   ```

2. Install dependencies:
   ```bash
   cd quotemanager
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project
   - Copy your Firebase configuration
   - Create a .env file with your Firebase credentials

4. Start the development server:
   ```bash
   npm start
   ```

## 🔧 Configuration

1. Firebase Configuration:
   ```javascript
   // src/firebase.js
   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
     // ... other config
   };
   ```

2. Environment Variables:
   Create a .env file in the root directory:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   // ... other variables
   ```

## 🚀 Usage

1. **Login/Registration**
   - Use your email to create an account
   - Set up your company profile
   - Configure quotation templates

2. **Creating Quotes**
   - Select or add a client
   - Add items with automatic GST calculation
   - Apply discounts and terms
   - Generate and preview PDF

3. **Managing Quotes**
   - Track quote status
   - View quote history
   - Export reports
   - Monitor analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👨‍💻 About the Developer

### Gaurav Singh
- **Role**: Full Stack Developer
- **Expertise**: React.js, Firebase, Enterprise Applications
- **LinkedIn**: [Connect with Gaurav](https://www.linkedin.com/in/gauravitis/)
- **GitHub**: [@gauravitis](https://github.com/gauravitis)

Gaurav is a passionate full-stack developer with expertise in building scalable enterprise applications. With a strong foundation in modern web technologies and a keen eye for user experience, he has developed Quote Manager Pro to address the real-world challenges faced by businesses in quotation management.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the amazing component library
- Firebase team for the robust backend services
- All the contributors who have helped shape this project

## 📞 Contact

Gaurav Singh - [@gauravitis](https://twitter.com/gauravitis) - gaurav@example.com

Project Link: [https://github.com/gauravitis/quotemanager](https://github.com/gauravitis/quotemanager)

---
<div align="center">
  Made with ❤️ by Gaurav Singh
</div>
