# README.md für Smooflix

## Einleitung

Smooflix ist eine Webseite, die ich im Rahmen einer Weiterbildung erstellt habe. Die Aufgabe war, eine Smoothie-Suchfunktion zu programmieren, die über eine API Smoothie-Rezepte abruft und anzeigt. Man gibt einfach einen Namen ein und bekommt einen passenden Smoothie mit Zutaten, Bild und Geschmacksrichtung zurück. Ich habe dabei nicht nur die Grundaufgabe umgesetzt, sondern auch einige zusätzliche Features eingebaut, die ich cool fand.

## Hauptteil

### Struktur des Projekts

Das Projekt besteht aus drei Hauptteilen:

-   HTML: Die Grundstruktur der Webseite mit Suchfeld und Anzeigebereichen
-   CSS/LESS: Für das Design habe ich LESS verwendet und es lokal in CSS kompiliert
-   JavaScript: Hier passiert die eigentliche Magie mit der API-Abfrage

### Javascript-Aufbau

Mein JavaScript-Code kümmert sich um folgende Aufgaben:

-   Erfassen der Nutzereingabe aus dem Suchfeld
-   Zusammenbauen der API-URL mit dem eingegebenen Smoothie-Namen
-   Senden des GET-Requests mit der Fetch-API
-   Verarbeiten der JSON-Antwort und Anzeigen auf der Webseite

```javascript
// Beispiel für die Fetch-Funktion
fetch(
    `https://storage01.dbe.academy/fswd/api-smoothie-mixer/?smoothiename=${smoothieName}`
)
    .then((response) => response.json())
    .then((data) => {
        // Verarbeitung der Daten
    })
    .catch((error) => {
        console.error("Fehler beim Abrufen der Daten:", error);
    });
```
Als Extra-Feature habe ich eine separate JSON-Datei erstellt, die zusätzliche Informationen zu den Smoothies enthält. Das war nicht Teil der eigentlichen Aufgabe, aber ich wollte ausprobieren, wie man mehrere Datenquellen kombinieren kann.
### Version V1.1: Preloader (Zusatzleistung)
In der Version V1.1 habe ich einen Ladebildschirm hinzugefügt. Das war eine Zusatzleistung, die nicht in der Aufgabenstellung gefordert war. Der Preloader wird angezeigt, während die Daten von der API geladen werden, und verschwindet, sobald alles bereit ist.

Der Preloader funktioniert so:

1. Beim Absenden der Suche wird der Ladebildschirm eingeblendet
2. Während die API-Anfrage läuft, sieht der Nutzer eine Animation
3. Sobald die Daten geladen sind, wird der Preloader ausgeblendet und die Ergebnisse werden angezeigt

Ich habe dafür Promise-Funktionen verwendet, um den asynchronen Ablauf zu steuern:
```javascript
function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

// Beim Suchen
showLoader();
fetchSmoothieData()
  .then(data => {
    displayResults(data);
    hideLoader();
  });
```
## Fazit
Das Smooflix-Projekt hat mir gezeigt, wie man mit externen APIs arbeitet und Daten dynamisch in eine Webseite einbindet. Besonders Spaß gemacht hat mir das Hinzufügen eigener Features wie des Preloaders und der zusätzlichen JSON-Datei. Ich habe viel über asynchrone Programmierung mit Promises gelernt und wie man eine benutzerfreundliche Oberfläche gestaltet. Insgesamt bin ich mit dem Ergebnis zufrieden und freue mich darauf, in Zukunft noch mehr solcher interaktiven Webseiten zu entwickeln.