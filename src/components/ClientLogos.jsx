/**
 * ClientLogos.jsx — "Our Previous Clients" logo strip, shown above the
 * footer on every public page (rendered once from Layout.jsx, not
 * per-page, so there's a single place to add/remove/reorder logos).
 *
 * Design notes:
 * - Source logos vary wildly in size/aspect ratio (from 95×95 up to
 *   3840×2160, square/wide/tall). Rather than pre-cropping each one,
 *   every logo sits in an identical fixed-size box (160×80) with
 *   object-fit:contain — so they all read as visually "the same size"
 *   on the page regardless of their original file dimensions.
 * - Continuous horizontal auto-scroll (CSS keyframe, GPU-friendly
 *   transform:translateX — no JS animation loop, no scroll listeners,
 *   so this costs nothing extra on pages that don't need it).
 * - The logo array is rendered twice back-to-back and the track
 *   scrolls exactly one set-width, so the loop is seamless.
 * - Pauses on hover/focus so people can actually read a name if they
 *   want to; respects prefers-reduced-motion by disabling the scroll
 *   and wrapping to a static grid instead.
 * - Logos render in their true, original colors — no grayscale/fade
 *   filter. Some source files (e.g. Gestamp) have a solid brand-color
 *   background rather than a transparent one; desaturating those made
 *   them look like a muddy gray block instead of their actual navy
 *   branding, so every logo now shows exactly as it looks in the
 *   asset file, just scaled to fit the uniform box.
 */

const CLIENTS = [
  { name: "Motherhood Hospital",   file: "motherhood-hospital.png" },
  { name: "BYD Electronics",       file: "byd-electronics.png" },
  { name: "Carborundum Universal", file: "carborundum-universal.png" },
  { name: "Freudenberg NOK",       file: "freudenberg-nok.png" },
  { name: "Gestamp",               file: "gestamp.jpg" },
  { name: "Hanil",                 file: "hanil.jpg" },
  { name: "Hanil E-HWA",           file: "hanil-automotive.jpg" },
  { name: "India Pistons",         file: "india.jpg" },
  { name: "Indian Oil (IOCL)",     file: "indian-oil-iocl.jpg" },
  { name: "JK Tyres",              file: "jk-tyres.png" },
  { name: "KCC Paints",            file: "kcc-paints.png" },
  { name: "KONE",                  file: "kone.png" },
  { name: "Mando Automotive",      file: "mando-automotive.jpg" },
  { name: "Medway Hospital",       file: "medway-hospital.png" },
  { name: "Motherson Sumi",        file: "motherson-sumi.jpg" },
  { name: "NSN",                   file: "nsn.png" },
  { name: "Renault Nissan",        file: "renault-nissan.png" },
  { name: "Royal Enfield",         file: "royal-enfield.png" },
  { name: "TI Cycles",             file: "ti-cycles.jpg" },
  { name: "TIDC",                  file: "tidc.png" },
  { name: "Titan Eye+",            file: "titan-eye-plus.png" },
  { name: "Wheels India",          file: "wheels-india.png" },
  { name: "ZTT India",             file: "ztt-india.jpg" },
];

const CSS = `
.cl-section{background:#f8fafc;border-top:1px solid #e2eaf4;padding:44px 0 48px;overflow:hidden;}
.cl-title{font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:700;
  letter-spacing:1.8px;color:#64748b;text-align:center;margin:0 0 28px;text-transform:uppercase;}
.cl-viewport{overflow:hidden;position:relative;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);}
.cl-track{display:flex;align-items:center;width:max-content;
  animation:cl-scroll 42s linear infinite;}
.cl-viewport:hover .cl-track,.cl-viewport:focus-within .cl-track{animation-play-state:paused;}
@keyframes cl-scroll{from{transform:translateX(0);}to{transform:translateX(-50%);}}
.cl-logo-box{flex:0 0 auto;width:150px;height:76px;margin:0 20px;
  display:flex;align-items:center;justify-content:center;
  background:#fff;border:1px solid #e2eaf4;border-radius:12px;padding:12px 16px;}
.cl-logo-box img{max-width:100%;max-height:100%;object-fit:contain;
  transition:transform .25s;}
.cl-logo-box:hover img{transform:scale(1.06);}
@media(max-width:600px){
  .cl-logo-box{width:118px;height:64px;margin:0 12px;padding:9px 12px;}
}
@media(prefers-reduced-motion:reduce){
  .cl-track{animation:none;flex-wrap:wrap;justify-content:center;width:auto;gap:0;}
  .cl-viewport{-webkit-mask-image:none;mask-image:none;}
}
`;

export default function ClientLogos() {
  // Rendered twice so the translateX(-50%) loop lines up seamlessly —
  // the visible "join" is just the second copy starting where the
  // first one's last logo ends.
  const doubled = [...CLIENTS, ...CLIENTS];

  return (
    <section className="cl-section" aria-label="Our previous clients">
      <style>{CSS}</style>
      <p className="cl-title">Our Previous Clients</p>
      <div className="cl-viewport">
        <div className="cl-track">
          {doubled.map((c, i) => (
            <div className="cl-logo-box" key={`${c.file}-${i}`}>
              <img src={`/assets/img/clients/${c.file}`} alt={c.name} loading="lazy" width="150" height="76"/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
