import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import AboutRouteGuard from "./components/AboutRouteGuard";

// ── Code splitting ──────────────────────────────────────────────────
// Every page below used to be a plain `import`, meaning the entire app
// — patient pages, doctor pages, the 3,600-line admin dashboard, all of
// it — shipped in one JS bundle that downloaded before a first-time
// visitor could even see the homepage. React.lazy() + Suspense (below)
// splits each page into its own chunk that only loads when its route
// is actually visited, so a patient's first load no longer includes
// code for the admin dashboard, doctor tools, or hospital portal they
// may never touch. Small, always-needed pieces (Layout, AuthProvider,
// the toast/dialog containers, the announcement banner) stay as
// regular imports since they're used on every page anyway — splitting
// those out would just add a network round-trip for no benefit.

// Public pages
const Home               = lazy(() => import("./pages/public/Home"));
const AboutUs             = lazy(() => import("./pages/public/AboutUs"));
const Contact              = lazy(() => import("./pages/public/Contact"));
const HealthcareProvider   = lazy(() => import("./pages/public/HealthcareProvider"));
const Doctors               = lazy(() => import("./pages/public/Doctors"));
const InternationalPatients = lazy(() => import("./pages/public/InternationalPatients"));
const PartnerWithUs         = lazy(() => import("./pages/public/PartnerWithUs"));
const Blog                  = lazy(() => import("./pages/public/Blog"));
const BlogPost               = lazy(() => import("./pages/public/BlogPost"));
const HomeHealthcarePage    = lazy(() => import("./pages/public/HomeHealthcare"));
const CorporateWellness     = lazy(() => import("./pages/public/CorporateWellness"));
const ResidentialHealthCare = lazy(() => import("./pages/public/ResidentialHealthCare"));
const OurHospitals          = lazy(() => import("./pages/public/OurHospitals"));
const HospitalProfile       = lazy(() => import("./pages/public/HospitalProfile"));
const PrivacyPolicy         = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsAndConditions    = lazy(() => import("./pages/legal/TermsAndConditions"));
const MedicalDisclaimer     = lazy(() => import("./pages/legal/MedicalDisclaimer"));
const PatientRights         = lazy(() => import("./pages/legal/PatientRights"));
const HospitalPortal        = lazy(() => import("./pages/hospital/Portal"));
const HospitalDashboard     = lazy(() => import("./pages/hospital/Dashboard"));
const PharmacyDashboard     = lazy(() => import("./pages/pharmacy/Dashboard"));

// Auth
const Login = lazy(() => import("./pages/auth/Login"));

// Patient
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard"));
const FamilyMembers    = lazy(() => import("./pages/patient/FamilyMembers"));
const HealthProfile    = lazy(() => import("./pages/patient/HealthProfile"));
const Documents         = lazy(() => import("./pages/patient/Documents"));
const Waitlist           = lazy(() => import("./pages/patient/Waitlist"));
const PharmacyOrders     = lazy(() => import("./pages/patient/PharmacyOrders"));
import AnnouncementBanner from "./components/AnnouncementBanner";
import SkipLink from "./components/SkipLink";
import InstallPrompt from "./components/InstallPrompt";
import { ToastContainer } from "./components/Toast";
import { ConfirmDialogContainer } from "./components/ConfirmDialog";
const PatientProfile = lazy(() => import("./pages/patient/Profile"));
const VideoCall        = lazy(() => import("./pages/patient/VideoCall"));
const DoctorVideoCall    = lazy(() => import("./pages/doctor/VideoCall"));
const Payment              = lazy(() => import("./pages/patient/Payment"));
const PaymentHistory        = lazy(() => import("./pages/patient/PaymentHistory"));
const HomeBookings           = lazy(() => import("./pages/patient/HomeBookings"));
const PatientChatList         = lazy(() => import("./pages/patient/ChatList"));

// Doctor
const DoctorDashboard    = lazy(() => import("./pages/doctor/Dashboard"));
const DoctorProfile       = lazy(() => import("./pages/doctor/Profile"));
const DoctorAvailability   = lazy(() => import("./pages/doctor/Availability"));
const DoctorChatPage        = lazy(() => import("./pages/doctor/ChatPage"));

// Admin
const AdminDashboard   = lazy(() => import("./pages/admin/Dashboard"));
const AdminChatPage     = lazy(() => import("./pages/admin/ChatPage"));
const HospitalChatPage   = lazy(() => import("./pages/hospital/ChatPage"));

// Shown briefly while a page's chunk downloads — same spinner already
// used by ProtectedRoute below during the auth-session check, so a
// route transition and an auth check look the same rather than
// flashing two different loading styles.
function RouteFallback() {
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

function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: userRole, loading } = useAuth();
  const location = useLocation();
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
  if (!isLoggedIn) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace/>;
  // role can be a single string or an array — Our Hospitals, for
  // instance, is shared by both Patient and Hospital logins.
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace/>;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public pages — WITH Navbar + Footer (Layout) ── */}
      <Route element={<Layout/>}>
        {/* Only these four are accessible without logging in, per client requirement */}
        <Route path="/"                    element={<Home/>}/>
        <Route path="/about"               element={<AboutRouteGuard><AboutUs/></AboutRouteGuard>}/>
        <Route path="/contact"             element={<Contact/>}/>
        <Route path="/healthcare-provider" element={<HealthcareProvider/>}/>

        {/* Legal/compliance pages are a deliberate exception — kept public
            so a visitor can read them (e.g. Privacy Policy) before they've
            logged in at all. Flag if this should change. */}
        <Route path="/privacy"             element={<PrivacyPolicy/>}/>
        <Route path="/terms"               element={<TermsAndConditions/>}/>
        <Route path="/disclaimer"          element={<MedicalDisclaimer/>}/>
        <Route path="/rights"              element={<PatientRights/>}/>

        {/* ── Healthcare Consultancy portal — login required ── */}
        <Route path="/doctors" element={
          <ProtectedRoute role={["patient","admin"]}><Doctors/></ProtectedRoute>}/>
        <Route path="/blog" element={
          <ProtectedRoute role={["patient","admin"]}><Blog/></ProtectedRoute>}/>
        <Route path="/blog/:slug" element={
          <ProtectedRoute role={["patient","admin"]}><BlogPost/></ProtectedRoute>}/>
        <Route path="/home-healthcare" element={
          <ProtectedRoute role={["patient","admin"]}><HomeHealthcarePage/></ProtectedRoute>}/>
        <Route path="/international-patients" element={
          <ProtectedRoute role={["patient","admin"]}><InternationalPatients/></ProtectedRoute>}/>

        {/* Login required to view this page. */}
        <Route path="/partner-with-us" element={
          <ProtectedRoute role={["patient","hospital","admin"]}><PartnerWithUs/></ProtectedRoute>}/>

        {/* Public — B2B enquiry page, no login needed to submit an
            enquiry (same reasoning as /partner-with-us above). */}
        <Route path="/corporate-wellness" element={<CorporateWellness/>}/>
        <Route path="/residential-healthcare" element={<ResidentialHealthCare/>}/>

        {/* ── Hospitals — shared by Patient, Hospital, and Admin ── */}
        <Route path="/our-hospitals" element={
          <ProtectedRoute role={["patient","hospital","admin"]}><OurHospitals/></ProtectedRoute>}/>
        <Route path="/our-hospitals/:id" element={
          <ProtectedRoute role={["patient","hospital","admin"]}><HospitalProfile/></ProtectedRoute>}/>
      </Route>

      {/* ── Auth — NO Navbar (full screen login) ── */}
      <Route path="/login" element={<Login/>}/>
      <Route path="/hospital-login" element={<Navigate to="/login?staff=hospital" replace/>}/>
      <Route path="/hospital-portal/:token" element={<HospitalPortal/>}/>
      <Route path="/hospital/dashboard" element={
        <ProtectedRoute role="hospital"><HospitalDashboard/></ProtectedRoute>}/>
      <Route path="/pharmacy/dashboard" element={
        <ProtectedRoute role="pharmacy"><PharmacyDashboard/></ProtectedRoute>}/>

      {/* ── Patient — NO Navbar (dashboard has its own header) ── */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute role="patient"><PatientDashboard/></ProtectedRoute>}/>
      <Route path="/patient/family-members" element={
        <ProtectedRoute role="patient"><FamilyMembers/></ProtectedRoute>}/>
      <Route path="/patient/health-profile" element={
        <ProtectedRoute role="patient"><HealthProfile/></ProtectedRoute>}/>
      <Route path="/patient/documents" element={
        <ProtectedRoute role="patient"><Documents/></ProtectedRoute>}/>
      <Route path="/patient/waitlist" element={
        <ProtectedRoute role="patient"><Waitlist/></ProtectedRoute>}/>
      <Route path="/patient/pharmacy-orders" element={
        <ProtectedRoute role="patient"><PharmacyOrders/></ProtectedRoute>}/>
      <Route path="/patient/profile" element={
        <ProtectedRoute role="patient"><PatientProfile/></ProtectedRoute>}/>
      <Route path="/patient/video/:appointmentId" element={
        <ProtectedRoute role="patient"><VideoCall/></ProtectedRoute>}/>
      <Route path="/doctor/video/:appointmentId" element={
        <ProtectedRoute role="doctor"><DoctorVideoCall/></ProtectedRoute>}/>
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
      <Route path="/hospital/chat" element={
        <ProtectedRoute role="hospital"><HospitalChatPage/></ProtectedRoute>}/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

// Announcement banner is only relevant inside logged-in dashboards
// (patient/doctor/admin/hospital) — public pages like Home, About Us,
// Services, etc. should never show it, regardless of whether admin has
// an active announcement.
function AnnouncementGate() {
  const location = useLocation();
  const isDashboard = /^\/(patient|doctor|admin|hospital)\//.test(location.pathname);
  if (!isDashboard) return null;
  return <AnnouncementBanner/>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SkipLink/>
        <ToastContainer/>
        <ConfirmDialogContainer/>
        <AnnouncementGate/>
        <Suspense fallback={<RouteFallback/>}>
          <AppRoutes/>
        </Suspense>
        <InstallPrompt/>
      </BrowserRouter>
    </AuthProvider>
  );
}
