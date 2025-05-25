import React, { useState, useEffect } from "react";
import styles from "./UserModal.module.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../config/supabaseClient";
import ProfileImageUploader from '../ProfileImageUploader/ProfileImageUploader';

interface UserModalProps {
  onClose: () => void;
  onLogout: () => void;
  email: string;
}

interface UserProfile {
  avatar_url: string;
  username: string;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onLogout, email }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>('https://placehold.co/150x150?text=Avatar&font=roboto');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const userId = user?.id || '';

  // Récupérer ou créer le profil utilisateur au chargement du composant
  useEffect(() => {
    const initializeUserProfile = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          // Tenter de récupérer le profil existant
          const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('avatar_url, username')
            .eq('id', userId)
            .single() as { data: UserProfile | null, error: any };
          
          if (fetchError) {
            // Si l'erreur est "not found", créer un nouveau profil
            if (fetchError.code === 'PGRST116') {
              console.log('Profil non trouvé, création d\'un nouveau profil');
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  avatar_url: 'https://placehold.co/150x150?text=Avatar&font=roboto', // URL par défaut
                  username: email.split('@')[0], // Utilise la partie locale de l'email comme nom d'utilisateur par défaut
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              
              if (insertError) {
                console.error('Erreur lors de la création du profil:', insertError);
              } else {
                console.log('Nouveau profil créé avec succès');
                // On garde l'avatar_url par défaut
              }
            } else {
              console.error('Erreur lors de la récupération du profil:', fetchError);
            }
          } else if (profile) {
  setAvatarUrl(profile.avatar_url || 'https://placehold.co/150x150?text=Avatar&font=roboto');
  setProfile({
    avatar_url: profile.avatar_url,
    username: profile.username,
  })
}
          
        } catch (error) {
          console.error('Erreur:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeUserProfile();
  }, [userId,email]);

  const handleImageSuccess = (url: string) => {
    setAvatarUrl(url);
    console.log('Image sauvegardée avec succès:', url);
  };
  
  const handleImageError = (error: Error) => {
    console.error('Erreur lors de la sauvegarde de l\'image:', error);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      
        {isLoading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : (<div style={{textAlign:"right"}}>
                  <button onClick={onClose} className={styles.closeBtn}>Fermer</button>
          <ProfileImageUploader
            initialImageUrl={avatarUrl}
            userId={userId}
            onSuccess={handleImageSuccess}
            onError={handleImageError}
          /><div style={{textAlign:"center"}}>
                  <h2>{profile ? profile.username : 'Utilisateur'}</h2>      
        <button onClick={onLogout} className={styles.logoutBtn}>Se déconnecter</button>
          </div>

    </div>    )}

      </div>
    </div>
  );
};

export default UserModal;