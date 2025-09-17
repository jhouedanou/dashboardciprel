# Dashboard Analytics CIPREL

Dashboard moderne développé avec Nuxt 3 et Vuetify pour afficher les métriques Google Analytics du site **ciprel.ci**.

## 🚀 Fonctionnalités

- **Métriques clés** : Sessions, utilisateurs uniques, pages vues, taux de rebond
- **Graphiques interactifs** : Évolution du trafic avec Chart.js
- **Interface responsive** : Design moderne avec Vuetify 3
- **Périodes configurables** : 7, 30 ou 90 derniers jours
- **Mise à jour en temps réel** : Données fraîches de Google Analytics

## 📋 Prérequis

- Node.js 18+
- Compte Google Analytics avec accès à la propriété ciprel.ci
- Compte de service Google Cloud avec l'API Analytics activée

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone <votre-repo>
   cd dashboardciprel
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Google Analytics**
   
   a. Créer un compte de service dans Google Cloud Console
   b. Télécharger le fichier JSON des clés
   c. Activer l'API Google Analytics Reporting
   d. Ajouter le compte de service aux utilisateurs autorisés dans Google Analytics

4. **Variables d'environnement**
   
   Copier `.env.example` vers `.env` et remplir :
   ```bash
   cp .env.example .env
   ```
   
   Modifier `.env` avec vos valeurs :
   ```env
   GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
   GOOGLE_CLIENT_EMAIL=votre-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre-clé-privée\n-----END PRIVATE KEY-----\n"
   GOOGLE_ANALYTICS_VIEW_ID=123456789
   ```

## 🚀 Lancement

**Mode développement**
```bash
npm run dev
```

**Mode production**
```bash
npm run build
npm run preview
```

L'application sera accessible sur `http://localhost:3000`

## 📊 Structure du projet

```
dashboardciprel/
├── components/
│   ├── MetricsCard.vue      # Cartes de métriques
│   └── AnalyticsChart.vue   # Graphiques
├── composables/
│   └── useAnalytics.ts      # Logique Analytics
├── pages/
│   └── index.vue            # Page principale
├── plugins/
│   └── vuetify.ts           # Configuration Vuetify
├── server/api/
│   └── analytics.ts         # API Google Analytics
└── nuxt.config.ts           # Configuration Nuxt
```

## 🎨 Personnalisation

### Thème Vuetify
Modifier `plugins/vuetify.ts` pour changer les couleurs :

```typescript
theme: {
  themes: {
    light: {
      colors: {
        primary: '#1976D2',    // Bleu CIPREL
        secondary: '#424242',
        // ...
      }
    }
  }
}
```

### Métriques additionnelles
Ajouter dans `server/api/analytics.ts` :

```typescript
metrics: 'ga:sessions,ga:users,ga:pageviews,ga:organicSearches'
```

## 📈 Métriques disponibles

- **Sessions** : Nombre total de sessions
- **Utilisateurs** : Visiteurs uniques
- **Pages vues** : Total des pages consultées
- **Taux de rebond** : % de sessions à une page
- **Durée moyenne** : Temps moyen par session

## 🔧 API Google Analytics

L'API utilise Google Analytics Reporting API v4 pour récupérer :
- Données temporelles (ga:date)
- Métriques de base (sessions, users, pageviews)
- Dimensions personnalisées selon les besoins

## 🛡️ Sécurité

- Variables d'environnement pour les clés sensibles
- Validation des données API
- Gestion d'erreurs robuste
- Accès restreint aux comptes de service

## 📱 Responsive Design

Interface optimisée pour :
- Desktop (1200px+)
- Tablet (768px-1199px)  
- Mobile (320px-767px)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit (`git commit -m 'Ajout fonctionnalité'`)
4. Push (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question concernant l'intégration avec Google Analytics ou la configuration, contactez l'équipe technique CIPREL.

---

*Dashboard développé pour la Compagnie Ivoirienne de Production d'Electricité (CIPREL)*