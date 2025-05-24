import React, { useState } from "react";
import { FiShoppingCart, FiUser, FiList } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import UserModal from "../UserModal/UserModal";
import { renderIcon } from '../../utils/iconUtils';

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
            {renderIcon(FiList)}
          </Link>
          <Link to="/" className={styles.icon}>
            {renderIcon(FiShoppingCart)}
          </Link>
            <div 
              className={styles.icon} 
              onClick={() => setShowModal(!showModal)}
            >
              {renderIcon(FiUser)}
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
