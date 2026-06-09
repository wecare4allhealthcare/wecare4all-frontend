import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import "./i18n";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home               from "./pages/public/Home";
import AboutUs            from "./pages/public/AboutUs";
import Contact            from "./pages/public/Contact";
import HealthcareProvider from "./pages/public/HealthcareProvider";
import PartnerWithUs      from "./pages/public/PartnerWithUs";
import Blog from "./pages/public/Blog";
import Login              from "./pages/auth/Login";
import PatientDashboard   from "./pages/patient/Dashboard";
import DoctorDashboard    from "./pages/doctor/Dashboard";
import AdminDashboard     from "./pages/admin/Dashboard";
import NotFound           from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration:4000,
          style:{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",borderRadius:"10px"},
          success:{iconTheme:{primary:"#047857",secondary:"#fff"}},
          error:{iconTheme:{primary:"#dc2626",secondary:"#fff"}},
        }}/>
        <Routes>
          {/* Public pages — with Navbar + Footer */}
          <Route element={<Layout/>}>
            <Route path="/"                    element={<Home/>}/>
            <Route path="/about"               element={<AboutUs/>}/>
            <Route path="/contact"             element={<Contact/>}/>
            <Route path="/healthcare-provider" element={<HealthcareProvider/>}/>
            <Route path="/partner-with-us"     element={<PartnerWithUs/>}/>
            <Route path="/blog" element={<Blog/>}/>
            <Route path="/terms"               element={<Contact/>}/>
            <Route path="/privacy"             element={<Contact/>}/>
            <Route path="/rights"              element={<AboutUs/>}/>
          </Route>
          {/* Auth — full screen, no navbar */}
          <Route path="/login" element={<Login/>}/>
          {/* Protected — with Navbar + Footer */}
          <Route element={<Layout/>}>
            <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard/></ProtectedRoute>}/>
            <Route path="/doctor/dashboard"  element={<ProtectedRoute role="doctor"><DoctorDashboard/></ProtectedRoute>}/>
            <Route path="/admin/dashboard"   element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/>
          </Route>
          {/* 404 */}
          <Route path="*" element={<Layout><NotFound/></Layout>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
