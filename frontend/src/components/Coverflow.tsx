import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Item = { src: string; title: string; subtitle?: string };
export default function Coverflow({ items, autoPlayMs = 3000 }: { items: Item[]; autoPlayMs?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const cardW = useRef(0);
  const gap = useRef(32);
  const centerOffset = useRef(0);
  const step = () => cardW.current + gap.current;

  // medir y configurar padding para centrar
  const measure = () => {
    const track = trackRef.current!;
    const firstCard = track.querySelector<HTMLElement>(".cf-card");
    if (!firstCard) return;

    cardW.current = firstCard.offsetWidth;
    // gap real del flex container
    const style = getComputedStyle(track);
    gap.current = parseInt(style.columnGap || style.gap || "32", 10);

    centerOffset.current = (track.clientWidth - cardW.current) / 2;
    // padding lateral para que la 1ª y última también puedan centrarse
    track.style.paddingLeft = `${centerOffset.current + 32}px`;
    track.style.paddingRight = `${centerOffset.current + 32}px`;
  };

  useLayoutEffect(() => {
    if (!trackRef.current) return;
    measure();
    // centrar la primera
    goTo(0, false);

    const onResize = () => { measure(); goTo(idx, false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // índice desde scroll (compensando offset)
  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const i = Math.round((el.scrollLeft - (centerOffset.current)) / step());
        setIdx(Math.max(0, Math.min(items.length - 1, i)));
        ticking = false;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  const goTo = (i: number, smooth = true) => {
    const el = trackRef.current; if (!el) return;
    const x = i * step() + centerOffset.current;
    el.scrollTo({ left: x, behavior: smooth ? "smooth" : "auto" });
    setIdx(i);
  };

  // autoplay
  useEffect(() => {
    const el = trackRef.current; if (!el || items.length < 2) return;
    const t = setInterval(() => goTo((idx + 1) % items.length), autoPlayMs);
    return () => clearInterval(t);
  }, [idx, items.length, autoPlayMs]);

  return (
    <div className="cf-wrap">
      <div className="cf-track" ref={trackRef}>
        {items.map((it, i) => (
          <article
            key={i}
            className={`cf-card ${i === idx ? "is-active" : ""}`}
            onClick={() => goTo(i)}
          >
            <img src={it.src} alt={it.title} />
            <div className="cf-overlay">
              <div className="cf-badge">{i + 1 < 10 ? `#0${i + 1}` : `#${i + 1}`}</div>
              <div className="cf-title">{it.title}</div>
              {it.subtitle && <div className="cf-sub">{it.subtitle}</div>}
            </div>
          </article>
        ))}
      </div>

      <div className="cf-dots">
        {items.map((_, i) => (
          <span key={i} className={`cf-dot ${i === idx ? "active" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}
