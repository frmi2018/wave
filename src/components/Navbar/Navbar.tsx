import React, { useState } from "react";
import { FiShoppingCart, FiUser } from "react-icons/fi";
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
      <div className={styles.brand}>Wawe</div>

      {user ? (
        <div className={styles.icons}>
          <Link to="/cart" className={styles.icon}>
            {renderIcon(FiShoppingCart)}
          </Link>
          {/* <FiUser className={styles.icon} onClick={() => setShowModal(!showModal)} /> */}

                        <div 
              className={styles.icon} 
              onClick={() => setShowModal(!showModal)}
            >
              {renderIcon(FiUser)}
            </div>
        </div>
      ) : null}

      {showModal && user?.user.email && (
        <UserModal
          onClose={() => setShowModal(false)}
          onLogout={handleLogout}
          email={user.user.email} 
        />
      )}
    </div>
  );
};

export default Navbar;
