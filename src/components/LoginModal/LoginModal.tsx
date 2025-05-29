import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast/ToastContext";
import styles from "./LoginModal.module.css";

interface LoginModalProps {
  onClose: () => void;
  toggleModal: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, toggleModal }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Veuillez remplir tous les champs.", "error", 3000);
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      showToast("Connexion réussie !", "success", 2000);
      
      // Fermer la modal après connexion réussie
      onClose();
      
      // Rediriger vers la page d'accueil
      navigate("/");
    } catch (error) {
      showToast("Erreur lors de la connexion. Vérifiez vos informations.", "error", 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fermer">
          ×
        </button>
        
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>Connexion</h2>
            <p className={styles.subtitle}>Accédez à votre compte RecipeApp</p>
          </div>

          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
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
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.input}
                disabled={isLoading}
                autoComplete="current-password"
                required
              />
            </div>

            <button 
              type="submit"
              onClick={handleLogin}
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? (
                <span className={styles.loading}>
                  <span className={styles.spinner}></span>
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Pas encore de compte ?{" "}
              <span className={styles.toggleLink} onClick={toggleModal}>
                S'inscrire
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;