// components/ProfileImageUpLoader/
import { useState, useRef, ChangeEvent } from 'react';
import styles from './ProfileImageUploader.module.css';
import { uploadProfileImageToCloudinary, deleteImageFromCloudinary } from "../../services/cloudinaryService"
import { updateUserAvatar } from '../../services/supabaseProfileService';

// Types pour les props du composant
interface ProfileImageUploaderProps {
  initialImageUrl?: string;
  userId: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

const ProfileImageUploader = ({
  initialImageUrl = 'https://placehold.co/150x150?text=Avatar&font=roboto',
  userId,
  onSuccess,
  onError
}: ProfileImageUploaderProps) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Gérer le clic sur l'image (ouvre le sélecteur de fichier)
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Gérer le changement d'image
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier (type et taille)
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // Limite à 5MB
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    // Afficher l'aperçu de l'image sélectionnée
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Gérer le survol de l'image
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  // Vérifier si l'URL est une image Cloudinary (et pas le placeholder)
  const isCloudinaryImage = (url: string): boolean => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  // Sauvegarder l'image sur Cloudinary puis dans Supabase
  const saveImage = async () => {
    if (imageUrl === initialImageUrl || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      // Sauvegarder l'ancienne URL pour pouvoir la supprimer après
      const oldImageUrl = initialImageUrl;

      // Convertir l'URL data en blob si nécessaire
      let imageBlob: Blob;
      if (imageUrl.startsWith('data:')) {
        const response = await fetch(imageUrl);
        imageBlob = await response.blob();
      } else {
        // Si c'est déjà une URL externe, on télécharge d'abord l'image
        const response = await fetch(imageUrl);
        imageBlob = await response.blob();
      }

      // Upload de la nouvelle image sur Cloudinary

      const cloudinaryUrl = await uploadProfileImageToCloudinary(imageBlob);


      // Sauvegarder l'URL dans Supabase

      await updateUserAvatar(userId, cloudinaryUrl);


      // Supprimer l'ancienne image de Cloudinary (seulement si c'était une image Cloudinary)
      if (oldImageUrl && isCloudinaryImage(oldImageUrl)) {

        try {
          const deleteSuccess = await deleteImageFromCloudinary(oldImageUrl);
          if (!deleteSuccess) {
            console.warn('⚠️ Impossible de supprimer l\'ancienne image de Cloudinary:', oldImageUrl);
          } else {
            console.log('✅ Ancienne image supprimée avec succès');
          }
        } catch (deleteError) {
          console.error('❌ Erreur lors de la suppression de l\'ancienne image:', deleteError);
          // On ne fait pas échouer tout le processus si la suppression échoue
        }
      } else {
        console.log('ℹ️ Pas de suppression nécessaire (pas une image Cloudinary ou pas d\'ancienne image)');
      }

      // Mettre à jour l'état local avec la nouvelle URL
      setImageUrl(cloudinaryUrl);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(cloudinaryUrl);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      
      // Appeler le callback d'erreur si fourni
      if (onError && err instanceof Error) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.imageContainer}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={imageUrl}
          className={styles.profileImage}
          onClick={handleImageClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleImageClick();
            }
          }}
          aria-label="Changer l'image de profil"
        />
        
        {/* Message au survol */}
        {isHovering && (
          <div 
            className={styles.hoverMessage}
            style={{ 
              left: `${cursorPosition.x + 15}px`, 
              top: `${cursorPosition.y + 15}px` 
            }}
          >
            Changer image de profil
          </div>
        )}
        
        {/* Input file caché */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className={styles.hiddenInput}
        />
      </div>

      {/* Message d'erreur */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Bouton de sauvegarde */}
      <button 
        className={styles.saveButton}
        onClick={saveImage}
        disabled={isLoading || imageUrl === initialImageUrl}
      >
        {isLoading ? 'Sauvegarde en cours...' : 'Sauvegarder l\'image'}
      </button>
    </div>
  );
};

export default ProfileImageUploader;