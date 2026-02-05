import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type CarouselItem = { 
  id: number;
  src: string; 
  title: string; 
  subtitle?: string;
};

type Props = { 
  items: CarouselItem[]; 
  autoPlayMs?: number; 
};

export default function Carousel({ items, autoPlayMs = 4500 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const go = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(items.length - 1, index + dir));
    const x = next * el.clientWidth;
    el.scrollTo({ left: x, behavior: "smooth" });
    setIndex(next);
  };

  // Sync index when user scrolls manually
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth);
      setIndex(i);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto play con pausa
  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length <= 1 || isPaused) return;
    
    const t = setInterval(() => {
      const next = (index + 1) % items.length;
      const x = next * el.clientWidth;
      el.scrollTo({ left: x, behavior: "smooth" });
      setIndex(next);
    }, autoPlayMs);
    
    return () => clearInterval(t);
  }, [index, items.length, autoPlayMs, isPaused]);

  return (
    <div 
      className="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="track" ref={trackRef}>
        {items.map((item, i) => (
          <div className="slide" key={item.id}>
            <Link to={`/universities/${item.id}`} className="slide-link">
              <img src={item.src} alt={item.title} />
              <div className="slide-overlay">
                <div className="slide-badge">#{i + 1}</div>
                <div className="slide-content">
                  <h3 className="slide-title">{item.title}</h3>
                  {item.subtitle && <p className="slide-subtitle">{item.subtitle}</p>}
                  <div className="slide-cta">
                    Ver universidad
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button 
            className="ctrl left" 
            aria-label="Anterior" 
            onClick={() => go(-1)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className="ctrl right" 
            aria-label="Siguiente" 
            onClick={() => go(1)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          
          <div className="dots">
            {items.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? 'active' : ''}`}
                onClick={() => {
                  const el = trackRef.current;
                  if (el) {
                    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                    setIndex(i);
                  }
                }}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}