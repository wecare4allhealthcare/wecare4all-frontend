/**
 * Payment.jsx — Razorpay payment page
 * Called after booking appointment with consultation fee
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const G = `
.pay{font-family:'Inter',sans-serif;background:#f0f6fc;min-height:100vh;color:#1e293b;}
.pay *{box-sizing:border-box;} .pay a{text-decoration:none;}
.pay h1,.pay h2,.pay h3{font-family:'Manrope',sans-serif;}
@keyframes spin{to{transform:rotate(360deg)}}
.btn-pay{width:100%;background:linear-gradient(135deg,var(--wc-green),var(--wc-green-dark));color:#fff;
  font-family:'Inter',sans-serif;font-weight:700;font-size:15px;
  padding:14px;border-radius:10px;border:none;cursor:pointer;
  box-shadow:0 4px 18px rgba(91,158,50,.38);transition:all .25s;}
.btn-pay:hover{transform:translateY(-1px);box-shadow:0 7px 24px rgba(91,158,50,.48);}
.btn-pay:disabled{opacity:.6;cursor:not-allowed;transform:none;}
`;

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const { t }                 = useTranslation();
  const { appointmentId }     = useParams();
  const { user }              = useAuth();
  const navigate              = useNavigate();
  const [searchParams]        = useSearchParams();
  const [appt,    setAppt]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paid,    setPaid]    = useState(false);
  const [error,   setError]   = useState("");
  const [confirming, setConfirming] = useState(false);
  const [stripeCancelled, setStripeCancelled] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [upiReference, setUpiReference] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/payment-settings`);
        const json = await res.json();
        setPaymentSettings(json);
      } catch { setPaymentSettings({ manual_upi_enabled: false }); }
    })();
  }, []);

  const submitUpiProof = async () => {
    if (!upiReference.trim()) { setError("Please enter the UPI transaction reference (UTR) number."); return; }
    setSubmittingProof(true); setError("");
    try {
      const token = localStorage.getItem("wc4a_token");
      const res = await fetch(`${API}/appointments/${appointmentId}/submit-payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_reference: upiReference.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Couldn't submit payment reference.");
      setProofSubmitted(true);
    } catch (ex) { setError(ex.message); }
    finally { setSubmittingProof(false); }
  };

  useEffect(() => {
    document.title = "Complete Payment — We Care 4 'all'";
    fetchAppointment();
  }, [appointmentId]);

  useEffect(() => {
    // Returning from Stripe's hosted checkout — the real confirmation
    // comes from the webhook (see stripe_payments.py), which can lag a
    // second or two behind the redirect, so poll briefly rather than
    // trusting the URL param itself (which the user's browser controls
    // and isn't proof anything was actually paid).
    if (searchParams.get("stripe") === "success" && !paid) {
      setConfirming(true);
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        await fetchAppointment();
        if (attempts >= 8) clearInterval(poll); // ~16s, then give up gracefully
      }, 2000);
      return () => clearInterval(poll);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("stripe") === "cancelled") setStripeCancelled(true);
  }, [searchParams]);

  useEffect(() => { if (paid) setConfirming(false); }, [paid]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/appointments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json  = await res.json();
      const found = (json.appointments||[]).find(a => String(a.id) === String(appointmentId));
      if (!found) throw new Error(t("paymentPage.notFound"));
      if (found.payment_status === "paid") { setPaid(true); }
      setAppt(found);
    } catch (ex) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true); setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error(t("paymentPage.gatewayLoadFailed"));

      const token  = localStorage.getItem("wc4a_token");
      // Create order
      const res    = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          appointment_id: appointmentId,
        }),
      });
      const order  = await res.json();
      if (!res.ok) throw new Error(order.detail || t("paymentPage.orderCreationFailed"));

      // Open Razorpay checkout
      const rzOptions = {
        key:         order.key_id,
        amount:      order.amount,
        currency:    order.currency,
        name:        "We Care 4 'all'",
        description: `Consultation — ${appt.doctors?.full_name || "Doctor"}`,
        order_id:    order.order_id,
        prefill: {
          name:    order.patient_name,
          email:   order.patient_email,
          contact: order.patient_mobile,
        },
        theme:    { color: "var(--wc-green)" },
        handler: async (response) => {
          // Verify payment
          try {
            const vRes = await fetch(`${API}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                appointment_id:      appointmentId,
              }),
            });
            const vJson = await vRes.json();
            if (!vRes.ok) throw new Error(vJson.detail || t("paymentPage.verificationFailed"));
            setPaid(true);
          } catch (ex) {
            setError(`${t("paymentPage.verificationErrorPrefix")}${ex.message}${t("paymentPage.verificationErrorSuffix")}`);
          } finally {
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rz = new window.Razorpay(rzOptions);
      rz.open();
    } catch (ex) {
      setError(ex.message);
      setPaying(false);
    }
  };

  const handleStripePay = async () => {
    setStripeLoading(true); setError("");
    try {
      const token = localStorage.getItem("wc4a_token");
      const res   = await fetch(`${API}/payments/stripe/create-session`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });
      const json  = await res.json();
      if (!res.ok) throw new Error(json.detail || t("paymentPage.stripeStartFailed"));
      window.location.href = json.checkout_url; // hand off to Stripe's hosted checkout
    } catch (ex) {
      setError(ex.message);
      setStripeLoading(false);
    }
  };

  if (loading) return (
    <div className="pay" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"36px",height:"36px",border:"3px solid var(--wc-border)",borderTop:"3px solid var(--wc-green)",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px"}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{fontFamily:"'Inter',sans-serif",color:"#6b7688"}}>{t("paymentPage.loading")}</p>
      </div>
    </div>
  );

  if (error && !appt) return (
    <div className="pay" style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <style>{G}</style>
      <div style={{textAlign:"center",maxWidth:"400px"}}>
        <div style={{fontSize:"44px",marginBottom:"14px"}}>⚠️</div>
        <h3 style={{fontSize:"20px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"8px"}}>{t("paymentPage.errorTitle")}</h3>
        <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",marginBottom:"20px"}}>{error}</p>
        <Link to="/patient/dashboard" style={{padding:"11px 24px",borderRadius:"9px",background:"var(--wc-navy)",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px"}}>{t("paymentPage.backToDashboard")}</Link>
      </div>
    </div>
  );

  const doc = appt?.doctors;

  return (
    <div className="pay">
      <style>{G}</style>
      <div style={{maxWidth:"480px",margin:"0 auto",padding:"48px 24px"}}>
        <Link to="/patient/dashboard" style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"#6b7688",display:"inline-flex",alignItems:"center",gap:"5px",marginBottom:"24px"}}>
          {t("paymentPage.backToDashboardLong")}
        </Link>

        <div style={{background:"#fff",border:"1px solid var(--wc-border)",borderRadius:"18px",overflow:"hidden",boxShadow:"0 4px 20px rgba(18,59,74,.08)"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",padding:"22px 26px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"#fff",margin:"0 0 3px"}}>
              {paid ? t("paymentPage.paymentComplete") : t("paymentPage.completePayment")}
            </h2>
            <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"rgba(255,255,255,.78)",margin:0}}>
              {paid ? t("paymentPage.bookingConfirmed") : t("paymentPage.securePayment")}
            </p>
          </div>

          <div style={{padding:"24px 26px"}}>
            {confirming ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:"36px",height:"36px",border:"3px solid var(--wc-border)",borderTop:"3px solid var(--wc-green)",
                  borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
                <h3 style={{fontSize:"18px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"8px"}}>
                  {t("paymentPage.confirming")}
                </h3>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13.5px",color:"var(--wc-muted)"}}>
                  {t("paymentPage.confirmingNote")}
                </p>
              </div>
            ) : paid ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:"64px",height:"64px",background:"#dcfce7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"28px"}}>✅</div>
                <h3 style={{fontSize:"20px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"8px"}}>{t("paymentPage.successTitle")}</h3>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",marginBottom:"22px"}}>{t("paymentPage.successDesc")}</p>
                <Link to="/patient/dashboard" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px",padding:"12px 24px",borderRadius:"9px"}}>
                  {t("paymentPage.goToDashboard")}
                </Link>
              </div>
            ) : (proofSubmitted || appt?.payment_status === "pending_verification") ? (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{width:"64px",height:"64px",background:"#fef9c3",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"28px"}}>⏳</div>
                <h3 style={{fontSize:"20px",fontWeight:"700",color:"var(--wc-navy)",marginBottom:"8px"}}>Payment Submitted</h3>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"14px",color:"var(--wc-muted)",marginBottom:"22px"}}>
                  We've received your UPI reference and will verify it shortly. Your appointment will be confirmed once verified — usually within a few hours.
                </p>
                <Link to="/patient/dashboard" style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"linear-gradient(135deg,var(--wc-green),var(--wc-green-dark))",color:"#fff",fontFamily:"'Inter',sans-serif",fontWeight:"600",fontSize:"14px",padding:"12px 24px",borderRadius:"9px"}}>
                  {t("paymentPage.goToDashboard")}
                </Link>
              </div>
            ) : (
              <>
                {/* Appointment summary */}
                <div style={{background:"var(--wc-warm-white)",border:"1px solid var(--wc-border)",borderRadius:"11px",padding:"16px",marginBottom:"20px"}}>
                  <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",fontWeight:"700",color:"var(--wc-green)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:"11px"}}>{t("paymentPage.appointmentSummary")}</p>
                  {[
                    [t("paymentPage.doctor"),    doc?.full_name || t("paymentPage.doctorFallback")],
                    [t("paymentPage.specialty"), doc?.specialization || ""],
                    [t("paymentPage.date"),      appt?.appointment_date || ""],
                    [t("paymentPage.time"),      appt?.appointment_time ? `${appt.appointment_time.slice(0,5)} IST` : ""],
                    [t("paymentPage.type"),      appt?.appointment_type || ""],
                  ].filter(([,v])=>v).map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",marginBottom:"7px"}}>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",color:"var(--wc-muted)"}}>{l}</span>
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:"600",color:"var(--wc-navy)",textTransform:"capitalize"}}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* Amount — USD equivalent shown alongside ₹ (using the same
                    usd_inr_rate Stripe actually charges at, from
                    /payment-settings) so an international patient knows
                    roughly what they'll pay before picking Stripe below,
                    instead of only seeing an unfamiliar ₹ figure. */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"var(--wc-sage)",border:"1px solid #86efac",borderRadius:"11px",marginBottom:"20px"}}>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"15px",fontWeight:"600",color:"var(--wc-navy)"}}>{t("paymentPage.consultationFee")}</span>
                  <span style={{textAlign:"right"}}>
                    <span style={{fontFamily:"'Manrope',sans-serif",fontSize:"26px",fontWeight:"700",color:"var(--wc-green)",display:"block"}}>
                      ₹{appt?.payment_amount || 0}
                    </span>
                    {paymentSettings?.usd_inr_rate > 0 && (
                      <span style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"#6b7688"}}>
                        ≈ ${(Number(appt?.payment_amount || 0) / paymentSettings.usd_inr_rate).toFixed(2)} USD
                      </span>
                    )}
                  </span>
                </div>

                {stripeCancelled && (
                  <div style={{background:"var(--wc-warm-white)",border:"1px solid var(--wc-border)",borderRadius:"9px",
                    padding:"10px 14px",marginBottom:"14px"}}>
                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",margin:0}}>
                      {t("paymentPage.stripeCancelledNote")}
                    </p>
                  </div>
                )}

                {error && <p style={{fontFamily:"'Inter',sans-serif",color:"#dc2626",fontSize:"13px",marginBottom:"14px"}}>⚠ {error}</p>}

                {paymentSettings?.manual_upi_enabled ? (
                  <div>
                    <div style={{background:"#eff8ff",border:"1px solid #bae6fd",borderRadius:"11px",padding:"14px",marginBottom:"16px",textAlign:"center"}}>
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-teal)",fontWeight:700,margin:0}}>
                        Pay via UPI — scan the QR code below with any UPI app
                      </p>
                    </div>
                    <div style={{textAlign:"center",marginBottom:"16px"}}>
                      {qrFailed ? (
                        <div style={{width:"220px",maxWidth:"100%",aspectRatio:"1",margin:"0 auto",
                          borderRadius:"12px",border:"1.5px dashed #fbbf24",background:"#fffbeb",
                          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                          padding:"16px",gap:"6px"}}>
                          <span style={{fontSize:"26px"}}>⚠️</span>
                          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"#92400e",
                            textAlign:"center",margin:0,fontWeight:600}}>
                            QR code image didn't load
                          </p>
                          <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#92400e",
                            textAlign:"center",margin:0}}>
                            Pay directly to the UPI ID below instead.
                          </p>
                        </div>
                      ) : (
                        <img src={paymentSettings.qr_url} alt="UPI QR Code"
                          onError={()=>setQrFailed(true)}
                          style={{width:"220px",maxWidth:"100%",borderRadius:"12px",border:"1px solid var(--wc-border)"}}/>
                      )}
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"13px",fontWeight:700,color:"var(--wc-navy)",margin:"10px 0 2px"}}>
                        {paymentSettings.payee_name}
                      </p>
                      <p style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",color:"var(--wc-muted)",margin:0}}>
                        UPI ID: {paymentSettings.upi_id}
                      </p>
                    </div>
                    <label style={{fontFamily:"'Inter',sans-serif",fontSize:"12.5px",fontWeight:700,color:"#374151",display:"block",marginBottom:"6px"}}>
                      After paying, enter your UPI transaction reference (UTR) number *
                    </label>
                    <input value={upiReference} onChange={(e)=>setUpiReference(e.target.value)}
                      placeholder="e.g. 123456789012"
                      style={{width:"100%",border:"1.5px solid var(--wc-border)",borderRadius:"9px",padding:"11px 13px",
                        fontFamily:"'Inter',sans-serif",fontSize:"14px",outline:"none",marginBottom:"14px"}}/>
                    <button onClick={submitUpiProof} disabled={submittingProof} className="btn-pay">
                      {submittingProof ? "Submitting…" : "I've Paid — Submit Reference"}
                    </button>
                    <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#6b7688",textAlign:"center",marginTop:"10px"}}>
                      Your UTR number is shown in your UPI app's payment confirmation screen or SMS.
                      We'll verify and confirm your appointment shortly.
                    </p>
                  </div>
                ) : (
                <>
                <button onClick={handlePay} disabled={paying} className="btn-pay">
                  {paying ? (
                    <span style={{display:"inline-flex",alignItems:"center",gap:"8px",justifyContent:"center"}}>
                      <span style={{width:"15px",height:"15px",border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .75s linear infinite",display:"inline-block"}}/>
                      {t("paymentPage.openingPayment")}
                    </span>
                  ) : t("paymentPage.payViaRazorpay",{amount:appt?.payment_amount || 0})}
                </button>

                <div style={{display:"flex",alignItems:"center",gap:"10px",margin:"16px 0"}}>
                  <div style={{flex:1,height:"1px",background:"var(--wc-border)"}}/>
                  <span style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#6b7688"}}>{t("paymentPage.or")}</span>
                  <div style={{flex:1,height:"1px",background:"var(--wc-border)"}}/>
                </div>

                <button onClick={handleStripePay} disabled={stripeLoading}
                  className="btn-pay" style={{background:"linear-gradient(135deg,#1e293b,#334155)",
                    boxShadow:"0 4px 18px rgba(30,41,59,.3)"}}>
                  {stripeLoading ? (
                    <span style={{display:"inline-flex",alignItems:"center",gap:"8px",justifyContent:"center"}}>
                      <span style={{width:"15px",height:"15px",border:"2px solid rgba(255,255,255,.4)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin .75s linear infinite",display:"inline-block"}}/>
                      {t("paymentPage.redirecting")}
                    </span>
                  ) : t("paymentPage.payViaStripe")}
                </button>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#6b7688",
                  textAlign:"center",marginTop:"6px"}}>
                  {t("paymentPage.stripeNote")}
                </p>

                <div style={{display:"flex",justifyContent:"center",gap:"16px",marginTop:"14px",flexWrap:"wrap"}}>
                  {t("paymentPage.paymentMethods",{returnObjects:true}).map(m=>(
                    <span key={m} style={{fontFamily:"'Inter',sans-serif",fontSize:"12px",color:"#6b7688"}}>{m}</span>
                  ))}
                </div>
                <p style={{fontFamily:"'Inter',sans-serif",fontSize:"11px",color:"#6b7688",textAlign:"center",marginTop:"10px"}}>
                  {t("paymentPage.securedNote")}
                </p>
                </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
