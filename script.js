/* =========================
   Premade enemies
   ========================= */
const premadeEnemies = {
    "Goblin":   { name: "Goblin",   init: "", hp: 7,  ac: 15 },
    "Orc":      { name: "Orc",      init: "", hp: 15, ac: 13 },
    "Bandit":   { name: "Bandit",   init: "", hp: 11, ac: 12 },
    "Skeleton": { name: "Skeleton", init: "", hp: 13, ac: 13 },
    "Wolf":     { name: "Wolf",     init: "", hp: 11, ac: 13 }
};

const list = document.getElementById("characterList");
let saved = JSON.parse(localStorage.getItem("savedCharacters") || "[]");
let currentTurnIndex = 0;

function saveToLocalStorage() {
    localStorage.setItem("savedCharacters", JSON.stringify(saved));
}

function getNextEnemyName(baseName) {
    const cards = Array.from(list.children);
    let count = 0;
    cards.forEach(card => {
        const currentName = card.children[0].value;
        if (currentName.startsWith(baseName)) count++;
    });
    return `${baseName} ${count + 1}`;
}

document.getElementById("enemySelect").onchange = function () {
    const choice = this.value;
    if (!choice) return;

    const enemy = { ...premadeEnemies[choice] };
    enemy.name = getNextEnemyName(enemy.name);
    addCharacter(enemy);

    this.value = "";
};

/* =========================
   Card creation & saving
   ========================= */
function addCharacter(data = null) {
    const card = document.createElement("div");
    card.className = "card";

    const name = document.createElement("input");
    name.placeholder = "Name";
    name.value = data?.name || "";

    const init = document.createElement("input");
    init.type = "number";
    init.placeholder = "Init";
    init.value = (data && data.init !== undefined) ? data.init : "";

    const hp = document.createElement("input");
    hp.type = "number";
    hp.placeholder = "Health";
    hp.value = data?.hp ?? "";

    const ac = document.createElement("input");
    ac.type = "number";
    ac.placeholder = "AC";
    ac.value = data?.ac ?? "";

    const saveBox = document.createElement("input");
    saveBox.type = "checkbox";
    saveBox.className = "saveBox";
    saveBox.checked = data?.saved || false;

    const cardId = data?.id || `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    card.dataset.id = cardId;

    function upsertSavedEntry() {
        if (!saveBox.checked) return;

        const entry = {
            id: cardId,
            name: name.value,
            init: Number(init.value) || 0,
            hp: Number(hp.value) || 0,
            ac: Number(ac.value) || 0,
            saved: true
        };

        const index = saved.findIndex(c => c.id === cardId);
        if (index >= 0) saved[index] = entry;
        else saved.push(entry);

        saveToLocalStorage();
    }

    saveBox.onchange = () => {
        if (saveBox.checked) {
            upsertSavedEntry();
        } else {
            saved = saved.filter(c => c.id !== cardId);
            saveToLocalStorage();
        }
    };

    [name, init, hp, ac].forEach(field => {
        field.oninput = () => {
            if (saveBox.checked) {
                upsertSavedEntry();
            }
        };
    });

    init.onblur = () => {
        sortCards();
    };

    card.appendChild(name);
    card.appendChild(init);
    card.appendChild(hp);
    card.appendChild(ac);
    card.appendChild(saveBox);

    list.appendChild(card);
    highlightTurn();
}

/* =========================
   Sorting, rolling, deleting
   ========================= */
function sortCards() {
    const cards = Array.from(list.children);
    cards.sort((a, b) => {
        const initA = parseInt(a.children[1].value) || 0;
        const initB = parseInt(b.children[1].value) || 0;
        return initB - initA;
    });
    cards.forEach(c => list.appendChild(c));
    currentTurnIndex = 0;
    highlightTurn();
}

function rollAll() {
    const cards = Array.from(list.children);
    cards.forEach(card => {
        const saveBox = card.children[4];
        if (!saveBox.checked) {
            const roll = Math.floor(Math.random() * 20) + 1;
            card.children[1].value = roll;
        }
    });
    sortCards();
}

function deleteUnchecked() {
    const cards = Array.from(list.children);
    cards.forEach(card => {
        const saveBox = card.children[4];
        if (!saveBox.checked) {
            card.remove();
        }
    });
    sortCards();
}

/* =========================
   Turn tracking
   ========================= */
function highlightTurn() {
    const cards = Array.from(list.children);

    cards.forEach((card, index) => {
        card.classList.toggle("currentTurn", index === currentTurnIndex);
    });
}


function nextTurn() {
    const cards = Array.from(list.children);
    if (cards.length === 0) return;

    currentTurnIndex++;

    if (currentTurnIndex >= cards.length) {
        currentTurnIndex = 0;
    }

    highlightTurn();
}


/* =========================
   Initial load
   ========================= */
saved.forEach(c => addCharacter(c));