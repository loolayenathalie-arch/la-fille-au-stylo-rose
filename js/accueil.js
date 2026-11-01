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
        var cx = 50 + (Math.random() - 0.5) * 56, cy = 66 + Math.random() * 20;
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

  function borne(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function adoucit(x) { return x * x * (3 - 2 * x); } /* départ et arrivée en douceur */

  function pose(p, t, f) {
    var cle = p.toFixed(3) + t.toFixed(3) + f.toFixed(3);
    if (cle === dernier) { return; }
    dernier = cle;
    scene.style.setProperty('--p', p.toFixed(3));
    scene.style.setProperty('--t', t.toFixed(3));
    scene.style.setProperty('--f', f.toFixed(3));
  }

  function met() {
    attente = false;
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

  applique();
})();
