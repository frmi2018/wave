🧰 Tu peux aussi :

Remarque : Créer un dossier sql/rls/ dans ton projet Git pour garder trace de toutes tes policies.

Te faire un compte "admin" dans ta table profiles avec un champ role, pour créer plus tard des exceptions côté RLS (par ex. : user.role = 'admin').

### Gestion de policy dans Supabase

✅ Etape 1 : activer la Row Level Security sur une table :

```sql
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
```

✅ Créer une policy temporaire qui bloque rien pour tester (optionnel)

```sql
-- Politique temporaire permissive :
CREATE POLICY "debug_all_access"
ON public."NOM-DE-LA-TABLE"
FOR ALL
USING (true)
WITH CHECK (true);
```

✅ Pour supprimer une policy

```sql
DROP POLICY "debug_all_access" ON public."NOM-DE-LA-TABLE";
```

✅ Etapes suivantes : rajouter des policy

Exemple cette politique signifie :
Un utilisateur peut lire une recette si elle est publique (is_public = true) ou s’il en est le créateur (user_id = auth.uid()).

```sql
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing public recipes or own recipes"
ON public.recipes
FOR SELECT
USING (
  is_public = true OR user_id = auth.uid()
);
```

Comme les étapes sont liées aux recettes, il faut autoriser la lecture des étapes si la recette est publique ou appartient à l’utilisateur :

```sql
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow viewing steps for public or own recipes"
ON public.recipe_steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
  )
);
```

Authoriser la création qu'a l'utilisateur dans table recipe_steps

```sql
CREATE POLICY "Users can insert their own recipe steps"
ON public.recipe_steps
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
```

Authoriser la MAJ qu'a l'utilisateur dans table recipe_steps

```sql
CREATE POLICY "Users can update their own recipe steps"
ON public.recipe_steps
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
```

Authoriser la suppression qu'a l'utilisateur dans table recipe_steps

```sql
CREATE POLICY "Users can delete their own recipe steps"
ON public.recipe_steps
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.recipes
    WHERE recipes.id = recipe_steps.recipe_id
    AND recipes.user_id = auth.uid()
  )
);
```
