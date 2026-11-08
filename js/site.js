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
  /* Vibration à peine sentie (téléphone), jamais en mode calme ni si l'appareil ne sait pas */
  function vibre() {
    if (calme) { return; }
    try { if (navigator.vibrate) { navigator.vibrate(10); } } catch (e) { /* tant pis */ }
  }
  window.vibreDoux = vibre;

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
  /* Le ciel suit l'heure de l'appareil : le matin plus clair, le soir déjà lavande, la nuit plus étoilée. Rien n'est envoyé. */
  var heure = new Date().getHours();
  var moment = heure >= 5 && heure < 11 ? 'matin' : (heure >= 11 && heure < 18 ? 'jour' : 'soir');
  racine.classList.add('heure-' + moment);
  var nuitBase = moment === 'soir' ? (heure >= 21 || heure < 5 ? 0.35 : 0.2) : 0;

  /* Le soir qui tombe : --nuit suit le défilement (0 en haut, 1 en bas de page) */
  var nuit = document.createElement('div');
  nuit.className = 'nuit';
  nuit.setAttribute('aria-hidden', 'true');
  document.body.appendChild(nuit);
  var nuitAttente = false;
  function poseNuit() {
    nuitAttente = false;
    var course = document.documentElement.scrollHeight - window.innerHeight;
    var p = course > 0 ? Math.min(1, Math.max(0, window.scrollY / course)) : 0;
    racine.style.setProperty('--nuit', Math.min(1, nuitBase + p * p * (1 - nuitBase)).toFixed(3));
  }
  window.addEventListener('scroll', function () { if (!nuitAttente) { nuitAttente = true; window.requestAnimationFrame(poseNuit); } }, { passive: true });
  window.addEventListener('resize', poseNuit);
  poseNuit();

  /* Brumes colorées et nuages qui passent */
  var brumes = ['brume-peche', 'brume-eau', 'brume-vert'];
  for (var b = 0; b < brumes.length; b++) {
    var br = document.createElement('span');
    br.className = 'brume-page ' + brumes[b];
    ciel.appendChild(br);
  }
  var nbNuages = window.innerWidth < 700 ? 1 : 2;
  for (var q = 0; q < nbNuages; q++) {
    var nu = document.createElement('span');
    nu.className = 'nuage-passe';
    nu.style.top = (12 + q * 30 + Math.random() * 12).toFixed(0) + '%';
    var nd = 90 + Math.random() * 30;
    nu.style.setProperty('--nd', nd.toFixed(0) + 's');
    nu.style.setProperty('--nl', (-Math.random() * nd).toFixed(0) + 's');
    nu.style.setProperty('--ny', ((Math.random() - 0.5) * 8).toFixed(1) + 'vh');
    ciel.appendChild(nu);
  }
  /* Nuages ronds qui volent, notes de musique, pluie de lumière (moins nombreux sur téléphone) */
  var petit = window.innerWidth < 700;
  function pose(el, cle, val) { el.style.setProperty(cle, val); }
  var nbVol = petit ? 2 : 3;
  for (var nv = 0; nv < nbVol; nv++) {
    var nuV = document.createElement('span');
    nuV.className = 'nuage-vol' + (nv % 2 ? ' loin' : '');
    nuV.appendChild(document.createElement('i'));
    nuV.style.top = (4 + nv * (petit ? 24 : 16) + Math.random() * 8).toFixed(0) + '%';
    pose(nuV, '--nw', (petit ? 5.5 + Math.random() * 3 : 7 + Math.random() * 6).toFixed(1) + 'rem');
    var ndv = 70 + Math.random() * 50;
    pose(nuV, '--nd', ndv.toFixed(0) + 's');
    pose(nuV, '--nl', (-Math.random() * ndv).toFixed(0) + 's');
    pose(nuV, '--ny', ((Math.random() - 0.5) * 6).toFixed(1) + 'vh');
    pose(nuV, '--no', (nv % 2 ? 0.7 : 0.92).toFixed(2));
    ciel.appendChild(nuV);
  }
  var glyphes = ['\u266A', '\u266B', '\u2669', '\u266A'];
  var couleurs = ['#B87A46', '#C06A82', '#89A8B8', '#B87A46'];
  var nbNotes = petit ? 1 : 2;
  for (var nn = 0; nn < nbNotes; nn++) {
    var no = document.createElement('span');
    no.className = 'note';
    no.textContent = glyphes[nn % glyphes.length];
    pose(no, '--nx', (6 + Math.random() * 88).toFixed(0) + '%');
    pose(no, '--ns', (1.1 + Math.random() * 1).toFixed(2) + 'rem');
    pose(no, '--nc', couleurs[nn % couleurs.length]);
    var ndn = 20 + Math.random() * 12;
    pose(no, '--nd', ndn.toFixed(1) + 's');
    pose(no, '--nl', (-Math.random() * ndn).toFixed(1) + 's');
    ciel.appendChild(no);
  }

  var nb = window.innerWidth < 700 ? 5 : 8;
  /* Des étoiles qui ne s'allument que la nuit venue */
  var nbNuit = window.innerWidth < 700 ? 3 : 6;
  for (var nn2 = 0; nn2 < nbNuit; nn2++) {
    var en = document.createElement('span');
    en.className = 'etoile nuit-seule' + (Math.random() < 0.3 ? ' bleu' : '');
    en.style.left = (Math.random() * 96 + 1).toFixed(1) + '%';
    en.style.top = (Math.random() * 94 + 2).toFixed(1) + '%';
    en.style.setProperty('--t', (3 + Math.random() * 4).toFixed(1) + 'px');
    var durN = 3 + Math.random() * 4;
    en.style.setProperty('--d', durN.toFixed(1) + 's');
    en.style.setProperty('--dl', (-Math.random() * durN).toFixed(1) + 's');
    ciel.appendChild(en);
  }
  for (var n = 0; n < nb; n++) {
    var e = document.createElement('span');
    var teinte = Math.random();
    e.className = 'etoile' + (teinte < 0.17 ? ' rose' : (teinte < 0.34 ? ' bleu' : ''));
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
  /* Sur l'accueil, le ciel vivant est posé DANS la scène, derrière le texte et les boutons : rien ne passe devant un texte. */
  var hoteCiel = document.querySelector('.page-accueil .scene .ciel') || document.body;
  hoteCiel.appendChild(ciel);

  /* L'étoile qui veille : la même étoile scintillante que sur l'accueil, en petit, au-dessus de tout (jamais sur un champ : coin bas droit). */
  var veille = document.createElement('div');
  veille.className = 'veille';
  veille.setAttribute('aria-hidden', 'true');
  veille.innerHTML =
    '<svg viewBox="-100 -100 200 200" focusable="false">' +
    '<defs><radialGradient id="ve-degrade"><stop offset="0" stop-color="#FFF3D6" stop-opacity="1"/><stop offset=".3" stop-color="#F2C97D" stop-opacity=".55"/><stop offset="1" stop-color="#F6D9A8" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="ve-halo" r="120" fill="url(#ve-degrade)"/>' +
    '<g class="ve-rayons"><path d="M0 -92 L3 -3 L92 0 L3 3 L0 92 L-3 3 L-92 0 L-3 -3Z" fill="#FFF3D6" fill-opacity=".95"/>' +
    '<path d="M0 -50 L2.4 -2.4 L50 0 L2.4 2.4 L0 50 L-2.4 2.4 L-50 0 L-2.4 -2.4Z" fill="#FFF3D6" fill-opacity=".8" transform="rotate(45)"/></g>' +
    '<g class="ve-coeur"><circle r="14" fill="#FFF3D6"/><circle r="7.5" fill="#FFFFFF"/></g>' +
    '<path class="ve-eclat" d="M-62 -40 L-59 -43 L-62 -56 L-65 -43 L-78 -40 L-65 -37 L-62 -24 L-59 -37Z" fill="#FFFFFF"/>' +
    '<path class="ve-eclat" d="M60 -58 L62.5 -60.5 L60 -70 L57.5 -60.5 L48 -58 L57.5 -55.5 L60 -46 L62.5 -55.5Z" fill="#FFF3D6"/>' +
    '<path class="ve-eclat" d="M52 52 L54.5 49.5 L52 40 L49.5 49.5 L40 52 L49.5 54.5 L52 64 L54.5 54.5Z" fill="#FFFFFF"/>' +
    '</svg>';
  veille.setAttribute('role', 'button');
  veille.setAttribute('aria-label', "L'étoile qui veille (un petit secret)");
  veille.removeAttribute('aria-hidden');
  veille.setAttribute('tabindex', '0');
  function etoileRepond() {
    if (calme || veille.classList.contains('touche')) { return; }
    veille.classList.add('touche');
    vibre();
    for (var p = 0; p < 4; p++) {
      var pou = document.createElement('span');
      pou.className = 've-poussiere';
      pou.style.setProperty('--px', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
      pou.style.setProperty('--py', (-(55 + Math.random() * 50)).toFixed(0) + 'px');
      pou.style.animationDelay = (p * 0.12).toFixed(2) + 's';
      veille.appendChild(pou);
    }
    window.setTimeout(function () {
      veille.classList.remove('touche');
      var vieux = veille.querySelectorAll('.ve-poussiere');
      for (var v = 0; v < vieux.length; v++) { veille.removeChild(vieux[v]); }
    }, 2300);
  }
  veille.addEventListener('click', etoileRepond);
  veille.addEventListener('mouseenter', etoileRepond);
  veille.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); etoileRepond(); } });
  document.body.appendChild(veille);

  /* Poussière d'étoile autour du titre à l'arrivée (quatre perles, 2 s, puis plus rien) */
  var tete = document.querySelector('.page-tete');
  if (tete && !calme) {
    for (var t = 0; t < 4; t++) {
      var pt = document.createElement('span');
      pt.className = 'poussiere-titre';
      pt.setAttribute('aria-hidden', 'true');
      pt.style.left = (18 + Math.random() * 64).toFixed(0) + '%';
      pt.style.top = (10 + Math.random() * 70).toFixed(0) + '%';
      pt.style.setProperty('--pl', (0.4 + t * 0.25).toFixed(2) + 's');
      pt.style.setProperty('--px', ((Math.random() - 0.5) * 30).toFixed(0) + 'px');
      tete.appendChild(pt);
    }
  }
  /* Titres de section hors .apparait : le trait rose se dessine quand le titre entre à l'écran */
  var titres = document.querySelectorAll('.contenu h2, .pied h2');
  if (observateur) {
    var obsTitres = new IntersectionObserver(function (entrees) {
      for (var i = 0; i < entrees.length; i++) {
        if (entrees[i].isIntersecting) { entrees[i].target.parentNode.classList.add('trait-vu'); obsTitres.unobserve(entrees[i].target); }
      }
    }, { threshold: 0.5 });
    for (var tt = 0; tt < titres.length; tt++) { obsTitres.observe(titres[tt]); }
  } else {
    for (var tu = 0; tu < titres.length; tu++) { titres[tu].parentNode.classList.add('trait-vu'); }
  }

  /* L'introduction (Le livre) : chaque phrase arrive l'une après l'autre, comme une lecture lente ; le cœur du Doudou qui parle s'allume */
  var volets = document.querySelectorAll('.intro-volet');
  for (var vo = 0; vo < volets.length; vo++) {
    var paras = volets[vo].querySelectorAll('p');
    var rang = 0;
    for (var pa = 0; pa < paras.length; pa++) {
      var morceaux = paras[pa].innerHTML.split(/([.!?\u2026])\s+(?=[^<\s])/);
      var phrases = [];
      for (var mo = 0; mo < morceaux.length; mo += 2) { phrases.push(morceaux[mo] + (morceaux[mo + 1] || '')); }
      paras[pa].innerHTML = phrases.map(function (m) {
        var d = 0.25 + rang * 0.55; rang++;
        return '<span class="phrase" style="transition-delay:' + d.toFixed(2) + 's">' + m + '</span>';
      }).join(' ');
    }
    var vc = document.createElement('span');
    vc.className = 'volet-coeur';
    vc.setAttribute('aria-hidden', 'true');
    volets[vo].appendChild(vc);
    (function (el, n) { window.setTimeout(function () { el.classList.add('lu'); }, 1200 + n * 600); })(volets[vo], rang);
  }

  /* Un cœur de lumière dans chaque cadre portrait (L'univers) */
  var cadres = document.querySelectorAll('.cadre-portrait');
  for (var c = 0; c < cadres.length; c++) {
    var coeur = document.createElement('span');
    coeur.className = 'coeur-page';
    coeur.setAttribute('aria-hidden', 'true');
    cadres[c].appendChild(coeur);
  }

  /* Boîte à musique facultative : le bouton n'apparaît que si le fichier son existe ; jamais de lecture automatique. */
  var ecouter = document.querySelector('[data-ecouter]');
  var boite = document.getElementById('boite-a-musique');
  if (ecouter && boite && window.fetch) {
    fetch(boite.getAttribute('src'), { method: 'HEAD' }).then(function (r) {
      if (!r.ok) { return; }
      ecouter.hidden = false;
      ecouter.addEventListener('click', function () {
        if (boite.paused) { boite.volume = 0.5; boite.play().then(function () { ecouter.setAttribute('aria-pressed', 'true'); ecouter.textContent = 'Arrêter la boîte à musique'; }).catch(function () {}); }
        else { boite.pause(); ecouter.setAttribute('aria-pressed', 'false'); ecouter.textContent = 'Écouter la boîte à musique'; }
      });
    }).catch(function () {});
  }

  /* Le stylo rose écrit la dernière ligne de l'accroche, une fois par visite */
  var ecrit = document.querySelector('.page-accueil .ecrit');
  if (ecrit && !calme) {
    var dejaEcrit = null;
    try { dejaEcrit = window.sessionStorage.getItem('ecrit'); } catch (e) { dejaEcrit = null; }
    if (!dejaEcrit) {
      ecrit.classList.add('ecrit-vif');
      try { window.sessionStorage.setItem('ecrit', '1'); } catch (e) { /* tant pis */ }
    }
  }

  /* Le nom du site s'écrit à la main une fois par visite, sur l'accueil */
  var nom = document.querySelector('.page-accueil .nom-du-site');
  if (nom && !calme) {
    var signe = null;
    try { signe = window.sessionStorage.getItem('signe'); } catch (e) { signe = null; }
    if (!signe) {
      nom.classList.add('signe');
      try { window.sessionStorage.setItem('signe', '1'); } catch (e) { /* tant pis */ }
    }
  }

  /* La page L'Étoile : de petites étoiles fixes dans la nuit */
  var cielEtoile = document.querySelector('.etoile-ciel');
  if (cielEtoile) {
    for (var ce = 0; ce < 28; ce++) {
      var pt = document.createElement('span');
      pt.className = 'etoile-pt';
      pt.style.left = (Math.random() * 96 + 2).toFixed(1) + '%';
      pt.style.top = (Math.random() * 96 + 2).toFixed(1) + '%';
      var dpt = 3 + Math.random() * 5;
      pt.style.setProperty('--d', dpt.toFixed(1) + 's');
      pt.style.setProperty('--dl', (-Math.random() * dpt).toFixed(1) + 's');
      cielEtoile.appendChild(pt);
    }
  }

  /* Respirer avec l'Étoile (page L'Étoile) : appuyer = inspirer, relâcher = expirer, trois fois */
  var souffle = document.querySelector('[data-souffle]');
  var cielEtoileS = document.querySelector('.etoile-ciel');
  if (souffle && cielEtoileS) {
    var sBouton = souffle.querySelector('.souffle-bouton');
    var sPoints = souffle.querySelectorAll('.souffle-pas i');
    var sFin = souffle.querySelector('.souffle-fin');
    var respirations = 0, enCours = false, debut = 0;
    function inspire(e) {
      if (enCours) { return; }
      if (e && e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') { return; }
      if (e && e.preventDefault) { e.preventDefault(); }
      enCours = true; debut = Date.now();
      cielEtoileS.classList.add('inspire'); souffle.classList.add('en-cours');
      vibre();
    }
    function expire(e) {
      if (!enCours) { return; }
      if (e && e.type === 'keyup' && e.key !== ' ' && e.key !== 'Enter') { return; }
      enCours = false;
      cielEtoileS.classList.remove('inspire'); souffle.classList.remove('en-cours');
      if (Date.now() - debut > 1200 && respirations < 3) {
        respirations++;
        for (var sp = 0; sp < sPoints.length; sp++) { sPoints[sp].classList.toggle('fait', sp < respirations); }
        if (respirations === 3) { sFin.hidden = false; }
      }
    }
    sBouton.addEventListener('pointerdown', inspire);
    sBouton.addEventListener('pointerup', expire);
    sBouton.addEventListener('pointercancel', expire);
    sBouton.addEventListener('pointerleave', expire);
    sBouton.addEventListener('keydown', inspire);
    sBouton.addEventListener('keyup', expire);
    sBouton.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  /* L'univers : toucher un personnage, il dit sa première phrase (texte de Nath) dans une bulle qui s'efface */
  var persos = document.querySelectorAll('.bandeau[class*="perso-"]');
  for (var pe = 0; pe < persos.length; pe++) {
    (function (sec) {
      var cadre = sec.querySelector('.cadre-portrait');
      var para = sec.querySelector('.deux-colonnes p');
      if (!cadre || !para) { return; }
      var premiere = (para.textContent.match(/^[^.!?…]+[.!?…]+/) || [para.textContent])[0].trim();
      var bulle = document.createElement('span');
      bulle.className = 'bulle';
      bulle.setAttribute('role', 'status');
      bulle.textContent = premiere;
      cadre.appendChild(bulle);
      var minuteur = null;
      function parle() {
        vibre();
        bulle.classList.add('visible');
        window.clearTimeout(minuteur);
        minuteur = window.setTimeout(function () { bulle.classList.remove('visible'); }, 4200);
      }
      cadre.addEventListener('click', parle);
      if (!cadre.hasAttribute('tabindex')) { cadre.setAttribute('tabindex', '0'); cadre.setAttribute('role', 'button'); cadre.setAttribute('aria-label', sec.querySelector('h2').textContent + ' : écouter sa phrase'); }
      cadre.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); parle(); } });
    })(persos[pe]);
  }

  /* La fenêtre de Lili (Le livre) : on écarte le rideau soi-même */
  var fenetreScene = document.querySelector('.fenetre-scene');
  var rideauBouton = document.querySelector('[data-rideau]');
  if (fenetreScene && rideauBouton) {
    var ouvreRideau = function () {
      fenetreScene.classList.add('ouverte');
      vibre();
      rideauBouton.setAttribute('aria-expanded', 'true');
    };
    if (calme) { ouvreRideau(); }
    rideauBouton.addEventListener('click', ouvreRideau);
    fenetreScene.querySelector('.fenetre').addEventListener('click', ouvreRideau);
    document.addEventListener('calme-change', function (e) { if (e.detail && e.detail.calme) { ouvreRideau(); } });
  }

  /* Le secret du gilet (L'univers) */
  var lili = document.querySelector('.bandeau-rose .cadre-portrait');
  if (lili) {
    var manche = document.createElement('span');
    manche.className = 'manche-doudou';
    manche.setAttribute('aria-hidden', 'true');
    manche.innerHTML = '<img src="images/personnages/doudou-dort.webp" width="280" height="396" alt="">';
    lili.appendChild(manche);
    lili.setAttribute('role', 'button'); lili.setAttribute('tabindex', '0');
    lili.setAttribute('aria-label', 'Lili et son gilet (un petit secret)');
    var blotti = function () {
      if (calme || lili.classList.contains('blotti')) { return; }
      lili.classList.add('blotti');
      vibre();
      for (var nm = 0; nm < 2; nm++) {
        var note = document.createElement('span');
        note.className = 'note-manche';
        note.textContent = nm ? '\u266B' : '\u266A';
        note.style.setProperty('--nl', (0.4 + nm * 0.35).toFixed(2) + 's');
        note.style.setProperty('--nx', ((Math.random() - 0.5) * 50).toFixed(0) + 'px');
        note.style.setProperty('--nc', nm ? '#89A8B8' : '#C06A82');
        lili.appendChild(note);
      }
      window.setTimeout(function () {
        lili.classList.remove('blotti');
        var vn = lili.querySelectorAll('.note-manche');
        for (var x = 0; x < vn.length; x++) { lili.removeChild(vn[x]); }
      }, 3400);
    };
    lili.addEventListener('click', blotti);
    lili.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blotti(); } });
  }

  /* Mode veilleuse : bleu nuit tamisé, gardé le temps de la visite (sessionStorage, jamais envoyé) */
  var boutonsLune = document.querySelectorAll('[data-veilleuse]');
  var nuitMode = false;
  try { nuitMode = window.sessionStorage.getItem('veilleuse') === '1'; } catch (e) { nuitMode = false; }
  function appliqueLune() {
    racine.classList.toggle('nuit-mode', nuitMode);
    for (var l = 0; l < boutonsLune.length; l++) { boutonsLune[l].setAttribute('aria-pressed', nuitMode ? 'true' : 'false'); }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', nuitMode ? '#232A47' : '#EFE3CE'); }
  }
  for (var m = 0; m < boutonsLune.length; m++) {
    boutonsLune[m].addEventListener('click', function () {
      nuitMode = !nuitMode;
      try { window.sessionStorage.setItem('veilleuse', nuitMode ? '1' : '0'); } catch (e) { /* tant pis */ }
      appliqueLune();
    });
  }
  appliqueLune();

  /* La veillée (accueil) : trois phrases de Doudou Tout-Mou, puis le livre ; le site passe en mode veilleuse */
  var boutonVeillee = document.querySelector('[data-veillee]');
  var boite = document.querySelector('[data-veillee-boite]');
  if (boutonVeillee && boite) {
    var phrases = [
      'Bonjour toi ! Je suis Doudou Tout-Mou, farceur et bavard.',
      'Je suis petit, tout blanc, tout doux, et tout mou parce qu’on me serre très fort, toutes les nuits.',
      'Et toi, en t’installant bien confortablement… L’histoire va commencer…'
    ];
    var pas = 0, dernierFocus = null;
    var phraseEl = boite.querySelector('.veillee-phrase');
    var suite = boite.querySelector('[data-veillee-suite]');
    var fermer = boite.querySelector('[data-veillee-fermer]');
    var points = boite.querySelectorAll('.veillee-pas i');
    function montrePhrase() {
      phraseEl.innerHTML = '';
      var mots = phrases[pas].split(' ');
      for (var mo = 0; mo < mots.length; mo++) {
        var sp = document.createElement('span');
        sp.textContent = mots[mo] + (mo < mots.length - 1 ? '\u00A0' : '');
        sp.style.animationDelay = (calme ? 0 : mo * 0.09).toFixed(2) + 's';
        phraseEl.appendChild(sp);
      }
      for (var pt = 0; pt < points.length; pt++) { points[pt].classList.toggle('fait', pt <= pas); }
      suite.textContent = pas < phrases.length - 1 ? 'Continuer' : 'Ouvrir le livre';
    }
    function ouvreVeillee() {
      dernierFocus = document.activeElement;
      pas = 0;
      if (!nuitMode) { nuitMode = true; try { window.sessionStorage.setItem('veilleuse', '1'); } catch (e) { /* tant pis */ } appliqueLune(); }
      boite.hidden = false;
      document.body.style.overflow = 'hidden';
      montrePhrase();
      suite.focus();
    }
    function fermeVeillee() {
      boite.hidden = true;
      document.body.style.overflow = '';
      if (dernierFocus && dernierFocus.focus) { dernierFocus.focus(); }
    }
    boutonVeillee.addEventListener('click', ouvreVeillee);
    suite.addEventListener('click', function () {
      if (pas < phrases.length - 1) { pas++; montrePhrase(); }
      else { window.location.href = 'le-livre.html'; }
    });
    fermer.addEventListener('click', fermeVeillee);
    boite.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { fermeVeillee(); }
      if (e.key === 'Tab') { /* le focus reste dans la boîte */
        var f = [suite, fermer];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* Menu repliable (téléphone) */
  var menuBouton = document.querySelector('[data-menu]');
  var menuNav = document.querySelector('.menu');
  if (menuBouton && menuNav) {
    menuBouton.addEventListener('click', function () {
      var ouvert = menuNav.classList.toggle('ouvert');
      menuBouton.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuNav.classList.contains('ouvert')) { menuNav.classList.remove('ouvert'); menuBouton.setAttribute('aria-expanded', 'false'); menuBouton.focus(); }
    });
  }

  applique(false);
})();
