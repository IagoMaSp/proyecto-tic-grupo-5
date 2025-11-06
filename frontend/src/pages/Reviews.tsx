import { useEffect, useState} from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/authContext.tsx";
import * as api from "../api.ts";
import type { Review, University } from "../api.ts";

type ReviewFormData = {
  university_id: number | null;
  university_name: string;
  start_date: string;
  end_date: string;
  description: string;
  social_rating: number;
  academic_rating: number;
  place_rating: number;
};

type FormErrors = {
  general?: string;
  university?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  ratings?: string;
};

// --- Componente Principal ---

export default function Reviews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fetchAllReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await api.getReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    document.title = "UM Exchange | Reviews";
    fetchAllReviews();
  }, []);

  const handleReviewCreated = (newReview: Review) => {
    setReviews([newReview, ...reviews]);
    fetchAllReviews(); // Recargar todo por si acaso
  };

  if (authLoading) {
    return (
      <div className="card loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <section>
      <div className="card mb-24">
        <h1 className="page-title">Experiencias de Alumnos</h1>
        <p className="subtitle">
          {isAuthenticated
            ? "Compartí tu experiencia o leé la de otros."
            : "Leé las experiencias de otros alumnos."}
        </p>

        {isAuthenticated ? (
          <ReviewForm onReviewCreated={handleReviewCreated} />
        ) : (
          <NotLoggedInView />
        )}
      </div>

      <div className="card">
        <h2 className="section-title mb-24">Reseñas Recientes</h2>
        {loadingReviews ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : reviews.length === 0 ? (
          <p>Todavía no hay reseñas. ¡Sé el primero!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// --- Vista para Usuario No Logueado ---

function NotLoggedInView() {
  return (
    <div className="not-logged-in-view">
      <p>Tenés que iniciar sesión para dejar tu reseña.</p>
      <Link to="/login" className="btn primary">
        Iniciar sesión
      </Link>
    </div>
  );
}

// --- Formulario de Review ---

interface ReviewFormProps {
  onReviewCreated: (review: Review) => void;
}

function ReviewForm({ onReviewCreated }: ReviewFormProps) {
  const initialState: ReviewFormData = {
    university_id: null,
    university_name: "",
    start_date: "",
    end_date: "",
    description: "",
    social_rating: 2.5,
    academic_rating: 2.5,
    place_rating: 2.5,
  };
  const [formData, setFormData] = useState<ReviewFormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRatingChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSelectUniversity = (university: University) => {
    setFormData((prev) => ({
      ...prev,
      university_id: university.id,
      university_name: university.name,
    }));
    setErrors((prev) => ({ ...prev, university: undefined }));
    setIsModalOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const today = new Date().toISOString().split("T")[0];

    if (!formData.university_id) {
      newErrors.university = "Tenés que seleccionar una universidad.";
    }
    if (!formData.start_date) {
      newErrors.start_date = "La fecha de inicio es obligatoria.";
    }
    if (formData.start_date && formData.start_date > today) {
      newErrors.start_date = "La fecha de inicio no puede ser en el futuro.";
    }
    if (!formData.end_date) {
      newErrors.end_date = "La fecha de fin es obligatoria.";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date <= formData.start_date
    ) {
      newErrors.end_date = "La fecha de fin debe ser posterior a la de inicio.";
    }
    if (formData.description.length < 20) {
      newErrors.description =
        "La descripción debe tener al menos 20 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const reviewData: Partial<Review> = {
        university: formData.university_id ?? undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        social_rating: formData.social_rating,
        academic_rating: formData.academic_rating,
        place_rating: formData.place_rating,
      };

      const newReview = await api.createReview(reviewData);
      onReviewCreated(newReview);
      setFormData(initialState);
    } catch (error) {
      console.error("Error creating review:", error);
      setErrors({
        general:
          (error as Error).message || "Error al enviar la review.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h3 className="section-title mb-16">Creá tu Reseña</h3>
        <div className="review-form-grid">
          <div className="form-group full-width">
            <label htmlFor="university" className="form-label">
              Universidad
            </label>
            <div className="university-selector">
              <input
                type="text"
                id="university"
                name="university"
                className={`form-input ${errors.university ? "error" : ""}`}
                value={formData.university_name}
                placeholder="Seleccioná una universidad"
                readOnly
              />
              <button
                type="button"
                className="btn ghost"
                onClick={() => setIsModalOpen(true)}
              >
                Elegir
              </button>
            </div>
            {errors.university && (
              <span className="error-message">{errors.university}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="start_date" className="form-label">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              className={`form-input ${errors.start_date ? "error" : ""}`}
              value={formData.start_date}
              onChange={handleChange}
            />
            {errors.start_date && (
              <span className="error-message">{errors.start_date}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="end_date" className="form-label">
              Fecha de Fin
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              className={`form-input ${errors.end_date ? "error" : ""}`}
              value={formData.end_date}
              onChange={handleChange}
            />
            {errors.end_date && (
              <span className="error-message">{errors.end_date}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="ratings" className="form-label">
              Ratings (0.0 a 5.0)
            </label>
            <div className="ratings-grid">
              <RatingSlider
                label="Social"
                id="social_rating"
                value={formData.social_rating}
                onChange={(e) =>
                  handleRatingChange("social_rating", e.target.value)
                }
              />
              <RatingSlider
                label="Académico"
                id="academic_rating"
                value={formData.academic_rating}
                onChange={(e) =>
                  handleRatingChange("academic_rating", e.target.value)
                }
              />
              <RatingSlider
                label="Geográfico (Lugar/Ciudad)"
                id="place_rating"
                value={formData.place_rating}
                onChange={(e) =>
                  handleRatingChange("place_rating", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description" className="form-label">
              Descripción (mín. 20 caracteres)
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-input ${errors.description ? "error" : ""}`}
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Contá tu experiencia, qué te gustó, qué no, etc."
              style={{ height: "auto", paddingTop: "12px" }}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          {errors.general && (
            <div className="alert-error full-width">{errors.general}</div>
          )}

          <div className="form-group full-width">
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Enviando...
                </>
              ) : (
                "Enviar Review"
              )}
            </button>
          </div>
        </div>
      </form>

      {isModalOpen && (
        <UniversitySelectionModal
          onSelect={handleSelectUniversity}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

// --- Componente Slider ---

interface RatingSliderProps {
  label: string;
  id: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function RatingSlider({ label, id, value, onChange }: RatingSliderProps) {
  return (
    <div className="rating-slider">
      <div className="rating-slider-header">
        <label htmlFor={id} className="rating-label">
          {label}
        </label>
        <span className="rating-value">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        id={id}
        name={id}
        min="0"
        max="5"
        step="0.5"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// --- Modal de Selección de Universidad ---

interface UniversitySelectionModalProps {
  onSelect: (university: University) => void;
  onClose: () => void;
}

function UniversitySelectionModal({
  onSelect,
  onClose,
}: UniversitySelectionModalProps) {
  const [view, setView] = useState<"search" | "wishlist">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [wishlistItems, setWishlistItems] = useState<api.Wishlist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === "wishlist") {
      fetchWishlist();
    }
  }, [view]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (view === "search" && searchQuery.length > 2) {
        fetchSearch();
      } else if (searchQuery.length === 0) {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery, view]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await api.getWishlist();
      setWishlistItems(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
    setLoading(false);
  };

  const fetchSearch = async () => {
    setLoading(true);
    try {
      const data = await api.getUniversities({ search: searchQuery });
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching universities:", error);
    }
    setLoading(false);
  };

  const renderUniversityItem = (university: University) => (
    <div
      key={university.id}
      className="uni-search-item"
      onClick={() => onSelect(university)}
    >
      <div>
        <span className="name">{university.name}</span>
        <span className="country">{university.country}</span>
      </div>
      <button className="btn primary btn-select-uni">Elegir</button>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Seleccioná una Universidad</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-tabs">
          <button
            className={`modal-tab ${view === "search" ? "active" : ""}`}
            onClick={() => setView("search")}
          >
            Buscar
          </button>
          <button
            className={`modal-tab ${view === "wishlist" ? "active" : ""}`}
            onClick={() => setView("wishlist")}
          >
            Mi Wishlist
          </button>
        </div>
        <div className="modal-body">
          {view === "search" && (
            <>
              <div className="search-input-wrapper mb-16">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="uni-search-list">
                {loading && <p>Buscando...</p>}
                {!loading &&
                  searchResults.map((uni) => renderUniversityItem(uni))}
                {!loading &&
                  searchResults.length === 0 &&
                  searchQuery.length > 2 && <p>No se encontraron resultados.</p>}
              </div>
            </>
          )}
          {view === "wishlist" && (
            <div className="uni-search-list">
              {loading && <p>Cargando wishlist...</p>}
              {!loading &&
                wishlistItems.length === 0 && (
                  <p>No tenés universidades en tu wishlist.</p>
                )}
              {!loading &&
                wishlistItems.map((item) =>
                  renderUniversityItem(item.university as any)
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Card de Review (para la lista) ---

function ReviewCard({ review }: { review: Review }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-UY", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div>
          <h4 className="review-uni-name">{review.university_name}</h4>
          <p className="review-user-date">
            Por <strong>{review.username}</strong> | {formatDate(review.start_date)} -{" "}
            {formatDate(review.end_date)}
          </p>
        </div>
        <div className="review-overall-rating">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{review.overall_rating.toFixed(1)}</span>
        </div>
      </div>
      <p className="review-description">{review.description}</p>
      <div className="review-ratings-grid">
        <div className="review-rating-item">
          <span className="review-rating-label">Social</span>
          <span className="review-rating-value">
            {review.social_rating.toFixed(1)} / 5.0
          </span>
        </div>
        <div className="review-rating-item">
          <span className="review-rating-label">Académico</span>
          <span className="review-rating-value">
            {review.academic_rating.toFixed(1)} / 5.0
          </span>
        </div>
        <div className="review-rating-item">
          <span className="review-rating-label">Lugar/Ciudad</span>
          <span className="review-rating-value">
            {review.place_rating.toFixed(1)} / 5.0
          </span>
        </div>
      </div>
    </div>
  );
}