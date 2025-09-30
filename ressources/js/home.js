document.addEventListener("DOMContentLoaded", function () {
    const smoothieInput = document.getElementById("smoothieName");
    const submitButton = document.getElementById("submit");
    const loaderOverlay = document.getElementById("loader-overlay");
    const progressCircle = document.querySelector(".progress-ring__circle");
    const progressPercentage = document.querySelector(".progress-percentage");
    const contentSection = document.querySelector("section#content");

    // Store original styles of content elements
    const originalStyles = new Map();

    // Handle localStorage
    const storedSmoothieName = localStorage.getItem("storedSmoothieName");
    if (null !== storedSmoothieName) {
        smoothieInput.value = storedSmoothieName;
        setTimeout(() => {
            submitButton.click();
        }, 500);
    }

    // Calculate circle properties
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

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

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                try {
                    validIngredients = JSON.parse(this.responseText);
                    console.log(
                        "Ingredients loaded successfully:",
                        validIngredients
                    );
                } catch (error) {
                    console.error("Error parsing ingredients list:", error);
                }
            } else {
                console.error(
                    "Error loading ingredients list:",
                    xhr.statusText
                );
            }
        };

        xhr.onerror = function () {
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

        return validIngredients.zutaten.some((validItem) =>
            validItem.eingabe.some(
                (entry) => entry.toLowerCase().trim() === lowerIngredient
            )
        );
    }

    // Update progress circle
    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        progressPercentage.textContent = `${Math.round(percent)}%`;
    }

    // Preload image and return a promise
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () =>
                reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    // Fade content to white
    function fadeContentToWhite() {
        // Save original styles and set elements to white
        const contentElements = contentSection.querySelectorAll("*");

        contentElements.forEach((element) => {
            // Store original styles
            originalStyles.set(element, {
                color: getComputedStyle(element).color,
                backgroundColor: getComputedStyle(element).backgroundColor,
                borderColor: getComputedStyle(element).borderColor,
                transition: element.style.transition,
            });

            // Set transition for smooth fade
            element.style.transition =
                "color 0.5s, background-color 0.5s, border-color 0.5s";

            // Fade text to white
            if (getComputedStyle(element).color !== "rgba(0, 0, 0, 0)") {
                element.style.color = "#FFFFFF";
            }

            // Fade background to white if it's not transparent
            const bgColor = getComputedStyle(element).backgroundColor;
            if (bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
                element.style.backgroundColor = "#FFFFFF";
            }

            // Fade border to white if it exists
            const borderColor = getComputedStyle(element).borderColor;
            if (
                borderColor !== "rgba(0, 0, 0, 0)" &&
                borderColor !== "transparent"
            ) {
                element.style.borderColor = "#FFFFFF";
            }
        });

        // Also handle images
        const images = contentSection.querySelectorAll("img");
        images.forEach((img) => {
            originalStyles.set(img, {
                opacity: getComputedStyle(img).opacity,
                transition: img.style.transition,
            });
            img.style.transition = "opacity 0.5s";
            img.style.opacity = "0";
        });
    }

    // Restore original content colors
    function restoreContentColors() {
        const contentElements = contentSection.querySelectorAll("*");

        contentElements.forEach((element) => {
            if (originalStyles.has(element)) {
                const original = originalStyles.get(element);

                // Restore original color
                if (original.color) {
                    element.style.color = original.color;
                }

                // Restore original background
                if (original.backgroundColor) {
                    element.style.backgroundColor = original.backgroundColor;
                }

                // Restore original border
                if (original.borderColor) {
                    element.style.borderColor = original.borderColor;
                }

                // Restore original opacity for images
                if (original.opacity) {
                    element.style.opacity = original.opacity;
                }

                // Restore original transition
                setTimeout(() => {
                    element.style.transition = original.transition || "";
                }, 500); // Wait for transition to complete
            }
        });
    }

    function handleSubmit(event) {
        event.preventDefault();

        const smoothieName = smoothieInput.value;

        // setLocalStorage
        localStorage.setItem("storedSmoothieName", smoothieName);

        if (!smoothieName.trim()) {
            console.warn("Please enter a smoothie name");
            return;
        }

        const smoothieHeadline = document.querySelector(".smoothieName");
        const smoothieImage = document.querySelector(".smoothiePicture");
        const smoothieButton = document.querySelector(".smoothieButton");
        const smoothieIngredientsList = document.querySelector(
            ".smoothieIngredientsList"
        );

        // Fade content to white
        fadeContentToWhite();

        // Show loader
        loaderOverlay.classList.remove("hidden");
        let progress = 0;
        let apiData = null;
        let apiLoaded = false;
        let imagePreloaded = false;

        // Start API request immediately
        const xhr = new XMLHttpRequest();
        const url = "https://storage01.dbe.academy/fswd/api-smoothie-mixer/";
        const attribute = "?smoothiename=" + encodeURIComponent(smoothieName);
        xhr.open("GET", url + attribute, true);

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                apiData = JSON.parse(this.responseText).data;
                apiLoaded = true;
                console.log("API data loaded");

                // Start preloading the image as soon as we have the URL
                if (apiData && apiData.image) {
                    preloadImage(apiData.image)
                        .then(() => {
                            console.log("Image preloaded successfully");
                            imagePreloaded = true;
                        })
                        .catch((error) => {
                            console.error("Error preloading image:", error);
                            imagePreloaded = true; // Continue even if image fails to load
                        });
                } else {
                    imagePreloaded = true; // No image to preload
                }
            } else {
                console.warn("Something went wrong:", xhr.statusText);
                apiLoaded = true; // Mark as loaded even on error to continue animation
                imagePreloaded = true; // No image to preload on error
            }
        };

        xhr.onerror = function () {
            console.error("Network error");
            apiLoaded = true; // Mark as loaded even on error to continue animation
            imagePreloaded = true; // No image to preload on error
        };

        xhr.send();

        // Start progress animation
        function updateProgress() {
            // Random speed factor between 0.5 and 1.5
            const speedFactor = 0.5 + Math.random();

            // If API is loaded and progress is below 70%, speed up to reach 100%
            if (apiLoaded && progress < 70) {
                progress += speedFactor * 2;
            } else {
                progress += speedFactor;
            }

            // Cap progress at 100%
            if (progress >= 100) {
                progress = 100;
                setProgress(progress);

                // Add pulse animation
                progressCircle.classList.add("pulse");
                progressPercentage.classList.add("pulse");

                // Wait for image to be preloaded and then continue
                const checkImageAndContinue = () => {
                    if (imagePreloaded) {
                        // First update the UI with new data while loader is still visible
                        if (apiData) {
                            updateSmoothieUI(apiData);
                        }

                        // Wait 2 seconds for the pulse animation
                        setTimeout(() => {
                            // Then remove the pulse animation
                            progressCircle.classList.remove("pulse");
                            progressPercentage.classList.remove("pulse");

                            // Hide the loader
                            loaderOverlay.classList.add("hidden");

                            // Finally restore the original colors
                            restoreContentColors();
                        }, 2000);
                    } else {
                        // Check again in 100ms
                        setTimeout(checkImageAndContinue, 100);
                    }
                };

                checkImageAndContinue();
                return;
            }

            // If API is loaded but progress is less than 70%, accelerate to 70%
            if (apiLoaded && progress < 70) {
                progress = Math.max(progress, 70);
            }

            // If progress is over 90% but API isn't loaded yet, slow down
            if (!apiLoaded && progress > 90) {
                progress = 90; // Hold at 90% until API loads
            }

            // If progress is over 95% but image isn't preloaded yet, slow down
            if (apiLoaded && !imagePreloaded && progress > 95) {
                progress = 95; // Hold at 95% until image is preloaded
            }

            setProgress(progress);
            requestAnimationFrame(updateProgress);
        }

        requestAnimationFrame(updateProgress);

        // Function to update UI with smoothie data
        function updateSmoothieUI(data) {
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
                let processedIngredient = firstIngredient.replace(
                    /-/g,
                    specialMarker
                );

                // Split by spaces
                const splitBySpaces = processedIngredient.split(" ");

                // Restore hyphens in each part
                const finalIngredients = splitBySpaces.map((part) =>
                    part.replace(new RegExp(specialMarker, "g"), "-")
                );

                // Add only valid ingredients
                finalIngredients.forEach((item) => {
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
            allIngredients = allIngredients.filter(
                (ingredient) => ingredient.trim() !== ""
            );

            // Standardize ingredients based on JSON file
            const standardizedIngredients =
                standardizeIngredients(allIngredients);

            // Clear and update ingredients list
            smoothieIngredientsList.innerHTML = "";
            standardizedIngredients.forEach((ingredient) => {
                const listItem = document.createElement("li");
                listItem.textContent = ingredient;
                listItem.classList.add("smoothieIngredient");
                smoothieIngredientsList.appendChild(listItem);
            });
        }
    }

    // Standardize ingredients based on JSON data
    function standardizeIngredients(ingredientsList) {
        if (!validIngredients || !validIngredients.zutaten) {
            return ingredientsList;
        }

        return ingredientsList.map((ingredient) => {
            const lowerIngredient = ingredient.toLowerCase().trim();

            for (const validIngredient of validIngredients.zutaten) {
                if (
                    validIngredient.eingabe.some(
                        (entry) =>
                            entry.toLowerCase().trim() === lowerIngredient
                    )
                ) {
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
            (word) => word.charAt(0).toUpperCase() + word.slice(1)
        );
        return capitalizedWords.join("-");
    }
});
