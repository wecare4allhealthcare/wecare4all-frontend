import { useEffect, useRef, useState } from "react";

export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: options.threshold || 0.12, rootMargin: options.rootMargin || "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
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
