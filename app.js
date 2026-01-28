// Load existing entries
let entries = JSON.parse(localStorage.getItem("nutritionEntries")) || [];
function saveEntries() {
    localStorage.setItem("nutritionEntries", JSON.stringify(entries));
}

// Load Food Library (will be filled from localStorage or foods.json)
let foodLibrary = [];
function saveLibrary() {
    localStorage.setItem("foodLibrary", JSON.stringify(foodLibrary));
}

// Daily totals history
let dailyTotals = JSON.parse(localStorage.getItem("dailyTotals")) || [];
function saveDailyTotals() {
    localStorage.setItem("dailyTotals", JSON.stringify(dailyTotals));
}

// Local date (no UTC issues)
function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Daily rollover removed — entries persist normally

// Track selected category
let selectedCategory = null;

// MULTIPLIER LOGIC
let currentMultiplier = 1;
let multiplierInput = "";

// Keypad elements
const pad = document.getElementById("multiplierPad");
const padDisplay = document.getElementById("multiplierDisplay");
const padKeys = document.querySelectorAll(".padKey");
const padBack = document.getElementById("padBack");
const padCancel = document.getElementById("padCancel");
const padOK = document.getElementById("padOK");

// Show keypad
document.getElementById("multiplyButton").addEventListener("click", () => {
    multiplierInput = "";
    padDisplay.textContent = "0";
    pad.classList.remove("hidden");
});

// Keypad digit buttons
padKeys.forEach(key => {
    key.addEventListener("click", () => {
        const val = key.textContent;

        // Prevent multiple decimals
        if (val === "." && multiplierInput.includes(".")) return;

        multiplierInput += val;
        padDisplay.textContent = multiplierInput || "0";
    });
});

// Backspace
padBack.addEventListener("click", () => {
    multiplierInput = multiplierInput.slice(0, -1);
    padDisplay.textContent = multiplierInput || "0";
});

// Cancel
padCancel.addEventListener("click", () => {
    currentMultiplier = 1;
    multiplierInput = "";
    pad.classList.add("hidden");
});

// OK
padOK.addEventListener("click", () => {
    const num = Number(multiplierInput);
    if (!isNaN(num) && num > 0) {
        currentMultiplier = num;
    } else {
        currentMultiplier = 1;
    }
    pad.classList.add("hidden");
});

// Category button logic
document.querySelectorAll(".catButton").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".catButton").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedCategory = btn.dataset.category;
    });
});

// Add entry
document.getElementById("addButton").addEventListener("click", () => {
    const name = document.getElementById("foodName").value.trim();
    const calories = Number(document.getElementById("calories").value);
    const fat = Number(document.getElementById("fat").value);
    const carbs = Number(document.getElementById("carbs").value);

    if (!name || isNaN(calories) || isNaN(fat) || isNaN(carbs)) {
        alert("Please fill out all fields.");
        return;
    }

    const entry = {
        name,
        calories: calories * currentMultiplier,
        fat: fat * currentMultiplier,
        carbs: carbs * currentMultiplier,
        date: getTodayDate()
    };

    entries.push(entry);
    saveEntries();
    renderEntries();
    updateTotals();
    clearInputs();

    // Reset multiplier
    currentMultiplier = 1;
});

// Save to library (now requires category)
document.getElementById("saveToLibraryButton").addEventListener("click", () => {
    const name = document.getElementById("foodName").value.trim();
    const calories = Number(document.getElementById("calories").value);
    const fat = Number(document.getElementById("fat").value);
    const carbs = Number(document.getElementById("carbs").value);

    if (!name || isNaN(calories) || isNaN(fat) || isNaN(carbs)) {
        alert("Please fill out all fields before saving to library.");
        return;
    }

    if (!selectedCategory) {
        alert("Please select a category before saving.");
        return;
    }

    const food = { 
        name, 
        calories, 
        fat, 
        carbs,
        category: selectedCategory
    };

    foodLibrary.push(food);
    saveLibrary();
    renderLibrary();

    selectedCategory = null;
    document.querySelectorAll(".catButton").forEach(b => b.classList.remove("active"));

    clearInputs();
});

// Render library
function renderLibrary() {
    const list = document.getElementById("libraryList");
    const search = document.getElementById("librarySearch").value.toLowerCase();

    list.innerHTML = "";

    // Your preferred category order
    const categoryOrder = ["Fruit", "Veg", "Meat", "Dairy", "Grains", "Other"];

    // Sort by category first, then alphabetically
    const sorted = [...foodLibrary].sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category);
        const catB = categoryOrder.indexOf(b.category);

        if (catA !== catB) return catA - catB;

        return a.name.localeCompare(b.name);
    });

    // Render filtered + sorted list
    sorted
        .filter(food => food.name.toLowerCase().includes(search))
        .forEach((food, index) => {
            const li = document.createElement("li");
            li.textContent = `${food.name} — ${food.calories} cal, ${food.fat}g fat, ${food.carbs}g carbs — [${food.category}]`;

            li.addEventListener("click", () => useFoodFromLibrary(food));

            li.addEventListener("dblclick", () => {
                if (confirm(`Delete "${food.name}" from library?`)) {
                    foodLibrary.splice(index, 1);
                    saveLibrary();
                    renderLibrary();
                }
            });

            list.appendChild(li);
        });
}

document.getElementById("librarySearch").addEventListener("input", renderLibrary);

// Auto-fill from library
function useFoodFromLibrary(food) {
    document.getElementById("foodName").value = food.name;
    document.getElementById("calories").value = food.calories;
    document.getElementById("fat").value = food.fat;
    document.getElementById("carbs").value = food.carbs;

    // Reset multiplier when selecting a food
    currentMultiplier = 1;
}

// Render entries
function renderEntries() {
    const today = getTodayDate();
    const list = document.getElementById("entryList");
    list.innerHTML = "";

    entries
        .map((e, index) => ({ ...e, index }))
        .filter(e => e.date === today)
        .forEach(e => {
            const li = document.createElement("li");
            li.textContent = `${e.name} — ${e.calories} cal, ${e.fat}g fat, ${e.carbs}g carbs`;

            li.addEventListener("dblclick", () => {
                const action = prompt(
                    `Edit or Delete?\n\n1 = Edit\n2 = Delete\n\nEntry: ${e.name} (${e.calories} cal)`
                );

                if (action === "1") editEntry(e.index);
                else if (action === "2") deleteEntry(e.index);
            });

            list.appendChild(li);
        });
}

// Edit entry
function editEntry(index) {
    const entry = entries[index];

    const newName = prompt("Food name:", entry.name);
    if (!newName) return;

    const newCalories = Number(prompt("Calories:", entry.calories));
    const newFat = Number(prompt("Fat (g):", entry.fat));
    const newCarbs = Number(prompt("Carbs (g):", entry.carbs));

    if (isNaN(newCalories) || isNaN(newFat) || isNaN(newCarbs)) {
        alert("Invalid numbers.");
        return;
    }

    entries[index] = {
        ...entry,
        name: newName,
        calories: newCalories,
        fat: newFat,
        carbs: newCarbs
    };

    saveEntries();
    renderEntries();
    updateTotals();
}

// Delete entry
function deleteEntry(index) {
    if (confirm("Delete this entry?")) {
        entries.splice(index, 1);
        saveEntries();
        renderEntries();
        updateTotals();
    }
}

// Clear today's totals
document.getElementById("clearTodayButton").addEventListener("click", () => {
    if (!confirm("Clear all entries for today?")) return;

    const today = getTodayDate();
    entries = entries.filter(e => e.date !== today);
    saveEntries();
    renderEntries();
    updateTotals();
});

// Update totals
function updateTotals() {
    const today = getTodayDate();
    const todayEntries = entries.filter(e => e.date === today);

    const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalFat = todayEntries.reduce((sum, e) => sum + e.fat, 0);
    const totalCarbs = todayEntries.reduce((sum, e) => sum + e.carbs, 0);

    document.getElementById("totalCalories").textContent = totalCalories.toFixed(2);
    document.getElementById("totalFat").textContent = totalFat.toFixed(2);
    document.getElementById("totalCarbs").textContent = totalCarbs.toFixed(2);
}

// Utility
function clearInputs() {
    document.getElementById("foodName").value = "";
    document.getElementById("calories").value = "";
    document.getElementById("fat").value = "";
    document.getElementById("carbs").value = "";
}

// Load Food Library from localStorage or foods.json
async function loadFoodLibrary() {
    const stored = JSON.parse(localStorage.getItem("foodLibrary")) || [];

    // If user already has a library, use it as the source of truth
    if (Array.isArray(stored) && stored.length > 0) {
        foodLibrary = stored;
        renderLibrary();
        return;
    }

    // Otherwise, try to seed from foods.json
    try {
        const response = await fetch("foods.json");
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                foodLibrary = data;
                saveLibrary();
                renderLibrary();
                return;
            }
        }
    } catch (err) {
        console.error("Failed to load foods.json:", err);
    }

    // Fallback: empty library
    foodLibrary = stored;
    renderLibrary();
}

// Initial load
renderEntries();
updateTotals();
loadFoodLibrary();




















