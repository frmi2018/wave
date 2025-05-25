import { useState, useRef, ChangeEvent } from 'react';
import styles from './RecipeImageUploader.module.css';
import { supabase } from '../../config/supabaseClient';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_UPLOAD_PRESET_RECIPES,
  getCloudinaryUploadUrl
} from '../../config/cloudinaryConfig';

// Types pour les props du composant
interface RecipeImageUploaderProps {
  initialImageUrl?: string;
  recipeId: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

const CLOUDINARY_URL = getCloudinaryUploadUrl();

const RecipeImageUploader = ({
  initialImageUrl = 'https://placehold.co/300x300?text=Photo+recette&font=roboto',
  recipeId,
  onSuccess,
  onError
}: RecipeImageUploaderProps) => {
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

    if (file.size > 10 * 1024 * 1024) { // Limite à 10MB pour les images de recettes
      setError('L\'image ne doit pas dépasser 10MB');
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

  // Sauvegarder l'image sur Cloudinary puis dans Supabase
  const saveImage = async () => {
    if (imageUrl === initialImageUrl || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

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

      // Préparer le formulaire pour Cloudinary
      const formData = new FormData();
      formData.append('file', imageBlob);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_RECIPES);
      formData.append('api_key', CLOUDINARY_API_KEY);

      // Envoyer à Cloudinary
      const cloudinaryResponse = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      });

      if (!cloudinaryResponse.ok) {
        throw new Error('Erreur lors de l\'upload sur Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const cloudinaryUrl = cloudinaryData.secure_url;

      // Sauvegarder l'URL dans Supabase (table recipes)
      const { error: supabaseError } = await supabase
        .from('recipes')
        .update({ image_url: cloudinaryUrl })
        .eq('id', recipeId);

      if (supabaseError) {
        throw new Error(`Erreur Supabase: ${supabaseError.message}`);
      }

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(cloudinaryUrl);
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
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
          alt="Recette" 
          className={styles.recipeImage}
          onClick={handleImageClick}
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
            Ajouter une photo de recette
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

export default RecipeImageUploader;