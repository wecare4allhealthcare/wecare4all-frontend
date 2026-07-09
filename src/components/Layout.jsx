import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingFAQ from "./FloatingFAQ";
import PartnerHospitalsPanel from "./PartnerHospitalsPanel";

export default function Layout({ children }) {
  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        <main style={{ flex:1, paddingTop:"72px" }}>
          {children || <Outlet />}
        </main>
        <Footer />
        <FloatingFAQ />
        <PartnerHospitalsPanel />
      </div>
    </>
  );
}
