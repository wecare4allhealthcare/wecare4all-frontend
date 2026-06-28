import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

// Public pages
import Home               from "./pages/public/Home";
import AboutUs            from "./pages/public/AboutUs";
import Contact            from "./pages/public/Contact";
import HealthcareProvider from "./pages/public/HealthcareProvider";
import Doctors            from "./pages/public/Doctors";
import PartnerWithUs      from "./pages/public/PartnerWithUs";
import Blog               from "./pages/public/Blog";
import HomeHealthcarePage from "./pages/public/HomeHealthcare";
import PrivacyPolicy      from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import MedicalDisclaimer  from "./pages/legal/MedicalDisclaimer";
import PatientRights      from "./pages/legal/PatientRights";
import HospitalPortal      from "./pages/hospital/Portal";

// Auth
import Login              from "./pages/auth/Login";

// Patient
import PatientDashboard   from "./pages/patient/Dashboard";
import FamilyMembers      from "./pages/patient/FamilyMembers";
import HealthProfile      from "./pages/patient/HealthProfile";
import AnnouncementBanner from "./components/AnnouncementBanner";
import InstallPrompt      from "./components/InstallPrompt";
import PatientProfile     from "./pages/patient/Profile";
import VideoCall          from "./pages/patient/VideoCall";
import Payment            from "./pages/patient/Payment";
import PaymentHistory     from "./pages/patient/PaymentHistory";
import HomeBookings       from "./pages/patient/HomeBookings";
import PatientChatList    from "./pages/patient/ChatList";

// Doctor
import DoctorDashboard    from "./pages/doctor/Dashboard";
import DoctorProfile      from "./pages/doctor/Profile";
import DoctorAvailability from "./pages/doctor/Availability";
import DoctorChatPage     from "./pages/doctor/ChatPage";

// Admin
import AdminDashboard     from "./pages/admin/Dashboard";
import AdminChatPage      from "./pages/admin/ChatPage";

function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: userRole, loading } = useAuth();
  // On a hard refresh, AuthContext's session restore (reading the token
  // from localStorage, then calling getMe()) is async — for that first
  // render, isLoggedIn is false simply because the check hasn't finished
  // yet, not because the user is actually logged out. Redirecting to
  // /login here was firing on every refresh of a protected page, even
  // with a perfectly valid session. Wait for `loading` to clear first.
  if (loading) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",
        minHeight:"100vh",background:"#f0f6fc"}}>
        <div style={{width:"32px",height:"32px",border:"3px solid #e2eaf4",
          borderTop:"3px solid #047857",borderRadius:"50%",
          animation:"spin .8s linear infinite"}}/>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace/>;
  if (role && userRole !== role) return <Navigate to="/" replace/>;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public pages — WITH Navbar + Footer (Layout) ── */}
      <Route element={<Layout/>}>
        <Route path="/"                    element={<Home/>}/>
        <Route path="/about"               element={<AboutUs/>}/>
        <Route path="/contact"             element={<Contact/>}/>
        <Route path="/healthcare-provider" element={<HealthcareProvider/>}/>
        <Route path="/doctors"             element={<Doctors/>}/>
        <Route path="/partner-with-us"     element={<PartnerWithUs/>}/>
        <Route path="/blog"                element={<Blog/>}/>
        <Route path="/home-healthcare"     element={<HomeHealthcarePage/>}/>
        <Route path="/privacy"             element={<PrivacyPolicy/>}/>
        <Route path="/terms"               element={<TermsAndConditions/>}/>
        <Route path="/disclaimer"          element={<MedicalDisclaimer/>}/>
        <Route path="/rights"              element={<PatientRights/>}/>
      </Route>

      {/* ── Auth — NO Navbar (full screen login) ── */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/hospital-portal/:token" element={<HospitalPortal/>}/>

      {/* ── Patient — NO Navbar (dashboard has its own header) ── */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute role="patient"><PatientDashboard/></ProtectedRoute>}/>
      <Route path="/patient/family-members" element={
        <ProtectedRoute role="patient"><FamilyMembers/></ProtectedRoute>}/>
      <Route path="/patient/health-profile" element={
        <ProtectedRoute role="patient"><HealthProfile/></ProtectedRoute>}/>
      <Route path="/patient/profile" element={
        <ProtectedRoute role="patient"><PatientProfile/></ProtectedRoute>}/>
      <Route path="/patient/video/:appointmentId" element={
        <ProtectedRoute role="patient"><VideoCall/></ProtectedRoute>}/>
      <Route path="/patient/payment/:appointmentId" element={
        <ProtectedRoute role="patient"><Payment/></ProtectedRoute>}/>
      <Route path="/patient/payments" element={
        <ProtectedRoute role="patient"><PaymentHistory/></ProtectedRoute>}/>
      <Route path="/patient/home-bookings" element={
        <ProtectedRoute role="patient"><HomeBookings/></ProtectedRoute>}/>
      <Route path="/patient/chat" element={
        <ProtectedRoute role="patient"><PatientChatList/></ProtectedRoute>}/>

      {/* ── Doctor — NO Navbar (dashboard has its own header) ── */}
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute role="doctor"><DoctorDashboard/></ProtectedRoute>}/>
      <Route path="/doctor/profile" element={
        <ProtectedRoute role="doctor"><DoctorProfile/></ProtectedRoute>}/>
      <Route path="/doctor/availability" element={
        <ProtectedRoute role="doctor"><DoctorAvailability/></ProtectedRoute>}/>
      <Route path="/doctor/chat" element={
        <ProtectedRoute role="doctor"><DoctorChatPage/></ProtectedRoute>}/>

      {/* ── Admin — NO Navbar (sidebar is the navigation) ── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>}/>
      <Route path="/admin/chat" element={
        <ProtectedRoute role="admin"><AdminChatPage/></ProtectedRoute>}/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnnouncementBanner/>
        <AppRoutes/>
        <InstallPrompt/>
      </BrowserRouter>
    </AuthProvider>
  );
}
