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

  useEffect(() => {
    document.title = "UM Exchange | Mi Perfil";

    const fetchData = async () => {
      if (!isAuthenticated) {
        setLoadingData(false);
        return;
      }
      
      try {
        setLoadingData(true);
        const [reviewsData, wishlistData] = await Promise.all([
          api.getUserReviews(),
          api.getWishlistWithDetails(),
        ]);
        setUserReviews(reviewsData);
        setUserWishlist(wishlistData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    // Solo fetchear si la autenticación no está cargando
    if (!authLoading) {
      fetchData();
    }
  }, [isAuthenticated, authLoading]);

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
          <NotLoggedInView/>
        </div>
      </section>
    );
  }

  const renderTabContent = () => {
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
              Mi Wishlist ({userWishlist.length})
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