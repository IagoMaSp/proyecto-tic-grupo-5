import { useState } from "react";
import type { University } from "../../api";

interface UniversityPhotoGalleryProps {
  university: University;
}

export default function UniversityPhotoGallery({ university }: UniversityPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!university.photos || university.photos.length === 0) {
    return null;
  }

  const getPhotoUrl = (photo: string) => {
    if (!photo) return "";
    if (photo.startsWith("http")) return photo;
    if (photo.startsWith("/media/")) return photo;
    if (photo.startsWith("media/")) return `/${photo}`;
    return `/media/${photo}`;
  };
  
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

  return (
    <>
      <div className="info-card">
        <h2 className="info-card-title">Galería de fotos</h2>
        <div className="photo-gallery-grid">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="gallery-photo"
              onClick={() => setSelectedPhoto(photo)}
              style={{ backgroundImage: `url(${photo})` }}
            >
              <div className="gallery-photo-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div className="photo-lightbox" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <img src={selectedPhoto} alt="Vista ampliada" />
          </div>
        </div>
      )}
    </>
  );
}