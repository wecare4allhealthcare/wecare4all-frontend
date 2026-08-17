import { useRef } from "react";
import { useModalA11y } from "../hooks/useModalA11y";

export { useRoleBooking } from "./useRoleBooking";

export function RoleModal({ show, role, onLogin, onCancel }) {
  const boxRef = useRef(null);
  // Called unconditionally (before the early return below) per the
  // Rules of Hooks — `active` gates whether the effect inside actually
  // does anything, so this is a no-op while show is false.
  useModalA11y(boxRef, onCancel, show);
  if (!show) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:99999,display:"flex",
      alignItems:"center",justifyContent:"center",padding:"20px",
      background:"rgba(11,31,58,.55)",backdropFilter:"blur(4px)"}}>
      <div ref={boxRef} role="dialog" aria-modal="true" aria-label="Wrong Account Type" style={{background:"#fff",borderRadius:"20px",padding:"32px 28px",
        maxWidth:"400px",width:"100%",
        boxShadow:"0 24px 60px rgba(11,31,58,.25)",
        animation:"roleModalIn .22s ease"}}>
        <style>{`@keyframes roleModalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{width:"52px",height:"52px",borderRadius:"14px",
          background:"#fff7ed",border:"1.5px solid #fed7aa",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"24px",marginBottom:"16px"}}>⚠️</div>
        <h3 style={{fontFamily:"'Manrope',sans-serif",fontSize:"22px",
          fontWeight:"700",color:"var(--wc-navy)",margin:"0 0 8px"}}>
          Wrong Account Type
        </h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",
          color:"var(--wc-muted)",margin:"0 0 24px",lineHeight:"1.6"}}>
          You are currently logged in as a{" "}
          <strong style={{color:"var(--wc-navy)",textTransform:"capitalize"}}>{role}</strong>.
          Please log in with a <strong style={{color:"var(--wc-green)"}}>patient account</strong>{" "}
          to book a consultation.
        </p>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={onCancel}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",
              border:"1.5px solid var(--wc-border)",background:"var(--wc-warm-white)",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"var(--wc-muted)",cursor:"pointer"}}>
            Cancel
          </button>
          <button onClick={onLogin}
            style={{flex:1,padding:"11px 0",borderRadius:"10px",border:"none",
              background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",
              fontFamily:"'Inter',sans-serif",fontWeight:"700",
              fontSize:"14px",color:"#fff",cursor:"pointer",
              boxShadow:"0 4px 14px rgba(4,120,87,.3)"}}>
            Login as Patient →
          </button>
        </div>
      </div>
    </div>
  );
}
