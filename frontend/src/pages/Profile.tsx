import { useEffect, useState } from "react";
import { useAuth } from "../contexts/authContext";
import * as api from "../api";
import type { Review, WishlistWithDetails } from "../api";

import ProfileDetails from "../components/profile/ProfileDetails.tsx";
import UserReviewsList from "../components/profile/UserReviewsList.tsx";
import UserWishlist from "../components/profile/UserWishlist.tsx";
import NotLoggedInView from "../components/reviews/NotLoggedInView";

type Tab = "details" | "reviews" | "wishlist";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userWishlist, setUserWishlist] = useState<WishlistWithDetails[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const refreshWishlist = async () => {
  try {
    console.log('[Profile] 🔄 Llamando a getWishlistWithDetails...');
    const wishlistData = await api.getWishlistWithDetails();
    console.log('[Profile] ✅ Wishlist recibida:', wishlistData);
    console.log('[Profile] ¿Es array?', Array.isArray(wishlistData));
    setUserWishlist(wishlistData || []);
  } catch (error) {
    console.error("[Profile] ❌ Error al refrescar wishlist:", error);
    setUserWishlist([]);
  }
};

  useEffect(() => {
  document.title = "UM Exchange | Mi Perfil";

  const fetchData = async () => {
    if (!isAuthenticated) {
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      console.log("[Profile] Iniciando fetch de datos...");

      try {
        const reviewsData = await api.getUserReviews();
        console.log("[Profile] Reseñas recibidas:", reviewsData);
        setUserReviews(reviewsData || []);
      } catch (error) {
        console.error("[Profile] Error al fetchear REVIEWS:", error);
        setUserReviews([]);
      }

      try {
        console.log('[Profile] 🔄 Iniciando refreshWishlist...');
        await refreshWishlist();
        console.log('[Profile] ✅ refreshWishlist completado');
      } catch (error) {
        console.error("[Profile] ❌ Error al fetchear WISHLIST:", error);
        setUserWishlist([]);
      }

    } catch (error) {
      console.error("[Profile] Error en el wrapper de fetchData:", error);
    } finally {
      setLoadingData(false);
      console.log("[Profile] Fetch finalizado, loading=false.");
    }
  };

  if (!authLoading) {
    fetchData();
  }
}, [isAuthenticated, authLoading, activeTab]);

  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner" />
    </div>
  );

  if (authLoading) {
    return <div className="card">{renderLoading()}</div>;
  }

  if (!isAuthenticated) {
    return (
      <section>
        <div className="card">
          <h1 className="page-title">Mi Perfil</h1>
          <NotLoggedInView />
        </div>
      </section>
    );
  }

  const renderTabContent = () => {
    console.log(`[Profile] Renderizando tab: ${activeTab}, Loading: ${loadingData}, Cantidad Reseñas: ${userReviews.length}`);

    if (loadingData) {
      return renderLoading();
    }

    switch (activeTab) {
      case "details":
        return <ProfileDetails />;
      case "reviews":
        return <UserReviewsList reviews={userReviews} />;
      case "wishlist":
        return <UserWishlist wishlistItems={userWishlist} />;
      default:
        return null;
    }
  };

  return (
    <section>
      <div className="card">
        <h1 className="page-title mb-24">Mi Perfil</h1>

        <div className="profile-layout">
          {/* Tabs de Navegación */}
          <nav className="profile-nav">
            <button
              className={`nav-item ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Datos Personales
            </button>
            <button
              className={`nav-item ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Mis Reseñas ({userReviews.length})
            </button>
            <button
              className={`nav-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              Lista de Deseos ({userWishlist.length})
            </button>
          </nav>

          {/* Contenido del Tab */}
          <div className="profile-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </section>
  );
}