/**
 * NotificationBell.jsx — reusable in-app notification dropdown.
 * Drop into any dashboard header: <NotificationBell />
 *
 * The dropdown is positioned via a measured, viewport-clamped fixed
 * position rather than being nested inside whatever container the bell
 * sits in. The first version anchored it with `position:absolute; right:0`
 * relative to the bell's own tiny wrapper — fine in a wide header, but
 * inside a narrow ~220px sidebar that put the panel's right edge at the
 * sidebar's edge and let a 320px-wide box overflow off-screen to the left,
 * which is what was rendering as a clipped, overlapping mess. Measuring
 * the button's real position on open and clamping to the viewport fixes
 * that regardless of where the bell is placed.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setupPush } from "../utils/push";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const PANEL_WIDTH = 336;

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", {day:"numeric",month:"short"});
}

const TYPE_ICON = {
  new_booking:          "📅",
  appointment_assigned: "👨‍⚕️",
  appointment_accepted: "✅",
  appointment_rejected: "⚠️",
};

export default function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [pos, setPos]     = useState({ top: 60, left: 12 });
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const token = localStorage.getItem("wc4a_token");

  const fetchCount = async () => {
    try {
      const res  = await fetch(`${API}/notifications/unread-count`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      setCount(json.count || 0);
    } catch {}
  };

  const fetchList = async () => {
    try {
      const res  = await fetch(`${API}/notifications`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const json = await res.json();
      setItems(json.notifications || []);
    } catch {}
  };

  useEffect(() => {
    fetchCount();
    setupPush();
    const t = setInterval(fetchCount, 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = () => {
    if (!open) {
      fetchList();
      const rect = btnRef.current.getBoundingClientRect();
      let left = rect.right - PANEL_WIDTH;
      left = Math.max(12, Math.min(left, window.innerWidth - PANEL_WIDTH - 12));
      setPos({ top: rect.bottom + 10, left });
    }
    setOpen(o => !o);
  };

  const clickItem = async (n) => {
    try {
      await fetch(`${API}/notifications/${n.id}/read`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}` },
      });
    } catch {}
    setOpen(false);
    fetchCount();
    if (n.link) navigate(n.link);
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/notifications/read-all`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}` },
      });
    } catch {}
    setItems(items.map(i => ({...i, is_read:true})));
    setCount(0);
  };

  return (
    <>
      <button ref={btnRef} onClick={toggle}
        style={{position:"relative",background:"rgba(255,255,255,.10)",
          border:"1px solid rgba(255,255,255,.20)",borderRadius:"10px",
          width:"40px",height:"40px",cursor:"pointer",fontSize:"17px",
          color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",
          transition:"background .15s"}}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.18)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.10)"}>
        🔔
        {count > 0 && (
          <span style={{position:"absolute",top:"-5px",right:"-5px",
            background:"#dc2626",color:"#fff",fontSize:"10px",fontWeight:"700",
            padding:"1px 5px",borderRadius:"50px",minWidth:"17px",
            textAlign:"center",border:"2px solid #0b1f3a",lineHeight:"13px"}}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div ref={panelRef} style={{position:"fixed",top:pos.top,left:pos.left,
          width:`${PANEL_WIDTH}px`,maxHeight:"min(460px, calc(100vh - 90px))",
          overflowY:"auto",background:"#fff",borderRadius:"14px",
          boxShadow:"0 16px 40px rgba(11,31,58,.22), 0 2px 8px rgba(11,31,58,.08)",
          border:"1px solid #eef2f7",zIndex:2000,
          fontFamily:"'DM Sans',sans-serif"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #f1f5f9",
            display:"flex",justifyContent:"space-between",alignItems:"center",
            position:"sticky",top:0,background:"#fff",borderRadius:"14px 14px 0 0"}}>
            <span style={{fontSize:"14px",fontWeight:"700",color:"#0b1f3a",
              display:"flex",alignItems:"center",gap:"6px"}}>
              🔔 Notifications
            </span>
            {count > 0 && (
              <button onClick={markAllRead}
                style={{background:"#f0fdf4",border:"1px solid #bbf7d0",
                  color:"#047857",fontSize:"11px",cursor:"pointer",
                  fontWeight:"700",padding:"4px 10px",borderRadius:"50px"}}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div style={{padding:"40px 20px",textAlign:"center"}}>
              <div style={{fontSize:"30px",marginBottom:"8px",opacity:.5}}>🔔</div>
              <p style={{color:"#94a3b8",fontSize:"13px",margin:0}}>
                You're all caught up
              </p>
            </div>
          ) : items.map(n => (
            <div key={n.id} onClick={()=>clickItem(n)}
              style={{padding:"13px 18px",borderBottom:"1px solid #f8fafc",
                cursor:"pointer",background: n.is_read ? "#fff" : "#f0fdf4",
                display:"flex",gap:"10px",alignItems:"flex-start",
                transition:"background .12s"}}
              onMouseEnter={e=>e.currentTarget.style.background = n.is_read ? "#f8fafc" : "#e7fbef"}
              onMouseLeave={e=>e.currentTarget.style.background = n.is_read ? "#fff" : "#f0fdf4"}>
              <span style={{fontSize:"17px",flexShrink:0,marginTop:"1px"}}>
                {TYPE_ICON[n.type] || "🔔"}
              </span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:"8px"}}>
                  <p style={{fontSize:"13px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
                    {n.title}
                  </p>
                  {!n.is_read && <span style={{width:"7px",height:"7px",borderRadius:"50%",
                    background:"#047857",flexShrink:0,marginTop:"5px"}}/>}
                </div>
                {n.body && <p style={{fontSize:"12px",color:"#64748b",margin:"3px 0 0",
                  lineHeight:"1.4"}}>{n.body}</p>}
                <p style={{fontSize:"10.5px",color:"#94a3b8",margin:"5px 0 0"}}>
                  {timeAgo(n.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
