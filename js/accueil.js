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
