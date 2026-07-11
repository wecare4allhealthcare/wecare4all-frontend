import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function useRoleBooking() {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // "Hospital Consultancy" accounts are technically role=patient but have
  // no dashboard of their own (see Navbar.jsx / Login.jsx) — send them to
  // apply for empanelment instead of into the real patient booking flow.
  const isHospitalIntent = role === "patient" &&
    (typeof window !== "undefined" && localStorage.getItem("wc4a_login_portal") === "hospital");

  const handleBookingClick = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isLoggedIn)        { navigate("/login"); return; }
    if (isHospitalIntent)   { navigate("/partner-with-us"); return; }
    if (role === "patient") { navigate("/patient/dashboard"); return; }
    // Admin isn't a "wrong account" in the same sense doctor/hospital
    // accounts are here — admin needs to be able to see and click through
    // every page on the site, including the booking flow, without being
    // blocked by a modal that assumes they've mistakenly logged in with
    // the wrong role. Let them browse through to the doctors page instead.
    if (role === "admin")   { navigate("/doctors"); return; }
    setShowModal(true);
  };

  // Generic version for links that go to a specific destination rather
  // than always the same booking flow (e.g. a service card's "Learn
  // more" going to /international-patients, /home-healthcare, etc.) —
  // same role logic as handleBookingClick, just parametrized by target
  // instead of hardcoding where patient/admin end up.
  const handleGatedNavigate = (e, path) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isLoggedIn)        { navigate("/login"); return; }
    if (isHospitalIntent)   { navigate("/partner-with-us"); return; }
    if (role === "patient" || role === "admin") { navigate(path); return; }
    setShowModal(true);
  };

  return {
    showModal,
    handleBookingClick,
    handleGatedNavigate,
    closeModal: () => setShowModal(false),
    role,
    navigate,
  };
}
