import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
export default function Layout({ children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <Navbar />
      <main style={{ flex:1 }}>{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
