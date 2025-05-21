### Explication du code

1 . Toast.tsx - Un composant réutilisable qui affiche un message pendant une durée déterminée

. Prend en charge différents types de messages (succès, erreur, info)
. S'anime à l'apparition et à la disparition
. Disparaît automatiquement après un délai configurable

2. Toast.module.css - Un module CSS pour le style du toast

. Utilise des animations de transition pour une expérience utilisateur fluide
. Propose différentes couleurs selon le type de message
. Positionne le toast en bas de l'écran

3. ToastContext.tsx - Un contexte React pour gérer facilement les toasts dans toute votre application

. Fournit un hook `useToast()` pour afficher des toasts depuis n'importe quel composant
. Gère l'état des toasts de manière centralisée

4. LoginComponent.tsx - Votre composant modifié pour utiliser le système de toast

. Utilise le hook `useToast()` pour afficher les messages
. Conserve la logique de redirection après connexion réussie

5. App.tsx - Un exemple d'intégration du ToastProvider dans votre application

### Comment utiliser le système de toast

1. Enveloppez votre application avec `<ToastProvider>` comme montré dans App.tsx
   Dans n'importe quel composant où vous souhaitez afficher un toast :

2. Importez le hook `useToast`
   Utilisez la fonction `showToast(message, type, duration)` pour afficher un toast

Par exemple :

```typescript
const { showToast } = useToast();
showToast("Action réussie !", "success", 3000);
```

Vous pouvez facilement personnaliser davantage le style du toast en modifiant le fichier Toast.module.css selon vos besoins.
