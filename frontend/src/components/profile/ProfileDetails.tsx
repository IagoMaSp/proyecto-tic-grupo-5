import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../../contexts/authContext";
import * as api from "../../api";

export default function ProfileDetails() {
  const { user, fetchProfile } = useAuth(); 
  
  const [username, setUsername] = useState(user?.username || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.profile?.profile_photo_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    if (username !== user.username) {
      formData.append("username", username);
    }
    if (selectedFile) {
      formData.append("profile.profile_photo", selectedFile);
    }

    try {
      await api.updateProfile(formData);
      await fetchProfile(); 
      setSuccess("Perfil actualizado con éxito.");
    } catch (err) {
      setError((err as Error).message || "Error al actualizar.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-details-form">
      <h2 className="section-title mb-24">Editar Datos</h2>
      <form onSubmit={handleSubmit}>
        
        {error && <div className="alert-error mb-16">{error}</div>}
        {success && <div className="alert-success mb-16">{success}</div>}
        
        <div className="form-group mb-16">
          <label className="form-label">Foto de Perfil</label>
          <div className="avatar-uploader">
            <img
              src={preview || `https://ui-avatars.com/api/?name=${username}&background=0D80C8&color=fff`}
              alt="Vista previa"
              className="avatar-preview"
            />
            <input
              type="file"
              id="profile_photo"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="form-input-file"
            />
            <label htmlFor="profile_photo" className="btn ghost">
              {selectedFile ? "Cambiar foto" : "Elegir foto"}
            </label>
            {preview && (
              <button
                type="button"
                className="btn text"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                Quitar
              </button>
            )}
          </div>
        </div>

        <div className="form-group mb-16">
          <label htmlFor="username" className="form-label">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group mb-16">
          <label htmlFor="email" className="form-label">
            Email (no se puede cambiar)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={user.email}
            disabled
          />
        </div>

        <button type="submit" className="btn primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" /> Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </form>
    </div>
  );
}