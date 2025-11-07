import { useState} from "react";
import type { FormEvent } from "react";
import * as api from "../../api.ts";
import type { Review, University } from "../../api.ts";
import RatingSlider from "./RatingSlider.tsx";
import UniversitySelectionModal from "./UniversitySelectionModal.tsx";

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

interface ReviewFormProps {
  onReviewCreated: (review: Review) => void;
}

export default function ReviewForm({ onReviewCreated }: ReviewFormProps) {
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
      const reviewData = {
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
            {/* MODIFICACIÓN: El onClick ahora está en el div wrapper */}
            <div
              className="university-selector"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <input
                type="text"
                id="university"
                name="university"
                className={`form-input ${errors.university ? "error" : ""}`}
                value={formData.university_name}
                placeholder="Seleccioná una universidad"
                readOnly
                style={{ cursor: "pointer" }} // Añadido para mejor UX
              />
              <button
                type="button"
                className="btn ghost"
                // El onClick se movió al div wrapper
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
                "Enviar Reseña"
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