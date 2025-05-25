import React, { useState } from "react";
import { supabase } from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast/ToastContext";
import styles from "./SignUpModal.module.css";

interface SignUpModalProps {
  onClose: () => void;
  toggleModal: () => void;
}

const SignUp: React.FC<SignUpModalProps> = ({ onClose, toggleModal }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);

    if (password !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error", 3000);
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        if (error.message.includes("User already registered")) {
          showToast("Cette adresse email est déjà utilisée. Veuillez vous connecter.", "error", 3000);
        } else {
          showToast(error.message, "error");
        }
      } else {
        showToast("Inscription réussie ! Vérifiez vos emails.", "success", 3000);
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

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
    <div style={{ padding: "1rem", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{textAlign:"center"}}>Inscription</h2>
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
      />
      <input
        type="password"
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
      />
</div>
      <button 
        onClick={handleSignUp} 
        disabled={isLoading} 
        style={{ width: "100%", padding: "8px", backgroundColor: "#007BFF", color: "#fff", border: "none", cursor: "pointer" }}
      >
        {isLoading ? "Inscription..." : "S'inscrire"}
      </button>
            <div style={{ marginTop: "10px", textAlign: "center" }}>
                  <p style={{ textAlign:"center" }}>
          Déjà inscrit ?{" "}
          <span
            style={{ cursor: "pointer", color: "#007BFF" }}
            onClick={toggleModal}
          >
            Se connecter
          </span>
        </p>
</div>
    </div></div></div>
  );
};

export default SignUp;
