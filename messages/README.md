# Système de traduction

Ce projet utilise `next-intl` pour la gestion des traductions multilingues.

## Langues supportées

- **fr** : Français (par défaut)
- **en** : Anglais
- **es** : Espagnol
- **pt** : Portugais

## Structure

Les fichiers de traduction sont dans le dossier `messages/` :
- `fr.json` : Traductions françaises
- `en.json` : Traductions anglaises
- `es.json` : Traductions espagnoles
- `pt.json` : Traductions portugaises

## Utilisation

### Dans un composant serveur (Server Component)

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyComponent() {
  const t = await getTranslations('user.stats');
  
  return <div>{t('globalRank')}</div>;
}
```

### Dans un composant client (Client Component)

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('user.stats');
  
  return <div>{t('globalRank')}</div>;
}
```

### Avec des paramètres

```typescript
const t = useTranslations('user.info');
t('limit', { limit: '40 000' });
t('support', { link: <a href="...">ce LIEN</a> });
```

## Ajouter une nouvelle traduction

1. Ajoutez la clé dans tous les fichiers JSON (`fr.json`, `en.json`, `es.json`, `pt.json`)
2. Utilisez la structure hiérarchique avec des points : `section.subsection.key`

## Configuration

La configuration se trouve dans :
- `i18n.ts` : Configuration principale
- `middleware.ts` : Détection de la locale
- `next.config.ts` : Plugin next-intl

