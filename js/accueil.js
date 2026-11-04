/* Accueil animé : simple, sans bibliothèque, sans cookie, sans stockage.
   - lit le défilement et pose trois variables CSS sur la scène :
       --p brume -> net, --t les Doudous se tournent, --f le fil de lumière apparaît ;
   - suit le mode calme (prefers-reduced-motion + bouton « Réduire les animations », géré par js/site.js). */
(function () {
  var racine = document.documentElement;

  var parcours = document.getElementById('parcours');
  var scene = document.getElementById('scene');
  if (!parcours || !scene) { return; }

  /* Un peu de hasard : chaque élément vivant reçoit sa propre durée et son propre décalage,
     pour que rien ne batte au même rythme. */
  var vivants = document.querySelectorAll('[data-vie]');
  for (var i = 0; i < vivants.length; i++) {
    var base = parseFloat(vivants[i].getAttribute('data-vie')) || 60;
    var duree = base * (0.8 + Math.random() * 0.45);
    vivants[i].style.setProperty('--d', duree.toFixed(1) + 's');
    vivants[i].style.setProperty('--dl', (-Math.random() * duree).toFixed(1) + 's');
  }

  /* Les étoiles : des points de lumière ronds, de tailles variées (quelques grandes, beaucoup de minuscules).
     Chacune respire à son rythme (4 à 9 s) et dérive très lentement vers le haut ; --z donne la profondeur
     (léger décalage au défilement). Quelques-unes glissent vers les Doudous quand ils apparaissent et se posent autour. */
  var astres = document.querySelector('.astres');
  if (astres) {
    var mobile = window.innerWidth < 700;
    var total = mobile ? 12 : 26, grandes = mobile ? 2 : 4, versDoudous = mobile ? 4 : 7;
    for (var k = 0; k < total; k++) {
      var a = document.createElement('span');
      var g = k < grandes;
      var gauche = 4 + Math.random() * 92, haut = 4 + Math.random() * 78;
      a.className = 'astre' + (g ? ' grande' : '') + (!g && Math.random() < 0.12 ? (Math.random() < 0.5 ? ' rose' : ' bleu') : '');
      a.style.left = gauche.toFixed(1) + '%';
      a.style.top = haut.toFixed(1) + '%';
      if (!g) { a.style.setProperty('--t', (4 + Math.random() * 5).toFixed(1) + 'px'); }
      else { a.style.setProperty('--t', (26 + Math.random() * 12).toFixed(0) + 'px'); }
      a.style.setProperty('--z', (g ? 24 : 40 + Math.random() * 90).toFixed(0));
      var dur = 4 + Math.random() * 5;
      var i = document.createElement('i');
      i.style.setProperty('--d', dur.toFixed(1) + 's');
      i.style.setProperty('--dl', (-Math.random() * dur).toFixed(1) + 's');
      var dd = (g ? 80 : 40) + Math.random() * 50;
      i.style.setProperty('--dd', dd.toFixed(0) + 's');
      i.style.setProperty('--dl2', (-Math.random() * dd).toFixed(0) + 's');
      i.style.setProperty('--dv', (-(g ? 6 : 8 + Math.random() * 12)).toFixed(1) + 'vh');
      i.style.setProperty('--dr', ((Math.random() - 0.5) * 18).toFixed(0) + 'px');
      if (k >= grandes && k < grandes + versDoudous) {
        /* cible : autour des deux Doudous, en bas de la scène */
        var cx = 50 + (Math.random() - 0.5) * 60, cy = 52 + Math.random() * 30;
        a.style.setProperty('--dx', (cx - gauche).toFixed(1) + 'vw');
        a.style.setProperty('--dy', (cy - haut).toFixed(1) + 'svh');
      }
      a.appendChild(i);
      astres.appendChild(a);
    }
  }

  /* Le mode calme est géré par js/site.js (réglage du système ou bouton) ; ici on le suit. */
  var calme = racine.classList.contains('calme');
  var attente = false;
  var dernier = '';

  /* Révélation des Doudous, de la grande étoile et de la poussière d'étoile : tout ensemble, dès que le HAUT de
     l'illustration entre dans l'écran (pas besoin d'attendre qu'elle soit au centre). */
  var duo = document.querySelector('.doudou-duo');
  function revele() { scene.classList.add('revele'); }
  if (calme || !('IntersectionObserver' in window) || !duo) { revele(); }
  else {
    var vue = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) { revele(); vue.disconnect(); }
      }
    }, { threshold: 0 });
    vue.observe(duo);
  }
  document.addEventListener('calme-change', function (e) { if (e.detail && e.detail.calme) { revele(); } });

  /* Toucher les Doudous : les cœurs s'allument fort, trois notes s'échappent, puis tout se calme. */
  var flotte = document.querySelector('.doudou-flotte');
  var coeursTouche = document.querySelectorAll('.coeur');
  function calin() {
    if (calme || scene.classList.contains('calin')) { return; }
    scene.classList.add('calin');
    var glyphes = ['\u266A', '\u266B', '\u2669'];
    var couleurs = ['#B87A46', '#C06A82', '#89A8B8'];
    for (var n = 0; n < 3; n++) {
      var note = document.createElement('span');
      note.className = 'note-doudou';
      note.setAttribute('aria-hidden', 'true');
      note.textContent = glyphes[n];
      var src = coeursTouche[n % coeursTouche.length];
      note.style.setProperty('--cx', src ? getComputedStyle(src).left : '50%');
      note.style.setProperty('--cy', src ? getComputedStyle(src).top : '60%');
      note.style.setProperty('--nc', couleurs[n]);
      note.style.setProperty('--nl', (n * 0.25).toFixed(2) + 's');
      note.style.setProperty('--nx', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
      flotte.appendChild(note);
    }
    window.setTimeout(function () {
      scene.classList.remove('calin');
      var vieilles = flotte.querySelectorAll('.note-doudou');
      for (var v = 0; v < vieilles.length; v++) { flotte.removeChild(vieilles[v]); }
    }, 3200);
  }
  if (flotte) {
    flotte.addEventListener('click', calin);
    flotte.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); calin(); } });
  }

  function borne(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function adoucit(x) { return x * x * (3 - 2 * x); } /* départ et arrivée en douceur */

  /* La grande étoile et le flux d'éclats.
     L'étoile se place au milieu de l'espace libre entre le texte d'accroche et les Doudous (jamais sur un texte),
     sa taille suit cet espace (80 à 100 px sur téléphone, 120 à 160 px sur ordinateur).
     Du centre de l'étoile au cœur de chaque Doudou (repères .coeur), un petit flux d'éclats minuscules coule en boucle :
     ici on ne pose que les distances ; le mouvement est en CSS (transform et opacity). */
  var etoile = document.querySelector('.grande-etoile');
  var zone = document.querySelector('.doudous');
  var texte = document.querySelector('.chapeau-accueil');
  var bloc = document.querySelector('.bloc-texte');
  var lift = 0;                                   /* remontée du texte (px, négative), à p = 1 */
  var coeurs = document.querySelectorAll('.coeur');
  var flux = [document.querySelector('.flux-g'), document.querySelector('.flux-d')];
  var gardeCle = '';
  var nbEclats = window.innerWidth < 700 ? 8 : 13;
  for (var q = 0; q < flux.length; q++) {
    if (!flux[q]) { continue; }
    for (var s = 0; s < nbEclats; s++) {
      var o = document.createElement('span');
      o.className = 'flux-o';
      var dur = 5 + Math.random() * 3.5;
      o.style.setProperty('--fd', dur.toFixed(1) + 's');
      o.style.setProperty('--fl', (-Math.random() * dur).toFixed(1) + 's');
      o.style.setProperty('--jx', ((Math.random() - 0.5) * 22).toFixed(0) + 'px');
      o.style.setProperty('--jy', ((Math.random() - 0.5) * 16).toFixed(0) + 'px');
      o.style.setProperty('--k', (0.72 + Math.random() * 0.28).toFixed(2));
      o.style.setProperty('--s', (2.2 + Math.random() * 2.6).toFixed(1) + 'px');
      o.appendChild(document.createElement('i'));
      flux[q].appendChild(o);
    }
  }
  function trace() {
    if (!etoile || !zone || !texte || !bloc || coeurs.length < 2) { return; }
    var pNow = calme ? 1 : (parseFloat(scene.style.getPropertyValue('--p')) || 0);
    var liftNow = calme ? 0 : lift * pNow;
    var z = zone.getBoundingClientRect();
    var tb = texte.getBoundingClientRect(), bb = bloc.getBoundingClientRect();
    /* ciel libre entre le texte et les Doudous, sans la remontée : on veut au moins 250 px */
    var gapNat = z.top - (tb.bottom - liftNow);
    var cible = window.innerWidth < 768 ? 180 : 190;
    var place = Math.max(0, bb.top - liftNow - 14);
    var neuf = calme ? 0 : -Math.min(Math.max(0, cible - gapNat), place);
    if (Math.abs(neuf - lift) > 0.5) { lift = neuf; bloc.style.setProperty('--lift', lift.toFixed(0) + 'px'); liftNow = lift * pNow; }
    var libre = z.top - texte.getBoundingClientRect().bottom;
    var mobile = window.innerWidth < 700;
    var taille = Math.max(mobile ? 80 : 150, Math.min(mobile ? 100 : 210, libre * 0.92));
    var cy = -libre / 2;                           /* milieu du ciel libre, relatif aux Doudous */
    var cx = z.width / 2;
    var cle = [taille, cy, cx, lift].map(Math.round).join();
    var coeurPos = [];
    for (var n = 0; n < 2; n++) {
      var c = coeurs[n].getBoundingClientRect();
      coeurPos.push([c.left - z.left, c.top - z.top]);
      cle += ',' + Math.round(c.left - z.left) + ',' + Math.round(c.top - z.top);
    }
    if (cle === gardeCle) { return; }
    gardeCle = cle;
    etoile.style.width = taille.toFixed(0) + 'px';
    etoile.style.top = cy.toFixed(1) + 'px';
    for (var m = 0; m < 2; m++) {
      if (!flux[m]) { continue; }
      flux[m].style.left = cx.toFixed(1) + 'px';
      flux[m].style.top = cy.toFixed(1) + 'px';
      flux[m].style.setProperty('--fx', (coeurPos[m][0] - cx).toFixed(1) + 'px');
      flux[m].style.setProperty('--fy', (coeurPos[m][1] - cy).toFixed(1) + 'px');
    }
  }
  window.addEventListener('resize', trace);
  window.addEventListener('load', trace);

  function pose(p, t, f) {
    var cle = p.toFixed(3) + t.toFixed(3) + f.toFixed(3);
    if (cle === dernier) { return; }
    dernier = cle;
    scene.style.setProperty('--p', p.toFixed(3));
    scene.style.setProperty('--t', t.toFixed(3));
    scene.style.setProperty('--f', f.toFixed(3));
    trace();
  }

  /* Filet de sécurité (si l'observateur tarde) : le haut de l'image est dans l'écran. */
  function verifie() {
    if (duo && duo.getBoundingClientRect().top < window.innerHeight) { revele(); }
  }

  function met() {
    attente = false;
    verifie();
    if (calme) { return; }
    var r = parcours.getBoundingClientRect();
    var course = r.height - window.innerHeight;
    var s = course > 0 ? borne(-r.top / course) : 1;   /* 0 en haut, 1 à la fin du parcours */
    pose(adoucit(borne(s / 0.6)), adoucit(borne((s - 0.15) / 0.6)), adoucit(borne((s - 0.5) / 0.4)));
  }

  function demande() {
    if (!attente) { attente = true; window.requestAnimationFrame(met); }
  }

  function applique() {
    if (calme) {
      scene.style.removeProperty('--p');
      scene.style.removeProperty('--t');
      scene.style.removeProperty('--f');
      dernier = '';
      trace();
    } else {
      demande();
    }
  }

  document.addEventListener('calme-change', function (e) {
    calme = !!(e.detail && e.detail.calme);
    applique();
  });
  window.addEventListener('scroll', demande, { passive: true });
  window.addEventListener('resize', demande);

  verifie();
  window.addEventListener('load', verifie);
  applique();
})();
