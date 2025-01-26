import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard/index';

function LandingPage() {
  const navigate = useNavigate();

  const handleAccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="hero-content">
      <h1>Welcome to ChemBio Lifesciences</h1>
      <div className="glowing-line"></div>
      <h2 className="crm-title">ChemBio CRM</h2>
      <div className="warning-box">
        <svg className="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="warning-text">Continue only if you are authorised to use this portal</p>
      </div>
      <button className="cta-button" onClick={handleAccess}>Access Portal</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <main className="main-content">
              <section className="hero-section">
                <LandingPage />
              </section>
            </main>
          } />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
