const TODOS = [
    { id: 1715670949844, title: 'Aufgabe 4 abgeben', due: '2021-05-21T10:00:00.000Z', status: 'done' },
    { id: 1715670971040, title: 'Aufgabe 6 abgeben', due: '2021-06-08T10:00:00.000Z', status: 'doing' },
    { id: 1715670972068, title: 'ToDo-Anwendung fertig stellen', due: '2021-06-22T10:00:00.000Z', status: 'open' },
    { id: 1715670971070, title: 'Für die Klausur lernen', due: '2021-07-01T11:00:00.000Z', status: 'open' }
];

function renderTodos() {
    const container = document.getElementById("todo-list");
    container.innerHTML = "";

    TODOS.forEach(todo => {

        const html = `
            <div class="todo-item" data-id="${todo.id}">

                <h3>${todo.title}</h3>
                <p>Fällig: ${todo.due}</p>
                <p>Status: ${todo.status}</p>

                <!-- Icons -->
                <button onclick="deleteTodo(${todo.id})">🗑️ Löschen</button>
                <button onclick="editTodo(${todo.id})">✏️ Bearbeiten</button>

            </div>
        `;
        container.insertAdjacentHTML("beforeend", html);
    });
}

function addTodo(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const date = document.getElementById("date").value;
    const newTodo = {
        id: Date.now(),
        title: title,
        due: date ? new Date(date).toLocaleDateString() : "",
        status: "open"
    };
    TODOS.push(newTodo);
    renderTodos();
    event.target.reset();
}

function deleteTodo(id) {
    const index = TODOS.findIndex(todo => todo.id === id);
    if (index !== -1) {
        TODOS.splice(index, 1);
    }
    renderTodos();
}

function editTodo(id) {
    const todo = TODOS.find(t => t.id === id);
    if (!todo) return;
    const newTitle = prompt("Neuer Titel:", todo.title);
    const newStatus = prompt("Neuer Status (open/doing/done):", todo.status);
    if (newTitle !== null && newTitle.trim() !== "") {
        todo.title = newTitle;
    }
    const allowed = ["open", "doing", "done"];
    if (allowed.includes(newStatus)) {
        todo.status = newStatus;
    }
    renderTodos();
}