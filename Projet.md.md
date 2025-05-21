Projet : Wawe "What are we eat ?" est une application où les utilisateurs pourront partager leur recette de cuisine, enregistrer leurs ingrédients, créer un panier de course.

## Vue d'ensemble du projet

L'application permettra de :

- Se connecter/déconnecter via Supabase
- Créer des recettes de cuisine et les partager entre utilisateurs
- Enregistrer les ingrédients que l'on possède
- Créer un panier de courses pour les ingrédients à acheter
- responsive mobile first

## Choix technologiques

Visual studio code
React
Supabase pour l'authentification et la base de données
Cloudinary pour le stockage des images
CSS natif avec module pour le styling
Github
Vercel pour le déploiement du projet

## Structure de base du projet

```
wawe/
├── public/
├── src/
│   ├── api/
│   │   └── signup.ts
│   ├── components/
│   │   ├── LoginModal/
│   │   │   ├── LoginModal.tsx
│   │   │   └── LoginModal.module.css
│   │   ├── Navbar/
│   │   ├── ProfileImageUploader/
│   │   ├── SignUpModal/
│   │   ├── Toast/
│   │   └── UserModal/
│   ├── constants/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   ├── pages/
│   │   └──  Home.tsx
│   ├── services/
│   │   └── supabaseclients.ts
│   ├── types/
│   ├── utils/
│   │   └── iconUtils.ts
│   └── styles/
└── ...fichiers de configuration
```

## Structure de la base de données dans Supabase

### Table profiles :

id (uuid, primary key, références auth.users.id)
username (text)
avatar_url (text, nullable)
created_at (timestamp with timezone, default: now())

### Table recipes :

id (uuid, primary key)
user_id (uuid, foreign key -> profiles.id)
title (text)
description (text)
instructions (text)
image_url (text, nullable)
cooking_time (integer, en minutes)
servings (integer)
is_public (boolean, default: true)
created_at (timestamp with timezone, default: now())

### Table ingredients :

id (uuid, primary key)
name (text, unique)
category (text, nullable)

### Table recipe_ingredients :

id (uuid, primary key)
recipe_id (uuid, foreign key -> recipes.id)
ingredient_id (uuid, foreign key -> ingredients.id)
quantity (float)
unit (text, nullable)

### Table user_ingredients (ingrédients possédés) :

id (uuid, primary key)
user_id (uuid, foreign key -> profiles.id)
ingredient_id (uuid, foreign key -> ingredients.id)
quantity (float, nullable)
unit (text, nullable)
expiry_date (date, nullable)

### Table shopping_list :

id (uuid, primary key)
user_id (uuid, foreign key -> profiles.id)
ingredient_id (uuid, foreign key -> ingredients.id)
quantity (float, nullable)
unit (text, nullable)
is_checked (boolean, default: false)

## Étapes de développement

Phase 1 : Configuration initiale et authentification

Mise en place de Next.js
Configuration de Supabase
Création du système d'authentification

Phase 2 : Gestion des recettes

Création et affichage des recettes
Ajout des images avec Cloudinary
Partage entre utilisateurs

Phase 3 : Gestion des ingrédients

Liste des ingrédients disponibles
Interface pour ajouter/supprimer des ingrédients

Phase 4 : Panier de courses

Système de liste de courses
Transfert des ingrédients du panier vers le stock
