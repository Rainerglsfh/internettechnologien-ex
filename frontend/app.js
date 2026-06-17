let TODOS = [];
let currentFilter = "all";

const statusMap = ["open", "doing", "done"];
const categoryLabels = {
    school: "Schule",
    work: "Arbeit",
    private: "Privat"
};
const categoryOrder = ["school", "work", "private"];

window.onload = function () {
    setupFilterTabs();

    fetch("/api/todos")
        .then(response => {
            if (!response.ok) {
                throw new Error("Fehler beim Laden der ToDos");
            }
            return response.json();
        })
        .then(data => {
            TODOS = data;
            renderTodos();
        })
        .catch(error => {
            console.error("Fetch Fehler:", error);
        });
};

function setupFilterTabs() {
    const tabs = document.getElementById("category-tabs");

    tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter]");
        if (!button) return;

        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });
        button.classList.add("active");

        renderTodos();
    });
}

function renderTodos() {
    const container = document.getElementById("todo-list");
    container.innerHTML = "";

    const visibleCategories = categoryOrder.filter(category => {
        return TODOS.some(todo => todo.category === category);
    });

    if (currentFilter === "all") {
        if (visibleCategories.length === 0) {
            container.innerHTML = '<p class="empty-state">Keine ToDos vorhanden.</p>';
            return;
        }

        visibleCategories.forEach(category => {
            const categoryTodos = TODOS.filter(todo => todo.category === category);
            container.insertAdjacentHTML(
                "beforeend",
                renderCategorySection(category, categoryTodos)
            );
        });
        return;
    }

    const filteredTodos = TODOS.filter(todo => todo.category === currentFilter);

    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <p class="empty-state">
                Keine ToDos in der Kategorie "${categoryLabels[currentFilter] || currentFilter}".
            </p>
        `;
        return;
    }

    container.insertAdjacentHTML(
        "beforeend",
        renderCategorySection(currentFilter, filteredTodos)
    );
}

function renderCategorySection(category, todos) {
    return `
        <section class="todo-category-section">
            <h3>${categoryLabels[category] || category}</h3>
            <div class="todo-category-items">
                ${todos.map(todo => `
                    <div class="todo-item" data-id="${todo._id}">
                        <h3>${todo.title}</h3>
                        <p><strong>Fällig:</strong> ${todo.due || "Kein Datum"}</p>
                        <p><strong>Status:</strong> ${statusMap[todo.status] || "open"}</p>
                        <p><strong>Priorität:</strong> ${todo.priority || "low"}</p>
                        <p><strong>Kategorie:</strong> ${categoryLabels[todo.category] || todo.category || "Keine"}</p>
                        ${todo.description ? `<p><strong>Beschreibung:</strong> ${todo.description}</p>` : ""}

                        <button onclick="deleteTodo('${todo._id}')">🗑️ Löschen</button>
                        <button onclick="editTodo('${todo._id}')">✏️ Bearbeiten</button>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}

function addTodo(event) {
    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const date = document.getElementById("date").value;
    const category = document.getElementById("category").value;
    const priorityElement = document.querySelector('input[name="priority"]:checked');
    const priority = priorityElement ? priorityElement.value : "low";

    if (!title) return;

    const newTodo = {
        title,
        description,
        due: date ? new Date(date).toISOString() : "",
        status: 0,
        priority,
        category
    };

    fetch("/api/todos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newTodo)
    })
        .then(res => {
            if (!res.ok) throw new Error("POST fehlgeschlagen");
            return res.json();
        })
        .then(createdTodo => {
            TODOS.push(createdTodo);
            renderTodos();
            event.target.reset();
        })
        .catch(err => console.error(err));
}

function deleteTodo(id) {
    fetch(`/api/todos/${id}`, {
        method: "DELETE"
    })
        .then(res => {
            if (!res.ok && res.status !== 204) {
                throw new Error("DELETE fehlgeschlagen");
            }

            TODOS = TODOS.filter(todo => todo._id !== id);
            renderTodos();
        })
        .catch(err => console.error(err));
}

function editTodo(id) {
    const todo = TODOS.find(t => t._id === id);
    if (!todo) return;

    const newTitle = prompt("Neuer Titel:", todo.title);
    if (newTitle === null) return;

    const newStatusInput = prompt("Neuer Status (0=open, 1=doing, 2=done):", todo.status);
    if (newStatusInput === null) return;

    const updatedTodo = {
        ...todo,
        title: newTitle || todo.title,
        status: ["0", "1", "2"].includes(newStatusInput)
            ? parseInt(newStatusInput)
            : todo.status
    };

    fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTodo)
    })
        .then(res => {
            if (!res.ok) throw new Error("PUT fehlgeschlagen");
            return res.json().catch(() => {
                return updatedTodo;
            });
        })
        .then(updatedFromServer => {
            const index = TODOS.findIndex(t => t._id === id);
            if (index !== -1) {
                TODOS[index] = updatedFromServer;
            }
            renderTodos();
        })
        .catch(err => {
            console.error("Fehler beim Update:", err);
        });
}