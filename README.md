# Advent v Bunkru

Adventní kalendář posilovny Bunker Timpo. 24 okének, každé se samo odemkne v daný den v 0:00 (český čas).

## Jak upravit text okénka

1. Otevři soubor **okenka.md**.
2. Vpravo nahoře klikni na **tužku** (Edit this file).
3. Najdi okénko podle řádku `## číslo` a přepiš text.
4. Dole nebo vpravo nahoře klikni na **Commit changes** a potvrď.
5. Zhruba do minuty je změna na webu.

Funguje to i z mobilu přes prohlížeč.

Pravidla v okenka.md:
- `nadpis:` nadpis okénka
- `foto:` cesta k fotce, např. `fotky/09.jpg`
- `odkaz:` adresa a text tlačítka oddělené svislítkem, např. `https://www.instagram.com/bunker_timpo | Označ nás`
- `zona: zluta` jen pro sál a solárium (žlutý pruh)
- pak prázdný řádek a text; odstavce odděluj prázdným řádkem, odrážky začínají `- `
- hranaté závorky `[takhle]` znamenají, že tam ještě něco chybí doplnit. Před spuštěním zkontroluj, že žádné nezůstaly.

## Jak přidat fotku

1. Otevři složku **fotky**.
2. **Add file → Upload files**, přetáhni fotku a dej **Commit changes**.
3. Fotku pojmenuj podle čísla okénka: `01.jpg`, `02.jpg` … `24.jpg` (malými písmeny, koncovka `.jpg`).

Když fotka chybí, ukáže se místo ní velké číslo okénka. Fotky ideálně na šířku, do 1 MB.

## Logo a písmo

- Do složky **logo** nahraj `bt-logo-bile.png` (bílé logo z design systému).
- Do složky **fonty** nahraj `AeroMaticsStencilCZ-Bold.ttf`.

Dokud tam nejsou, ukáže se nápis BUNKER TIMPO a náhradní stencil písmo.

## Náhled všech okének

Přidej na konec adresy `?nahled=1`, např. `https://market86.github.io/bunker-advent/?nahled=1`. Uvidíš všechna okénka odemčená. Tuhle adresu nikde nezveřejňuj.

## Zveřejnění (jednou)

**Settings → Pages → Branch: main, složka / (root) → Save.** Za minutu běží na `https://market86.github.io/bunker-advent/`.

Vlastní adresa: webař může udělat přesměrování z `bunkertimpo.cz/advent`, nebo nastavit `advent.bunkertimpo.cz` (Settings → Pages → Custom domain).

## Soubory

- `okenka.md` – všechny texty (tady upravuješ)
- `index.html`, `styl.css`, `kalendar.js` – stránka, není potřeba sahat
- `fotky/`, `logo/`, `fonty/` – obrázky a písmo
- `.nojekyll` – nutné pro GitHub Pages, nemazat
