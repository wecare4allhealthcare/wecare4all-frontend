import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingFAQ from "./FloatingFAQ";
import HeaderAdStrip from "./HeaderAdStrip";
import { ToastContainer } from "./Toast";

export default function Layout({ children }) {
  return (
    <>
      <ToastContainer />
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <Navbar />
        <main style={{ flex:1, paddingTop:"72px" }}>
          <HeaderAdStrip />
          {children || <Outlet />}
        </main>
        <Footer />
        <FloatingFAQ />
      </div>
    </>
  );
}
