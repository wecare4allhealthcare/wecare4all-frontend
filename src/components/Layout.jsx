import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ClientLogos from "./ClientLogos";
import FloatingFAQ from "./FloatingFAQ";
import PartnerHospitalsPanel from "./PartnerHospitalsPanel";
import SymptomChecker from "./SymptomChecker";

export default function Layout({ children }) {
  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        {/* paddingTop = 36px contact strip + 72px nav (client requirement,
            Aug 2026 — see the fixed contact strip added in Navbar.jsx) */}
        <main id="main-content" tabIndex={-1} style={{ flex:1, paddingTop:"108px", outline:"none" }}>
          {children || <Outlet />}
        </main>
        <ClientLogos />
        <Footer />
        <FloatingFAQ />
        <PartnerHospitalsPanel />
        <SymptomChecker />
      </div>
    </>
  );
}
