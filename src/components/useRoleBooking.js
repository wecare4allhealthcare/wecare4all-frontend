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
    setShowModal(true);
  };

  return {
    showModal,
    handleBookingClick,
    closeModal: () => setShowModal(false),
    role,
    navigate,
  };
}
