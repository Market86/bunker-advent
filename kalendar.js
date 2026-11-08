// Bunker Timpo – adventní kalendář
// Texty se berou ze souboru okenka.md. Tady se nic upravovat nemusí.
(function () {
  "use strict";

  var ROK = 2026;            // rok adventu
  var MESIC = 12;            // prosinec
  var POCET = 24;
  // Pevné "náhodné" pořadí okének v mřížce
  var PORADI = [7, 15, 2, 21, 11, 18, 4, 23, 9, 1, 13, 20, 16, 6, 24, 10, 3, 19, 12, 22, 5, 17, 8, 14];
  var DNY = ["NE", "PO", "ÚT", "ST", "ČT", "PÁ", "SO"];
  var OSTRE_ADRESY = /(^|\.)github\.io$|(^|\.)bunkertimpo\.cz$/i;

  // Náhled: ?nahled=1, nebo když stránka neběží na ostré adrese (třeba náhled v Claude)
  var nahled = /[?&]nahled=1\b/.test(location.search) || !OSTRE_ADRESY.test(location.hostname);
  var simulace = "vse"; // v náhledu: "vse", "pred", "po" nebo číslo dne
  var KLIC = nahled ? "bunker-advent-nahled" : "bunker-advent-otevreno";

  var okenka = {};
  var otevreno = nactiOtevreno();

  // ---------- datum ----------
  function dnesPraha() {
    if (nahled && simulace !== "vse") {
      if (simulace === "pred") return { rok: ROK, mesic: 11, den: 20 };
      if (simulace === "po") return { rok: ROK, mesic: 12, den: 27 };
      return { rok: ROK, mesic: MESIC, den: simulace };
    }
    var casti = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var o = {};
    casti.forEach(function (c) { o[c.type] = parseInt(c.value, 10); });
    return { rok: o.year, mesic: o.month, den: o.day };
  }
  function porovnej(a, b) { return (a.rok - b.rok) || (a.mesic - b.mesic) || (a.den - b.den); }
  function datumOkenka(c) { return { rok: ROK, mesic: MESIC, den: c }; }
  function jeOdemceno(c) {
    if (nahled && simulace === "vse") return true;
    return porovnej(dnesPraha(), datumOkenka(c)) >= 0;
  }
  function jeDnes(c) {
    if (nahled && simulace === "vse") return false;
    return porovnej(dnesPraha(), datumOkenka(c)) === 0;
  }
  function predStartem() {
    if (nahled && simulace === "vse") return false;
    return porovnej(dnesPraha(), datumOkenka(1)) < 0;
  }
  function denVTydnu(c) { return DNY[new Date(Date.UTC(ROK, MESIC - 1, c)).getUTCDay()]; }

  // ---------- paměť otevřených ----------
  function nactiOtevreno() {
    try { return JSON.parse(localStorage.getItem(KLIC)) || []; } catch (e) { return []; }
  }
  function ulozOtevreno() {
    try { localStorage.setItem(KLIC, JSON.stringify(otevreno)); } catch (e) { /* nevadí */ }
  }

  // ---------- okenka.md ----------
  function rozeber(md) {
    var bloky = {};
    var aktualni = null;
    md.replace(/\r/g, "").split("\n").forEach(function (radek) {
      var h = radek.match(/^##\s+(.+?)\s*$/);
      if (h) {
        aktualni = { nadpis: "", foto: "", odkaz: "", zona: "", radky: [] };
        bloky[h[1].toLowerCase()] = aktualni;
        return;
      }
      if (!aktualni) return;
      var p = radek.match(/^(nadpis|foto|odkaz|zona):\s*(.*)$/i);
      if (p && aktualni.radky.join("").trim() === "") {
        aktualni[p[1].toLowerCase()] = p[2].trim();
        return;
      }
      aktualni.radky.push(radek);
    });
    return bloky;
  }

  function vykresliText(radky, cil) {
    cil.textContent = "";
    var odstavec = [];
    var seznam = null;
    function zavriOdstavec() {
      if (!odstavec.length) return;
      var p = document.createElement("p");
      var text = odstavec.join(" ");
      p.textContent = text;
      if (/^tip od davida$/i.test(text)) p.className = "podpis";
      cil.appendChild(p);
      odstavec = [];
    }
    radky.forEach(function (r) {
      var t = r.trim();
      if (/^- /.test(t)) {
        zavriOdstavec();
        if (!seznam) { seznam = document.createElement("ul"); cil.appendChild(seznam); }
        var li = document.createElement("li");
        li.textContent = t.slice(2);
        seznam.appendChild(li);
      } else if (t === "") {
        zavriOdstavec(); seznam = null;
      } else {
        seznam = null; odstavec.push(t);
      }
    });
    zavriOdstavec();
  }

  function bezpecnyOdkaz(url) { return /^(https?:|mailto:|tel:)/i.test(url) ? url : ""; }

  // ---------- mřížka ----------
  function el(tag, trida, text) {
    var e = document.createElement(tag);
    if (trida) e.className = trida;
    if (text != null) e.textContent = text;
    return e;
  }

  function vykresliMrizku(animovat) {
    var mrizka = document.getElementById("mrizka");
    mrizka.textContent = "";
    PORADI.forEach(function (cislo, i) {
      var data = okenka[cislo] || {};
      var b = el("button", "dvirka");
      b.type = "button";
      b.dataset.cislo = cislo;
      b.style.setProperty("--i", animovat ? i : 0);
      if (!animovat) b.style.animation = "none";
      if (data.zona === "zluta") b.classList.add("dvirka--zluta");

      var za = el("span", "dvirka__za");
      za.appendChild(el("b", null, String(cislo)));
      za.appendChild(el("span", null, data.nadpis || ""));
      b.appendChild(za);

      var dvere = el("span", "dvirka__dvere");
      dvere.appendChild(el("span", "dvirka__cislo", String(cislo)));
      var stitek = el("span", "dvirka__stitek", "");
      dvere.appendChild(stitek);
      b.appendChild(dvere);

      var jeOtevreno = otevreno.indexOf(cislo) !== -1;
      if (!jeOdemceno(cislo)) {
        b.classList.add("dvirka--zamceno");
        stitek.textContent = cislo + ".\u00a012.";
        b.setAttribute("aria-label", "Okénko " + cislo + ", otevře se " + cislo + ". 12.");
      } else if (jeOtevreno) {
        b.classList.add("dvirka--otevreno");
        b.setAttribute("aria-label", "Okénko " + cislo + ": " + (data.nadpis || ""));
      } else if (jeDnes(cislo)) {
        b.classList.add("dvirka--dnes");
        stitek.textContent = "DNES";
        b.setAttribute("aria-label", "Okénko " + cislo + ", dnešní, otevři");
      } else {
        stitek.textContent = "OTEVŘI";
        b.setAttribute("aria-label", "Okénko " + cislo + ", otevři");
      }
      b.addEventListener("click", function () { klik(cislo, b); });
      mrizka.appendChild(b);
    });
  }

  var casovac;
  function hlaska(text) {
    var h = document.getElementById("hlaska");
    h.textContent = text;
    h.classList.add("hlaska--videt");
    clearTimeout(casovac);
    casovac = setTimeout(function () { h.classList.remove("hlaska--videt"); }, 2400);
  }

  function klik(cislo, b) {
    if (!jeOdemceno(cislo)) {
      b.classList.remove("dvirka--zatres");
      void b.offsetWidth;
      b.classList.add("dvirka--zatres");
      hlaska("Ještě ne. Vydrž do " + cislo + ".\u00a012.");
      return;
    }
    if (otevreno.indexOf(cislo) !== -1) { otevri(cislo); return; }
    // dvířka nejdřív vyjedou nahoru, pak se otevře obsah
    b.classList.remove("dvirka--dnes");
    b.classList.add("dvirka--otevreno");
    otevreno.push(cislo);
    ulozOtevreno();
    var bezPohybu = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(function () { otevri(cislo); }, bezPohybu ? 0 : 520);
  }

  function otevri(cislo) {
    var data = okenka[cislo] || { nadpis: "Okénko " + cislo, radky: [] };
    var okno = document.getElementById("okno");
    okno.classList.toggle("okno--zluta", data.zona === "zluta");

    var foto = document.getElementById("okno-foto");
    foto.textContent = "";
    var nahradni = el("span", "okno__foto-cislo", String(cislo));
    if (data.foto) {
      var img = document.createElement("img");
      img.alt = "";
      img.onerror = function () { foto.textContent = ""; foto.appendChild(nahradni); };
      img.src = data.foto;
      foto.appendChild(img);
    } else {
      foto.appendChild(nahradni);
    }

    document.getElementById("okno-datum").textContent =
      "OKÉNKO " + cislo + " · " + denVTydnu(cislo) + " " + cislo + ". 12.";
    document.getElementById("okno-nadpis").textContent = data.nadpis || ("Okénko " + cislo);
    vykresliText(data.radky || [], document.getElementById("okno-text"));

    var odkaz = document.getElementById("okno-odkaz");
    var casti = (data.odkaz || "").split("|");
    var url = bezpecnyOdkaz((casti[0] || "").trim());
    if (url) {
      odkaz.href = url;
      odkaz.textContent = (casti[1] || "Více").trim();
      odkaz.hidden = false;
    } else {
      odkaz.hidden = true;
    }

    okno.scrollTop = 0;
    if (typeof okno.showModal === "function") okno.showModal(); else okno.setAttribute("open", "");
  }

  function zavri() {
    var okno = document.getElementById("okno");
    if (typeof okno.close === "function") okno.close(); else okno.removeAttribute("open");
  }

  // ---------- hlavička a odpočet ----------
  var odpocetTimer;
  function dvojciferne(n) { return (n < 10 ? "0" : "") + n; }
  function tikni() {
    var start = Date.parse(ROK + "-12-01T00:00:00+01:00");
    var zbyva = Math.max(0, start - Date.now());
    var s = Math.floor(zbyva / 1000);
    document.getElementById("o-dny").textContent = dvojciferne(Math.floor(s / 86400));
    document.getElementById("o-hod").textContent = dvojciferne(Math.floor(s % 86400 / 3600));
    document.getElementById("o-min").textContent = dvojciferne(Math.floor(s % 3600 / 60));
    document.getElementById("o-sek").textContent = dvojciferne(s % 60);
  }

  function vykresliStav() {
    var stav = document.getElementById("stav");
    var odpocet = document.getElementById("odpocet");
    var dnes = dnesPraha();
    clearInterval(odpocetTimer);
    odpocet.hidden = true;
    if (nahled && simulace === "vse") {
      stav.textContent = "NÁHLED · VŠECHNA OKÉNKA ODEMČENÁ";
    } else if (predStartem()) {
      stav.textContent = "ADVENT 2026 · OD 1. 12.";
      odpocet.hidden = false;
      tikni();
      odpocetTimer = setInterval(tikni, 1000);
    } else if (porovnej(dnes, datumOkenka(POCET)) > 0) {
      stav.textContent = "VŠECHNA OKÉNKA JSOU OTEVŘENÁ";
    } else {
      stav.textContent = denVTydnu(dnes.den) + " " + dnes.den + ". 12. · OTEVŘI DNEŠNÍ OKÉNKO";
    }
  }

  function vykresliUvod() {
    var u = okenka["úvod"] || okenka["uvod"];
    if (!u) return;
    if (u.nadpis) document.getElementById("uvod-nadpis").textContent = u.nadpis.toUpperCase();
    vykresliText(u.radky, document.getElementById("uvod-text"));
  }

  // ---------- lišta náhledu ----------
  function nastavNahled() {
    if (!nahled) return;
    var lista = document.getElementById("nahled-lista");
    var vyber = document.getElementById("nahled-den");
    lista.hidden = false;
    var moznosti = [["vse", "Vše odemčené"], ["pred", "Před startem (odpočet)"]];
    for (var d = 1; d <= POCET; d++) moznosti.push([String(d), "Jako by bylo " + d + ". 12."]);
    moznosti.push(["po", "Po Vánocích"]);
    moznosti.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m[0]; o.textContent = m[1];
      vyber.appendChild(o);
    });
    vyber.addEventListener("change", function () {
      simulace = /^\d+$/.test(vyber.value) ? parseInt(vyber.value, 10) : vyber.value;
      vykresliStav();
      vykresliMrizku(false);
    });
    document.getElementById("nahled-reset").addEventListener("click", function () {
      otevreno = [];
      ulozOtevreno();
      vykresliMrizku(false);
      hlaska("Všechna okénka jsou zase zavřená.");
    });
  }

  document.getElementById("okno-zavrit").addEventListener("click", zavri);
  document.getElementById("okno").addEventListener("click", function (e) {
    if (e.target === this) zavri();
  });

  nastavNahled();
  fetch("okenka.md", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (md) {
      var bloky = rozeber(md);
      Object.keys(bloky).forEach(function (k) {
        var n = parseInt(k, 10);
        okenka[isNaN(n) ? k : n] = bloky[k];
      });
    })
    .catch(function () { /* bez textů se ukážou aspoň čísla */ })
    .then(function () {
      vykresliUvod();
      vykresliStav();
      vykresliMrizku(true);
    });
})();
