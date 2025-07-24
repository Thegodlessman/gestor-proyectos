import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Security from "./pages/Security";
import ForgotPassword from "./pages/ForgotPassword";
import VerificarEmail from "./pages/VerificarEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProfilePage from "./pages/ProfilePage";
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/security" element={<Security />} />
          <Route path="project/:id" element={<ProjectDetailPage />} />
          <Route path="/admin/permisos" element={<AdminPermissionsPage/>}/>
        </Route>
      </Routes>
  );
}

export default App;