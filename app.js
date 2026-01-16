// ------------------------------
// Data Storage
// ------------------------------
let foodLibrary = JSON.parse(localStorage.getItem("foodLibrary") || "[]");
let todaysEntries = [];

let pendingLibraryItem = null;       // temp storage before confirm
let pendingLibraryCategory = null;   // selected category for library save
let pendingDelete = null;            // { type: "today" | "library", index: number }
let suppressLibraryClick = false;    // prevents auto-click after saving


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

const multiplierPopup = document.getElementById("multiplierPopup");
const multiplierEntry = document.getElementById("multiplierEntry");
const multiplierOk = document.getElementById("multiplierOk");
const multiplierCancel = document.getElementById("multiplierCancel");

const libraryConfirmPopup = document.getElementById("libraryConfirmPopup");
const libraryConfirmText = document.getElementById("libraryConfirmText");
const libraryYes = document.getElementById("libraryYes");
const libraryNo = document.getElementById("libraryNo");

const deleteConfirmPopup = document.getElementById("deleteConfirmPopup");
const deleteConfirmText = document.getElementById("deleteConfirmText");
const deleteYes = document.getElementById("deleteYes");
const deleteNo = document.getElementById("deleteNo");

const libraryList = document.getElementById("libraryList");
const librarySearch = document.getElementById("librarySearch");

const totalCalories = document.getElementById("totalCalories");
const totalFat = document.getElementById("totalFat");
const totalCarbs = document.getElementById("totalCarbs");
const entryList = document.getElementById("entryList");

const categoryButtons = document.querySelectorAll(".category-button");


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
// Multiplier Popup Logic
// ------------------------------
multiplyButton.addEventListener("click", () => {
  multiplierEntry.value = "";
  multiplierPopup.classList.remove("hidden");
});

multiplierOk.addEventListener("click", () => {
  let value = parseFloat(multiplierEntry.value);
  if (isNaN(value) || value <= 0) value = 1;
  multiplierInput.value = value;
  multiplierPopup.classList.add("hidden");
});

multiplierCancel.addEventListener("click", () => {
  multiplierPopup.classList.add("hidden");
});


// ------------------------------
// Add Food Entry
// ------------------------------
addButton.addEventListener("click", () => {
  const name = foodName.value.trim();
  const cal = parseFloat(calories.value) || 0;
  const f = parseFloat(fat.value) || 0;
  const c = parseFloat(carbs.value) || 0;
  const mult = parseFloat(multiplierInput.value) || 1;

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

  multiplierInput.value = 1;

  foodName.value = "";
  calories.value = "";
  fat.value = "";
  carbs.value = "";
});


// ------------------------------
// Save to Library (with category + confirm)
// ------------------------------
saveToLibraryButton.addEventListener("click", () => {
  const name = foodName.value.trim();
  const cal = parseFloat(calories.value) || 0;
  const f = parseFloat(fat.value) || 0;
  const c = parseFloat(carbs.value) || 0;

  if (!name) return;

  pendingLibraryItem = { baseName: name, calories: cal, fat: f, carbs: c };
  pendingLibraryCategory = null;

  categoryButtons.forEach(btn => btn.classList.remove("selected-category"));
});


// Category selection for library save
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!pendingLibraryItem) return;

    pendingLibraryCategory = btn.getAttribute("data-category");

    categoryButtons.forEach(b => b.classList.remove("selected-category"));
    btn.classList.add("selected-category");

    const fullName = `${pendingLibraryItem.baseName} (${pendingLibraryCategory})`;
    libraryConfirmText.textContent = `Confirm save:\n${fullName}`;
    libraryConfirmPopup.classList.remove("hidden");
  });
});


// Confirm Yes/No for library save
libraryYes.addEventListener("click", () => {
  if (!pendingLibraryItem || !pendingLibraryCategory) {
    libraryConfirmPopup.classList.add("hidden");
    return;
  }

  const fullName = `${pendingLibraryItem.baseName} (${pendingLibraryCategory})`;

  foodLibrary.push({
    name: fullName,
    calories: pendingLibraryItem.calories,
    fat: pendingLibraryItem.fat,
    carbs: pendingLibraryItem.carbs
  });

  localStorage.setItem("foodLibrary", JSON.stringify(foodLibrary));

  pendingLibraryItem = null;
  pendingLibraryCategory = null;
  libraryConfirmPopup.classList.add("hidden");

  categoryButtons.forEach(btn => btn.classList.remove("selected-category"));

  renderLibrary();

  // Clear input fields
  foodName.value = "";
  calories.value = "";
  fat.value = "";
  carbs.value = "";

  // Prevent auto-click from refilling fields
  suppressLibraryClick = true;
  setTimeout(() => suppressLibraryClick = false, 300);
});


libraryNo.addEventListener("click", () => {
  pendingLibraryItem = null;
  pendingLibraryCategory = null;
  libraryConfirmPopup.classList.add("hidden");
  categoryButtons.forEach(btn => btn.classList.remove("selected-category"));
});


// ------------------------------
// Double‑Tap Helper
// ------------------------------
function addDoubleTapListener(element, callback) {
  let lastTap = 0;
  element.addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 300) callback();
    lastTap = now;
  });
}


// ------------------------------
// Delete Confirm Yes/No
// ------------------------------
deleteYes.addEventListener("click", () => {
  if (!pendingDelete) return;

  if (pendingDelete.type === "today") {
    todaysEntries.splice(pendingDelete.index, 1);
    updateTotals();
    renderEntries();
  }

  if (pendingDelete.type === "library") {
    foodLibrary.splice(pendingDelete.index, 1);
    localStorage.setItem("foodLibrary", JSON.stringify(foodLibrary));
    renderLibrary();
  }

  pendingDelete = null;
  deleteConfirmPopup.classList.add("hidden");
});

deleteNo.addEventListener("click", () => {
  pendingDelete = null;
  deleteConfirmPopup.classList.add("hidden");
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

  todaysEntries.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — ${item.calories} cal, ${item.fat}g fat, ${item.carbs}g carbs`;

    addDoubleTapListener(li, () => {
      pendingDelete = { type: "today", index };
      deleteConfirmText.textContent = "Delete this item?";
      deleteConfirmPopup.classList.remove("hidden");
      deleteConfirmPopup.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    entryList.appendChild(li);
  });
}


// ------------------------------
// Render Library (sorted by category then name)
// ------------------------------
function renderLibrary(filter = "") {
  libraryList.innerHTML = "";

  const categoryOrder = ["Fruit", "Veg", "Meats", "Other"];

  const filtered = foodLibrary
    .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const catA = extractCategory(a.name);
      const catB = extractCategory(b.name);

      const idxA = categoryOrder.indexOf(catA);
      const idxB = categoryOrder.indexOf(catB);

      if (idxA !== idxB) return idxA - idxB;

      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

  filtered.forEach((item) => {
  const realIndex = foodLibrary.indexOf(item);

  const li = document.createElement("li");
  li.textContent = `${item.name} — ${item.calories} cal`;

  addDoubleTapListener(li, () => {
    pendingDelete = { type: "library", index: realIndex };
    deleteConfirmText.textContent = "Delete this item?";
    deleteConfirmPopup.classList.remove("hidden");
    deleteConfirmPopup.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  li.addEventListener("click", () => {
    if (suppressLibraryClick) return;

    foodName.value = item.name;
    calories.value = item.calories;
    fat.value = item.fat;
    carbs.value = item.carbs;
  });

  libraryList.appendChild(li);
});

}


function extractCategory(name) {
  const match = name.match(/\((.*?)\)$/);
  return match ? match[1] : "Other";
}


librarySearch.addEventListener("input", () => {
  renderLibrary(librarySearch.value);
});


// Initial load
renderLibrary();








