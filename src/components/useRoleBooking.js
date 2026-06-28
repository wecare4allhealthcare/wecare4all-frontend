import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function useRoleBooking() {
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleBookingClick = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isLoggedIn)        { navigate("/login"); return; }
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
