MAHJONG INFINI — NEON CITY 2077 (édition mobile)
==================================================

CONTENU
-------
index.html   Structure de l'app
style.css    Thème "Classique" + thème "Neon City 2077", mise en page mobile-first
app.js       Générateur de plateaux, règles, pouvoirs, tuiles SVG, PWA
manifest.json  Manifeste d'installation (PWA)
sw.js        Service worker (jeu 100% hors-ligne après 1er chargement)
icons/       Icônes de l'app (192, 512, 512 maskable)

INSTALLER L'APPLICATION (obligatoire : servir les fichiers, pas les ouvrir en double-clic)
-------------------------------------------------------------------------
Les navigateurs n'autorisent l'installation PWA que si les fichiers sont
servis via http(s), pas en ouvrant index.html directement (file://).

1) Hébergement gratuit (recommandé) : GitHub Pages, Netlify, Vercel,
   Cloudflare Pages. Déposez le dossier tel quel, ouvrez l'URL fournie
   sur votre téléphone, puis :
     - Android/Chrome : menu ⋮ > "Installer l'application"
     - iPhone/Safari : bouton Partager > "Sur l'écran d'accueil"

2) En local, pour tester tout de suite :
     python3 -m http.server 8080
   puis ouvrez http://localhost:8080 sur le même réseau.

CE QUI A CHANGÉ DANS CETTE VERSION
------------------------------------
- Tuiles entièrement redessinées en SVG vectoriel fait main (plus
  d'émojis ni de glyphes Unicode qui s'affichaient de travers ou
  "en boîte" selon les téléphones). Thème classique : vrais motifs de
  vents / dragons / caractères / bambous / cercles dessinés à la main.
  Thème Neon City 2077 : 10 pictogrammes "netrunner" originaux x 3
  couleurs néon, cohérents avec l'ambiance cyberpunk.
- Mise en page repensée pour le téléphone : barre de pouvoirs fixée en
  bas (zone de pouce), zones sûres (encoche / barre de gestes) gérées
  partout, cibles tactiles agrandies, vibrations légères au clic.
- Les plateaux générés en mode portrait sont maintenant plus hauts que
  larges pour remplir l'écran du téléphone au lieu de rétrécir.

À PROPOS DU THÈME "NEON CITY 2077"
-----------------------------------
Identité visuelle originale (palette néon magenta/cyan/jaune, icônes
"netrunner" dessinées à la main) inspirée de l'esthétique cyberpunk.
Je ne peux pas reproduire les logos, personnages ou visuels protégés
de Cyberpunk 2077 (CD Projekt Red) ou d'Edgerunners (Netflix/Trigger) —
le thème rend hommage à l'ambiance sans copier d'éléments protégés.

FONCTIONNALITÉS
----------------
- Aucune publicité, aucun tracker, aucun appel réseau après le 1er chargement.
- Plateaux générés proceduralement à partir d'une graine aléatoire :
  quantité virtuellement infinie de dispositions différentes.
- 🔁 Reset : relance le plateau ACTUEL à l'identique.
- ✨ Nouveau : génère une disposition totalement inédite.
- Pouvoirs (rechargés à chaque plateau) : 👁️ Indice, 🌀 Mélange,
  ⚡ Joker (supprime 2 tuiles libres même différentes), ⏪ Annuler.
- 2 thèmes, sélection mémorisée. Partie sauvegardée automatiquement.
