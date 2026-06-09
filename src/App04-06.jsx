import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import "./i18n";
import Layout           from "./components/Layout";
import ProtectedRoute   from "./components/ProtectedRoute";
import Home             from "./pages/public/Home";
import AboutUs          from "./pages/public/AboutUs";
import Contact          from "./pages/public/Contact";
import HealthcareProvider from "./pages/public/HealthcareProvider";
import PartnerWithUs    from "./pages/public/PartnerWithUs";
import Doctors          from "./pages/public/Doctors";
import Blog             from "./pages/public/Blog";
import Login            from "./pages/auth/Login";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientProfile   from "./pages/patient/Profile";
import PatientChatList  from "./pages/patient/ChatList";
import PaymentHistory   from "./pages/patient/PaymentHistory";
import DoctorProfile    from "./pages/doctor/Profile";
import DoctorAvailability from "./pages/doctor/Availability";
import DoctorChatList   from "./pages/doctor/ChatList";
import VideoCall        from "./pages/patient/VideoCall";
import Payment          from "./pages/patient/Payment";
import DoctorDashboard  from "./pages/doctor/Dashboard";
import AdminDashboard   from "./pages/admin/Dashboard";
import NotFound         from "./pages/NotFound";

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
          {/* Public */}
          <Route element={<Layout/>}>
            <Route path="/"                    element={<Home/>}/>
            <Route path="/about"               element={<AboutUs/>}/>
            <Route path="/contact"             element={<Contact/>}/>
            <Route path="/healthcare-provider" element={<HealthcareProvider/>}/>
            <Route path="/partner-with-us"     element={<PartnerWithUs/>}/>
            <Route path="/doctors"             element={<Doctors/>}/>
            <Route path="/blog"                element={<Blog/>}/>
            <Route path="/terms"               element={<Contact/>}/>
            <Route path="/privacy"             element={<Contact/>}/>
            <Route path="/rights"              element={<AboutUs/>}/>
          </Route>
          {/* Auth — full screen */}
          <Route path="/login" element={<Login/>}/>
          {/* Protected — with Layout */}
          <Route element={<Layout/>}>
            <Route path="/patient/dashboard" element={
              <ProtectedRoute role="patient"><PatientDashboard/></ProtectedRoute>}/>
            <Route path="/patient/profile" element={
              <ProtectedRoute role="patient"><PatientProfile/></ProtectedRoute>}/>
            <Route path="/patient/chat" element={
              <ProtectedRoute role="patient"><PatientChatList/></ProtectedRoute>}/>
            <Route path="/patient/payments" element={
              <ProtectedRoute role="patient"><PaymentHistory/></ProtectedRoute>}/>
            <Route path="/patient/payment/:appointmentId" element={
              <ProtectedRoute role="patient"><Payment/></ProtectedRoute>}/>
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute role="doctor"><DoctorDashboard/></ProtectedRoute>}/>
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/>
          </Route>
          {/* Video call — full screen, no navbar */}
          <Route path="/patient/video/:appointmentId" element={
            <ProtectedRoute role="patient"><VideoCall/></ProtectedRoute>}/>
          {/* 404 */}
          <Route path="*" element={<Layout><NotFound/></Layout>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
