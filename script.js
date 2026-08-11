(function () {
  'use strict';

  var PAW_COUNT = 22;
  var WEDDING_TARGET_UTC = Date.UTC(2026, 9, 25, 18, 0, 0); // 25 Oct 2026, 19:00 GMT+1

  // purple, lavender, light yellow, dark yellow, creamy
  var PALETTE = ['#3B1C5A', '#C6B7E2', '#F2E0AC', '#E6B44C', '#E3D5BC'];

  var envelope = document.getElementById('envelope');
  var openBtn = document.getElementById('openBtn'); // currently commented out in the markup
  var openBtnWrap = document.getElementById('openBtnWrap');
  var tapHint = document.getElementById('tapHint');
  var hero = document.querySelector('.hero');
  var trailPath = document.getElementById('trailPath');
  var pawsLayer = document.getElementById('pawsLayer');
  var pawRow = document.getElementById('pawRow');

  var opened = false;

  // The rest of the invitation stays sealed until the envelope is opened.
  document.body.classList.add('locked');

  function openLetter() {
    if (opened) return;
    opened = true;
    envelope.classList.add('opened');

    if (openBtnWrap) {
      openBtnWrap.style.opacity = '0';
      openBtnWrap.style.pointerEvents = 'none';
    }
    if (tapHint) tapHint.style.opacity = '0';

    setTimeout(function () {
      envelope.classList.add('flown');
    }, 1050);

    // Drop the hero entirely so the message section becomes the top of the page,
    // then hand scrolling back to the reader.
    setTimeout(function () {
      hero.style.display = 'none';
      document.body.classList.remove('locked');
      window.scrollTo(0, 0);
      layoutPaws();
    }, 1750);
  }

  envelope.addEventListener('click', openLetter);
  if (openBtn) openBtn.addEventListener('click', openLetter);

  function pawShape(fill) {
    var ns = 'http://www.w3.org/2000/svg';
    var g = document.createElementNS(ns, 'g');
    g.setAttribute('fill', fill || '#B7A6D8');
    g.setAttribute('opacity', '0.85');

    var shapes = [
      { cx: 0, cy: 4, rx: 6.4, ry: 5 },
      { cx: -6, cy: -4.4, rx: 2.5, ry: 3.2 },
      { cx: -2, cy: -7.2, rx: 2.5, ry: 3.4 },
      { cx: 2.4, cy: -7.2, rx: 2.5, ry: 3.4 },
      { cx: 6.2, cy: -4.2, rx: 2.5, ry: 3.2 }
    ];

    shapes.forEach(function (s) {
      var el = document.createElementNS(ns, 'ellipse');
      el.setAttribute('cx', s.cx);
      el.setAttribute('cy', s.cy);
      el.setAttribute('rx', s.rx);
      el.setAttribute('ry', s.ry);
      g.appendChild(el);
    });

    return g;
  }

  // Footer: a wandering row of paws, each a different colour from the palette.
  function buildFooterPaws() {
    if (!pawRow) return;
    var ns = 'http://www.w3.org/2000/svg';
    var tilts = [-16, 12, -8, 16, -14, 10, -6, 18, -12, 8];

    for (var i = 0; i < tilts.length; i++) {
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '26');
      svg.setAttribute('height', '26');
      svg.setAttribute('viewBox', '-14 -14 28 28');
      svg.style.transform =
        'rotate(' + tilts[i] + 'deg)' + (i % 2 ? ' translateY(-6px)' : '');
      svg.appendChild(pawShape(PALETTE[i % PALETTE.length]));
      pawRow.appendChild(svg);
    }
  }

  function layoutPaws() {
    if (!trailPath || !trailPath.getTotalLength) return;
    var total = trailPath.getTotalLength();
    var count = Math.max(6, PAW_COUNT);

    pawsLayer.innerHTML = '';

    for (var i = 0; i < count; i++) {
      var l = (total * (i + 0.5)) / count;
      var p = trailPath.getPointAtLength(l);
      var q = trailPath.getPointAtLength(Math.min(total, l + 2));
      var a = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
      var side = i % 2 === 0 ? 7 : -7;
      var rad = ((a - 90) * Math.PI) / 180;
      var ox = Math.cos(rad + Math.PI / 2) * side;
      var oy = Math.sin(rad + Math.PI / 2) * side;

      var paw = pawShape('#B7A6D8');
      paw.setAttribute(
        'transform',
        'translate(' + (p.x + ox).toFixed(1) + ' ' + (p.y + oy).toFixed(1) + ') rotate(' + a.toFixed(1) + ') scale(1.15)'
      );
      pawsLayer.appendChild(paw);
    }
  }

  var cdDays = document.getElementById('cdDays');
  var cdHours = document.getElementById('cdHours');
  var cdMinutes = document.getElementById('cdMinutes');
  var cdSeconds = document.getElementById('cdSeconds');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    var diff = Math.max(0, WEDDING_TARGET_UTC - Date.now());
    var s = Math.floor(diff / 1000);
    cdDays.textContent = String(Math.floor(s / 86400));
    cdHours.textContent = pad(Math.floor(s / 3600) % 24);
    cdMinutes.textContent = pad(Math.floor(s / 60) % 60);
    cdSeconds.textContent = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
  buildFooterPaws();

  // Lay the trail out straight away, and again on load/resize. rAF alone isn't
  // enough: it never fires while the page is in a background tab.
  layoutPaws();
  requestAnimationFrame(layoutPaws);
  window.addEventListener('load', layoutPaws);
  window.addEventListener('resize', layoutPaws);
})();
