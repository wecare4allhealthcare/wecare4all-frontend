import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import HospitalConsultancyRouteGuard from "./components/HospitalConsultancyRouteGuard";

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
const Home = lazy(() => import("./pages/public/Home"));
const AboutUs = lazy(() => import("./pages/public/AboutUs"));
const Contact = lazy(() => import("./pages/public/Contact"));
const HealthcareProvider = lazy(() => import("./pages/public/HealthcareProvider"));
const Doctors = lazy(() => import("./pages/public/Doctors"));
const InternationalPatients = lazy(() => import("./pages/public/InternationalPatients"));
const PartnerWithUs = lazy(() => import("./pages/public/PartnerWithUs"));
const Blog = lazy(() => import("./pages/public/Blog"));
const BlogPost = lazy(() => import("./pages/public/BlogPost"));
const HomeHealthcarePage = lazy(() => import("./pages/public/HomeHealthcare"));
const CorporateWellness = lazy(() => import("./pages/public/CorporateWellness"));
const ResidentialHealthCare = lazy(() => import("./pages/public/ResidentialHealthCare"));
const HospitalConsultancy = lazy(() => import("./pages/public/HospitalConsultancy"));
const SpecialtyPage = lazy(() => import("./pages/public/SpecialtyPage"));
const OurHospitals = lazy(() => import("./pages/public/OurHospitals"));
const HospitalProfile = lazy(() => import("./pages/public/HospitalProfile"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/legal/TermsAndConditions"));
const MedicalDisclaimer = lazy(() => import("./pages/legal/MedicalDisclaimer"));
const PatientRights = lazy(() => import("./pages/legal/PatientRights"));
const HospitalPortal = lazy(() => import("./pages/hospital/Portal"));
const HospitalDashboard = lazy(() => import("./pages/hospital/Dashboard"));
const PharmacyDashboard = lazy(() => import("./pages/pharmacy/Dashboard"));
const PharmacySignup = lazy(() => import("./pages/pharmacy/Signup"));
const LabDashboard = lazy(() => import("./pages/lab/Dashboard"));
const LabSignup = lazy(() => import("./pages/lab/Signup"));
const CompanySignup = lazy(() => import("./pages/company/Signup"));
const CompanyLogin = lazy(() => import("./pages/company/Login"));
const CompanyDashboard = lazy(() => import("./pages/company/Dashboard"));
const EmployeeLogin  = lazy(() => import("./pages/company/EmployeeLogin"));
const EmployeeSignup = lazy(() => import("./pages/company/EmployeeSignup"));
const ChangePassword = lazy(() => import("./pages/company/ChangePassword"));

// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Patient
const PatientDashboard = lazy(() => import("./pages/patient/Dashboard"));
const HospitalConsultancyDashboard = lazy(() => import("./pages/patient/HospitalConsultancyDashboard"));
const FamilyMembers = lazy(() => import("./pages/patient/FamilyMembers"));
const HealthProfile = lazy(() => import("./pages/patient/HealthProfile"));
const Documents = lazy(() => import("./pages/patient/Documents"));
const Waitlist = lazy(() => import("./pages/patient/Waitlist"));
const HealthLocker = lazy(() => import("./pages/patient/HealthLocker"));
const LabTests = lazy(() => import("./pages/patient/LabTests"));
const FamilyPlan = lazy(() => import("./pages/patient/FamilyPlan"));
const PharmacyOrders = lazy(() => import("./pages/patient/PharmacyOrders"));
import AnnouncementBanner from "./components/AnnouncementBanner";
import SkipLink from "./components/SkipLink";
import InstallPrompt from "./components/InstallPrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "./components/Toast";
import { ConfirmDialogContainer } from "./components/ConfirmDialog";
const PatientProfile = lazy(() => import("./pages/patient/Profile"));
const VideoCall = lazy(() => import("./pages/patient/VideoCall"));
const DoctorVideoCall = lazy(() => import("./pages/doctor/VideoCall"));
const Payment = lazy(() => import("./pages/patient/Payment"));
const PaymentHistory = lazy(() => import("./pages/patient/PaymentHistory"));
const HomeBookings = lazy(() => import("./pages/patient/HomeBookings"));
const PatientChatList = lazy(() => import("./pages/patient/ChatList"));

// Doctor
const DoctorDashboard = lazy(() => import("./pages/doctor/Dashboard"));
const DoctorProfile = lazy(() => import("./pages/doctor/Profile"));
const DoctorAvailability = lazy(() => import("./pages/doctor/Availability"));
const DoctorChatPage = lazy(() => import("./pages/doctor/ChatPage"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminChatPage = lazy(() => import("./pages/admin/ChatPage"));
const HospitalChatPage = lazy(() => import("./pages/hospital/ChatPage"));

// Shown briefly while a page's chunk downloads — same spinner already
// used by ProtectedRoute below during the auth-session check, so a
// route transition and an auth check look the same rather than
// flashing two different loading styles.
function RouteFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f0f6fc",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid var(--wc-border)",
          borderTop: "3px solid var(--wc-green)",
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }}
      />
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f0f6fc",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--wc-border)",
            borderTop: "3px solid var(--wc-green)",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      </div>
    );
  }
  if (!isLoggedIn)
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  // role can be a single string or an array — Our Hospitals, for
  // instance, is shared by both Patient and Hospital logins.
  const allowedRoles = Array.isArray(role) ? role : role ? [role] : null;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public pages — WITH Navbar + Footer (Layout) ── */}
      <Route element={<Layout />}>
        {/* Only these four are accessible without logging in, per client requirement */}
        <Route path="/" element={<Home />} />
        {/* Public (found during SEO audit, Aug 2026): AboutRouteGuard was
            restricting /about — the founder credentials/trust page this
            site's own homepage links to ("Read our full story →") — to
            admin and Hospital Consultancy accounts ONLY. Every regular
            patient, logged-out visitor, and Google's crawler got bounced
            straight back to "/" with no explanation. No form or submit
            action lives on this page (pure informational), so there was
            no reason for it to be gated at all — this looks like it was
            never meant to apply to the general About Us content, only to
            some hospital-consultancy-specific variant that never
            materialized as a separate route. AboutRouteGuard.jsx is kept
            in the codebase in case that distinction is still needed
            later, just no longer wraps this route. */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/healthcare-provider" element={<HealthcareProvider />} />
        {/* Public SEO pages — one per medical specialty, per web-analysis
            recommendation (Aug 2026): "Turn the list of 18 medical
            specialties into clickable links leading to dedicated SEO
            pages." No login required — see SpecialtyPage.jsx header
            comment for why the live doctor list still works logged-out. */}
        <Route path="/specialties/:slug" element={<SpecialtyPage />} />

        {/* Legal/compliance pages are a deliberate exception — kept public
            so a visitor can read them (e.g. Privacy Policy) before they've
            logged in at all. Flag if this should change. */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/disclaimer" element={<MedicalDisclaimer />} />
        <Route path="/rights" element={<PatientRights />} />

        {/* Public (SEO audit, Aug 2026): the client's own keyword list
            ("best doctors in chennai", "best gastroenterologist in
            chennai", "best surgeons in chennai/india", etc) overwhelmingly
            targets exactly this page — and it was completely unreachable
            by Google behind <ProtectedRoute>. Booking itself was ALREADY
            correctly gated independently of the page-level wrapper — see
            handleBookingClick below, which already does
            `if(!isLoggedIn){navigate("/login?redirect=/doctors");return;}`
            — so removing the page-level gate needed zero changes to the
            booking flow itself. */}
        <Route path="/doctors" element={<Doctors />} />
        {/* Public — blog is a public marketing/SEO surface; the backend
            GET /blog/posts and /blog/posts/{slug} endpoints are already
            unauthenticated, this ProtectedRoute wrapper was the only
            thing keeping it gated. Removed so search engines and
            logged-out visitors can read posts directly. */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        {/* Public (Aug 2026 client decision): explanation/marketing
            content on both pages is now open to anonymous visitors —
            was previously gated behind <ProtectedRoute role={["patient",
            "admin"]}>, which sent a first-time visitor straight to
            /login before they'd seen anything. Actual booking/submit
            actions on each page still require login — enforced at the
            point of submit (see HomeHealthcarePage's BookingModal
            handleSubmit, which already checks isLoggedIn and redirects
            to /login?redirect=/home-healthcare — that logic needed no
            change). InternationalPatients has no form of its own; its
            CTAs go to /doctors and /contact, which already gate at
            their own submit points. */}
        <Route
          path="/home-healthcare"
          element={<HomeHealthcarePage />}
        />
        <Route
          path="/international-patients"
          element={<InternationalPatients />}
        />

        {/* Public — a hospital applying to partner doesn't have any kind
            of account yet (see empanelment.py's submit_empanelment,
            which is a genuinely public endpoint with no auth
            dependency, and EmpanelForm.jsx, which works with or
            without a token). This used to require login as patient/
            hospital/admin, which — since a hospital had no account of
            its own to log into yet — was the actual reason hospitals
            were being signed up as patients (with a Patient ID) just
            to reach this form. */}
        <Route path="/partner-with-us" element={<PartnerWithUs />} />

        {/* Public — B2B enquiry page, no login needed to submit an
            enquiry (same reasoning as /partner-with-us above). */}
        <Route path="/corporate-wellness" element={<CorporateWellness />} />
        <Route path="/residential-healthcare" element={<ResidentialHealthCare />} />

        {/* Login required — Admin, genuine Hospital-staff accounts, and
            patient-role accounts that logged in via the Hospital portal
            (see HospitalConsultancyRouteGuard.jsx — mirrors the same
            role logic AboutRouteGuard used to use for /about). Logged-out
            visitors are sent to /login?redirect=...; a logged-in but
            wrong-role visitor is sent to "/". Kept gated — unlike /about,
            this genuinely is a hospital-partner-only portal page, not a
            general marketing page a random visitor or Google should
            land on. */}
        <Route
          path="/hospital-consultancy"
          element={
            <HospitalConsultancyRouteGuard>
              <HospitalConsultancy />
            </HospitalConsultancyRouteGuard>
          }
        />

        {/* Public (SEO audit, Aug 2026): pure browse/profile pages, no
            form or submit action on either — a partner hospital
            directory and individual hospital profiles are exactly the
            kind of content that should be indexable ("best hospitals in
            chennai" style searches), and nothing here needed a login to
            safely show. */}
        <Route path="/our-hospitals" element={<OurHospitals />} />
        <Route path="/our-hospitals/:id" element={<HospitalProfile />} />
      </Route>

      {/* ── Auth — NO Navbar (full screen login) ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/hospital-login" element={<Navigate to="/login?staff=hospital" replace />} />
      <Route path="/hospital-portal/:token" element={<HospitalPortal />} />
      <Route
        path="/hospital/dashboard"
        element={
          <ProtectedRoute role="hospital">
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/dashboard"
        element={
          <ProtectedRoute role="pharmacy">
            <PharmacyDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/pharmacy/signup" element={<PharmacySignup />} />
      <Route
        path="/lab/dashboard"
        element={
          <ProtectedRoute role="lab">
            <LabDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/lab/signup" element={<LabSignup />} />

      {/* ── Patient — NO Navbar (dashboard has its own header) ── */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      {/* Hospital Consultancy — role=patient, portal_type=hospital initially.
          Once their empanelment is approved, the page silently swaps their
          session to a hospital-role token and renders the real hospital
          dashboard in place (same URL) — so this route must also allow
          role=hospital, not just patient. */}
      <Route
        path="/patient/hospital-consultancy"
        element={
          <ProtectedRoute role={["patient","hospital"]}>
            <HospitalConsultancyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/family-members"
        element={
          <ProtectedRoute role="patient">
            <FamilyMembers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/health-profile"
        element={
          <ProtectedRoute role="patient">
            <HealthProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/documents"
        element={
          <ProtectedRoute role="patient">
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/waitlist"
        element={
          <ProtectedRoute role="patient">
            <Waitlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/health-locker"
        element={
          <ProtectedRoute role="patient">
            <HealthLocker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/lab-tests"
        element={
          <ProtectedRoute role="patient">
            <LabTests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/family-plan"
        element={
          <ProtectedRoute role="patient">
            <FamilyPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/pharmacy-orders"
        element={
          <ProtectedRoute role="patient">
            <PharmacyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute role="patient">
            <PatientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/video/:appointmentId"
        element={
          <ProtectedRoute role="patient">
            <VideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/video/:appointmentId"
        element={
          <ProtectedRoute role="doctor">
            <DoctorVideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/payment/:appointmentId"
        element={
          <ProtectedRoute role="patient">
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/payments"
        element={
          <ProtectedRoute role="patient">
            <PaymentHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/home-bookings"
        element={
          <ProtectedRoute role="patient">
            <HomeBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/chat"
        element={
          <ProtectedRoute role="patient">
            <PatientChatList />
          </ProtectedRoute>
        }
      />

      {/* ── Doctor — NO Navbar (dashboard has its own header) ── */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute role="doctor">
            <DoctorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute role="doctor">
            <DoctorAvailability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/chat"
        element={
          <ProtectedRoute role="doctor">
            <DoctorChatPage />
          </ProtectedRoute>
        }
      />

      {/* ── Admin — NO Navbar (sidebar is the navigation) ── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <ProtectedRoute role="admin">
            <AdminChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/chat"
        element={
          <ProtectedRoute role="hospital">
            <HospitalChatPage />
          </ProtectedRoute>
        }
      />

      <Route path="/company/signup" element={<CompanySignup />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute role={["company_super_admin", "hr_admin"]}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/employee-login" element={<EmployeeLogin/>}/>
      {/* Several links across the app (Footer, Login.jsx, CorporateWellness.jsx,
          EmployeeSignup.jsx) point to /company/employee-login, but only
          /employee-login was registered, causing a 404. Registering both
          paths to the same component fixes every existing link without
          having to hunt down and rewrite each one. */}
      <Route path="/company/employee-login" element={<EmployeeLogin/>}/>
      <Route path="/employee-signup" element={<EmployeeSignup/>}/>
      <Route path="/company/employee-signup" element={<EmployeeSignup/>}/>
      <Route path="/company/change-password" element={
      <ProtectedRoute role={["patient","company_super_admin","hr_admin"]}><ChangePassword/></ProtectedRoute>}/>

      {/* Fallback */}
      {/* Was silently redirecting every unmatched URL to Home (Navigate
          replace) — a mistyped/broken link gave no indication anything
          was wrong, and it meant the ready-made NotFound.jsx component
          (a proper 404 page) sat completely unused. Found via a full
          route-registration audit. */}
      <Route path="*" element={<NotFound />} />
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
  return <AnnouncementBanner />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SkipLink />
        <ToastContainer />
        <ConfirmDialogContainer />
        <AnnouncementGate />
        {/* No error boundary existed anywhere before this — a render-time
            crash on any route (a first-mount race reading a token/stat
            before it was ready, most visibly on the admin dashboard)
            unmounted the whole tree to a blank page that only a manual
            refresh recovered from. Wrapping the routed content gives every
            page a recoverable fallback instead. */}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
        <InstallPrompt />
      </BrowserRouter>
    </AuthProvider>
  );
}
