import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../components/LoginModal/LoginModal";
import SignUp from "../components/SignUpModal/SignUpModal";
import UserRecipes from "../components/UserRecipes/UserRecipes";
import styles from "./Home.module.css";
import Navbar from "../components/Navbar/Navbar";
import OtherUsersRecipes from "../components/UserRecipes/OtherUsersRecipes";

const Home: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Gère l'affichage des formulaires en fonction de l'état de l'utilisateur
  useEffect(() => {
    if (!user) {
      setShowLoginModal(false);
      setShowSignUpModal(false);
    }
  }, [user]);

  const toggleModal = () => {
    setShowLoginModal(!showLoginModal);
    setShowSignUpModal(!showSignUpModal);
  };

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan);
    // Afficher le formulaire d'inscription après sélection du plan
    setShowSignUpModal(true);
    setShowLoginModal(false);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
    setShowSignUpModal(false);
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      {user ? (
        <>
        <Navbar/>
        <UserRecipes />
        <OtherUsersRecipes/>
        </>

      ) : (
        <>
          {!showLoginModal && !showSignUpModal && (
            <div className={styles.landingPage}>
              <div className={styles.hero}>
                <h1 className={styles.heroTitle}>Bienvenue sur Wawe</h1>
                <p className={styles.heroSubtitle}>
                  Organisez vos recettes favorites et découvrez de nouveaux plats
                </p>
              </div>

              <div className={styles.pricingSection}>
                <h2 className={styles.pricingTitle}>Choisissez votre abonnement</h2>
                <div className={styles.pricingCards}>
                  
                  <div className={styles.pricingCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.planName}>Gratuit</h3>
                      <div className={styles.price}>
                        <span className={styles.priceAmount}>0€</span>
                        <span className={styles.pricePeriod}>/mois</span>
                      </div>
                    </div>
                    <ul className={styles.features}>
                      <li>Accès aux recettes Wawe</li>
                      <li>Accès aux ingrédients Wawe</li>
                      <li>5 recettes personnelles</li>
                      <li>Accès aux fonctionnalités de base</li>
                    </ul>
                    <button 
                      className={`${styles.selectButton} ${styles.freeButton}`}
                      onClick={() => handlePlanSelection('free')}
                    >
                      Commencer gratuitement
                    </button>
                  </div>

                  <div className={`${styles.pricingCard} ${styles.popular}`}>
                    <div className={styles.popularBadge}>Populaire</div>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.planName}>Mensuel</h3>
                      <div className={styles.price}>
                        <span className={styles.priceAmount}>2€</span>
                        <span className={styles.pricePeriod}>/mois</span>
                      </div>
                    </div>
                    <ul className={styles.features}>
                      <li>Accès aux recettes Wawe</li>
                      <li>Accès aux ingrédients Wawe</li>
                      <li>15 Recettes personnelles</li>
                      <li>30 ingrédients personnelles</li>
                      <li>Calendrier de plannification des repas</li>
                    </ul>
                    <button 
                      className={`${styles.selectButton} ${styles.monthlyButton}`}
                      // onClick={() => handlePlanSelection('monthly')}
                    >
                      Choisir Mensuel
                    </button>
                  </div>

                  <div className={styles.pricingCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.planName}>Annuel</h3>
                      <div className={styles.price}>
                        <span className={styles.priceAmount}>12€</span>
                        <span className={styles.pricePeriod}>/an</span>
                      </div>
                      <div className={styles.savings}>Économisez 50%</div>
                    </div>
                    <ul className={styles.features}>
                      <li>Recettes illimitées</li>
                      <li>Ajout lien vers une video de votre recette</li>
                      <li>Ingrédients illimitées</li>
                      <li>Partage de recettes entre utilisateurs</li>
                      <li>Partage d'ingrédients entre utilisateurs</li>
                      <li>Accès anticipé aux nouveautés</li>
                    </ul>
                    <button 
                      className={`${styles.selectButton} ${styles.annualButton}`}
                      // onClick={() => handlePlanSelection('annual')}
                    >
                      Choisir Annuel
                    </button>
                  </div>
                </div>

                <div className={styles.loginSection}>
                  <p className={styles.loginText}>Vous avez déjà un compte ?</p>
                  <button 
                    className={styles.loginLink}
                    onClick={handleLoginClick}
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          )}

          {showLoginModal && (
            <Login 
              onClose={() => setShowLoginModal(false)} 
              toggleModal={toggleModal} 
            />
          )}
          
          {showSignUpModal && (
            <SignUp 
              onClose={() => setShowSignUpModal(false)} 
              toggleModal={toggleModal}
              selectedPlan={selectedPlan}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Home;