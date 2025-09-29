document.addEventListener("DOMContentLoaded", function () {
    const smoothieInput = document.getElementById("smoothieName");
    const submitButton = document.getElementById("submit");
    
    // Ingredients list from JSON file
    let validIngredients = null;
    
    // Load ingredients data
    loadIngredientsData();

    submitButton.addEventListener("click", handleSubmit);

    smoothieInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit(event);
        }
    });
    
    // Load ingredients list from JSON file
    function loadIngredientsData() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "ressources/js/ingredients.json", true);
        
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                try {
                    validIngredients = JSON.parse(this.responseText);
                    console.log("Ingredients loaded successfully:", validIngredients);
                } catch (error) {
                    console.error("Error parsing ingredients list:", error);
                }
            } else {
                console.error("Error loading ingredients list:", xhr.statusText);
            }
        };
        
        xhr.onerror = function() {
            console.error("Network error while loading ingredients list");
        };
        
        xhr.send();
    }

    // Check if ingredient exists in valid ingredients list
    function isValidIngredient(ingredient) {
        if (!validIngredients || !validIngredients.zutaten) {
            return false;
        }
        
        const lowerIngredient = ingredient.toLowerCase().trim();
        
        return validIngredients.zutaten.some(validItem => 
            validItem.eingabe.some(entry => 
                entry.toLowerCase().trim() === lowerIngredient
            )
        );
    }

    function handleSubmit(event) {
        event.preventDefault();

        const smoothieName = smoothieInput.value;

        if (!smoothieName.trim()) {
            console.warn("Please enter a smoothie name");
            return;
        }

        const smoothieHeadline = document.querySelector(".smoothieName");
        const smoothieImage = document.querySelector(".smoothiePicture");
        const smoothieButton = document.querySelector(".smoothieButton");
        const smoothieIngredientsList = document.querySelector(".smoothieIngredientsList");

        const xhr = new XMLHttpRequest();
        const url = "https://storage01.dbe.academy/fswd/api-smoothie-mixer/";
        const attribute = "?smoothiename=" + encodeURIComponent(smoothieName);
        xhr.open("GET", url + attribute, true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                const response = JSON.parse(this.responseText);
                const data = response.data;
                
                // Update DOM elements
                smoothieImage.src = data.image;
                smoothieImage.alt = makeFirstLetterBig(data.name);
                smoothieImage.title = makeFirstLetterBig(data.name);
                smoothieHeadline.innerText = makeFirstLetterBig(data.name);
                smoothieButton.innerText = data.taste;
                
                // Process ingredients
                let allIngredients = [];

                // Only first element (index 0) needs filtering
                if (data.ingredients.length > 0) {
                    const firstIngredient = data.ingredients[0];
                    
                    // Handle hyphenated words as single units
                    const specialMarker = "###HYPHEN###";
                    let processedIngredient = firstIngredient.replace(/-/g, specialMarker);

                    // Split by spaces
                    const splitBySpaces = processedIngredient.split(" ");

                    // Restore hyphens in each part
                    const finalIngredients = splitBySpaces.map(part => 
                        part.replace(new RegExp(specialMarker, "g"), "-")
                    );

                    // Add only valid ingredients
                    finalIngredients.forEach(item => {
                        if (item.trim() !== "" && isValidIngredient(item)) {
                            allIngredients.push(item);
                        }
                    });
                }
                
                // Add all other ingredients directly (from index 1)
                for (let i = 1; i < data.ingredients.length; i++) {
                    allIngredients.push(data.ingredients[i]);
                }

                // Remove empty strings
                allIngredients = allIngredients.filter(ingredient => ingredient.trim() !== "");
                
                // Standardize ingredients based on JSON file
                const standardizedIngredients = standardizeIngredients(allIngredients);

                // Clear and update ingredients list
                smoothieIngredientsList.innerHTML = "";
                standardizedIngredients.forEach(ingredient => {
                    const listItem = document.createElement("li");
                    listItem.textContent = ingredient;
                    listItem.classList.add("smoothieIngredient");
                    smoothieIngredientsList.appendChild(listItem);
                });
            } else {
                console.warn("Something went wrong:", xhr.statusText);
            }
        };

        xhr.onerror = function () {
            console.error("Network error");
        };

        xhr.send();
    }
    
    // Standardize ingredients based on JSON data
    function standardizeIngredients(ingredientsList) {
        if (!validIngredients || !validIngredients.zutaten) {
            return ingredientsList;
        }
        
        return ingredientsList.map(ingredient => {
            const lowerIngredient = ingredient.toLowerCase().trim();
            
            for (const validIngredient of validIngredients.zutaten) {
                if (validIngredient.eingabe.some(entry => 
                    entry.toLowerCase().trim() === lowerIngredient
                )) {
                    return validIngredient.standard;
                }
            }
            
            return ingredient;
        });
    }

    // Capitalize first letter of each word and join with hyphens
    function makeFirstLetterBig(text) {
        const words = text.split(" ");
        const capitalizedWords = words.map(
            word => word.charAt(0).toUpperCase() + word.slice(1)
        );
        return capitalizedWords.join("-");
    }
});
