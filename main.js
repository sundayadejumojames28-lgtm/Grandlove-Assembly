(function () {
  "use strict";
  var cfg = window.GRANDLOVE_CONFIG || {};

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Header shadow + back-to-top
  var header = document.querySelector(".site-header");
  var backTop = document.querySelector(".back-top");
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (backTop) backTop.classList.toggle("show", y > 500);
  }, { passive: true });
  if (backTop) backTop.addEventListener("click", function () { window.scrollTo({ top: 0 }); });

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("visible"); });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // WhatsApp buttons
  document.querySelectorAll("[data-whatsapp]").forEach(function (btn) {
    var msg = btn.getAttribute("data-message") || "";
    btn.addEventListener("click", function (ev) {
      if (!cfg.whatsappNumber) {
        ev.preventDefault();
        alert("The WhatsApp number has not been set up yet. Please use the Contact page in the meantime.");
        return;
      }
      btn.setAttribute("href", "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(msg));
    });
  });

  // Gallery filter
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      filterBar.querySelectorAll("button").forEach(function (x) { x.classList.toggle("active", x === b); });
      var f = b.getAttribute("data-filter");
      document.querySelectorAll(".gallery-item").forEach(function (it) {
        it.classList.toggle("hide", f !== "all" && it.getAttribute("data-cat") !== f);
      });
    });
  }

  // Enquiry tabs
  var tabs = document.querySelectorAll(".tabs [role=tab]");
  function selectTab(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", String(on));
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { selectTab(t.getAttribute("aria-controls")); }); });
  if (tabs.length && location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("form")) selectTab(target.id);
  }

  // Forms (sent only when a form endpoint is configured)
  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    function show(cls, text) { status.className = "form-status show " + cls; status.textContent = text; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!cfg.formEndpoint) {
        show("info", "This form is not yet connected to a delivery service, so your message was not sent. Please reach us through the contact details on this page.");
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      fetch(cfg.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset(); show("ok", "Thank you! Your message has been sent.");
        })
        .catch(function () { show("err", "Sorry, your message could not be sent. Please try again later."); })
        .finally(function () { btn.disabled = false; });
    });
  });
})();
