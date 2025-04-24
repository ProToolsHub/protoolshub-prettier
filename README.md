# Brew Prettier

Un formateur de code automatique pour Homebrew et tous les langages web modernes. Cet outil vous permet de formater facilement vos projets sans polluer leur structure avec des dépendances supplémentaires.

## Caractéristiques

- 🚀 Formate automatiquement JavaScript, TypeScript, CSS, HTML, et bien plus
- 🧰 Installation centralisée des outils (Prettier, ESLint, Stylelint)
- 🔍 Détection intelligente des types de fichiers
- 🛠️ Configuration personnalisable et facile à utiliser
- 🌱 Ne pollue pas vos projets avec des node_modules

## Installation

```bash
# Ajouter le tap Homebrew
brew tap ProToolsHub/tap

# Installer l'outil
brew install brew-prettier
```

## Utilisation

```bash
# Formater le répertoire courant
brew-prettier

# Formater un répertoire spécifique
brew-prettier /chemin/vers/votre/projet

# Formater un fichier spécifique
brew-prettier fichier.js
```

## Options

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

## Configuration

Lors de la première utilisation, `brew-prettier` installe automatiquement les outils nécessaires dans `~/.brew-prettier`. Vous pouvez personnaliser sa configuration avec la commande `brew-prettier --setup`.

La configuration est sauvegardée dans `~/.brew-prettier/config.json` et comprend :

- Les extensions de fichiers à traiter
- Les répertoires à ignorer
- Les options de formatage pour chaque type de fichier

## Langages pris en charge

- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **HTML et frameworks**: `.html`, `.vue`, `.svelte`
- **CSS et préprocesseurs**: `.css`, `.scss`, `.sass`, `.less`
- **Données et documentation**: `.json`, `.yaml`, `.yml`, `.md`, `.mdx`
- **Ruby** (Homebrew): `.rb`

## Intégration avec Git

Vous pouvez intégrer cet outil dans vos hooks Git pour formater automatiquement le code avant chaque commit :

```bash
# Dans .git/hooks/pre-commit
#!/bin/sh
brew-prettier
```

## Architecture

L'outil stocke tous ses fichiers dans le répertoire `~/.brew-prettier` :

```
~/.brew-prettier/
├── config.json           # Configuration de l'outil
└── tools/                # Outils de formatage
    ├── prettier/         # Installation de Prettier
    ├── eslint/           # Installation d'ESLint
    └── stylelint/        # Installation de Stylelint
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT