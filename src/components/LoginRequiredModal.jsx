import { useRef } from "react";
import { useModalA11y } from "../hooks/useModalA11y";

/**
 * LoginRequiredModal.jsx — Aug 2026, client request.
 *
 * Booking an appointment or a home healthcare visit no longer requires
 * login (see Doctors.jsx / HomeHealthcare.jsx BookingModal) — login is
 * only enforced here, at the moment payment is actually attempted, for
 * a guest whose booking hasn't been claimed onto an account yet. Used by
 * Payment.jsx (appointment payment) and HomeHealthcare.jsx (inline
 * payment step).
 *
 * onLogin should navigate to /login?redirect=<current payment URL> so the
 * person lands back on the exact same payment page once logged in — that
 * return trip is what claims the guest booking onto their account (see
 * GET /appointments/{id} / GET /home-healthcare/bookings/{id} on the
 * backend).
 */
export function LoginRequiredModal({ show, onLogin, onCancel }) {
  const boxRef = useRef(null);
  useModalA11y(boxRef, onCancel, show);
  if (!show) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:99999,display:"flex",
      alignItems:"center",justifyContent:"center",padding:"20px",
      background:"rgba(18,59,74,.55)",backdropFilter:"blur(4px)"}}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Login Required"
        style={{background:"#fff",borderRadius:"20px",padding:"32px 28px",
        maxWidth:"400px",width:"100%",
        boxShadow:"0 24px 60px rgba(18,59,74,.25)",
        animation:"loginModalIn .22s ease"}}>
        <style>{`@keyframes loginModalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{width:"52px",height:"52px",borderRadius:"14px",
          background:"#f0fdf4",border:"1.5px solid #86efac",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"24px",marginBottom:"16px"}}>🔒</div>
        <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",
          fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 8px"}}>
          Login Required to Continue
        </h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
          color:"var(--wc-muted)",margin:"0 0 24px",lineHeight:"1.6"}}>
          Your booking has been saved. To keep it secure and complete the payment,
          please log in to your account — you'll be brought right back here afterward.
        </p>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onCancel}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",
              border:"1.5px solid var(--wc-border)",background:"var(--wc-warm-white)",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"var(--wc-muted)",cursor:"pointer"}}>
            Not Now
          </button>
          <button onClick={onLogin}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",border:"none",
              background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"#fff",cursor:"pointer",
              boxShadow:"0 4px 14px rgba(91,158,50,.3)"}}>
            Login to Pay →
          </button>
        </div>
      </div>
    </div>
  );
}
