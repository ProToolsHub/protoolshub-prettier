# ✨ Brew Prettier

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Un formateur de code automatique pour Homebrew et tous les langages web modernes. Cet outil vous permet de formater facilement vos projets sans polluer leur structure avec des dépendances supplémentaires.

## ✨ Caractéristiques

- 🚀 Formate automatiquement JavaScript, TypeScript, CSS, HTML, et bien plus
- 🧰 Installation centralisée des outils (Prettier, ESLint, Stylelint)
- 🔍 Détection intelligente des types de fichiers
- 🛠️ Configuration personnalisable et facile à utiliser
- 🌱 Ne pollue pas vos projets avec des node_modules

## 📥 Installation

```bash
# Ajouter le tap Homebrew
brew tap protoolshub/prettier

# Installer l'outil
brew install brew-prettier
```

## 🎮 Utilisation

```bash
# Formater le répertoire courant
brew-prettier

# Formater un répertoire spécifique
brew-prettier /chemin/vers/votre/projet

# Formater un fichier spécifique
brew-prettier fichier.js
```

## ⚙️ Options

```bash
# Configurer l'outil
brew-prettier --setup

# Installer/mettre à jour les outils de formatage
brew-prettier --tools

# Afficher l'aide
brew-prettier --help

# Afficher la version
brew-prettier --version
```

## 🔧 Configuration

Lors de la première utilisation, `brew-prettier` installe automatiquement les outils nécessaires dans `~/.brew-prettier`. Vous pouvez personnaliser sa configuration avec la commande `brew-prettier --setup`.

La configuration est sauvegardée dans `~/.brew-prettier/config.json` et comprend :

- Les extensions de fichiers à traiter
- Les répertoires à ignorer
- Les options de formatage pour chaque type de fichier

## 🌈 Langages pris en charge

| Catégorie                    | Extensions                              |
| ---------------------------- | --------------------------------------- |
| **JavaScript/TypeScript**    | `.js`, `.jsx`, `.ts`, `.tsx`            |
| **HTML et frameworks**       | `.html`, `.vue`, `.svelte`              |
| **CSS et préprocesseurs**    | `.css`, `.scss`, `.sass`, `.less`       |
| **Données et documentation** | `.json`, `.yaml`, `.yml`, `.md`, `.mdx` |
| **Ruby** (Homebrew)          | `.rb`                                   |

## 🔄 Intégration avec Git

Vous pouvez intégrer cet outil dans vos hooks Git pour formater automatiquement le code avant chaque commit :

```bash
# Dans .git/hooks/pre-commit
#!/bin/sh
brew-prettier
```

## 🏗️ Architecture

L'outil stocke tous ses fichiers dans le répertoire `~/.brew-prettier` :

```
~/.brew-prettier/
├── config.json           # Configuration de l'outil
└── tools/                # Outils de formatage
    ├── prettier/         # Installation de Prettier
    ├── eslint/           # Installation d'ESLint
    └── stylelint/        # Installation de Stylelint
```

## 🚀 Publication d'une nouvelle version

Pour publier une nouvelle version de l'outil, suivez ces étapes :

1. **Mise à jour du code source**

   ```bash
   # Mettez à jour le code et commitez vos changements
   git add .
   git commit -m "Améliorations pour la version x.y.z"
   ```

2. **Création d'un tag de version**

   ```bash
   # Créez un tag pour la nouvelle version
   git tag vx.y.z

   # Poussez le tag vers GitHub
   git push origin vx.y.z
   ```

3. **Création d'une release sur GitHub**

   - Allez sur la page GitHub du projet
   - Cliquez sur "Releases" puis "Create a new release"
   - Sélectionnez le tag vx.y.z
   - Ajoutez un titre et une description pour la release
   - Publiez la release

4. **Mise à jour de la formule Homebrew**

   - Calculez le nouveau SHA256 de l'archive :
     ```bash
     curl -L -o /tmp/brew-prettier.tar.gz https://github.com/ProToolsHub/protoolshub-prettier/archive/refs/tags/vx.y.z.tar.gz
     shasum -a 256 /tmp/brew-prettier.tar.gz
     ```
   - Mettez à jour la formule dans le dépôt homebrew-prettier :
     ```ruby
     class BrewPrettier < Formula
       # ...
       url "https://github.com/ProToolsHub/protoolshub-prettier/archive/refs/tags/vx.y.z.tar.gz"
       sha256 "nouveau-sha256-calculé"
       # ...
     end
     ```
   - Commitez et poussez les changements :
     ```bash
     git add Formula/brew-prettier.rb
     git commit -m "Mise à jour vers la version x.y.z"
     git push
     ```

5. **Vérification de l'installation**
   ```bash
   brew update
   brew upgrade brew-prettier
   brew-prettier --version  # Devrait afficher la nouvelle version
   ```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request sur notre [dépôt GitHub](https://github.com/ProToolsHub/protoolshub-prettier).

## 📝 Licence

MIT
