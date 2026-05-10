# 🔐 Guide DevSecOps - Dental Clinic Pipeline

## 📋 Vue d'ensemble

Ce guide explique le pipeline Jenkins amélioré avec les meilleures pratiques DevSecOps.

---

## 🎯 Étapes du Pipeline

### ✅ ÉTAPE 1: Checkout
- Récupère le code depuis GitHub
- Affiche le commit SHA

### ✅ ÉTAPE 2: Backend - Installation & Audit
- `npm install` : installe les dépendances
- `npm audit` : scan les vulnérabilités haute sévérité
- Génère un rapport JSON

### ✅ ÉTAPE 3: Backend - Tests Unitaires
- `npm test` : exécute les tests Jest
- Génère un rapport de couverture
- **À CONFIGURER** : Ajouter les tests

### ✅ ÉTAPE 4: Frontend - Installation & Lint
- `npm install` : installe les dépendances
- `npm run lint` : analyse ESLint
- Génère un rapport JSON

### ✅ ÉTAPE 5: Frontend - Tests Unitaires
- `npm test` : exécute les tests Vitest
- Génère un rapport de couverture
- **À CONFIGURER** : Ajouter les tests

### ✅ ÉTAPE 6: Frontend - Build
- `npm run build` : build production
- Génère les artifacts dans `frontend/dist/`

### ✅ ÉTAPE 7: Code Quality - SonarQube
- Analyse statique du code
- Détecte les bugs et vulnérabilités
- **À CONFIGURER** : Installer SonarQube

### ✅ ÉTAPE 8: Security - OWASP Dependency Check
- Scan des dépendances vulnérables
- Vérifie les CVE (Common Vulnerabilities)
- **À CONFIGURER** : Installer OWASP

### ✅ ÉTAPE 9: Secret Scanning
- Détecte les secrets exposés (API keys, tokens)
- Utilise TruffleHog
- **À CONFIGURER** : Installer TruffleHog

### ✅ ÉTAPE 10: Archive des Artifacts
- Archive les builds frontend
- Archive les rapports de tests
- Archive les rapports de sécurité

---

## 🚀 Installation des Outils (Optionnels mais recommandés)

### 1️⃣ **Jest (Tests Backend)**

```bash
cd backend
npm install --save-dev jest @testing-library/node
npx jest --init
```

Créer des tests :
```bash
mkdir -p src/__tests__
# Créer des fichiers .test.js
```

### 2️⃣ **Vitest (Tests Frontend React)**

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/dom
```

Créer `vitest.config.js` :
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

### 3️⃣ **SonarQube (Analyse de Code)**

#### Avec Docker :
```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

Accès : `http://localhost:9000` (admin/admin)

#### Installer sonar-scanner :
```bash
sudo apt-get install -y sonar-scanner
```

#### Scanner le projet :
```bash
sonar-scanner \
  -Dsonar.projectKey=dental_clinic \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_SONARQUBE_TOKEN
```

### 4️⃣ **OWASP Dependency-Check**

#### Avec apt :
```bash
sudo apt-get install dependency-check
dependency-check --project "DentalClinic" --scan .
```

#### Avec Docker :
```bash
docker run --rm -v $(pwd):/src owasp/dependency-check:latest \
  --project DentalClinic \
  --scan /src \
  --format JSON \
  --out /src/reports
```

### 5️⃣ **TruffleHog (Secret Scanning)**

```bash
pip install truffleHog
truffleHog git file://. --json
```

---

## 📊 Utilisation dans Jenkins

### Lancer le Pipeline

1. Dans Jenkins, va sur le job `dental_clinic`
2. Clique sur `Build Now`
3. Attends les 10 étapes

### Consulter les Rapports

- **Tests** : Jenkins UI > Build > Test Results
- **Couverture** : Jenkins UI > Build > Coverage Report
- **Artifacts** : Jenkins UI > Build > Artifacts
- **SonarQube** : http://localhost:9000/projects

---

## 🔧 Configuration Jenkins (Recommandé)

### Plugin Required
```bash
Manage Jenkins > Manage Plugins > Available
- SonarQube Scanner
- JUnit Plugin (déjà présent)
- Cobertura Plugin (pour coverage)
```

### Configuration Système
```bash
Manage Jenkins > Configure System > SonarQube servers
- Name: SonarQube
- Server URL: http://localhost:9000
- Token: YOUR_SONARQUBE_TOKEN
```

---

## 📈 Tableau de Bord Recommandé

```
Dashboard (Visualiser tous les metrics)
├── Build Status (✅/❌)
├── Code Quality
│   ├── SonarQube Score
│   ├── Coverage %
│   └── Bugs/Vulnerabilities
├── Security Scan
│   ├── NPM Audit
│   ├── OWASP Dependency Check
│   └── Secret Scan
└── Test Results
    ├── Backend Tests
    └── Frontend Tests
```

---

## 🎯 Prochaines Étapes

### Phase 1 (Urgent)
- [ ] Ajouter Jest tests au backend
- [ ] Ajouter Vitest tests au frontend
- [ ] Configurer ESLint correctement

### Phase 2 (Moyen terme)
- [ ] Installer SonarQube
- [ ] Intégrer dans Jenkins
- [ ] Configurer seuils de qualité

### Phase 3 (Optimisation)
- [ ] OWASP Dependency-Check
- [ ] Secret Scanning
- [ ] Notifications Slack

### Phase 4 (Production)
- [ ] Docker images
- [ ] Registry (GitHub Packages)
- [ ] Déploiement automatique

---

## 📝 Exemple de Test Backend (Jest)

**backend/src/__tests__/auth.test.js** :
```javascript
describe('Auth', () => {
  it('should hash password', () => {
    const hashed = bcrypt.hashSync('password123', 10);
    expect(bcrypt.compareSync('password123', hashed)).toBe(true);
  });
});
```

---

## 📝 Exemple de Test Frontend (Vitest)

**frontend/src/__tests__/App.test.jsx** :
```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
```

---

## 🔐 Checklist DevSecOps

- [x] Git SCM + SSH
- [x] Pipeline CI/CD (Jenkins)
- [x] NPM Audit
- [x] ESLint
- [x] Artifacts Archiving
- [ ] Tests Unitaires (À ajouter)
- [ ] SonarQube (À installer)
- [ ] OWASP Dependency Check (À installer)
- [ ] Secret Scanning (À installer)
- [ ] Notifications (À configurer)
- [ ] Docker (À configurer)
- [ ] Déploiement (À configurer)

---

## ❓ FAQ

**Q: Pourquoi le pipeline échoue à l'étape Tests?**
A: Jest/Vitest n'est pas installé. Voir section "Installation des Outils".

**Q: Comment activer SonarQube?**
A: `docker run -d -p 9000:9000 sonarqube:latest` puis configurer le token dans Jenkins.

**Q: Où voir les artifacts?**
A: Jenkins UI > Build > Artifacts tab.

---

## 📞 Support

Pour des questions :
- Consulte les logs Jenkins
- Regarde la sortie de chaque étape
- Vérifie les fichiers de rapport générés

---

**Version** : 1.0  
**Dernière mise à jour** : 10 Mai 2026  
**Auteur** : Dental Clinic DevSecOps Team
