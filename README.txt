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

DERNIER CORRECTIF
------------------
Le décalage visuel entre étages (l'effet "tilt" 3D) était cumulatif et
pouvait, sur les plateaux à beaucoup d'étages, finir par recouvrir
entièrement une tuile appartenant à une autre pile — la rendant
invisible et injouable même si elle était logiquement libre. Le
décalage est maintenant plafonné : les étages restent visuellement
distincts sans jamais engloutir une tuile voisine.

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
