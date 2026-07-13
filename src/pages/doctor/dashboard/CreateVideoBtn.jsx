import { Link } from "react-router-dom";


export default function CreateVideoBtn({ appointmentId }) {
  // No "room creation" step needed anymore — with the native
  // WebRTC signaling backend, the appointment_id itself IS the room
  // key. Just navigate to our own internal video call page.
  return (
    <Link to={`/doctor/video/${appointmentId}`}
      style={{padding:"7px 14px",borderRadius:"7px",background:"#047857",color:"#fff",
        fontFamily:"'DM Sans',sans-serif",fontSize:"12px",fontWeight:"600",textDecoration:"none"}}>
      🎥 Join Room
    </Link>
  );
}
