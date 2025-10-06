import { useEffect, useRef, useState } from "react";

type Props = { images: string[]; autoPlayMs?: number; };

export default function Carousel({ images, autoPlayMs = 4500 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const go = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, index + dir));
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

  // Auto play
  useEffect(() => {
    const el = trackRef.current;
    if (!el || images.length <= 1) return;
    const t = setInterval(() => {
      const next = (index + 1) % images.length;
      const x = next * el.clientWidth;
      el.scrollTo({ left: x, behavior: "smooth" });
      setIndex(next);
    }, autoPlayMs);
    return () => clearInterval(t);
  }, [index, images.length, autoPlayMs]);

  return (
    <div className="carousel">
      <div className="track" ref={trackRef}>
        {images.map((src, i) => (
          <div className="slide" key={i}>
            <img src={src} alt={`slide ${i+1}`} />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button className="ctrl left" aria-label="Anterior" onClick={() => go(-1)}>‹</button>
          <button className="ctrl right" aria-label="Siguiente" onClick={() => go(1)}>›</button>
          <div className="dots">
            {images.map((_, i) => (
              <span key={i} className={`dot ${i===index ? 'active':''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
