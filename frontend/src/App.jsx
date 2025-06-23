import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import VerificarEmailPage from './pages/VerificarEmail';
import SecurityPage from './pages/Security'; 
import ForgotPasswordPage from './pages/ForgotPassword';


import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/verificar-email" element={<VerificarEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/seguridad" 
            element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} 
          />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;