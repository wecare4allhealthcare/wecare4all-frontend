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
        {/* Call us + Chat with us — grouped in one flex container so the
            two pill-shaped buttons (Aug 2026: "let that button be Chat
            with us and Call us" — replaced icon-only circles) space
            themselves apart based on their real rendered width, instead
            of each hardcoding a `right` offset that assumed a fixed
            52px circle. row-reverse keeps "Call us" as the rightmost
            pill (closest to FloatingFAQ, same position it held before)
            and "Chat with us" to its left. */}
        <div style={{
          position: "fixed", bottom: "24px", right: "90px", zIndex: 998,
          display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "12px",
        }}>
          <CallFloatButton />
          <WhatsAppFloatButton />
        </div>
        <PartnerHospitalsPanel />
        <SymptomChecker />
      </div>
    </>
  );
}
