# SULU Trikot-Manager 1.2

**Verwaltung, Import und Export von Trikotsätzen für die hockey.de Mannschaftsverwaltung**

Der SULU Trikot-Manager ist eine Browser-Erweiterung für die Mannschaftsverwaltung auf hockey.de. Die Erweiterung ermöglicht es, vorhandene Trikoteinstellungen lokal im Browser zu speichern, übersichtlich darzustellen und bei noch nicht definierten Trikotblöcken wieder zu übernehmen.

Die Anwendung wurde für **Google Chrome**, **Microsoft Edge** und **Mozilla Firefox** entwickelt.

> **Hinweis:** Der SULU Trikot-Manager ist eine eigenständige Erweiterung und kein offizielles Produkt von hockey.de.

---

## Inhaltsverzeichnis

- [Funktionsumfang](#funktionsumfang)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
  - [Google Chrome](#google-chrome)
  - [Microsoft Edge](#microsoft-edge)
  - [Mozilla Firefox](#mozilla-firefox)
- [Bedienung](#bedienung)
  - [Trikotsatz speichern](#trikotsatz-speichern)
  - [Trikotsatz übernehmen](#trikotsatz-übernehmen)
  - [Trikotsatz bearbeiten](#trikotsatz-bearbeiten)
  - [Trikotsatz löschen](#trikotsatz-löschen)
- [Import und Export](#import-und-export)
- [Darstellung der Trikotsätze](#darstellung-der-trikotsätze)
- [Lokale Datenspeicherung](#lokale-datenspeicherung)
- [Datenstruktur](#datenstruktur)
- [Projektstruktur](#projektstruktur)
- [Browser-Kompatibilität](#browser-kompatibilität)
- [Entwicklung mit Visual Studio Code](#entwicklung-mit-visual-studio-code)
- [Versionierung](#versionierung)
- [Fehlerbehebung](#fehlerbehebung)
- [Datenschutz](#datenschutz)
- [Rechtliche Hinweise](#rechtliche-hinweise)

---

## Funktionsumfang

Der SULU Trikot-Manager erweitert die Trikotverwaltung auf hockey.de um folgende Funktionen:

- lokales Speichern vollständig definierter Trikotsätze
- Übernahme gespeicherter Trikotsätze in leere Trikotblöcke
- Verwaltung mehrerer gespeicherter Trikotsätze
- Bearbeitung von Namen und Farbwerten
- Farbpicker und manuelle Hexwert-Eingabe
- Löschen gespeicherter Trikotsätze
- Export aller gespeicherten Trikotsätze als JSON-Datei
- Import einer zuvor exportierten JSON-Datei
- automatische Aktualisierung des Speicherzeitpunkts beim Import
- Datums- und Zeitstempel je gespeichertem Trikotsatz
- grafische Vorschau von Trikot, Rock beziehungsweise Hose und Stutzen
- vier Farbangaben für:
  - Trikot
  - Rock/Hose
  - Stutzen
  - Torwart
- unterschiedliche Darstellung für weibliche und männliche Mannschaften
- Rückgängig-Funktion nach der Übernahme eines Trikotsatzes
- automatische Migration älterer gespeicherter Datensätze
- optische Bestätigung beim Speichern und Übernehmen
- Anzeige der Anzahl lokal gespeicherter Trikotsätze
- grüner Übersichtsbutton, sobald mindestens ein Trikotsatz gespeichert ist
- browserübergreifende Unterstützung für Chrome, Edge und Firefox

---

## Voraussetzungen

Für die Verwendung werden benötigt:

- ein unterstützter Browser:
  - Google Chrome
  - Microsoft Edge
  - Mozilla Firefox ab Version 109
- Zugriff auf die Mannschaftsverwaltung von hockey.de
- ein gültiges Benutzerkonto mit den erforderlichen Berechtigungen zur Bearbeitung der Trikoteinstellungen

Die Erweiterung arbeitet ausschließlich auf den konfigurierten Seiten unter:

```text
https://hockey.de/admin/*
https://www.hockey.de/admin/*
```

---

## Installation

Die ZIP-Datei muss zunächst vollständig entpackt werden. Der entpackte Ordner muss mindestens folgende Dateien und Verzeichnisse enthalten:

```text
SULU-Trikot-Manager/
├── icons/
├── js/
├── content.css
├── LICENSE.txt
├── manifest.json
├── NOTICE.txt
├── popup.html
├── popup.js
└── README.md
```

### Google Chrome

1. ZIP-Datei entpacken.
2. In Chrome folgende Adresse öffnen:

   ```text
   chrome://extensions
   ```

3. Oben rechts den **Entwicklermodus** aktivieren.
4. Auf **Entpackte Erweiterung laden** klicken.
5. Den entpackten Projektordner auswählen.
6. Die hockey.de-Seite neu laden.
7. Bei bereits geöffneter Mannschaftsverwaltung empfiehlt sich ein vollständiges Neuladen mit:

   ```text
   Strg + F5
   ```

### Microsoft Edge

1. ZIP-Datei entpacken.
2. In Edge folgende Adresse öffnen:

   ```text
   edge://extensions
   ```

3. Den **Entwicklermodus** aktivieren.
4. Auf **Entpackte Erweiterung laden** klicken.
5. Den entpackten Projektordner auswählen.
6. Die hockey.de-Seite mit `Strg + F5` neu laden.

### Mozilla Firefox

Zum Testen kann die Erweiterung als temporäres Add-on geladen werden:

1. ZIP-Datei entpacken.
2. In Firefox folgende Adresse öffnen:

   ```text
   about:debugging#/runtime/this-firefox
   ```

3. Auf **Temporäres Add-on laden** klicken.
4. Im entpackten Projektordner die Datei `manifest.json` auswählen.
5. Die hockey.de-Seite neu laden.

Temporär geladene Add-ons werden von Firefox beim vollständigen Beenden des Browsers entfernt und müssen danach erneut geladen werden. Für eine dauerhafte normale Installation in Firefox ist eine Signierung durch Mozilla erforderlich.

---

## Bedienung

### Trikotsatz speichern

Ein Trikotsatz kann gespeichert werden, wenn alle vier Farbfelder vollständig definiert sind:

- Trikot
- Hose/Rock
- Stutzen
- Torwart

Die Farbwerte müssen im Hexformat vorliegen:

```text
#RRGGBB
```

Beispiel:

```text
#F7283A
```

Sind alle vier Farbwerte gültig, erscheint im betreffenden Trikotblock die Schaltfläche:

```text
Trikotwerte speichern
```

Beim Speichern werden unter anderem diese Informationen gespeichert:

- Bezeichnung des Trikotsatzes
- vier Farbwerte
- Darstellungsart Rock oder Hose
- Erstellungszeitpunkt
- letzter Änderungszeitpunkt
- technische Datensatz-ID
- Datenstrukturversion

Existiert bereits ein Satz mit derselben Bezeichnung, fragt die Erweiterung vor dem Überschreiben nach.

### Trikotsatz übernehmen

Sind in einem Trikotblock noch keine Farbwerte definiert, erscheint:

```text
Trikotsatz abrufen
```

Nach dem Öffnen der Auswahl kann ein gespeicherter Satz mit **Übernehmen** in den leeren Block eingesetzt werden.

Übernommen werden:

- Name
- Trikotfarbe
- Rock-/Hosenfarbe
- Stutzenfarbe
- Torwartfarbe

Nach einer erfolgreichen Übernahme erscheint eine Rückgängig-Option. Die ursprünglichen Werte des Zielblocks können damit wiederhergestellt werden.

Bereits vollständig definierte Trikotblöcke können nicht über die Abruffunktion überschrieben werden. Dadurch werden vorhandene Einstellungen geschützt.

### Unvollständige Trikotwerte

Wenn nur ein Teil der vier Farbwerte eingetragen ist oder mindestens ein Hexwert ungültig ist, wird der Zustand als unvollständig erkannt.

In diesem Zustand sind weder Speichern noch Abrufen möglich. Dadurch wird verhindert, dass:

- unvollständige Sätze gespeichert werden
- vorhandene Teilwerte versehentlich überschrieben werden

### Trikotsatz bearbeiten

In der globalen Übersicht kann ein gespeicherter Satz über **Bearbeiten** geändert werden.

Bearbeitbar sind:

- Name
- Trikotfarbe
- Rock-/Hosenfarbe
- Stutzenfarbe
- Torwartfarbe

Pro Farbzeile stehen zur Verfügung:

- ein nativer Farbpicker
- ein synchronisiertes Hexfeld

Änderungen im Farbpicker aktualisieren das Hexfeld. Änderungen im Hexfeld aktualisieren den Farbpicker, sofern der eingegebene Wert gültig ist.

Ungültige Hexwerte werden markiert und können nicht gespeichert werden.

### Trikotsatz löschen

Das Löschen ist ausschließlich über die globale Übersicht möglich.

Beim Abrufen eines Trikotsatzes wird keine Löschfunktion angeboten. Damit wird vermieden, dass Datensätze während der Auswahl versehentlich entfernt werden.

Vor dem Löschen erscheint eine Sicherheitsabfrage.

---

## Import und Export

### Export

Über **Export** werden alle lokal gespeicherten Trikotsätze in einer JSON-Datei gesichert.

Der vorgeschlagene Dateiname lautet:

```text
SULU-Trikotsaetze.json
```

Ein Export kann beispielsweise verwendet werden für:

- Datensicherung
- Browserwechsel
- Wechsel des Benutzerprofils
- Übertragung auf einen anderen Rechner
- Wiederherstellung nach einer Neuinstallation

### Import

Über **Import** kann eine zuvor erzeugte JSON-Datei eingelesen werden.

Beim Import wird geprüft, ob die Datei für den SULU Trikot-Manager vorgesehen ist und eine gültige Datensatzliste enthält.

Für jeden importierten Datensatz werden Erstellungs- und Änderungszeitpunkt auf den Zeitpunkt des Imports gesetzt. Frühere Zeitangaben aus der Sicherungsdatei werden für die Anzeige nicht übernommen.

Beispiel:

```text
Gespeichert: 16.10.2026, 12:02
```

Gleichnamige Trikotsätze werden beim Import aktualisiert.

---

## Darstellung der Trikotsätze

Jeder gespeicherte Trikotsatz wird als Karte dargestellt.

Die Karte enthält:

- grafische Dress-Vorschau
- Name des Trikotsatzes
- Farbbox und Hexwert für Trikot
- Farbbox und Hexwert für Rock/Hose
- Farbbox und Hexwert für Stutzen
- Farbbox und Hexwert für Torwart
- Speicher- beziehungsweise Änderungszeitpunkt
- verfügbare Aktionen

### Weibliche Mannschaften

Die Vorschau enthält:

- ärmelloses Trikot
- Hockeyrock mit Bund und Faltensegmenten
- zwei getrennte Stutzen

### Männliche Mannschaften

Die Vorschau enthält:

- ärmelloses Trikot
- Hose statt Hockeyrock
- zwei getrennte Stutzen

Die Dress-Grafik dient ausschließlich der visuellen Darstellung der gespeicherten Farbwerte.

---

## Lokale Datenspeicherung

Die Trikotsätze werden im lokalen Speicher der Browser-Erweiterung gespeichert:

```text
storage.local
```

Der verwendete Speicherschlüssel lautet:

```text
hockeyUniformSetsV3
```

Die Daten werden nicht automatisch zwischen Browsern oder Browserprofilen übertragen. Für einen Wechsel sollte zuvor ein JSON-Export erstellt werden.

Die Erweiterung benötigt die Berechtigung:

```json
"permissions": [
  "storage"
]
```

Es werden keine Trikotdaten an einen externen Server übertragen.

---

## Datenstruktur

Ein gespeicherter Datensatz enthält sinngemäß folgende Informationen:

```json
{
  "id": "eindeutige-datensatz-id",
  "schemaVersion": 2,
  "title": "Rot/Rot/Rot, TW Blau",
  "colors": {
    "shirt": "#F7283A",
    "bottom": "#F7283A",
    "socks": "#F7283A",
    "keeper": "#2685D3"
  },
  "gender": "female",
  "standard": false,
  "alternative": false,
  "createdAt": "2026-10-16T10:02:00.000Z",
  "updatedAt": "2026-10-16T10:02:00.000Z",
  "sourceTeamId": "76787"
}
```

Ältere Datensätze werden beim Lesen automatisch auf die aktuelle Struktur migriert. Fehlende Felder werden mit geeigneten Standardwerten ergänzt.

---

## Projektstruktur

```text
SULU-Trikot-Manager/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── js/
│   ├── app.js
│   ├── core.js
│   ├── storage.js
│   └── ui.js
├── content.css
├── LICENSE.txt
├── manifest.json
├── NOTICE.txt
├── popup.html
├── popup.js
└── README.md
```

### `manifest.json`

Enthält:

- Name und Version der Erweiterung
- Berechtigungen
- unterstützte hockey.de-Seiten
- Content-Scripts
- Stylesheet
- Popup
- Icons
- Firefox-spezifische Einstellungen

### `js/core.js`

Enthält zentrale Hilfsfunktionen für:

- DOM-Zugriff
- Feldzuordnung
- Hexwertprüfung
- native Eingabeereignisse
- Erkennung der Trikotblöcke
- gemeinsame Browser-API

### `js/storage.js`

Verantwortlich für:

- Lesen der lokalen Datensätze
- Speichern
- Überschreiben
- Bearbeiten
- Löschen
- Import
- Export
- Datenmigration
- Behandlung eines ungültig gewordenen Extension-Kontexts

### `js/ui.js`

Verantwortlich für:

- globale Trikotsatzübersicht
- Dress-Grafik
- Farbboxen
- Bearbeitungsdialog
- Farbpicker
- Import- und Exportaktionen
- Zeitstempel
- Toastmeldungen
- Zähler im Übersichtsbutton

### `js/app.js`

Verantwortlich für:

- Initialisierung
- Einfügen der Aktionsleisten
- Zustand leer, unvollständig oder vollständig
- Speichern aus dem hockey.de-Formular
- Übernahme gespeicherter Werte
- Rückgängig-Funktion
- Beobachtung dynamischer Seitenänderungen
- Positionierung des globalen Buttons

### `content.css`

Enthält sämtliche Styles für:

- Aktionsleisten
- Übersichtsbutton
- Dialoge
- Karten
- Dress-Vorschau
- Farbboxen
- Farbpicker
- Zeitstempel
- Effekte
- responsive Darstellung

---

## Browser-Kompatibilität

Die Erweiterung verwendet Manifest V3.

Unterstützt werden:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox ab Version 109

Firefox-spezifische Manifestangaben befinden sich unter:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "sulu-trikot-manager@hockey.de",
    "strict_min_version": "109.0",
    "data_collection_permissions": {
      "required": [
        "none"
      ]
    }
  }
}
```

Die Zeichenfolge im Feld `id` ist eine technische Firefox-Erweiterungs-ID. Sie ist keine verwendete E-Mail-Adresse und benötigt kein existierendes Postfach.

Chrome und Edge ignorieren die Firefox-spezifischen Manifestangaben.

---

## Entwicklung mit Visual Studio Code

### Lokales Git-Repository anlegen

Im Projektordner ein Terminal öffnen:

```bash
git init
git add .
git commit -m "Initial release SULU Trikot-Manager 1.2"
```

### Repository mit GitHub verbinden

```bash
git branch -M main
git remote add origin https://github.com/DEIN-BENUTZERNAME/SULU-Trikot-Manager.git
git push -u origin main
```

`DEIN-BENUTZERNAME` muss durch den eigenen GitHub-Benutzernamen ersetzt werden.

Da der Quellcode rechtlichen Nutzungs- und Weitergabebeschränkungen unterliegt, sollte das GitHub-Repository als **privat** angelegt werden.

### Empfohlene `.gitignore`

```gitignore
*.zip
*.xpi
*.crx

.DS_Store
Thumbs.db
desktop.ini

.vscode/
node_modules/
dist/
tmp/
```

### Spätere Änderungen veröffentlichen

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

---

## Versionierung

Die veröffentlichte Produktversion lautet:

```text
SULU Trikot-Manager 1.2
```

Das Feld `version` in der `manifest.json` muss browserkonform numerisch sein.

Beispiel:

```json
"version": "1.2.14"
```

Bei jeder Änderung, die als Browser-Update erkannt werden soll, muss die technische Versionsnummer erhöht werden.

---

## Fehlerbehebung

### `Extension context invalidated`

Dieser Fehler kann auftreten, wenn die entpackte Erweiterung neu geladen oder ersetzt wird, während hockey.de noch in einem geöffneten Tab läuft.

Lösung:

1. Erweiterung neu laden.
2. Zur hockey.de-Seite wechseln.
3. Seite mit `Strg + F5` vollständig neu laden.

Die Erweiterung fängt diesen Zustand ab und zeigt einen entsprechenden Hinweis an.

### Button oder Aktionsleisten fehlen

- prüfen, ob die richtige hockey.de-Seite geöffnet ist
- prüfen, ob die Erweiterung aktiviert ist
- Seite mit `Strg + F5` neu laden
- prüfen, ob die `manifest.json` aus dem richtigen Ordner geladen wurde
- bei Firefox prüfen, ob das temporäre Add-on noch aktiv ist

### Gespeicherte Trikotsätze fehlen

Die Daten sind an den lokalen Erweiterungsspeicher des jeweiligen Browserprofils gebunden.

Mögliche Ursachen:

- anderes Browserprofil
- anderer Browser
- Erweiterung mit anderer ID installiert
- Browserdaten gelöscht
- Erweiterung entfernt und mit verändertem Speicherbezug neu installiert

Vor Änderungen am Browserprofil sollte deshalb ein Export erstellt werden.

### Hexwert kann nicht gespeichert werden

Zulässig sind ausschließlich Werte im Format:

```text
#RRGGBB
```

Beispiel:

```text
#2685D3
```

Kurze Hexwerte wie `#FFF` werden nicht akzeptiert.

### Firefox entfernt die Erweiterung nach einem Neustart

Das ist bei temporär über `about:debugging` geladenen Erweiterungen erwartetes Verhalten. Für eine dauerhafte Installation ist eine signierte Firefox-Erweiterung erforderlich.

---

## Datenschutz

Der SULU Trikot-Manager speichert Trikotsätze ausschließlich lokal im Erweiterungsspeicher des Browsers.

Die Erweiterung:

- überträgt keine gespeicherten Trikotdaten an einen eigenen Server
- verwendet keine Analyse- oder Trackingdienste
- lädt keine Programmlogik von externen Servern nach
- verwendet die gespeicherten Daten ausschließlich zur lokalen Verwaltung und Übernahme von Trikotsätzen

Der JSON-Export wird nur auf ausdrückliche Benutzeraktion erzeugt.

---

## Rechtliche Hinweise

**Copyright © 2026 Lars Hansen. Alle Rechte vorbehalten.**

Jegliche Veränderung des Programmcodes, der Grafiken, der Benutzeroberfläche, der Konfiguration oder sonstiger Bestandteile dieses Projekts ist untersagt.

Die Weitergabe, Veröffentlichung, Vervielfältigung oder Bereitstellung des Projekts oder einzelner Bestandteile ist ausschließlich mit vorheriger ausdrücklicher Genehmigung durch den Entwickler gestattet.

Weitere Einzelheiten befinden sich in:

- `LICENSE.txt`
- `NOTICE.txt`

---

## Haftungshinweis

Die Verwendung der Erweiterung erfolgt auf eigene Verantwortung. Vor umfangreichen Änderungen oder einem Browserwechsel sollte ein Export der lokal gespeicherten Trikotsätze erstellt werden.

Der SULU Trikot-Manager ist kein offizielles Produkt von hockey.de. Namen, Marken und Darstellungen Dritter verbleiben bei den jeweiligen Rechteinhabern.
