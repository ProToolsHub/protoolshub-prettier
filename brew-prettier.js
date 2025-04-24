#!/usr/bin/env node

/**
 * Homebrew Code Formatter
 *
 * Script qui scanne et reformatte le code dans les formules Homebrew
 * Installation automatique des outils et configuration centralisée
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

// Configuration globale
const CONFIG_DIR = path.join(os.homedir(), '.brew-formatter');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOOLS_DIR = path.join(CONFIG_DIR, 'tools');

// Dossiers pour les outils
const PRETTIER_DIR = path.join(TOOLS_DIR, 'prettier');
const ESLINT_DIR = path.join(TOOLS_DIR, 'eslint');
const STYLELINT_DIR = path.join(TOOLS_DIR, 'stylelint');

// Configuration par défaut
let config = {
  // Extensions à formater par défaut
  extensions: [
    // JavaScript et TypeScript
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    // Web
    '.html',
    '.css',
    '.scss',
    '.sass',
    '.less',
    '.vue',
    '.svelte',
    // Data
    '.json',
    '.yaml',
    '.yml',
    '.md',
    '.mdx',
    // Ruby (Homebrew)
    '.rb',
  ],

  // Répertoires à ignorer
  ignoreDirs: [
    'node_modules',
    '.git',
    'vendor',
    'tmp',
    'cache',
    'dist',
    'build',
    'Caskroom',
    'Cellar',
  ],

  // Configuration prettier
  prettierConfig: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    arrowParens: 'avoid',
    endOfLine: 'lf',
  },

  // Configuration eslint
  eslintConfig: {
    enabled: true,
  },

  // Configuration stylelint
  stylelintConfig: {
    enabled: true,
  },
};

// Statistiques
let stats = {
  scanned: 0,
  formatted: 0,
  errors: 0,
  skipped: 0,
};

/**
 * Crée une interface de ligne de commande
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Charge la configuration
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const loadedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      config = { ...config, ...loadedConfig };
      return true;
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error.message);
  }
  return false;
}

/**
 * Sauvegarde la configuration
 */
function saveConfig() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error.message);
    return false;
  }
}

/**
 * Configure l'outil
 */
async function setupConfig() {
  const rl = createReadlineInterface();

  console.log('\n=== Configuration du Homebrew Formatter ===');

  return new Promise(resolve => {
    const formatExtensions = config.extensions.join(', ');
    rl.question(`Extensions à formater [${formatExtensions}] : `, extensions => {
      if (extensions.trim() !== '') {
        config.extensions = extensions.split(',').map(ext => ext.trim());
      }

      const ignoreList = config.ignoreDirs.join(', ');
      rl.question(`Répertoires à ignorer [${ignoreList}] : `, ignoreDirs => {
        if (ignoreDirs.trim() !== '') {
          config.ignoreDirs = ignoreDirs.split(',').map(dir => dir.trim());
        }

        rl.question(
          `Largeur d'impression (printWidth) [${config.prettierConfig.printWidth}] : `,
          printWidth => {
            if (printWidth.trim() !== '') {
              config.prettierConfig.printWidth = parseInt(printWidth, 10);
            }

            rl.question(
              `Utiliser des onglets (true/false) [${config.prettierConfig.useTabs}] : `,
              useTabs => {
                if (useTabs.trim() !== '') {
                  config.prettierConfig.useTabs = useTabs.toLowerCase() === 'true';
                }

                rl.question(
                  `Activer ESLint (true/false) [${config.eslintConfig.enabled}] : `,
                  eslintEnabled => {
                    if (eslintEnabled.trim() !== '') {
                      config.eslintConfig.enabled = eslintEnabled.toLowerCase() === 'true';
                    }

                    rl.question(
                      `Activer Stylelint (true/false) [${config.stylelintConfig.enabled}] : `,
                      stylelintEnabled => {
                        if (stylelintEnabled.trim() !== '') {
                          config.stylelintConfig.enabled =
                            stylelintEnabled.toLowerCase() === 'true';
                        }

                        rl.close();
                        saveConfig();
                        resolve();
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
}

/**
 * Vérifie et installe les outils nécessaires
 */
async function setupTools() {
  if (!fs.existsSync(TOOLS_DIR)) {
    fs.mkdirSync(TOOLS_DIR, { recursive: true });
  }

  console.log('\n=== Installation des outils ===');

  // Installer Prettier
  await setupPrettier();

  // Installer ESLint si activé
  if (config.eslintConfig.enabled) {
    await setupESLint();
  }

  // Installer Stylelint si activé
  if (config.stylelintConfig.enabled) {
    await setupStylelint();
  }

  console.log('\n✅ Tous les outils ont été installés et configurés avec succès.');
}

/**
 * Configure Prettier
 */
async function setupPrettier() {
  if (!fs.existsSync(PRETTIER_DIR)) {
    console.log('\n🔧 Installation de Prettier...');
    fs.mkdirSync(PRETTIER_DIR, { recursive: true });

    try {
      // Créer un package.json temporaire
      const packageJson = {
        name: 'brew-formatter-prettier',
        version: '1.0.0',
        private: true,
        dependencies: {
          prettier: '^3.2.0',
          '@prettier/plugin-php': '^0.22.0',
          '@prettier/plugin-ruby': '^4.0.2',
          'prettier-plugin-svelte': '^3.1.0',
          'prettier-plugin-astro': '^0.12.0',
          'prettier-plugin-tailwindcss': '^0.5.0',
        },
      };

      fs.writeFileSync(
        path.join(PRETTIER_DIR, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Créer un fichier de configuration Prettier
      const prettierConfig = {
        ...config.prettierConfig,
      };

      fs.writeFileSync(
        path.join(PRETTIER_DIR, '.prettierrc'),
        JSON.stringify(prettierConfig, null, 2)
      );

      // Installer avec npm
      console.log('Installation des dépendances Prettier...');
      execSync('npm install', {
        cwd: PRETTIER_DIR,
        stdio: 'inherit',
      });

      console.log('✅ Prettier installé avec succès.');
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'installation de Prettier: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Configure ESLint
 */
async function setupESLint() {
  if (!fs.existsSync(ESLINT_DIR)) {
    console.log("\n🔧 Installation d'ESLint...");
    fs.mkdirSync(ESLINT_DIR, { recursive: true });

    try {
      // Créer un package.json temporaire
      const packageJson = {
        name: 'brew-formatter-eslint',
        version: '1.0.0',
        private: true,
        dependencies: {
          eslint: '^8.55.0',
          'eslint-config-prettier': '^9.1.0',
          'eslint-plugin-react': '^7.33.0',
          'eslint-plugin-vue': '^9.19.0',
          '@typescript-eslint/eslint-plugin': '^6.13.0',
          '@typescript-eslint/parser': '^6.13.0',
        },
      };

      fs.writeFileSync(path.join(ESLINT_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Créer une configuration ESLint
      const eslintConfig = {
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        extends: [
          'eslint:recommended',
          'plugin:react/recommended',
          'plugin:@typescript-eslint/recommended',
          'prettier',
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        plugins: ['react', '@typescript-eslint'],
        rules: {
          'no-unused-vars': 'warn',
          'no-console': 'off',
        },
      };

      fs.writeFileSync(
        path.join(ESLINT_DIR, '.eslintrc.json'),
        JSON.stringify(eslintConfig, null, 2)
      );

      // Installer avec npm
      console.log('Installation des dépendances ESLint...');
      execSync('npm install', {
        cwd: ESLINT_DIR,
        stdio: 'inherit',
      });

      console.log('✅ ESLint installé avec succès.');
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'installation d'ESLint: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Configure Stylelint
 */
async function setupStylelint() {
  if (!fs.existsSync(STYLELINT_DIR)) {
    console.log('\n🔧 Installation de Stylelint...');
    fs.mkdirSync(STYLELINT_DIR, { recursive: true });

    try {
      // Créer un package.json temporaire
      const packageJson = {
        name: 'brew-formatter-stylelint',
        version: '1.0.0',
        private: true,
        dependencies: {
          stylelint: '^15.11.0',
          'stylelint-config-standard': '^34.0.0',
          'stylelint-config-standard-scss': '^11.0.0',
        },
      };

      fs.writeFileSync(
        path.join(STYLELINT_DIR, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Créer une configuration Stylelint
      const stylelintConfig = {
        extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
        rules: {
          indentation: 2,
          'string-quotes': 'single',
        },
      };

      fs.writeFileSync(
        path.join(STYLELINT_DIR, '.stylelintrc.json'),
        JSON.stringify(stylelintConfig, null, 2)
      );

      // Installer avec npm
      console.log('Installation des dépendances Stylelint...');
      execSync('npm install', {
        cwd: STYLELINT_DIR,
        stdio: 'inherit',
      });

      console.log('✅ Stylelint installé avec succès.');
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors de l'installation de Stylelint: ${error.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Vérifie si un fichier doit être traité selon son extension
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return config.extensions.includes(ext);
}

/**
 * Scanne récursivement un répertoire et traite les fichiers
 */
async function scanDirectory(dir) {
  // Vérifier si le répertoire existe
  if (!fs.existsSync(dir)) {
    console.error(`❌ Le répertoire ${dir} n'existe pas.`);
    return;
  }

  // Lire le contenu du répertoire
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Ignorer les répertoires spécifiés
      if (config.ignoreDirs.includes(entry.name)) {
        continue;
      }

      // Récursion dans les sous-répertoires
      await scanDirectory(entryPath);
    } else if (entry.isFile()) {
      // Traiter le fichier si son extension est dans la liste
      if (shouldProcessFile(entryPath)) {
        stats.scanned++;
        await formatFile(entryPath);
      }
    }
  }
}

/**
 * Obtient le chemin vers l'exécutable Prettier
 */
function getPrettierBin() {
  return path.join(PRETTIER_DIR, 'node_modules', '.bin', 'prettier');
}

/**
 * Obtient le chemin vers l'exécutable ESLint
 */
function getESLintBin() {
  return path.join(ESLINT_DIR, 'node_modules', '.bin', 'eslint');
}

/**
 * Obtient le chemin vers l'exécutable Stylelint
 */
function getStylelintBin() {
  return path.join(STYLELINT_DIR, 'node_modules', '.bin', 'stylelint');
}

/**
 * Exécute une commande et retourne la promesse
 */
function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, options);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', data => {
      stdout += data.toString();
    });

    process.stderr.on('data', data => {
      stderr += data.toString();
    });

    process.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Commande a échoué avec le code ${code}: ${stderr}`));
      }
    });
  });
}

/**
 * Formate un fichier avec Prettier et les linters appropriés
 */
async function formatFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // Formater avec Prettier
    await formatWithPrettier(filePath);

    // Linting avec ESLint pour JavaScript/TypeScript
    if (config.eslintConfig.enabled && ['.js', '.jsx', '.ts', '.tsx', '.vue'].includes(ext)) {
      await lintWithESLint(filePath);
    }

    // Linting avec Stylelint pour CSS/SCSS
    if (config.stylelintConfig.enabled && ['.css', '.scss', '.sass', '.less'].includes(ext)) {
      await lintWithStylelint(filePath);
    }

    stats.formatted++;
    console.log(`✅ Formatté: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erreur lors du formatage de ${filePath}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Formate un fichier avec Prettier
 */
async function formatWithPrettier(filePath) {
  const prettierBin = getPrettierBin();
  const configPath = path.join(PRETTIER_DIR, '.prettierrc');

  try {
    // Vérifier d'abord si le fichier a besoin d'être formatté
    const { stdout } = await execCommand(
      prettierBin,
      ['--check', '--config', configPath, filePath],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    // Si le fichier est déjà bien formatté, marquer comme ignoré
    if (stdout.trim() === '') {
      stats.skipped++;
      return;
    }

    // Le fichier a besoin d'être formatté
    await execCommand(prettierBin, ['--write', '--config', configPath, filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    // Si l'erreur est liée au check, cela signifie que le fichier a besoin d'être formatté
    await execCommand(prettierBin, ['--write', '--config', configPath, filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
}

/**
 * Lint avec ESLint
 */
async function lintWithESLint(filePath) {
  const eslintBin = getESLintBin();
  const configPath = path.join(ESLINT_DIR, '.eslintrc.json');

  try {
    await execCommand(eslintBin, ['--fix', '--config', configPath, filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    // Ignorer les erreurs de linting qui ne peuvent pas être corrigées automatiquement
    console.warn(`⚠️ Avertissement ESLint pour ${filePath}: ${error.message}`);
  }
}

/**
 * Lint avec Stylelint
 */
async function lintWithStylelint(filePath) {
  const stylelintBin = getStylelintBin();
  const configPath = path.join(STYLELINT_DIR, '.stylelintrc.json');

  try {
    await execCommand(stylelintBin, ['--fix', '--config', configPath, filePath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    // Ignorer les erreurs de linting qui ne peuvent pas être corrigées automatiquement
    console.warn(`⚠️ Avertissement Stylelint pour ${filePath}: ${error.message}`);
  }
}

/**
 * Affiche l'aide avec les options disponibles
 */
function showHelp() {
  console.log(`
╭───────────────────────────────────────────────────────────╮
│                                                           │
│                  ▗▄▖  ▗▄▄▖ ▗▄▄▖▗▄▄▄▖ ▗▄▖                  │
│                 ▐▌ ▐▌▐▌   ▐▌   ▐▌   ▐▌ ▐▌                 │
│                 ▐▛▀▜▌▐▌    ▝▀▚▖▐▛▀▀▘▐▌ ▐▌                 │
│                 ▐▌ ▐▌▝▚▄▄▖▗▄▄▞▘▐▙▄▄▖▝▚▄▞▘                 │
│                                                           │
│                 Outil de formatage du code                │
│                                                           │
│                                                           │
╰───────────────────────────────────────────────────────────╯

USAGE:
  brew-formatter [options] [chemin]

OPTIONS:
  Sans options       Format le répertoire courant récursivement
  --setup, -s        Configure l'outil (extensions, répertoires ignorés, etc.)
  --tools, -t        Installe ou met à jour les outils de formatage
  --help, -h         Affiche ce message d'aide
  --version, -v      Affiche la version du programme

EXEMPLES:
  brew-formatter                   # Formate le répertoire courant
  brew-formatter /chemin/vers/dir  # Formate le répertoire spécifié
  brew-formatter --setup           # Configure l'outil
  brew-formatter --tools           # Installe/met à jour les outils

`);
}

/**
 * Affiche la version du programme
 */
function showVersion() {
  console.log('Homebrew Code Formatter v1.0.1');
}

/**
 * Fonction principale
 */
async function main() {
  // Vérifier les arguments
  const args = process.argv.slice(2);

  // Afficher l'aide
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Afficher la version
  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  // Charger la configuration
  loadConfig();

  // Configuration
  if (args.includes('--setup') || args.includes('-s')) {
    await setupConfig();
    return;
  }

  // Installation des outils
  if (args.includes('--tools') || args.includes('-t')) {
    await setupTools();
    return;
  }

  // Vérifier que les outils sont installés
  if (!fs.existsSync(path.join(PRETTIER_DIR, 'node_modules', '.bin', 'prettier'))) {
    console.log('⚙️ Première utilisation détectée, installation des outils...');
    await setupTools();
  }

  // Démarrer le formatage
  console.log(`
╭───────────────────────────────────────────────────────────╮
│                                                           │
│                  ▗▄▖  ▗▄▄▖ ▗▄▄▖▗▄▄▄▖ ▗▄▖                  │
│                 ▐▌ ▐▌▐▌   ▐▌   ▐▌   ▐▌ ▐▌                 │
│                 ▐▛▀▜▌▐▌    ▝▀▚▖▐▛▀▀▘▐▌ ▐▌                 │
│                 ▐▌ ▐▌▝▚▄▄▖▗▄▄▞▘▐▙▄▄▖▝▚▄▞▘                 │
│                                                           │
│                 Outil de formatage du code                │
│                                                           │
│                                                           │
╰───────────────────────────────────────────────────────────╯
  `);

  // Déterminer le répertoire à scanner
  const targetDir = args.find(arg => !arg.startsWith('-')) || process.cwd();

  console.log(`\n🔍 Scan du répertoire: ${targetDir}`);
  console.log(`📋 Extensions traitées: ${config.extensions.join(', ')}`);

  // Réinitialiser les statistiques
  stats = { scanned: 0, formatted: 0, errors: 0, skipped: 0 };

  const startTime = Date.now();

  try {
    await scanDirectory(targetDir);

    // Afficher les statistiques
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n📊 Résumé:');
    console.log(`   Fichiers scannés: ${stats.scanned}`);
    console.log(`   Fichiers formattés: ${stats.formatted}`);
    console.log(`   Fichiers déjà bien formattés: ${stats.skipped}`);
    console.log(`   Erreurs: ${stats.errors}`);
    console.log(`   Durée: ${duration} secondes`);

    if (stats.formatted > 0) {
      console.log('\n✅ Formatage terminé avec succès !');
    } else if (stats.scanned > 0 && stats.formatted === 0) {
      console.log('\n✅ Tous les fichiers sont déjà bien formattés !');
    } else {
      console.log('\n⚠️ Aucun fichier à formater trouvé.');
    }
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter le programme
if (require.main === module) {
  main().catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
}

// Exposer pour les tests et autres utilisations
module.exports = {
  main,
  setupConfig,
  setupTools,
  formatFile,
  scanDirectory,
};
