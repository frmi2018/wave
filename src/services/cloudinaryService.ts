// services/cloudinaryService.ts

import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_UPLOAD_PRESET_PROFILE,
  getCloudinaryUploadUrl,
} from '../config/cloudinaryConfig';

/**
 * ✅ Upload de l'image de profil (Blob) sur Cloudinary avec un preset spécifique.
 * @param imageBlob - L'image du profil au format Blob
 * @returns URL sécurisée de l'image hébergée
 */
export const uploadProfileImageToCloudinary = async (imageBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', imageBlob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET_PROFILE);
  formData.append('api_key', CLOUDINARY_API_KEY);

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erreur lors de l'upload sur Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * ✅ Upload générique d'une image (ex : recette) vers Cloudinary.
 * @param file - fichier image à uploader
 * @returns URL sécurisée ou `null` en cas d'erreur
 */
export async function uploadImageToCloudinary(file: File): Promise<string | null> {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("❌ Variables d'environnement manquantes pour Cloudinary.");
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Erreur lors de l'upload vers Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("❌ Upload image Cloudinary échoué:", error);
    return null;
  }
};

/**
 * Supprime une image de Cloudinary via l'API serverless /api/deleteImage.
 * @param imageUrl URL complète de l'image Cloudinary à supprimer.
 * @returns true si suppression OK, false sinon.
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    // On extrait public_id à partir de l'URL (exemple simple)
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      console.error("Impossible d'extraire publicId de l'URL");
      return false;
    }

    // Appel API serverless Vercel
    const response = await fetch('/api/deleteImage', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Si besoin, ajoute un token d'authentification ici
      },
      body: JSON.stringify({ publicId }),      
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Erreur serveur lors suppression:', text);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Erreur suppression image:', error);
    return false;
  }
};

/**
 * Extraction simple du publicId à partir de l'URL Cloudinary.
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Exemple : https://res.cloudinary.com/moncompte/image/upload/v123456/monfolder/monimage.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}


