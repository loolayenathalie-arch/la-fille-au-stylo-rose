# Les Doudous et l'Étoile

Site de « La fille au stylo rose » (l’autrice). Titre du site : Les Doudous et l'Étoile.

Site statique d'autrice (albums jeunesse, 4 à 7 ans). HTML + CSS, aucun JavaScript, aucun cookie, aucun traceur.
Polices hébergées dans `fonts/` (Caveat et Atkinson Hyperlegible, licences incluses).

- Pages : `index.html`, `les-livres.html`, `les-doudous.html`, `a-propos.html`, `coin-des-parents.html`, `contact.html`, `mentions-legales.html`
- Images à remplacer : voir `images/LISEZ-MOI.txt`
- Textes : tous marqués `[texte de Nath]` ; mentions légales : `[à compléter]`
- Chercher les choses à faire : `grep -rn "TODO" --include=*.html --include=*.css --include=*.txt .`

## À faire plus tard
- Accueil animé (étape suivante, respecter `prefers-reduced-motion`)
- Formulaire de contact : destination `contact@lafilleaustylorose.com` (boîte OVH à créer)
- Newsletter Brevo (formulaire + expéditeur à vérifier après activation du domaine) ; adapter la politique de sécurité dans `vercel.json`
- Mentions légales à compléter (éditrice : Amotessa S.à r.l.-S, RCS Luxembourg B279710, gérante Nathalie Diaz)
- Brancher `lafilleaustylorose.com` (DNS chez OVH), puis retirer `noindex` et ouvrir `robots.txt`
