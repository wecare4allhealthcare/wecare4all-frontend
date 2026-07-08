import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingFAQ from "./FloatingFAQ";
import PartnerHospitalsPanel from "./PartnerHospitalsPanel";
import { ToastContainer } from "./Toast";
import { useAnnouncementHeight } from "../context/AnnouncementHeightContext";

export default function Layout({ children }) {
  const bannerHeight = useAnnouncementHeight();
  return (
    <>
      <ToastContainer />
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        <main style={{ flex:1, paddingTop:`${72 + bannerHeight}px` }}>
          {children || <Outlet />}
        </main>
        <Footer />
        <FloatingFAQ />
        <PartnerHospitalsPanel />
      </div>
    </>
  );
}
