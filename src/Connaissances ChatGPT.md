### Objectif de Wawe

Wawe est une application web qui permet de partager des recettes, gérer des ingrédients, et créer un panier de courses. L’idée est d’avoir une plateforme simple où l’utilisateur peut retrouver ses recettes, ajouter des ingrédients, et planifier ses achats.

### Fonctionnalités principales

Gestion des profils utilisateurs : Chaque utilisateur peut créer un compte avec un profil (photo, nom, rôle, etc.).

Partage et consultation de recettes : Les utilisateurs peuvent créer, éditer et afficher des recettes.

### Gestion des ingrédients :

Les ingrédients peuvent être publics ou privés (champ is_public).

Les utilisateurs peuvent gérer leur liste personnelle d’ingrédients.

Panier de courses / liste de courses : Possibilité de créer et gérer une liste de courses basée sur les recettes et ingrédients choisis.

Planning / calendrier : Fonctionnalité de calendrier pour planifier les repas sur une semaine.

### Technologies utilisées

Frontend : React (initialement en JavaScript, on travaille à migrer vers TypeScript).

Backend / BDD : Supabase (PostgreSQL + API).

Stockage des images : Cloudinary pour l’upload des photos (ex : photo de profil).

Styles : CSS Modules pour un style encapsulé.

Déploiement et versionning : GitHub pour le code, Vercel pour le déploiement.

### Organisation du projet

Structure du code avec dossiers components, pages, services, context, hooks, types, etc.

Le code est progressivement refactoré pour améliorer la lisibilité, en découpant les composants (ex : CalendarPage en sous-composants).

Utilisation de hooks personnalisés pour gérer la logique métier (ex : gestion des jours, des repas).

Séparation des services (ex : fichier cloudinaryService.ts pour gérer les uploads).

### Base de données / schéma principal

Tables principales : profiles (utilisateurs), recipes, ingredients, user_ingredients, shopping_list, recipe_ingredients.

Chaque table a ses champs spécifiques, avec des relations (ex : une recette a plusieurs ingrédients).

### Points importants à noter

On fait attention à la gestion des rôles utilisateurs (user vs admin).

Respect des bonnes pratiques en React et TypeScript.

On veut une application facile à maintenir et évolutive.
