/* Script commun aux pages : sans bibliothèque, sans cookie, sans traceur.
   - apparitions très douces au défilement (éléments .apparait) ;
   - mode calme (« Réduire les animations ») : réglage du système (prefers-reduced-motion) OU bouton.
     Le choix du bouton est gardé le temps de la visite seulement (sessionStorage, propre à l'onglet,
     jamais envoyé nulle part) pour qu'il suive d'une page à l'autre.
   Les autres scripts (accueil.js) écoutent l'événement « calme-change ». */
(function () {
  var racine = document.documentElement;
  racine.classList.add('js');

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var choix = null; /* '1' = calme demandé, '0' = animations demandées, null = pas de choix */
  try { choix = window.sessionStorage.getItem('calme'); } catch (e) { choix = null; }
  var calme = choix !== null ? choix === '1' : !!(mq && mq.matches);

  var boutons = document.querySelectorAll('[data-calmer]');

  function applique(annonce) {
    racine.classList.toggle('calme', calme);
    for (var i = 0; i < boutons.length; i++) {
      boutons[i].setAttribute('aria-pressed', calme ? 'true' : 'false');
    }
    if (calme) { montreTout(); }
    if (annonce) {
      var ev;
      try { ev = new CustomEvent('calme-change', { detail: { calme: calme } }); }
      catch (e) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('calme-change', false, false, { calme: calme }); }
      document.dispatchEvent(ev);
    }
  }

  /* Apparitions au défilement */
  var elements = document.querySelectorAll('.apparait');
  var observateur = null;
  function montreTout() {
    for (var i = 0; i < elements.length; i++) { elements[i].classList.add('visible'); }
  }
  if ('IntersectionObserver' in window) {
    observateur = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) {
          entrees[i].target.classList.add('visible');
          observateur.unobserve(entrees[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < elements.length; j++) { observateur.observe(elements[j]); }
  } else {
    montreTout();
  }

  for (var k = 0; k < boutons.length; k++) {
    boutons[k].addEventListener('click', function () {
      calme = !calme;
      try { window.sessionStorage.setItem('calme', calme ? '1' : '0'); } catch (e) { /* tant pis */ }
      applique(true);
    });
  }
  if (mq) {
    var suit = function (e) {
      if (choix === null) { calme = e.matches; applique(true); }
    };
    if (mq.addEventListener) { mq.addEventListener('change', suit); }
    else if (mq.addListener) { mq.addListener(suit); }
  }

  /* ---------- Ciel d'étoiles ----------
     Quelques perles de lumière qui respirent doucement, et une étoile qui veille (la même que sur l'accueil, en petit).
     Purement décoratif ; figé en mode calme (CSS). */
  var ciel = document.createElement('div');
  ciel.className = 'etoiles';
  ciel.setAttribute('aria-hidden', 'true');
  var nb = window.innerWidth < 700 ? 9 : 15;
  for (var n = 0; n < nb; n++) {
    var e = document.createElement('span');
    var teinte = Math.random();
    e.className = 'etoile' + (teinte < 0.1 ? ' rose' : (teinte < 0.2 ? ' bleu' : ''));
    e.style.left = (Math.random() * 96 + 1).toFixed(1) + '%';
    e.style.top = (Math.random() * 94 + 2).toFixed(1) + '%';
    e.style.setProperty('--t', (n < 2 ? 18 + Math.random() * 8 : 4 + Math.random() * 6).toFixed(1) + 'px');
    var dur = 4 + Math.random() * 5;
    e.style.setProperty('--d', dur.toFixed(1) + 's');
    e.style.setProperty('--dl', (-Math.random() * dur).toFixed(1) + 's');
    var dd = 50 + Math.random() * 50;
    e.style.setProperty('--dd', dd.toFixed(0) + 's');
    e.style.setProperty('--dl2', (-Math.random() * dd).toFixed(0) + 's');
    e.style.setProperty('--dv', (-(5 + Math.random() * 9)).toFixed(1) + 'vh');
    e.style.setProperty('--dr', ((Math.random() - 0.5) * 16).toFixed(0) + 'px');
    ciel.appendChild(e);
  }
  document.body.appendChild(ciel);

  /* L'étoile qui veille : la même étoile scintillante que sur l'accueil, en petit, au-dessus de tout (jamais sur un champ : coin bas droit). */
  var veille = document.createElement('div');
  veille.className = 'veille';
  veille.setAttribute('aria-hidden', 'true');
  veille.innerHTML =
    '<svg viewBox="-100 -100 200 200" focusable="false">' +
    '<defs><radialGradient id="ve-degrade"><stop offset="0" stop-color="#FFF3D6" stop-opacity="1"/><stop offset=".3" stop-color="#FAE2B8" stop-opacity=".55"/><stop offset="1" stop-color="#F6D9A8" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="ve-halo" r="120" fill="url(#ve-degrade)"/>' +
    '<g class="ve-rayons"><path d="M0 -92 L3 -3 L92 0 L3 3 L0 92 L-3 3 L-92 0 L-3 -3Z" fill="#FFF3D6" fill-opacity=".95"/>' +
    '<path d="M0 -50 L2.4 -2.4 L50 0 L2.4 2.4 L0 50 L-2.4 2.4 L-50 0 L-2.4 -2.4Z" fill="#FFF3D6" fill-opacity=".8" transform="rotate(45)"/></g>' +
    '<g class="ve-coeur"><circle r="14" fill="#FFF3D6"/><circle r="7.5" fill="#FFFFFF"/></g>' +
    '<path class="ve-eclat" d="M-62 -40 L-59 -43 L-62 -56 L-65 -43 L-78 -40 L-65 -37 L-62 -24 L-59 -37Z" fill="#FFFFFF"/>' +
    '<path class="ve-eclat" d="M60 -58 L62.5 -60.5 L60 -70 L57.5 -60.5 L48 -58 L57.5 -55.5 L60 -46 L62.5 -55.5Z" fill="#FFF3D6"/>' +
    '<path class="ve-eclat" d="M52 52 L54.5 49.5 L52 40 L49.5 49.5 L40 52 L49.5 54.5 L52 64 L54.5 54.5Z" fill="#FFFFFF"/>' +
    '</svg>';
  document.body.appendChild(veille);

  applique(false);
})();
