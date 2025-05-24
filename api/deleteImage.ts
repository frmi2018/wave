import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import fetch from 'node-fetch';

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { publicId } = req.body;

    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ error: 'publicId manquant ou invalide' });
    }

    // Signature Cloudinary (timestamp + signature)
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const params = new URLSearchParams();
    params.append('public_id', publicId);
    params.append('timestamp', timestamp.toString());
    params.append('api_key', CLOUDINARY_API_KEY);
    params.append('signature', signature);

    // Appel API Cloudinary pour suppression
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );

interface DeleteImageResponse {
  result: 'ok' | 'not found' | 'error'; // ou les valeurs possibles que Cloudinary renvoie
  // tu peux aussi ajouter d'autres propriétés selon la doc Cloudinary
  message?: string;
  error?: string;
}

    const result = await cloudinaryRes.json() as DeleteImageResponse;

    if (result.result === 'ok') {
      return res.status(200).json({ success: true, message: 'Image supprimée', result });
    } else {
      return res.status(400).json({ error: 'Erreur Cloudinary', details: result });
    }
  } catch (error: any) {
    console.error('Erreur API /deleteImage:', error);
    return res.status(500).json({ error: 'Erreur interne', details: error.message });
  }
}
