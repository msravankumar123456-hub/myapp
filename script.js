// Get DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');

// Initialize the app
let tasks = [];
let history = [];
let historyIndex = -1;

// Load tasks from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateHistoryButtons();
});

// Add task when button is clicked
addBtn.addEventListener('click', addTask);

// Add task when Enter key is pressed
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Undo button click
undoBtn.addEventListener('click', undo);

// Redo button click
redoBtn.addEventListener('click', redo);

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
    }
});

// Save current state to history
function saveState() {
    // Remove any states after current index (when new action is performed after undo)
    history = history.slice(0, historyIndex + 1);
    
    // Add new state
    history.push(JSON.parse(JSON.stringify(tasks)));
    historyIndex++;
    
    // Limit history to last 50 states to prevent memory issues
    if (history.length > 50) {
        history.shift();
        historyIndex--;
    }
    
    saveTasks();
    updateHistoryButtons();
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    taskInput.focus();

    saveState();
    renderTasks();
}

// Render all tasks
function renderTasks() {
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-message">No tasks yet. Add one to get started!</div>';
    } else {
        tasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            `;
            taskList.appendChild(li);
        });
    }

    updateStats();
}

// Toggle task completion status
function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveState();
        renderTasks();
    }
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveState();
    renderTasks();
}

// Undo the last action
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        tasks = JSON.parse(JSON.stringify(history[historyIndex]));
        renderTasks();
        updateHistoryButtons();
        saveTasks();
    }
}

// Redo the last undone action
function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        tasks = JSON.parse(JSON.stringify(history[historyIndex]));
        renderTasks();
        updateHistoryButtons();
        saveTasks();
    }
}

// Update undo/redo button states
function updateHistoryButtons() {
    undoBtn.disabled = historyIndex <= 0;
    redoBtn.disabled = historyIndex >= history.length - 1;
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;

    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        // Initialize history with the loaded state
        history = [JSON.parse(JSON.stringify(tasks))];
        historyIndex = 0;
    }
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
