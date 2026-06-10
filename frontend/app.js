let TODOS = [];

const statusMap = ["open", "doing", "done"];

window.onload = function () {
    fetch("/api/todos") 
        .then(response => {
            if (!response.ok) {
                throw new Error("Fehler beim Laden der ToDos");
            }
            return response.json();
        })
        .then(data => {
            TODOS = data;        // Backend-Daten speichern
            renderTodos();       // UI aktualisieren
        })
        .catch(error => {
            console.error("Fetch Fehler:", error);
        });
};

function renderTodos() {
    const container = document.getElementById("todo-list");
    container.innerHTML = "";

    TODOS.forEach(todo => {

        const html = `
            <div class="todo-item" data-id="${todo._id}">

                <h3>${todo.title}</h3>
                <p>Fällig: ${todo.due}</p>
                <p>Status: ${statusMap[todo.status]}</p>
                <p>Priorität: ${todo.priority}</p>

                <button onclick="deleteTodo('${todo._id}')">🗑️ Löschen</button>
                <button onclick="editTodo('${todo._id}')">✏️ Bearbeiten</button>

            </div>
        `;

        container.insertAdjacentHTML("beforeend", html);
    });
}

function addTodo(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const priorityElement = document.querySelector('input[name="priority"]:checked');
    const priority = priorityElement ? priorityElement.value : "low";
    const newTodo = {
        title: title,
        due: date ? new Date(date).toISOString() : "",
        status: 0,
        priority: priority
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
    if (newTitle === null) return;  // User hat Cancel geklickt

    const newStatusInput = prompt("Neuer Status (0=open, 1=doing, 2=done):", todo.status);
    if (newStatusInput === null) return;  // User hat Cancel geklickt bei Status

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
            // Wenn kein JSON in der Response ist, gibt es trotzdem keinen Fehler
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