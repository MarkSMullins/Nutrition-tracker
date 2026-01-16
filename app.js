// ------------------------------
// Data Storage
// ------------------------------
let foodLibrary = JSON.parse(localStorage.getItem("foodLibrary") || "[]");
let todaysEntries = [];

// ------------------------------
// DOM Elements
// ------------------------------
const foodName = document.getElementById("foodName");
const calories = document.getElementById("calories");
const fat = document.getElementById("fat");
const carbs = document.getElementById("carbs");
const multiplierInput = document.getElementById("multiplier");

const addButton = document.getElementById("addButton");
const multiplyButton = document.getElementById("multiplyButton");
const saveToLibraryButton = document.getElementById("saveToLibraryButton");

const numberPad = document.getElementById("numberPad");
const libraryList = document.getElementById("libraryList");
const librarySearch = document.getElementById("librarySearch");

const totalCalories = document.getElementById("totalCalories");
const totalFat = document.getElementById("totalFat");
const totalCarbs = document.getElementById("totalCarbs");
const entryList = document.getElementById("entryList");
// ------------------------------
// Title Button: Clear Today's Entries
// ------------------------------
document.getElementById("titleButton").addEventListener("click", () => {
  todaysEntries = [];
  updateTotals();
  renderEntries();
  multiplierInput.value = 1;
});

// ------------------------------
// Number Pad Logic
// ------------------------------
let multiplierValue = ""; // user builds this by tapping digits

multiplyButton.addEventListener("click", () => {
  multiplierValue = "";
  numberPad.classList.remove("hidden");
});

numberPad.addEventListener("click", (e) => {
  if (!e.target.classList.contains("pad-btn")) return;

  const value = e.target.textContent;

  if (e.target.classList.contains("pad-clear")) {
    multiplierValue = "";
  } else if (e.target.classList.contains("pad-ok")) {
    if (multiplierValue === "" || multiplierValue === "0") {
      multiplierValue = "1"; // default
    }
    multiplierInput.value = parseInt(multiplierValue, 10);
    numberPad.classList.add("hidden");
  } else {
    multiplierValue += value;
  }
});

// ------------------------------
// Add Food Entry
// ------------------------------
addButton.addEventListener("click", () => {
  const name = foodName.value.trim();
  const cal = parseFloat(calories.value) || 0;
  const f = parseFloat(fat.value) || 0;
  const c = parseFloat(carbs.value) || 0;
  const mult = parseInt(multiplierInput.value) || 1;

  if (!name) return;

  const entry = {
    name,
    calories: cal * mult,
    fat: f * mult,
    carbs: c * mult
  };

  todaysEntries.push(entry);
  updateTotals();
  renderEntries();

  // Reset multiplier
  multiplierInput.value = 1;

  // Clear inputs
  foodName.value = "";
  calories.value = "";
  fat.value = "";
  carbs.value = "";
});

// ------------------------------
// Update Totals
// ------------------------------
function updateTotals() {
  let cal = 0, f = 0, c = 0;

  todaysEntries.forEach(item => {
    cal += item.calories;
    f += item.fat;
    c += item.carbs;
  });

  totalCalories.textContent = cal;
  totalFat.textContent = f;
  totalCarbs.textContent = c;
}

// ------------------------------
// Render Today's Entries
// ------------------------------
function renderEntries() {
  entryList.innerHTML = "";

  todaysEntries.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — ${item.calories} cal, ${item.fat}g fat, ${item.carbs}g carbs`;
    entryList.appendChild(li);
  });
}

// ------------------------------
// Save to Library
// ------------------------------
saveToLibraryButton.addEventListener("click", () => {
  const name = foodName.value.trim();
  const cal = parseFloat(calories.value) || 0;
  const f = parseFloat(fat.value) || 0;
  const c = parseFloat(carbs.value) || 0;

  if (!name) return;

  foodLibrary.push({ name, calories: cal, fat: f, carbs: c });
  localStorage.setItem("foodLibrary", JSON.stringify(foodLibrary));

  renderLibrary();
});

// ------------------------------
// Render Library
// ------------------------------
function renderLibrary(filter = "") {
  libraryList.innerHTML = "";

  foodLibrary
    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.name} — ${item.calories} cal`;
      li.addEventListener("click", () => {
        foodName.value = item.name;
        calories.value = item.calories;
        fat.value = item.fat;
        carbs.value = item.carbs;
      });
      libraryList.appendChild(li);
    });
}

librarySearch.addEventListener("input", () => {
  renderLibrary(librarySearch.value);
});

// Initial load
renderLibrary();


