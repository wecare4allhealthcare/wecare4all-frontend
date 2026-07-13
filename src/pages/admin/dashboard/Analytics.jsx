import { useState, useEffect } from "react";
import { showToast } from "../../../components/Toast";
import { API, Spinner, BarChart } from "./shared";


export default function Analytics({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const res  = await fetch(`${API}/admin/analytics`,
          {headers:{Authorization:`Bearer ${token}`}});
        const json = await res.json();
        setData(json);
      }catch{setData(null);}
      finally{setLoading(false);}
    })();
  },[]);

  const exportCSV = async () => {
    try{
      const res  = await fetch(`${API}/admin/export/appointments`,
        {headers:{Authorization:`Bearer ${token}`}});
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `appointments_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }catch{showToast("Export failed. Try again.", "error");}
  };

  if(loading) return <Spinner/>;
  if(!data)   return (
    <div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8",
      fontFamily:"'DM Sans',sans-serif"}}>
      Analytics data unavailable. Check backend.
    </div>
  );

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun",
                       "Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData  = (data.monthly_revenue||[]).map((v,i)=>
    ({label:monthLabels[i],value:v}));
  const apptData     = (data.monthly_appointments||[]).map((v,i)=>
    ({label:monthLabels[i],value:v}));

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
        <h2 style={{fontSize:"22px",fontWeight:"700",color:"#0b1f3a",margin:0}}>
          Analytics
        </h2>
        <button onClick={exportCSV} className="btn-sm btn-navy"
          style={{padding:"9px 18px",fontSize:"13px"}}>
          ⬇️ Export CSV
        </button>
      </div>

      {/* KPI cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",
        gap:"12px",marginBottom:"24px"}}>
        {[
          {label:"Total Revenue",   value:`₹${(data.total_revenue||0).toLocaleString("en-IN")}`,
           icon:"💰",color:"#047857",bg:"#f0fdf4"},
          {label:"Avg per Patient", value:`₹${data.avg_revenue_per_patient||0}`,
           icon:"📊",color:"#0369a1",bg:"#eff8ff"},
          {label:"Completion Rate", value:`${data.completion_rate||0}%`,
           icon:"✅",color:"#7c3aed",bg:"#faf5ff"},
          {label:"Cancellation Rate",value:`${data.cancellation_rate||0}%`,
           icon:"❌",color:"#dc2626",bg:"#fef2f2"},
          {label:"This Month Appts",value:data.this_month_appointments||0,
           icon:"📅",color:"#d97706",bg:"#fffbeb"},
          {label:"This Month Rev",  value:`₹${(data.this_month_revenue||0).toLocaleString("en-IN")}`,
           icon:"📈",color:"#047857",bg:"#f0fdf4"},
        ].map(({label,value,icon,color,bg})=>(
          <div key={label} className="stat-card"
            style={{background:bg,border:`1px solid ${color}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"11px",
                  color:"#64748b",margin:"0 0 5px"}}>{label}</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",
                  fontWeight:"700",color,margin:0,lineHeight:1}}>{value}</p>
              </div>
              <span style={{fontSize:"18px"}}>{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
        gap:"16px",marginBottom:"24px"}}>
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <BarChart
            data={revenueData}
            color="#047857"
            title="Monthly Revenue (₹)"/>
        </div>
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <BarChart
            data={apptData}
            color="#0369a1"
            title="Monthly Appointments"/>
        </div>
      </div>

      {/* Top doctors */}
      {data.top_doctors?.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",
            marginBottom:"14px"}}>
            Top Performing Doctors
          </h3>
          {data.top_doctors.map((d,i)=>(
            <div key={d.id} className="data-row"
              style={{display:"flex",justifyContent:"space-between",
                alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <span style={{background:"#f0fdf4",color:"#047857",
                  fontFamily:"'DM Sans',sans-serif",fontWeight:"700",
                  fontSize:"13px",width:"26px",height:"26px",borderRadius:"50%",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  flexShrink:0}}>
                  {i+1}
                </span>
                <div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"14px",
                    fontWeight:"600",color:"#0b1f3a",margin:0}}>{d.full_name}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                    color:"#94a3b8",margin:0}}>{d.specialization}</p>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                  fontWeight:"700",color:"#047857",margin:0}}>
                  {d.appointment_count} appointments
                </p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"12px",
                  color:"#94a3b8",margin:0}}>
                  ₹{(d.revenue||0).toLocaleString("en-IN")} revenue
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Specialty breakdown */}
      {data.specialty_breakdown?.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e2eaf4",
          borderRadius:"14px",padding:"20px"}}>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#0b1f3a",marginBottom:"14px"}}>
            Appointments by Specialty
          </h3>
          {data.specialty_breakdown.map(s=>{
            const pct=Math.round((s.count/(data.this_month_appointments||1))*100);
            return(
              <div key={s.specialization} style={{marginBottom:"12px"}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  marginBottom:"4px"}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    color:"#374151"}}>{s.specialization||"General"}</span>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"13px",
                    fontWeight:"600",color:"#0b1f3a"}}>{s.count}</span>
                </div>
                <div style={{height:"6px",background:"#f1f5f9",borderRadius:"3px",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:"3px",
                    background:"linear-gradient(90deg,#047857,#059669)",
                    width:`${Math.min(pct,100)}%`,transition:"width .5s"}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
