import { useState, useEffect } from "react";
import type { University } from "../../api";

interface UniversityHeaderProps {
  university: University;
}

export default function UniversityHeader({ university }: UniversityHeaderProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const fallbackStyle = {
    background: "linear-gradient(135deg, #E0F2FE, #BAE6FD)", // fondo celeste UM
  };

  // Manejo robusto de URLs
  const getPhotoUrl = (photo: string) => {
    if (!photo) return "";
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("/media/")) return photo;
    if (photo.startsWith("media/")) return `/${photo}`;
    return `/media/${photo}`;
  };

  // Asegurar compatibilidad con API (array de objetos o strings)
  const photos =
    Array.isArray(university.photos) && university.photos.length > 0
      ? university.photos
          .map((p) =>
            typeof p === "string"
              ? getPhotoUrl(p)
              : p && (p as any).photo
              ? getPhotoUrl((p as any).photo)
              : null
          )
          .filter(Boolean) as string[]
      : [];

  const hasPhotos = photos.length > 0;
  const hasMultiplePhotos = photos.length > 1;

  useEffect(() => {
    if (!hasMultiplePhotos) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [photos.length, hasMultiplePhotos]);

  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="university-header">
      <div className="photo-hero">
        <div className="photo-hero-track">
          {hasPhotos ? (
            photos.map((photo, index) => (
              <div
                key={index}
                className={`photo-hero-slide ${index === currentPhotoIndex ? "active" : ""}`}
                style={{ backgroundImage: `url(${photo})` }}
              />
            ))
          ) : (
            <div className="photo-hero-slide active" style={fallbackStyle} />
          )}
        </div>

        <div className="photo-overlay" />

        <div className="photo-content">
          <div className="container">
            <div className="uni-header-badge">
              <span className="uni-header-flag">📍</span>
              <span>{university.country}</span>
            </div>
            <h1 className="uni-header-title">{university.name}</h1>

            {university.faculties && university.faculties.length > 0 && (
              <div className="uni-header-faculties">
                <span className="faculties-label">Convenios con:</span>
                <div className="faculties-tags">
                  {university.faculties.map((faculty, i) => (
                    <span key={i} className="faculty-tag">
                      {faculty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {hasMultiplePhotos && (
          <>
            <button className="photo-nav photo-nav-prev" onClick={prevPhoto}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="photo-nav photo-nav-next" onClick={nextPhoto}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <div className="photo-counter">
              {currentPhotoIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
