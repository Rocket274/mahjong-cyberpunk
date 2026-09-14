MAHJONG INFINI — NEON CITY 2077
================================

CONTENU
-------
index.html   Structure de l'app
style.css    Thème "Classique" + thème "Neon City 2077" (cyberpunk)
app.js       Générateur de plateaux, règles, pouvoirs, PWA
manifest.json  Manifeste d'installation (PWA)
sw.js        Service worker (jeu 100% hors-ligne après 1er chargement)
icons/       Icônes de l'app (192, 512, 512 maskable)

INSTALLER L'APPLICATION (obligatoire : servir les fichiers, pas les ouvrir en double-clic)
-------------------------------------------------------------------------
Les navigateurs n'autorisent l'installation PWA (icône "Installer") que
si les fichiers sont servis via http(s), pas en ouvrant index.html
directement (file://). Deux façons simples :

1) Hébergement gratuit (recommandé) :
   - GitHub Pages, Netlify, Vercel, Cloudflare Pages : déposez le dossier
     tel quel, ouvrez l'URL fournie sur votre téléphone/PC, puis :
     - Android/Chrome : menu ⋮ > "Installer l'application"
     - iPhone/Safari : bouton Partager > "Sur l'écran d'accueil"
     - PC/Chrome/Edge : icône d'installation dans la barre d'adresse,
       ou le bouton 📲 en haut à droite de l'appli.

2) En local, pour tester tout de suite :
   - Avec Python installé : ouvrez un terminal dans ce dossier puis :
       python3 -m http.server 8080
     puis ouvrez http://localhost:8080 dans le navigateur.

À PROPOS DU THÈME "NEON CITY 2077"
-----------------------------------
Il s'agit d'une identité visuelle originale (palette néon magenta/cyan,
typographie glitch, icônes "netrunner") inspirée de l'esthétique
cyberpunk. Je ne peux pas reproduire les logos, personnages ou visuels
protégés de Cyberpunk 2077 (CD Projekt Red) ou d'Edgerunners
(Netflix/Trigger/CDPR) — le thème rend hommage à l'ambiance sans copier
d'éléments protégés.

FONCTIONNALITÉS
----------------
- Aucune publicité, aucun tracker, aucun appel réseau après le 1er chargement.
- Plateaux générés proceduralement à partir d'une graine aléatoire :
  quantité virtuellement infinie de dispositions différentes (formes,
  tailles, nombre d'étages).
- Bouton "Recommencer" : relance le plateau ACTUEL à l'identique (même
  graine), pour retenter le même défi depuis le début.
- Bouton "Nouveau plateau" : génère une disposition totalement inédite.
- Pouvoirs d'aide (rechargés à chaque plateau) :
    👁️ Indice   — révèle une paire jouable
    🌀 Mélange  — redistribue les tuiles restantes si bloqué
    ⚡ Joker    — supprime 2 tuiles libres au choix, même différentes
    ⏪ Annuler  — reprend le dernier coup
- 2 thèmes (Classique / Neon City 2077), sélection mémorisée.
- Partie sauvegardée automatiquement (localStorage) : en cas de fermeture,
  vous reprenez exactement où vous en étiez.
