
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import ForgotPassword from "./pages/ForgotPassword";
import VerificarEmail from "./pages/VerificarEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage"; 
import AdminPermissionsPage from './pages/AdminPermissionsPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verificar-email" element={<VerificarEmail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/security" element={<Security />} />
          <Route path="project/:id" element={<ProjectDetailPage />} />
          <Route path="/admin/permisos" element={<AdminPermissionsPage/>}/>
        </Route>
      </Routes>
  );
}

export default App;


//v2
// import { Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";

// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Security from "./pages/Security";
// import ForgotPassword from "./pages/ForgotPassword";
// import VerificarEmail from "./pages/VerificarEmail";
// import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   return (
//     <AuthProvider>
//       <Routes>
//         {/* Ruta raíz que redirige a /login */}
//         <Route path="/" element={<Navigate to="/login" />} />

//         {/* Rutas Públicas */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/verify-email" element={<VerificarEmail />} />

//         {/* Rutas Protegidas */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/security" element={<Security />} />
//           {/* Aquí irán las demás rutas protegidas */}
//         </Route>
//       </Routes>
//     </AuthProvider>
//   );
// }

// export default App;



//v1

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/Login';
// import RegisterPage from './pages/Register';
// import DashboardPage from './pages/Dashboard';
// import VerificarEmailPage from './pages/VerificarEmail';
// import SecurityPage from './pages/Security'; 
// import ForgotPasswordPage from './pages/ForgotPassword';


// import ProtectedRoute from './components/ProtectedRoute';
// import { AuthProvider } from './context/AuthContext';

// //Prueba 2

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/verificar-email" element={<VerificarEmailPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route 
//             path="/seguridad" 
//             element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} 
//           />
          
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;