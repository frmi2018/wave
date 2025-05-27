import React, { useState } from "react";
import { ShoppingCart, User, List, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import UserModal from "../UserModal/UserModal";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setShowModal(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <div className={styles.navbar}>
      <Link to="/">
        <div className={styles.brand}>Wawe</div>
      </Link>
      {user ? (
        <div className={styles.icons}>
          <Link to="/ingredients" className={styles.icon}>
            <List size={24} />
          </Link>
          <Link to="/calendar" className={styles.icon}>
            <Calendar size={24} />
          </Link>
          <Link to="/" className={styles.icon}>
            <ShoppingCart size={24} />
          </Link>
          <div 
            className={styles.icon} 
            onClick={() => setShowModal(!showModal)}
          >
            <User size={24} />
          </div>
        </div>
      ) : null}

      {showModal && user?.email && (
        <UserModal
          onClose={() => setShowModal(false)}
          onLogout={handleLogout}
          email={user.email} 
        />
      )}
    </div>
  );
};

export default Navbar;