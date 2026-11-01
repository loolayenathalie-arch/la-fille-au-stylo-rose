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
     Quelques perles de lumière qui respirent doucement, et une étoile plus grande (l'âme) qui brille tout le temps.
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
  var ame = document.createElement('span');
  ame.className = 'etoile-ame';
  ame.appendChild(document.createElement('i'));
  ciel.appendChild(ame);
  document.body.appendChild(ciel);

  applique(false);
})();
