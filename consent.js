/* Nail Gallery – Cookie-Consent + Google Analytics (DSGVO-konform).
   GA wird ERST nach ausdrücklicher Einwilligung geladen.
   >>> Vor dem Live-Gang die echte Measurement-ID unten eintragen. <<< */
(function () {
  "use strict";

  var GA_ID = "G-XXXXXXXXXX";           // TODO: echte Google-Analytics Measurement-ID eintragen
  var KEY = "ng_cookie_consent";         // gespeicherter Wert: "accepted" | "rejected"

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  /* ---------- Google Analytics (nur bei Einwilligung) ---------- */
  function loadGA() {
    if (!GA_ID || GA_ID.indexOf("G-XXX") === 0) return;   // Platzhalter -> nichts laden
    if (window.__ngGaLoaded) return; window.__ngGaLoaded = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("consent", "default", { analytics_storage: "denied" });
    gtag("consent", "update", { analytics_storage: "granted" });
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  /* ---------- Styles ---------- */
  var css =
  "#ng-cookie{position:fixed;left:0;right:0;bottom:0;z-index:9990;background:rgba(16,16,16,.97);" +
  "-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid rgba(255,254,247,.12);" +
  "transform:translateY(110%);transition:transform .5s cubic-bezier(.16,.8,.24,1)}" +
  "#ng-cookie.show{transform:translateY(0)}" +
  "#ng-cookie .ngc-inner{max-width:1100px;margin:0 auto;padding:1.15rem clamp(1.3rem,5vw,3.4rem);" +
  "display:flex;align-items:center;gap:1.4rem;flex-wrap:wrap;justify-content:space-between}" +
  "#ng-cookie .ngc-text{flex:1 1 340px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:300;" +
  "font-size:.9rem;line-height:1.6;color:rgba(255,254,247,.8)}" +
  "#ng-cookie .ngc-text a{color:#c76bb0;text-decoration:underline}" +
  "#ng-cookie .ngc-actions{display:flex;gap:.7rem;flex-wrap:wrap}" +
  "#ng-cookie .ngc-btn{font-family:'Inter',sans-serif;font-weight:600;font-size:.78rem;letter-spacing:.04em;" +
  "padding:.72rem 1.4rem;border-radius:999px;cursor:pointer;border:1px solid transparent;transition:all .25s ease}" +
  "#ng-cookie .ngc-decline{background:transparent;color:#FFFEF7;border-color:rgba(255,254,247,.45)}" +
  "#ng-cookie .ngc-decline:hover{background:rgba(255,254,247,.1)}" +
  "#ng-cookie .ngc-accept{background:#8A0467;color:#fff}" +
  "#ng-cookie .ngc-accept:hover{background:#a3058a}" +
  "#ng-cookie-reopen{position:fixed;left:14px;bottom:14px;z-index:9998;font-family:'Inter',sans-serif;" +
  "font-weight:500;font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,254,247,.85);" +
  "background:rgba(16,16,16,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);" +
  "border:1px solid rgba(255,254,247,.2);border-radius:999px;padding:.5rem .8rem;cursor:pointer;display:none;" +
  "align-items:center;gap:.4rem;opacity:.55;transition:opacity .25s ease}" +
  "#ng-cookie-reopen:hover{opacity:1}" +
  "@media(max-width:600px){#ng-cookie .ngc-actions{width:100%}#ng-cookie .ngc-btn{flex:1 1 auto;text-align:center}}";

  function injectStyle() {
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  }

  /* ---------- Banner ---------- */
  function buildBanner() {
    var b = document.createElement("div");
    b.id = "ng-cookie"; b.setAttribute("role", "dialog");
    b.setAttribute("aria-live", "polite"); b.setAttribute("aria-label", "Cookie-Hinweis");
    b.innerHTML =
      '<div class="ngc-inner">' +
      '<p class="ngc-text">Wir verwenden notwendige Cookies f&uuml;r den Betrieb der Website und &ndash; nur mit deiner ' +
      'Einwilligung &ndash; Google Analytics, um unser Angebot zu verbessern. Mehr dazu in der ' +
      '<a href="datenschutz.html">Datenschutzerkl&auml;rung</a>.</p>' +
      '<div class="ngc-actions">' +
      '<button type="button" class="ngc-btn ngc-decline">Nur notwendige</button>' +
      '<button type="button" class="ngc-btn ngc-accept">Alle akzeptieren</button>' +
      '</div></div>';
    document.body.appendChild(b);
    b.querySelector(".ngc-accept").addEventListener("click", function () { accept(); });
    b.querySelector(".ngc-decline").addEventListener("click", function () { decline(); });
    requestAnimationFrame(function () { b.classList.add("show"); });
    return b;
  }

  function buildReopen() {
    if (document.getElementById("ng-cookie-reopen")) return;
    var r = document.createElement("button");
    r.id = "ng-cookie-reopen"; r.type = "button";
    r.textContent = "Cookie-Einstellungen";
    r.addEventListener("click", function () { openBanner(); });
    document.body.appendChild(r);
    return r;
  }
  function showReopen() { var r = buildReopen(); r.style.display = "inline-flex"; }
  function hideReopen() { var r = document.getElementById("ng-cookie-reopen"); if (r) r.style.display = "none"; }

  var bannerEl = null;
  function openBanner() { hideReopen(); if (!bannerEl) bannerEl = buildBanner(); else { bannerEl.classList.add("show"); } }
  function closeBanner() { if (bannerEl) bannerEl.classList.remove("show"); showReopen(); }

  function accept() { setChoice("accepted"); loadGA(); closeBanner(); }
  function decline() { setChoice("rejected"); closeBanner(); }

  window.ngCookieSettings = openBanner;   // Für Links, z.B. im Footer

  /* ---------- Init ---------- */
  function showBannerWhenReady() {
    // Warten, bis der Intro-Loader (falls vorhanden) verschwunden ist.
    var tries = 0;
    (function wait() {
      var loader = document.getElementById("ng-loader");
      if (!loader || tries > 30) { bannerEl = buildBanner(); return; }
      tries++; setTimeout(wait, 200);
    })();
  }

  function init() {
    injectStyle();
    var c = getChoice();
    if (c === "accepted") { loadGA(); showReopen(); }
    else if (c === "rejected") { showReopen(); }
    else { showBannerWhenReady(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
