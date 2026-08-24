/* Comportamentos compartilhados da vitrine de produtos.
   Sem dependências: nav sticky, reveal ao rolar, contadores e acordeão exclusivo. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ano no rodapé ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- nav ganha borda ao rolar ---------- */
  var nav = document.querySelector('.pnav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 6); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal ao entrar na viewport ---------- */
  var revealables = document.querySelectorAll('.rv, .rv-mk');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) {
      // escalona irmãos do mesmo container para o grid "montar" em cascata
      var parent = el.parentElement;
      var siblings = parent ? parent.querySelectorAll(':scope > .rv, :scope > .rv-mk') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 6) * 60 + 'ms';
      io.observe(el);
    });

    // Rede de segurança em duas camadas: nenhum conteúdo pode ficar invisível
    // se o observer não disparar (aba em segundo plano, renderizador ocioso).
    var revealVisiveis = function () {
      var vh = window.innerHeight;
      Array.prototype.forEach.call(revealables, function (el) {
        if (el.classList.contains('in')) return;
        if (el.getBoundingClientRect().top < vh * 1.15) el.classList.add('in');
      });
    };

    window.setTimeout(revealVisiveis, 1400);

    // O evento de rolagem não depende do observer: se ele falhar, isto cobre.
    var agendado = false;
    window.addEventListener('scroll', function () {
      if (agendado) return;
      agendado = true;
      window.requestAnimationFrame(function () {
        agendado = false;
        revealVisiveis();
      });
    }, { passive: true });
  }

  /* ---------- contadores (aparecem só onde houver data-count) ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var animate = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;
      if (reduce) { el.textContent = target + suffix; return; }
      var started = null;
      var duration = 1100;
      var tick = function (now) {
        if (started === null) started = now;
        var p = Math.min((now - started) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(counters, animate);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          cio.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    }
  }

  /* ---------- FAQ: abrir uma pergunta fecha as outras ---------- */
  var faq = document.querySelector('.faq');
  if (faq) {
    var items = faq.querySelectorAll('details');
    Array.prototype.forEach.call(items, function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        Array.prototype.forEach.call(items, function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }
})();
