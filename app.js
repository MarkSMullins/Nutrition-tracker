// -------------------------------
// Load existing entries
// -------------------------------
let entries = JSON.parse(localStorage.getItem("nutritionEntries")) || [];

function saveEntries() {
    localStorage.setItem("nutritionEntries", JSON.stringify(entries));
}

// -------------------------------
// Load Food Library
// -------------------------------
let foodLibrary = JSON.parse(localStorage.getItem("foodLibrary")) || [];

function saveLibrary() {
    localStorage.setItem("foodLibrary", JSON.stringify(foodLibrary));
}

// -------------------------------
// Add a new food entry
// -------------------------------
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
        calories,
        fat,
        carbs,
        date: new Date().toISOString().slice(0, 10)
    };

    entries.push(entry);
    saveEntries();
    renderEntries();
    updateTotals();

    clearInputs();
});

// -------------------------------
// Save current inputs to Food Library
// -------------------------------
document.getElementById("saveToLibraryButton").addEventListener("click", () => {
    const name = document.getElementById("foodName").value.trim();
    const calories = Number(document.getElementById("calories").value);
    const fat = Number(document.getElementById("fat").value);
    const carbs = Number(document.getElementById("carbs").value);

    if (!name || isNaN(calories) || isNaN(fat) || isNaN(carbs)) {
        alert("Please fill out all fields before saving to library.");
        return;
    }

    const food = { name, calories, fat, carbs };
    foodLibrary.push(food);
    saveLibrary();
    renderLibrary();

    clearInputs();
});

// -------------------------------
// Render Food Library (with search filter)
// -------------------------------
function renderLibrary() {
    const list = document.getElementById("libraryList");
    const search = document.getElementById("librarySearch").value.toLowerCase();

    list.innerHTML = "";

    foodLibrary
        .filter(food => food.name.toLowerCase().includes(search))
        .forEach((food, index) => {
            const li = document.createElement("li");
            li.textContent = `${food.name} — ${food.calories} cal, ${food.fat}g fat, ${food.carbs}g carbs`;

            // Single tap → use food
            li.addEventListener("click", () => {
                useFoodFromLibrary(food);
            });

            // Double tap → delete food
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

// -------------------------------
// Auto-fill inputs when selecting a library item
// -------------------------------
function useFoodFromLibrary(food) {
    document.getElementById("foodName").value = food.name;
    document.getElementById("calories").value = food.calories;
    document.getElementById("fat").value = food.fat;
    document.getElementById("carbs").value = food.carbs;
}

// -------------------------------
// Render today's entries (NOW WITH DOUBLE-TAP EDIT/DELETE)
// -------------------------------
function renderEntries() {
    const today = new Date().toISOString().slice(0, 10);
    const list = document.getElementById("entryList");
    list.innerHTML = "";

    entries
        .map((e, index) => ({ ...e, index })) // keep index for editing
        .filter(e => e.date === today)
        .forEach(e => {
            const li = document.createElement("li");
            li.textContent = `${e.name} — ${e.calories} cal, ${e.fat}g fat, ${e.carbs}g carbs`;

            // DOUBLE TAP → edit or delete
            li.addEventListener("dblclick", () => {
                const action = prompt(
                    `Edit or Delete?\n\n` +
                    `1 = Edit\n` +
                    `2 = Delete\n\n` +
                    `Entry: ${e.name} (${e.calories} cal)`
                );

                if (action === "1") {
                    editEntry(e.index);
                } else if (action === "2") {
                    deleteEntry(e.index);
                }
            });

            list.appendChild(li);
        });
}

// -------------------------------
// Edit an entry
// -------------------------------
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

// -------------------------------
// Delete an entry
// -------------------------------
function deleteEntry(index) {
    if (confirm("Delete this entry?")) {
        entries.splice(index, 1);
        saveEntries();
        renderEntries();
        updateTotals();
    }
}

// -------------------------------
// Update totals
// -------------------------------
function updateTotals() {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = entries.filter(e => e.date === today);

    const totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalFat = todayEntries.reduce((sum, e) => sum + e.fat, 0);
    const totalCarbs = todayEntries.reduce((sum, e) => sum + e.carbs, 0);

    document.getElementById("totalCalories").textContent = totalCalories;
    document.getElementById("totalFat").textContent = totalFat;
    document.getElementById("totalCarbs").textContent = totalCarbs;
}

// -------------------------------
// Utility
// -------------------------------
function clearInputs() {
    document.getElementById("foodName").value = "";
    document.getElementById("calories").value = "";
    document.getElementById("fat").value = "";
    document.getElementById("carbs").value = "";
}

// -------------------------------
// Initial load
// -------------------------------
renderEntries();
updateTotals();
renderLibrary();