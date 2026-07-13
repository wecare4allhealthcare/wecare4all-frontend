// Shared constant for the doctor-dashboard sub-components extracted out
// of Dashboard.jsx in Phase 14 (NotesModal, RejectModal, TransferModal,
// PatientBriefPanel, PatientBriefModal, AcceptRejectButtons, MyReviews).
// All of them fetch from the same API base — kept in one place so it's
// not redefined identically in eight separate files.
export const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
