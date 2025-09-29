document.addEventListener("DOMContentLoaded", function () {
    const smoothieInput = document.getElementById("smoothieName");
    const submitButton = document.getElementById("submit");
    
    // Variable für die Zutatenliste
    let validIngredients = null;
    
    // Lade die JSON-Datei mit den gültigen Zutaten
    loadIngredientsData();

    submitButton.addEventListener("click", handleSubmit);

    smoothieInput.addEventListener("keypress", function (event) {
        // Wenn die Enter-Taste gedrückt wurde (Keycode 13)
        if (event.key === "Enter") {
            event.preventDefault(); // Verhindert das Standardverhalten
            handleSubmit(event); // Ruft dieselbe Handler-Funktion auf
        }
    });
    
    // Funktion zum Laden der Zutatenliste aus der JSON-Datei
    function loadIngredientsData() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "ressources/js/ingredients.json", true);
        
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                try {
                    validIngredients = JSON.parse(this.responseText);
                    console.log("Zutatenliste erfolgreich geladen:", validIngredients);
                    
                    // Debug: Zeige alle gültigen Zutaten an
                    if (validIngredients && validIngredients.zutaten) {
                        console.log("Gültige Zutaten:");
                        validIngredients.zutaten.forEach(item => {
                            console.log(`Standard: ${item.standard}, Eingaben: ${item.eingabe.join(', ')}`);
                        });
                    }
                } catch (error) {
                    console.error("Fehler beim Parsen der Zutatenliste:", error);
                }
            } else {
                console.error("Fehler beim Laden der Zutatenliste:", xhr.statusText);
            }
        };
        
        xhr.onerror = function() {
            console.error("Netzwerkfehler beim Laden der Zutatenliste");
        };
        
        xhr.send();
    }

    // Hilfsfunktion: Prüft, ob eine Zutat in der Liste der gültigen Zutaten enthalten ist
    function isValidIngredient(ingredient) {
        if (!validIngredients || !validIngredients.zutaten) {
            console.warn("Zutatenliste nicht geladen, kann nicht validieren:", ingredient);
            return false; // Wenn die Zutatenliste nicht geladen ist, akzeptieren wir nichts
        }
        
        const lowerIngredient = ingredient.toLowerCase().trim();
        console.log(`Prüfe Zutat: "${lowerIngredient}"`);
        
        // Prüfe, ob die Zutat in einer der Eingabelisten vorkommt
        for (const validItem of validIngredients.zutaten) {
            for (const entry of validItem.eingabe) {
                const lowerEntry = entry.toLowerCase().trim();
                console.log(`Vergleiche mit: "${lowerEntry}"`);
                if (lowerIngredient === lowerEntry) {
                    console.log(`✓ Gültige Zutat gefunden: ${ingredient} -> ${validItem.standard}`);
                    return true;
                }
            }
        }
        
        console.log(`✗ Ungültige Zutat: ${ingredient}`);
        return false;
    }

    function handleSubmit(event) {
        event.preventDefault(); // Verhindert das Neuladen der Seite

        // get name of the smoothie
        const smoothieName = smoothieInput.value;

        // Prüfung auf leere Eingabe
        if (!smoothieName.trim()) {
            console.warn("Bitte gib einen Smoothie-Namen ein");
            return;
        }

        // get fields to change
        const smoothieHeadline = document.querySelector(".smoothieName");
        const smoothieImage = document.querySelector(".smoothiePicture");
        const smoothieButton = document.querySelector(".smoothieButton");
        const smoothieIngredientsList = document.querySelector(
            ".smoothieIngredientsList"
        );

        const xhr = new XMLHttpRequest();
        const url = "https://storage01.dbe.academy/fswd/api-smoothie-mixer/";
        const attribute = "?smoothiename=" + encodeURIComponent(smoothieName);
        xhr.open("GET", url + attribute, true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                const response = JSON.parse(this.responseText);
                console.log("API-Antwort:", response);
                const data = response.data;
                // DOM- Manipulation
                smoothieImage.src = data.image;
                smoothieHeadline.innerText = makeFirstLetterBig(data.name);
                smoothieButton.innerText = data.taste;
                
                // Process ingredients list
                let allIngredients = [];

                // Nur das erste Element (Index 0) muss gefiltert werden
                if (data.ingredients.length > 0) {
                    // Behandle das erste Element (Benutzereingabe)
                    const firstIngredient = data.ingredients[0];
                    console.log("Erster Eintrag aus API:", firstIngredient);
                    
                    // Schritt 1: Behandle Bindestriche-Wörter als eine Einheit
                    const specialMarker = "###HYPHEN###";
                    let processedIngredient = firstIngredient.replace(/-/g, specialMarker);

                    // Schritt 2: Teile den String an den Leerzeichen
                    const splitBySpaces = processedIngredient.split(" ");
                    console.log("Aufgeteilte Zutaten:", splitBySpaces);

                    // Schritt 3: Stelle die Bindestriche in jedem Teil wieder her
                    const finalIngredients = splitBySpaces.map((part) =>
                        part.replace(new RegExp(specialMarker, "g"), "-")
                    );
                    console.log("Finale Zutaten zur Prüfung:", finalIngredients);

                    // Füge nur gültige Zutaten zum Ergebnis-Array hinzu
                    finalIngredients.forEach(item => {
                        if (item.trim() !== "") {  // Überspringe leere Strings
                            if (isValidIngredient(item)) {
                                allIngredients.push(item);
                                console.log(`Zutat hinzugefügt: ${item}`);
                            } else {
                                console.log(`Ungültige Zutat ignoriert: ${item}`);
                            }
                        }
                    });
                    
                    // Debug: Zeige die gefundenen gültigen Zutaten an
                    console.log("Gefundene gültige Zutaten aus Benutzereingabe:", allIngredients);
                }
                
                // Füge alle anderen Zutaten direkt hinzu (ab Index 1)
                for (let i = 1; i < data.ingredients.length; i++) {
                    allIngredients.push(data.ingredients[i]);
                    console.log(`API-Zutat hinzugefügt: ${data.ingredients[i]}`);
                }

                // Entferne leere Strings aus dem Array
                allIngredients = allIngredients.filter(
                    (ingredient) => ingredient.trim() !== ""
                );
                
                console.log("Alle Zutaten vor Standardisierung:", allIngredients);
                
                // Standardisiere die Zutaten basierend auf der JSON-Datei
                const standardizedIngredients = standardizeIngredients(allIngredients);
                console.log("Standardisierte Zutaten:", standardizedIngredients);

                // clear ingredientlist
                smoothieIngredientsList.innerHTML = "";

                // add ingredients to <ul> tag
                standardizedIngredients.forEach((ingredient) => {
                    const listItem = document.createElement("li");
                    listItem.textContent = ingredient;
                    listItem.classList.add("smoothieIngredient");
                    smoothieIngredientsList.appendChild(listItem);
                });
            } else {
                console.warn("Etwas ist schief gelaufen.");
                console.warn("Error: " + xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error("Network error");
        };

        xhr.send();
    }
    
    // Funktion zur Standardisierung der Zutaten
    function standardizeIngredients(ingredientsList) {
        // Wenn die Zutatenliste noch nicht geladen wurde, gib die ursprüngliche Liste zurück
        if (!validIngredients || !validIngredients.zutaten) {
            console.warn("Zutatenliste noch nicht geladen, verwende Originaleingaben");
            return ingredientsList;
        }
        
        // Standardisiere jede Zutat
        return ingredientsList.map(ingredient => {
            // Konvertiere Zutat zu Kleinbuchstaben für den Vergleich
            const lowerIngredient = ingredient.toLowerCase().trim();
            
            // Suche nach einer passenden Zutat in der JSON-Liste
            for (const validIngredient of validIngredients.zutaten) {
                if (validIngredient.eingabe.some(entry => 
                    entry.toLowerCase().trim() === lowerIngredient
                )) {
                    console.log(`Standardisiere: ${ingredient} -> ${validIngredient.standard}`);
                    return validIngredient.standard;
                }
            }
            
            // Wenn keine Übereinstimmung gefunden wurde, gib die ursprüngliche Zutat zurück
            return ingredient;
        });
    }

    function makeFirstLetterBig(text) {
        // Teile den Text an Leerzeichen
        const words = text.split(" ");

        // Mache den ersten Buchstaben jedes Wortes groß
        const capitalizedWords = words.map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
        );

        // Verbinde die Wörter mit Bindestrichen
        return capitalizedWords.join("-");
    }
});
