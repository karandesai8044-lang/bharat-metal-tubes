// Bharat Metal & Tubes — main script
var BMT_WA    = '919300002940';                 // business WhatsApp
var BMT_EMAIL = 'bharatmetal2013@gmail.com';    // business email

// ---------------------------------------------------------------------------
// EMAIL DELIVERY — enquiries are emailed via FormSubmit (no server, no key).
//
// Change BMT_FORM_EMAIL to switch where enquiries land:
//   • For now it goes to K-Tech Solutions (testing).
//   • Later swap it to the client's inbox (bharatmetal2013@gmail.com) and
//     push — that single line is the only change needed.
//
// FIRST-TIME ACTIVATION (one click, once per email address):
//   The very first enquiry triggers a "Confirm your email" mail from
//   FormSubmit to the address below. Open it and click "Activate" once —
//   after that every enquiry is delivered automatically.
// ---------------------------------------------------------------------------
var BMT_FORM_EMAIL = 'ktechsolutions.in@gmail.com';   // TODO: swap to client's inbox for production

document.addEventListener('DOMContentLoaded', function () {

  /* ============ MOBILE DRAWER ============ */
  var toggle  = document.querySelector('.menu-toggle');
  var links   = document.querySelector('.nav-links');
  var overlay = document.querySelector('.nav-overlay');
  var dClose  = document.querySelector('.drawer-close');

  function openNav() {
    links.classList.add('open');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.classList.add('show');
    document.body.classList.add('nav-lock');
  }
  function closeNav() {
    links.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.classList.remove('show');
    document.body.classList.remove('nav-lock');
  }

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.contains('open') ? closeNav() : openNav();
    });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    if (overlay) overlay.addEventListener('click', closeNav);
    if (dClose)  dClose.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ============ NAVBAR SHADOW ============ */
  var nav = document.querySelector('.navbar');
  window.addEventListener('scroll', function () {
    if (nav) nav.style.boxShadow = window.scrollY > 20 ? '0 6px 20px rgba(0,0,0,0.25)' : 'none';
  });

  /* ============ REVEAL + COUNTERS ============ */
  document.querySelectorAll('.grid, .pd-grid, .footer-grid, .gallery-grid, .hero-stats, .stats-grid')
    .forEach(function (group) {
      group.querySelectorAll(':scope > .reveal').forEach(function (el, i) {
        el.style.setProperty('--stagger-delay', Math.min(i * 90, 540) + 'ms');
      });
    });

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var count = 0, step = Math.max(target / 60, 1);
      (function update() {
        count += step;
        if (count >= target) { el.textContent = target + suffix; }
        else { el.textContent = Math.floor(count) + suffix; requestAnimationFrame(update); }
      })();
      counterObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach(function (c) { counterObs.observe(c); });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ============ 3D TILT CARDS (desktop / mouse only) ============
     Touch devices skip this entirely — their "4D" moment is the .reveal
     3D unfold on scroll plus the CSS-only :active press (see style.css). */
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
      var rect = null;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 10;
        var ry = (px - 0.5) * 10;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        rect = null;
      });
    });
  }

  /* ============ PARALLAX DEPTH (hero photo panel + about-intro photo) ============
     Single rAF-throttled scroll handler, transform-only (no background-attachment:fixed
     — that broke the hero on mobile earlier in this project, never again). */
  if (!reduceMotion) {
    var pxTargets = [];
    var heroSlides = document.querySelector('.hero-slides');
    if (heroSlides) pxTargets.push({ el: heroSlides, speed: 0.15, max: 20 }); // capped well inside the -12% inset buffer so it never reveals an edge
    var aboutImg = document.querySelector('.parallax-img');
    if (aboutImg) pxTargets.push({ el: aboutImg, speed: 0.12, max: 30 });

    if (pxTargets.length) {
      var pxTicking = false;
      var updateParallax = function () {
        var vh = window.innerHeight;
        pxTargets.forEach(function (t) {
          var rect = t.el.getBoundingClientRect();
          var center = rect.top + rect.height / 2;
          var offset = Math.max(-t.max, Math.min(t.max, (center - vh / 2) * t.speed));
          t.el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
        });
        pxTicking = false;
      };
      window.addEventListener('scroll', function () {
        if (!pxTicking) { requestAnimationFrame(updateParallax); pxTicking = true; }
      }, { passive: true });
      updateParallax();
    }
  }

  /* ============ AMBIENT GLOW / CURSOR SPOTLIGHT (Industries section) ============
     Mobile: CSS keyframe drift (always-on, no JS). Desktop: mouse position instead. */
  if (canHover && !reduceMotion) {
    var glowSection = document.querySelector('.glow-section');
    if (glowSection) {
      glowSection.addEventListener('mousemove', function (e) {
        var rect = glowSection.getBoundingClientRect();
        glowSection.style.setProperty('--gx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
        glowSection.style.setProperty('--gy', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
        glowSection.classList.add('glow-manual');
      });
      glowSection.addEventListener('mouseleave', function () {
        glowSection.classList.remove('glow-manual');
      });
    }
  }

  /* ============ ENQUIRY → CHOOSE WHATSAPP OR EMAIL ============ */
  var modal = document.getElementById('sendModal');

  function val(form, sel) {
    var el = form.querySelector(sel);
    return el && el.value ? el.value.trim() : '';
  }

  // Builds the message body. `bold` wraps labels in * * for WhatsApp.
  function buildMessage(d, bold) {
    var B = bold ? '*' : '';
    var L = [];
    L.push(B + 'NEW ENQUIRY — BHARAT METAL & TUBES' + B);
    L.push('');
    if (d.name)     L.push(B + 'Name:' + B + ' ' + d.name);
    if (d.phone)    L.push(B + 'Phone:' + B + ' ' + d.phone);
    if (d.email)    L.push(B + 'Email:' + B + ' ' + d.email);
    if (d.material) L.push(B + 'Material Required:' + B + ' ' + d.material);
    if (d.qty)      L.push(B + 'Quantity:' + B + ' ' + d.qty);
    if (d.msg) {
      L.push('');
      L.push(B + 'Message:' + B);
      L.push(d.msg);
    }
    L.push('');
    L.push('—');
    L.push('Sent from the Bharat Metal & Tubes website');
    return L.join('\n');
  }

  function subjectFor(d) {
    return 'Enquiry' + (d.material ? ' — ' + d.material : '') + (d.name ? ' — ' + d.name : '');
  }
  // Gmail web compose — works in any browser with NO mail app installed.
  function gmailUrl(d) {
    return 'https://mail.google.com/mail/?view=cm&fs=1' +
           '&to=' + encodeURIComponent(BMT_EMAIL) +
           '&su=' + encodeURIComponent(subjectFor(d)) +
           '&body=' + encodeURIComponent(buildMessage(d, false));
  }
  // mailto: — only works if the device has a default mail app configured.
  function mailtoUrl(d) {
    return 'mailto:' + BMT_EMAIL +
           '?subject=' + encodeURIComponent(subjectFor(d)) +
           '&body='    + encodeURIComponent(buildMessage(d, false));
  }

  function copyText(txt, btn) {
    function done() {
      if (!btn) return;
      var el = btn.querySelector('b'), old = el.textContent;
      el.textContent = 'Copied ✓';
      setTimeout(function () { el.textContent = old; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, function () { legacy(); });
    } else { legacy(); }
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
  }

  /* ============ ENQUIRY SENT — small auto-dismiss toast ============ */
  var toastTimer = null;
  function showToast(msg) {
    var toast = document.querySelector('.enq-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'enq-toast';
      toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span></span>';
      document.body.appendChild(toast);
    }
    toast.querySelector('span').textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2800);
  }

  // state: null = let the user choose, true = already emailed, false = send failed
  function openModal(d, state) {
    if (!modal) { // fallback: straight to WhatsApp
      window.open('https://wa.me/' + BMT_WA + '?text=' + encodeURIComponent(buildMessage(d, true)), '_blank');
      return;
    }
    var waBtn    = modal.querySelector('[data-send="whatsapp"]');
    var gmailBtn = modal.querySelector('[data-send="gmail"]');
    var mailBtn  = modal.querySelector('[data-send="email"]');
    var copyBtn  = modal.querySelector('[data-send="copy"]');
    var h3       = modal.querySelector('.send-head h3');
    var sub      = modal.querySelector('.send-head p');
    var note     = modal.querySelector('.send-note');

    // reset to the default "choose" look every time
    [gmailBtn, mailBtn, copyBtn].forEach(function (b) { if (b) b.hidden = false; });
    if (waBtn) waBtn.querySelector('b').textContent = 'Send on WhatsApp';
    modal.classList.remove('is-sent');

    if (state === true) {
      modal.classList.add('is-sent');
      h3.textContent  = 'Enquiry sent ✓';
      sub.textContent = 'Thank you — your enquiry has reached Bharat Metal & Tubes by email. We usually reply within a few working hours.';
      if (note) note.innerHTML = 'Want it even faster? Send the same details on WhatsApp too.';
      [gmailBtn, mailBtn].forEach(function (b) { if (b) b.hidden = true; });
      if (waBtn) waBtn.querySelector('b').textContent = 'Also send on WhatsApp';
    } else if (state === false) {
      h3.textContent  = 'Couldn’t send automatically';
      sub.textContent = 'The connection failed. Please send it directly using one of these — everything is already written out for you.';
      if (note) note.innerHTML = 'Nothing is sent automatically &mdash; you always press send yourself.';
    } else {
      h3.textContent  = 'Almost done';
      sub.textContent = 'Your enquiry is ready and already written out. Just pick how you’d like to send it.';
      if (note) note.innerHTML = 'Nothing is sent automatically &mdash; you always press send yourself.<br>We usually reply within a few working hours.';
    }

    waBtn.onclick = function () {
      window.open('https://wa.me/' + BMT_WA + '?text=' + encodeURIComponent(buildMessage(d, true)), '_blank');
      hideModal();
    };
    if (gmailBtn) gmailBtn.onclick = function () {
      window.open(gmailUrl(d), '_blank', 'noopener');
      hideModal();
    };
    if (mailBtn) mailBtn.onclick = function () {
      window.location.href = mailtoUrl(d);
    };
    if (copyBtn) copyBtn.onclick = function () {
      copyText(buildMessage(d, false) + '\n\nTo: ' + BMT_EMAIL, copyBtn);
    };
    modal.classList.add('show');
    document.body.classList.add('nav-lock');
  }
  function hideModal() {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.classList.remove('nav-lock');
  }
  if (modal) {
    modal.querySelector('.send-close').addEventListener('click', hideModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) hideModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) hideModal();
    });
  }

  var BMT_MAX_FILE = 5 * 1024 * 1024; // FormSubmit free-tier attachment limit

  // FormSubmit's /ajax/ endpoint (used below) silently drops file uploads —
  // attachments only work through a real multipart form POST. So when a file
  // is attached we submit the form natively into this hidden iframe (no page
  // reload) instead of using fetch.
  var uploadFrame = null;
  function getUploadFrame() {
    if (uploadFrame) return uploadFrame;
    uploadFrame = document.createElement('iframe');
    uploadFrame.name = 'bmt-upload-frame';
    uploadFrame.style.display = 'none';
    uploadFrame.setAttribute('aria-hidden', 'true');
    document.body.appendChild(uploadFrame);
    return uploadFrame;
  }

  document.querySelectorAll('form[data-inquiry]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var texts     = form.querySelectorAll('input[type="text"]');
      var fileInput = form.querySelector('input[type="file"]');
      var files     = fileInput ? Array.prototype.slice.call(fileInput.files) : [];
      var d = {
        name:     texts[0] ? texts[0].value.trim() : '',
        qty:      texts[1] ? texts[1].value.trim() : '',
        phone:    val(form, 'input[type="tel"]'),
        email:    val(form, 'input[type="email"]'),
        material: val(form, 'select'),
        msg:      val(form, 'textarea')
      };

      var totalFileSize = files.reduce(function (sum, f) { return sum + f.size; }, 0);
      if (totalFileSize > BMT_MAX_FILE) {
        alert('The attached files are larger than 5MB combined. Please choose smaller or fewer files and try again.');
        return;
      }

      var btn  = form.querySelector('button[type="submit"]');
      var orig = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      var subjectField = form.querySelector('[name="_subject"]');
      if (subjectField) subjectField.value = subjectFor(d);

      if (files.length) {
        // Real multipart POST via hidden iframe — the only way FormSubmit delivers attachments.
        var frame  = getUploadFrame();
        var done   = false;
        var finish = function () {
          if (done) return;
          done = true;
          frame.removeEventListener('load', onLoad);
          clearTimeout(timer);
          if (btn) { btn.disabled = false; btn.textContent = orig; }
          form.reset();
          showToast('Enquiry sent — we\'ll reply within a few working hours.');
        };
        var onLoad = function () { finish(); };
        frame.addEventListener('load', onLoad);
        var timer = setTimeout(finish, 15000); // fallback in case the load event never fires

        form.action  = 'https://formsubmit.co/' + encodeURIComponent(BMT_FORM_EMAIL);
        form.method  = 'POST';
        form.enctype = 'multipart/form-data';
        form.target  = 'bmt-upload-frame';
        form.submit();
        return;
      }

      // FormSubmit AJAX: instant success/failure feedback, text-only enquiries.
      var payload = new FormData();
      payload.append('_subject',  subjectFor(d));
      payload.append('_template', 'table');
      payload.append('_captcha',  'false');
      payload.append('Name',      d.name);
      payload.append('Phone',     d.phone);
      payload.append('Email',     d.email);
      payload.append('Material',  d.material);
      payload.append('Quantity',  d.qty);
      payload.append('Message',   d.msg);

      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(BMT_FORM_EMAIL), {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    payload
      })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (btn) { btn.disabled = false; btn.textContent = orig; }
          if (j && (j.success === true || j.success === 'true')) { form.reset(); showToast('Enquiry sent — we\'ll reply within a few working hours.'); }
          else { openModal(d, false); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = orig; }
          openModal(d, false);   // network blocked → offer WhatsApp / Gmail / copy
        });
    });
  });

  /* ============ PREFILLED DIRECT CONTACT LINKS ============ */
  var quickMail = [
    'Dear Bharat Metal & Tubes,', '',
    'I would like to enquire about the following material:', '',
    'Material  : ', 'Grade     : ', 'Size / Spec: ', 'Quantity  : ', 'Delivery to: ', '',
    'Please share your best rate and availability.', '',
    'Name  : ', 'Phone : '
  ].join('\n');

  // Gmail web compose so it works even with no mail app installed.
  document.querySelectorAll('[data-quick="email"]').forEach(function (a) {
    a.setAttribute('href', 'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(BMT_EMAIL) +
      '&su=' + encodeURIComponent('Material Enquiry — Bharat Metal & Tubes') +
      '&body=' + encodeURIComponent(quickMail));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  // Plain mailto for anyone who prefers their own mail app.
  document.querySelectorAll('[data-quick="mailto"]').forEach(function (a) {
    a.setAttribute('href', 'mailto:' + BMT_EMAIL +
      '?subject=' + encodeURIComponent('Material Enquiry — Bharat Metal & Tubes') +
      '&body='    + encodeURIComponent(quickMail));
  });

  var quickWA = [
    'Hello Bharat Metal & Tubes,', '',
    'I would like a quote for:', '',
    'Material: ', 'Grade: ', 'Size: ', 'Quantity: ', '',
    'Please share your best rate. Thank you.'
  ].join('\n');

  document.querySelectorAll('[data-quick="whatsapp"]').forEach(function (a) {
    a.setAttribute('href', 'https://wa.me/' + BMT_WA + '?text=' + encodeURIComponent(quickWA));
  });

  /* ============ WEIGHT CALCULATOR ============ */
  var calc = document.getElementById('wcalc');
  if (calc) {
    var shape   = document.getElementById('wc-shape');
    var rows    = document.getElementById('wc-rows');
    var out     = document.getElementById('wc-out');
    var outUnit = document.getElementById('wc-unit');

    var SHAPES = {
      'ss-pipe':   { unit:'kg / metre', fields:[['Outer Dia (OD) mm','od','e.g. 60.3'],['Wall Thickness mm','wt','e.g. 3.9']],
                     calc:function(v){ return (v.od - v.wt) * v.wt * 0.02466; } },
      'ss-round':  { unit:'kg / metre', fields:[['Diameter mm','dia','e.g. 25']],
                     calc:function(v){ return v.dia * v.dia * 0.00623; } },
      'ss-square': { unit:'kg / metre', fields:[['Side mm','dia','e.g. 20']],
                     calc:function(v){ return v.dia * v.dia * 0.00787; } },
      'ss-hex':    { unit:'kg / metre', fields:[['A/F (across flats) mm','dia','e.g. 24']],
                     calc:function(v){ return v.dia * v.dia * 0.0068; } },
      'ss-flat':   { unit:'kg / metre', fields:[['Width mm','w','e.g. 40'],['Thickness mm','t','e.g. 6']],
                     calc:function(v){ return v.w * v.t * 0.00798; } },
      'ss-sheet':  { unit:'kg / sheet', fields:[['Length m','l','e.g. 2.5'],['Width m','w','e.g. 1.25'],['Thickness mm','t','e.g. 3']],
                     calc:function(v){ return v.l * v.w * v.t * 8; } },
      'ss-circle': { unit:'kg / piece', fields:[['Diameter mm','dia','e.g. 300'],['Thickness mm','t','e.g. 5']],
                     calc:function(v){ return (v.dia * v.dia * v.t) / 160000; } },
      'cs-sheet':  { unit:'kg / sheet', fields:[['Length m','l','e.g. 2.5'],['Width m','w','e.g. 1.25'],['Thickness mm','t','e.g. 5']],
                     calc:function(v){ return v.l * v.w * v.t * 7.85; } },
      'brass':     { unit:'kg / metre', fields:[['OD mm','od','e.g. 40'],['Wall Thickness mm','wt','e.g. 3']],
                     calc:function(v){ return (v.od - v.wt) * v.wt * 0.026; } },
      'alu-pipe':  { unit:'kg / metre', fields:[['OD mm','od','e.g. 40'],['Wall Thickness mm','wt','e.g. 3']],
                     calc:function(v){ return (v.od - v.wt) * v.wt * 0.0082; } },
      'alu-sheet': { unit:'kg / sheet', fields:[['Length m','l','e.g. 2.5'],['Width m','w','e.g. 1.25'],['Thickness mm','t','e.g. 3']],
                     calc:function(v){ return v.l * v.w * v.t * 2.69; } }
    };

    function compute() {
      var s = SHAPES[shape.value], v = {}, ok = true;
      rows.querySelectorAll('input').forEach(function (i) {
        var n = parseFloat(i.value);
        v[i.getAttribute('data-k')] = isNaN(n) ? 0 : n;
        if (isNaN(n)) ok = false;
      });
      var res = s.calc(v);
      out.textContent = (ok && isFinite(res) && res > 0) ? res.toFixed(2) : '0.00';
    }
    function buildFields() {
      var s = SHAPES[shape.value];
      rows.innerHTML = '';
      s.fields.forEach(function (f) {
        var wrap = document.createElement('div');
        wrap.className = 'calc-field';
        wrap.innerHTML = '<label>' + f[0] + '</label><input type="number" step="any" data-k="' + f[1] + '" placeholder="' + f[2] + '">';
        rows.appendChild(wrap);
      });
      outUnit.textContent = s.unit;
      out.textContent = '0.00';
      rows.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', compute); });
    }
    shape.addEventListener('change', buildFields);
    buildFields();
  }


});
