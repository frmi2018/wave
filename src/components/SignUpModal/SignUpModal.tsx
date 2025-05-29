import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "../Toast/ToastContext";
import styles from "./SignUpModal.module.css";

interface SignUpModalProps {
  onClose: () => void;
  toggleModal: () => void;
  selectedPlan?: string | null | undefined;
}

const SignUp: React.FC<SignUpModalProps> = ({ onClose, toggleModal, selectedPlan }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getPlanDetails = (plan: string | null | undefined) => {
    switch (plan) {
      case 'free':
        return { name: 'Gratuit', price: '0€/mois', color: '#6366f1', buttonClass: styles.freeButton };
      case 'monthly':
        return { name: 'Mensuel', price: '2€/mois', color: '#8b5cf6', buttonClass: styles.monthlyButton };
      case 'annual':
        return { name: 'Annuel', price: '10€/an', color: '#10b981', buttonClass: styles.annualButton };
      default:
        return { name: 'Gratuit', price: '0€/mois', color: '#6366f1', buttonClass: styles.freeButton };
    }
  };

  const planDetails = getPlanDetails(selectedPlan);

  const validateForm = () => {
    if (!username.trim()) {
      showToast("Veuillez saisir un nom d'utilisateur.", "error", 3000);
      return false;
    }

    if (username.trim().length < 3) {
      showToast("Le nom d'utilisateur doit contenir au moins 3 caractères.", "error", 3000);
      return false;
    }

    if (!email.trim()) {
      showToast("Veuillez saisir votre adresse email.", "error", 3000);
      return false;
    }
    
    if (!email.includes('@')) {
      showToast("Veuillez saisir une adresse email valide.", "error", 3000);
      return false;
    }

    if (password.length < 6) {
      showToast("Le mot de passe doit contenir au moins 6 caractères.", "error", 3000);
      return false;
    }

    if (password !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error", 3000);
      return false;
    }

    return true;
  };

  const createUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username.trim(),
          subscription_plan: selectedPlan || 'free',
          subscription_status: 'active',
          subscription_start_date: selectedPlan && selectedPlan !== 'free' ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la création du profil:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Créer le compte utilisateur avec Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: {
          data: {
            username: username.trim(),
            subscription_plan: selectedPlan || 'free'
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          showToast("Cette adresse email est déjà utilisée. Veuillez vous connecter.", "error", 3000);
        } else {
          showToast(error.message, "error");
        }
        return;
      }

      if (data.user) {
        // 2. Créer le profil utilisateur dans la table profiles
        try {
          await createUserProfile(data.user.id, email.trim());
        } catch (profileError) {
          console.error('Erreur lors de la création du profil:', profileError);
          showToast("Erreur lors de la création du profil utilisateur.", "error", 3000);
          return;
        }

        // 3. Gérer les abonnements payants
        if (selectedPlan === 'monthly' || selectedPlan === 'annual') {
          // TODO: Intégrer le paiement Stripe
          console.log(`Redirection vers le paiement pour le plan ${selectedPlan}`);
          
          // Exemple d'intégration Stripe (à adapter selon vos besoins)
          try {
            const response = await fetch('/api/create-checkout-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                priceId: selectedPlan === 'monthly' ? 'price_monthly_id' : 'price_annual_id',
                userId: data.user.id,
                email: email.trim()
              }),
            });

            const session = await response.json();
            
            if (session.url) {
              // Rediriger vers Stripe Checkout
              window.location.href = session.url;
              return;
            }
          } catch (stripeError) {
            console.error('Erreur Stripe:', stripeError);
            showToast("Erreur lors de l'initialisation du paiement.", "error", 3000);
          }
        }

        showToast("Inscription réussie ! Vérifiez vos emails pour confirmer votre compte.", "success", 5000);
        navigate("/");
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      showToast("Erreur lors de l'inscription. Veuillez réessayer.", "error", 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSignUp();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Inscription...";
    
    switch (selectedPlan) {
      case 'free':
        return "S'inscrire gratuitement";
      case 'monthly':
        return "S'inscrire (2€/mois)";
      case 'annual':
        return "S'inscrire (12€/an)";
      default:
        return "S'inscrire";
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        
        <div className={styles.modalContent}>
          {/* Affichage du plan sélectionné */}
          {selectedPlan && (
            <div 
              className={styles.planBanner}
              style={{ borderLeftColor: planDetails.color }}
            >
              <div className={styles.planHeader}>
                <h3 className={styles.planName} style={{ color: planDetails.color }}>
                  Plan sélectionné : {planDetails.name}
                </h3>
                <p className={styles.planPrice} style={{ color: planDetails.color }}>
                  {planDetails.price}
                </p>
              </div>
              {selectedPlan === 'annual' && (
                <p className={styles.planSavings}>
                  🎉 Économisez 58% !
                </p>
              )}
            </div>
          )}

          <div className={styles.header}>
            <h2 className={styles.title}>Inscription</h2>
            <p className={styles.subtitle}>Créez votre compte Wawe</p>
          </div>

          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="Nom d'utilisateur (min. 3 caractères)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Mot de passe (min. 6 caractères)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
                autoComplete="new-password"
                required
              />
            </div>

            <button 
              type="submit"
              onClick={handleSignUp}
              disabled={isLoading}
              className={`${styles.submitButton} ${planDetails.buttonClass}`}
            >
              {isLoading ? (
                <span className={styles.loading}>
                  <span className={styles.spinner}></span>
                  Inscription...
                </span>
              ) : (
                getButtonText()
              )}
            </button>
          </form>

          {(selectedPlan === 'monthly' || selectedPlan === 'annual') && (
            <div className={styles.paymentNotice}>
              💳 Vous serez redirigé vers notre partenaire de paiement sécurisé après l'inscription.
            </div>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Déjà inscrit ?{" "}
              <span className={styles.toggleLink} onClick={toggleModal}>
                Se connecter
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;