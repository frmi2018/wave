// services/cloudinaryConfig.ts

// Clé publique Cloudinary (non sensible). Utilisée uniquement pour l'upload (pas pour la suppression).
export const CLOUDINARY_API_KEY = process.env.REACT_APP_CLOUDINARY_API_KEY || '';

// Nom de ton "cloud" (disponible dans le tableau de bord Cloudinary)
export const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';

// Preset pour les images de recettes (doit exister dans ton compte Cloudinary)
export const CLOUDINARY_UPLOAD_PRESET_RECIPES =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_RECIPES || 'recipe_images';

// Preset pour les images de profil utilisateur
export const CLOUDINARY_UPLOAD_PRESET_PROFILE =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET_PROFILE || 'profile_avatars';

/**
 * ✅ Fonction utilitaire qui retourne l’URL d’upload vers Cloudinary
 * Utilisée dans `fetch()` pour envoyer les fichiers.
 */
export const getCloudinaryUploadUrl = () =>
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
