import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ClientLogos from "./ClientLogos";
import FloatingFAQ from "./FloatingFAQ";
import PartnerHospitalsPanel from "./PartnerHospitalsPanel";
import SymptomChecker from "./SymptomChecker";
import CallFloatButton from "./CallFloatButton";
import WhatsAppFloatButton from "./WhatsAppFloatButton";

export default function Layout({ children }) {
  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        {/* Client feedback (Aug 2026): the top contact strip was removed
            in favor of a floating call button (see CallFloatButton.jsx
            below) — paddingTop back to just the 72px navbar height. */}
        <main id="main-content" tabIndex={-1} style={{ flex:1, paddingTop:"72px", outline:"none" }}>
          {children || <Outlet />}
        </main>
        <ClientLogos />
        <Footer />
        <FloatingFAQ />
        <CallFloatButton />
        <WhatsAppFloatButton />
        <PartnerHospitalsPanel />
        <SymptomChecker />
      </div>
    </>
  );
}
