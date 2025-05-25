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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{textAlign:"center"}}>Connexion</h2>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button 
            onClick={handleLogin} 
            disabled={isLoading} 
            style={{ width: "100%", padding: "8px", backgroundColor: "#007BFF", color: "#fff", border: "none", cursor: "pointer" }}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <p style={{ textAlign:"center" }}>
              Pas encore de compte ?{" "}
              <span
                style={{ cursor: "pointer", color: "#007BFF" }}
                onClick={toggleModal}
              >
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