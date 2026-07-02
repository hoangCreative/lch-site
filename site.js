/* Lê Công Hoàng · site.js · dùng chung 4 trang, không framework */
(function(){
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme: theo hệ máy, nhớ lựa chọn ---------- */
  var fixed = root.hasAttribute('data-fixed-theme');
  if (!fixed){
    var stored = null;
    try{ stored = localStorage.getItem('lch-theme'); }catch(e){}
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme(t){ root.setAttribute('data-theme', t); }
    applyTheme(stored === 'dark' || stored === 'light' ? stored : (mq.matches ? 'dark' : 'light'));
    if (mq.addEventListener){
      mq.addEventListener('change', function(e){
        var s = null;
        try{ s = localStorage.getItem('lch-theme'); }catch(err){}
        if (!s) applyTheme(e.matches ? 'dark' : 'light');
      });
    }
    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try{ localStorage.setItem('lch-theme', next); }catch(e){}
      });
    });
  }

  /* ---------- dialog giữ chỗ (chỉ index) ---------- */
  var scrim = document.getElementById('booking');
  if (scrim){
    var lastFocus = null;
    function openBook(){
      lastFocus = document.activeElement;
      scrim.hidden = false;
      var first = scrim.querySelector('input[name="name"]');
      if (first) first.focus();
    }
    function closeBook(){
      scrim.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll('.js-book').forEach(function(b){ b.addEventListener('click', openBook); });
    scrim.querySelectorAll('.js-close-book').forEach(function(b){ b.addEventListener('click', closeBook); });
    scrim.addEventListener('click', function(e){ if (e.target === scrim) closeBook(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !scrim.hidden) closeBook(); });

    var form = document.getElementById('booking-form');
    var toast = document.getElementById('toast');
    function showToast(title, msg){
      if (!toast) return;
      var t = toast.querySelector('.toast-title'); if (t && title) t.textContent = title;
      var m = toast.querySelector('.toast-msg'); if (m && msg) m.textContent = msg;
      toast.hidden = false;
      setTimeout(function(){ toast.hidden = true; }, 12000);
    }
    if (form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        if (form.querySelector('[name="bot-field"]').value) return; /* honeypot */
        var v = function(n){ var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
        var fields = { 'form-name': 'giu-cho', name: v('name'), email: v('email'), job: v('job'), why: v('why') };
        var urlBody = Object.keys(fields).map(function(k){
          return encodeURIComponent(k) + '=' + encodeURIComponent(fields[k]);
        }).join('&');
        function guiQuaEmail(){
          var mailBody = 'Tên: ' + fields.name + '\nEmail: ' + fields.email + '\nNghề: ' + fields.job + '\nChỗ đang ngốn nhiều giờ nhất: ' + fields.why;
          window.location.href = 'mailto:leconghoangstudio@gmail.com?subject=' +
            encodeURIComponent('Giữ một chỗ · Mua lại thời gian của chính bạn') +
            '&body=' + encodeURIComponent(mailBody);
          closeBook();
          form.reset();
          showToast('Một bước nữa là xong', 'Ứng dụng email của bạn đang mở với nội dung điền sẵn, bấm Gửi là xong. Không thấy gì mở ra? Nhắn Zalo 0906 300 191 hoặc gửi thẳng về leconghoangstudio@gmail.com nhé.');
        }
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: urlBody
        }).then(function(r){
          if (!r.ok) throw new Error('no form backend');
          closeBook();
          form.reset();
          showToast('Đã ghi nhận', 'Đăng ký của bạn đã tới nơi. Mình sẽ liên hệ lại sớm nhé.');
        }).catch(guiQuaEmail);
      });
    }
    if (toast){
      toast.querySelectorAll('.js-close-toast').forEach(function(b){
        b.addEventListener('click', function(){ toast.hidden = true; });
      });
    }
  }

  /* ---------- thanh tiến độ đọc (ai-journey) ---------- */
  var bar = document.getElementById('progress');
  if (bar){
    var onScroll = function(){
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- hiện dần khi cuộn tới ---------- */
  var rvEls = document.querySelectorAll('.rv');
  if (rvEls.length && 'IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rvEls.forEach(function(el){ io.observe(el); });
  } else {
    rvEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- số đếm chạy ---------- */
  function runCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced){ el.textContent = target + suffix; return; }
    var t0 = null, dur = 1100, done = false;
    function step(ts){
      if (done) return;
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step); else done = true;
    }
    requestAnimationFrame(step);
    setTimeout(function(){ if (!done){ done = true; el.textContent = target + suffix; } }, dur + 300);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length){
    if ('IntersectionObserver' in window){
      var ioNum = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ runCount(e.target); ioNum.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function(el){ ioNum.observe(el); });
    } else {
      counters.forEach(runCount);
    }
  }

  /* ---------- email/zalo: luon cho thay dia chi that, khong im lang neu may khong mo duoc app ---------- */
  var miniToastTimer = null;
  function miniToast(msg){
    var t = document.getElementById('mini-toast');
    if (!t){
      t = document.createElement('div');
      t.id = 'mini-toast';
      t.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);max-width:90vw;background:#1f1d18;color:#fff;padding:11px 20px;border-radius:999px;font-size:13.5px;line-height:1.4;z-index:9999;box-shadow:0 8px 28px rgba(0,0,0,.28);opacity:0;transition:opacity .2s;text-align:center;font-family:inherit;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(miniToastTimer);
    miniToastTimer = setTimeout(function(){ t.style.opacity = '0'; }, 5000);
  }
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
    a.addEventListener('click', function(){
      var email = a.getAttribute('href').replace('mailto:', '').split('?')[0];
      try{ navigator.clipboard.writeText(email); }catch(e){}
      miniToast('Email: ' + email + ' (đã copy, dán vào nếu ứng dụng mail không tự mở)');
    });
  });
  document.querySelectorAll('a[href*="zalo.me/"]').forEach(function(a){
    a.addEventListener('click', function(){
      var m = a.getAttribute('href').match(/zalo\.me\/(\d+)/);
      var phone = m ? m[1] : a.textContent.trim();
      try{ navigator.clipboard.writeText(phone); }catch(e){}
      miniToast('Zalo: ' + phone + ' (đã copy, dán vào nếu app Zalo không tự mở)');
    });
  });
})();
