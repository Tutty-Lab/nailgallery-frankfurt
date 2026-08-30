/* Bild-Lightbox: jedes Foto per Klick in Vollbild, mit Vor/Zurück-Navigation. */
(function () {
  if (window.matchMedia && window.matchMedia('(hover:none)') && false) { /* noop */ }

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML =
    '<button class="lb-close" type="button" aria-label="Schließen">×</button>' +
    '<button class="lb-nav lb-prev" type="button" aria-label="Vorheriges Bild">‹</button>' +
    '<button class="lb-nav lb-next" type="button" aria-label="Nächstes Bild">›</button>' +
    '<figure class="lb-stage"><img class="lb-img" alt=""></figure>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('.lb-img');

  // Alle inhaltlichen Bilder sammeln (Nav ausgeschlossen, Lightbox-Bild ausgeschlossen).
  var imgs = [].slice.call(document.querySelectorAll('img')).filter(function (im) {
    if (im.classList.contains('lb-img')) return false;
    if (im.closest('nav')) return false;
    if (im.closest('.philo-media')) return false;   // Deko-Szene + Rahmen-Slider: nicht zoomen
    if (im.closest('[data-no-lightbox]') || im.hasAttribute('data-no-lightbox')) return false;
    if (!im.getAttribute('src')) return false;
    return true;
  });
  if (!imgs.length) return;

  var idx = 0;

  function show(i) {
    idx = (i + imgs.length) % imgs.length;
    var src = imgs[idx].currentSrc || imgs[idx].src;
    lbImg.src = src;
    lbImg.alt = imgs[idx].alt || '';
  }
  function open(i) {
    show(i);
    document.body.classList.add('lb-open');
  }
  function close() {
    document.body.classList.remove('lb-open');
  }

  imgs.forEach(function (im, i) {
    im.style.cursor = 'zoom-in';
    im.addEventListener('click', function (e) {
      var a = im.closest('a');
      if (a) e.preventDefault();
      e.stopPropagation();
      open(i);
    });
  });

  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });

  document.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('lb-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Wischgesten auf Mobil
  var sx = 0, sy = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
