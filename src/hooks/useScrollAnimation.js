import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Safety net: this drives opacity:0 → opacity:1 reveal-on-scroll
    // animations across ~13 homepage sections (Specialties, Care+,
    // Medical Tourism, Founder Trust, etc). If IntersectionObserver
    // never fires — browser quirk, element already in view before the
    // observer attaches and the implementation doesn't backfill that,
    // a fast reload landing mid-scroll, or any other edge case — the
    // section stayed at opacity:0 forever, permanently invisible, with
    // everything underneath (data, DOM, styles) completely correct.
    // That's exactly what was happening to the homepage Specialties
    // section: real content, real styling, just invisible. A decorative
    // scroll animation should never be able to hide real content
    // indefinitely, so force it visible after a short delay regardless
    // of whether the observer fired.
    const fallback = setTimeout(() => setVisible(true), 1200);

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); clearTimeout(fallback); } },
      { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);
  return [ref, visible];
}

export function useCountUp(target, duration = 1800, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    const num = parseInt(String(target).replace(/\D/g, "")) || 0;
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [triggered, target, duration]);
  return count;
}
