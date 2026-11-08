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
  var KLIC = "bunker-advent-otevreno";

  var nahled = /[?&]nahled=1\b/.test(location.search);
  var okenka = {};
  var otevreno = nactiOtevreno();

  // Dnešní datum podle českého času
  function dnesPraha() {
    var casti = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var o = {};
    casti.forEach(function (c) { o[c.type] = parseInt(c.value, 10); });
    return { rok: o.year, mesic: o.month, den: o.day };
  }

  function porovnej(a, b) {
    return (a.rok - b.rok) || (a.mesic - b.mesic) || (a.den - b.den);
  }

  function jeOdemceno(cislo) {
    if (nahled) return true;
    return porovnej(dnesPraha(), { rok: ROK, mesic: MESIC, den: cislo }) >= 0;
  }

  function jeDnes(cislo) {
    return porovnej(dnesPraha(), { rok: ROK, mesic: MESIC, den: cislo }) === 0;
  }

  function denVTydnu(cislo) {
    return DNY[new Date(Date.UTC(ROK, MESIC - 1, cislo)).getUTCDay()];
  }

  function nactiOtevreno() {
    try { return JSON.parse(localStorage.getItem(KLIC)) || []; } catch (e) { return []; }
  }
  function ulozOtevreno() {
    try { localStorage.setItem(KLIC, JSON.stringify(otevreno)); } catch (e) { /* nevadí */ }
  }

  // Načtení okenka.md
  function rozeber(md) {
    var bloky = {};
    var aktualni = null;
    md.replace(/\r/g, "").split("\n").forEach(function (radek) {
      var h = radek.match(/^##\s+(.+?)\s*$/);
      if (h) {
        var klic = h[1].toLowerCase();
        aktualni = { nadpis: "", foto: "", odkaz: "", zona: "", radky: [] };
        bloky[klic] = aktualni;
        return;
      }
      if (!aktualni) return;
      var p = radek.match(/^(nadpis|foto|odkaz|zona):\s*(.*)$/i);
      if (p && aktualni.radky.length === 0) {
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
      if (odstavec.length) {
        var p = document.createElement("p");
        var text = odstavec.join(" ");
        p.textContent = text;
        if (/^tip od davida$/i.test(text)) p.className = "podpis";
        cil.appendChild(p);
        odstavec = [];
      }
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
        zavriOdstavec();
        seznam = null;
      } else {
        seznam = null;
        odstavec.push(t);
      }
    });
    zavriOdstavec();
  }

  function bezpecnyOdkaz(url) {
    return /^(https?:|mailto:|tel:)/i.test(url) ? url : "";
  }

  // Mřížka
  function vykresliMrizku() {
    var mrizka = document.getElementById("mrizka");
    mrizka.textContent = "";
    PORADI.forEach(function (cislo) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dvirka";
      var data = okenka[cislo] || {};
      if (data.zona === "zluta") b.classList.add("dvirka--zluta");
      var stav = document.createElement("span");
      stav.className = "dvirka__stav";
      b.textContent = String(cislo);
      if (!jeOdemceno(cislo)) {
        b.classList.add("dvirka--zamceno");
        b.setAttribute("aria-label", "Okénko " + cislo + ", zatím zamčené");
      } else if (jeDnes(cislo) && otevreno.indexOf(cislo) === -1) {
        b.classList.add("dvirka--dnes");
        stav.textContent = "DNES";
        b.setAttribute("aria-label", "Okénko " + cislo + ", dnešní");
      } else if (otevreno.indexOf(cislo) !== -1) {
        b.classList.add("dvirka--otevreno");
        stav.textContent = "OTEVŘENO";
        b.setAttribute("aria-label", "Okénko " + cislo + ", otevřené");
      } else {
        b.setAttribute("aria-label", "Okénko " + cislo);
      }
      b.appendChild(stav);
      b.addEventListener("click", function () { klik(cislo); });
      mrizka.appendChild(b);
    });
  }

  var casovac;
  function hlaska(text) {
    var el = document.getElementById("hlaska");
    el.textContent = text;
    el.classList.add("hlaska--videt");
    clearTimeout(casovac);
    casovac = setTimeout(function () { el.classList.remove("hlaska--videt"); }, 2400);
  }

  function klik(cislo) {
    if (!jeOdemceno(cislo)) {
      hlaska("Ještě ne. Vydrž do " + cislo + ". 12.");
      return;
    }
    otevri(cislo);
  }

  function otevri(cislo) {
    var data = okenka[cislo] || { nadpis: "Okénko " + cislo, radky: [] };
    var okno = document.getElementById("okno");
    okno.classList.toggle("okno--zluta", data.zona === "zluta");

    var foto = document.getElementById("okno-foto");
    foto.textContent = "";
    var nahradni = document.createElement("span");
    nahradni.className = "okno__foto-cislo";
    nahradni.textContent = String(cislo);
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

    if (typeof okno.showModal === "function") okno.showModal(); else okno.setAttribute("open", "");
    if (otevreno.indexOf(cislo) === -1) { otevreno.push(cislo); ulozOtevreno(); }
    vykresliMrizku();
  }

  function zavri() {
    var okno = document.getElementById("okno");
    if (typeof okno.close === "function") okno.close(); else okno.removeAttribute("open");
  }

  function vykresliUvod() {
    var u = okenka["úvod"] || okenka["uvod"];
    if (u) {
      if (u.nadpis) document.getElementById("uvod-nadpis").textContent = u.nadpis.toUpperCase();
      vykresliText(u.radky, document.getElementById("uvod-text"));
    }
    var stav = document.getElementById("stav");
    var dnes = dnesPraha();
    var start = { rok: ROK, mesic: MESIC, den: 1 };
    if (nahled) {
      document.getElementById("nahled-info").hidden = false;
      stav.textContent = "NÁHLED";
    } else if (porovnej(dnes, start) < 0) {
      var zbyva = Math.round((Date.UTC(ROK, MESIC - 1, 1) - Date.UTC(dnes.rok, dnes.mesic - 1, dnes.den)) / 86400000);
      stav.textContent = "OKÉNKA SE OTEVÍRAJÍ 1. 12. · ZBÝVÁ " + zbyva + (zbyva === 1 ? " DEN" : zbyva < 5 ? " DNY" : " DNÍ");
    } else if (porovnej(dnes, { rok: ROK, mesic: MESIC, den: POCET }) > 0) {
      stav.textContent = "VŠECHNA OKÉNKA JSOU OTEVŘENÁ";
    } else {
      stav.textContent = "DNES JE " + dnes.den + ". 12. · OTEVŘI SVOJE OKÉNKO";
    }
  }

  document.getElementById("okno-zavrit").addEventListener("click", zavri);
  document.getElementById("okno").addEventListener("click", function (e) {
    if (e.target === this) zavri();
  });

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
      vykresliMrizku();
    });
})();
