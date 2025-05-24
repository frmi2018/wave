import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/services/supabaseClient';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { DeleteImageResponse } from '../src/types/cloudinary';
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_CLOUD_NAME,
} from '../src/services/cloudinaryConfig';

const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsHeaders = {
    'Access-Control-Allow-Origin':
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://wave-phi-eight.vercel.app',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value as string);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const { data: user, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    let publicId: string | undefined;
    console.log(publicId)

    if (req.method === 'DELETE') {
      const rawBody = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => (data += chunk));
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });

      try {
        const parsed = JSON.parse(rawBody);
        publicId = parsed.publicId;
      } catch (e) {
        return res.status(400).json({ error: 'JSON invalide' });
      }
    } else {
      publicId = req.query.publicId as string;
    }

    if (!publicId) {
      return res.status(400).json({ error: 'publicId manquant' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    // const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    // const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(stringToSign + CLOUDINARY_API_SECRET).digest('hex');


    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('signature', signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      }
    );

    const result = await cloudinaryRes.json() as DeleteImageResponse;

    if (result.result === 'ok') {
      return res.status(200).json({ success: true, message: 'Image supprimée', result });
    } else {
      return res.status(400).json({ error: 'Erreur Cloudinary', details: result });
    }
  } catch (err: any) {
    console.error('Erreur API :', err);
    return res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
}
