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

  /* ---------- Fil doré le long du bord (comme sur armonilux) ----------
     Un fil pâle toujours là, un fil vif qui se dessine au défilement, une petite fleur au bout.
     Tracé ondulant et irrégulier (deux ondes mêlées), recalculé si la page change de hauteur. */
  var NS = 'http://www.w3.org/2000/svg';
  var fil = null, pale = null, vif = null, fleur = null, longueur = 0, attenteFil = false;

  function el(nom, attrs) {
    var e = document.createElementNS(NS, nom);
    for (var cle in attrs) { if (attrs.hasOwnProperty(cle)) { e.setAttribute(cle, attrs[cle]); } }
    return e;
  }

  function construitFil() {
    var L = racine.clientWidth;
    var H = document.body.offsetHeight;
    var etroit = L < 700;
    var base = etroit ? 9 : 34, amp = etroit ? 7 : 26, pas = 60;
    var pts = [], i;
    for (i = 0; i * pas <= H + pas; i++) {
      var y = i * pas;
      pts.push([base + amp * (0.62 * Math.sin(y / 330 + 1.3) + 0.38 * Math.sin(y / 127 + 4.1)), y]);
    }
    var d = 'M' + pts[0][0].toFixed(1) + ' 0';
    for (i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ' Q' + pts[i][0].toFixed(1) + ' ' + pts[i][1] + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
    }
    if (!fil) {
      fil = el('svg', { 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'none' });
      pale = el('path', { 'class': 'fil-pale' });
      vif = el('path', { 'class': 'fil-vif' });
      fleur = el('g', { 'class': 'fil-fleur' });
      /* Un stylo rose, pointe sur le bout du fil, incliné comme une main qui écrit */
      var stylo = el('g', { transform: 'rotate(32)' });
      stylo.appendChild(el('path', { d: 'M0 0 L-3.2 -9 L3.2 -9 Z', fill: '#E8BDA9' }));
      stylo.appendChild(el('path', { d: 'M0 0 L-1 -3 L1 -3 Z', fill: '#7C5C43' }));
      stylo.appendChild(el('rect', { x: -3.2, y: -30, width: 6.4, height: 21, rx: 1, fill: '#C06A82' }));
      stylo.appendChild(el('rect', { x: -3.2, y: -12, width: 6.4, height: 2, fill: '#F6D9A8' }));
      stylo.appendChild(el('rect', { x: -3.2, y: -34, width: 6.4, height: 5, rx: 2, fill: '#A9546C' }));
      fleur.appendChild(stylo);
      fil.appendChild(pale); fil.appendChild(vif); fil.appendChild(fleur);
      var porte = document.createElement('div');
      porte.className = 'fil-lateral';
      porte.setAttribute('aria-hidden', 'true');
      porte.appendChild(fil);
      document.body.appendChild(porte);
    }
    fil.setAttribute('width', L);
    fil.setAttribute('height', H);
    fil.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    pale.setAttribute('d', d);
    vif.setAttribute('d', d);
    longueur = vif.getTotalLength();
    vif.setAttribute('stroke-dasharray', longueur);
    metFil();
  }

  function metFil() {
    attenteFil = false;
    if (!fil) { return; }
    var h = racine.scrollHeight - window.innerHeight;
    var p = calme ? 1 : (h > 0 ? Math.min(1, Math.max(0, (window.pageYOffset || racine.scrollTop) / h)) : 1);
    vif.setAttribute('stroke-dashoffset', (longueur * (1 - p)).toFixed(1));
    if (calme || p < 0.005) {
      fleur.setAttribute('opacity', 0);
    } else {
      var pt = vif.getPointAtLength(longueur * p);
      var echelle = racine.clientWidth < 700 ? 0.85 : 1.1;
      fleur.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') scale(' + echelle + ')');
      fleur.setAttribute('opacity', 1);
    }
  }
  function demandeFil() {
    metFil(); /* très léger : deux attributs à poser, pas besoin d'attendre l'image suivante */
  }
  var minuteur = null;
  function reconstruit() { window.clearTimeout(minuteur); minuteur = window.setTimeout(construitFil, 200); }

  construitFil();
  window.addEventListener('scroll', demandeFil, { passive: true });
  window.addEventListener('resize', reconstruit);
  window.addEventListener('load', reconstruit);
  if (window.ResizeObserver) { new ResizeObserver(reconstruit).observe(document.body); }
  document.addEventListener('calme-change', demandeFil);

  applique(false);
})();
