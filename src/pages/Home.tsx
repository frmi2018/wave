import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Login from "../components/LoginModal/LoginModal";
import SignUp from "../components/SignUpModal/SignUpModal";
import UserRecipes from "../components/UserRecipes/UserRecipes";

const Home: React.FC = () => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Gère l'affichage des formulaires en fonction de l'état de l'utilisateur
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
      setShowSignUpModal(false);
    } else {
      setShowLoginModal(false);
      setShowSignUpModal(false);
    }
  }, [user]);

  const toggleModal = () => {
    setShowLoginModal(!showLoginModal);
    setShowSignUpModal(!showSignUpModal);
  };

  return (
    <div>
      <Navbar />
      {user ? (
        <>
        <UserRecipes/>
        </>

      ) : (
        <>
          {showLoginModal && (
            <Login onClose={() => setShowLoginModal(false)} toggleModal={toggleModal} />
          )}
          {showSignUpModal && (
            <SignUp onClose={() => setShowSignUpModal(false)} toggleModal={toggleModal} />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
