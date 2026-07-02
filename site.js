/* LCH personal site, interactions. Vanilla, no dependencies. */
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---- theme toggle (remembers choice) ---------------------------------- */
  try {
    var saved = localStorage.getItem('lch-theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch (e) {}
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark';
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('lch-theme', next); } catch (e) {}
    });
  }

  /* ---- booking dialog --------------------------------------------------- */
  var dialog = document.getElementById('booking');
  var toast = document.getElementById('toast');
  var lastFocus = null;

  function openBooking() {
    lastFocus = document.activeElement;
    dialog.hidden = false;
    var first = dialog.querySelector('input, select, textarea');
    if (first) first.focus();
  }
  function closeBooking() {
    dialog.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.js-book').forEach(function (b) {
    b.addEventListener('click', openBooking);
  });
  document.querySelectorAll('.js-close-book').forEach(function (b) {
    b.addEventListener('click', closeBooking);
  });
  if (dialog) {
    dialog.addEventListener('mousedown', function (e) {
      if (e.target === dialog) closeBooking();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dialog && !dialog.hidden) closeBooking();
  });

  /* ---- booking submit -> mo email khach voi noi dung dien san ----------- */
  var BOOKING_EMAIL = 'leconghoangstudio@gmail.com';
  var form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (form.elements.name.value || '').trim();
      var email = (form.elements.email.value || '').trim();
      var job = (form.elements.job.value || '').trim();
      var why = (form.elements.why.value || '').trim();
      var subject = 'Giu mot cho trong lop: ' + name;
      var body = 'Ten: ' + name +
        '\nEmail: ' + email +
        (job ? '\nNghe: ' + job : '') +
        (why ? '\nCho dang ngon nhieu gio nhat: ' + why : '') +
        '\n\n(Gui tu trang khoa hoc, chua thu phi o buoc nay)';
      window.location.href = 'mailto:' + BOOKING_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      closeBooking();
      form.reset();
      showToast();
    });
  }
  var toastTimer = null;
  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 3200);
  }
  document.querySelectorAll('.js-close-toast').forEach(function (b) {
    b.addEventListener('click', function () {
      if (toast) toast.hidden = true;
      clearTimeout(toastTimer);
    });
  });

  /* ---- writing filter --------------------------------------------------- */
  var filters = document.querySelectorAll('.writing-filters .tag');
  var posts = document.querySelectorAll('.writing-list .post');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.remove('tag-active'); });
      f.classList.add('tag-active');
      var cat = f.getAttribute('data-cat');
      posts.forEach(function (p) {
        var show = cat === 'Tất cả' || p.getAttribute('data-cat') === cat;
        p.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---- waveform bars ---------------------------------------------------- */
  var HS = [46, 78, 60, 92, 54, 82, 44, 88, 64, 36, 74, 92, 58, 80, 48, 86, 64, 42, 76, 90, 52, 84];
  document.querySelectorAll('.waveform').forEach(function (w) {
    var n = parseInt(w.getAttribute('data-bars'), 10) || 22;
    var html = '';
    for (var i = 0; i < n; i++) {
      html += '<span style="height:' + HS[i % HS.length] + '%"></span>';
    }
    w.innerHTML = html;
  });
})();
