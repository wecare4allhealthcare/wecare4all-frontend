/**
 * Layout.jsx — Fixed
 * Adds paddingTop:72px to all pages so content
 * is never hidden under the fixed 72px navbar.
 * Pages with their own dark hero override this with
 * paddingTop on their hero section directly.
 */
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

// These pages manage their own hero padding internally
// (they have dark gradient heroes that go edge-to-edge)
const FULL_BLEED = [
  "/", "/about", "/contact", "/healthcare-provider",
  "/partner-with-us", "/doctors", "/blog",
];

export default function Layout({ children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <Navbar />
      {/* 
        paddingTop:72px pushes content below fixed navbar.
        Pages with dark heroes already handle this internally
        using paddingTop on their own hero section, so we use
        a wrapper that provides the base spacing.
      */}
      <main style={{ flex:1, paddingTop:"72px" }}>
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
}
