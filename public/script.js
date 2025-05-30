document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('addTaskBtn'); // Moved original definition up
    const pageTitle = document.querySelector('.container h1'); // Assuming this is the 'Todo List' title

    // Apply styles based on DEPLOYMENT_SLOT
    const deploymentSlot = window.DEPLOYMENT_SLOT;
    if (deploymentSlot === 'green') {
        if (pageTitle) pageTitle.style.color = 'green';
        if (addTaskBtn) addTaskBtn.style.backgroundColor = 'green';
    } else if (deploymentSlot === 'blue') {
        if (pageTitle) pageTitle.style.color = 'blue';
        if (addTaskBtn) addTaskBtn.style.backgroundColor = 'blue';
    }

    const taskModal = document.getElementById('taskModal');
    const closeBtn = document.querySelector('.close-btn');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskListUl = document.getElementById('taskList');

    // --- Modal Logic --- //
    addTaskBtn.onclick = () => {
        taskModal.style.display = 'block';
        taskDescriptionInput.value = ''; // Clear previous input
    };

    closeBtn.onclick = () => {
        taskModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    };

    // --- API Calls & Task Rendering --- //
    const API_URL = '/api/tasks';

    async function fetchTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            taskListUl.innerHTML = '<li>Error loading tasks. Please try again later.</li>';
        }
    }

    function renderTasks(tasks) {
        taskListUl.innerHTML = ''; // Clear existing tasks
        if (tasks.length === 0) {
            taskListUl.innerHTML = '<li>No tasks yet. Create one!</li>';
            return;
        }
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            if (task.completed) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id, checkbox.checked));

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('task-details');

            const descriptionSpan = document.createElement('span');
            descriptionSpan.classList.add('task-description');
            descriptionSpan.textContent = task.description;

            const metaDiv = document.createElement('div');
            metaDiv.classList.add('task-meta');
            const createdTime = new Date(task.created_at).toLocaleString();
            let completedTimeText = '';
            if (task.completed_at) {
                completedTimeText = `Completed: ${new Date(task.completed_at).toLocaleString()}`;
            }
            metaDiv.textContent = `Created: ${createdTime} ${completedTimeText}`.trim();
            
            detailsDiv.appendChild(descriptionSpan);
            detailsDiv.appendChild(metaDiv);

            li.appendChild(checkbox);
            li.appendChild(detailsDiv);
            taskListUl.appendChild(li);
        });
    }

    saveTaskBtn.onclick = async () => {
        const description = taskDescriptionInput.value.trim();
        if (!description) {
            alert('Please enter a task description.');
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            taskModal.style.display = 'none';
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task. Please try again.');
        }
    };

    async function toggleTaskStatus(taskId, isCompleted) {
        try {
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: isCompleted }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchTasks(); // Refresh the task list
        } catch (error) {
            console.error('Error updating task status:', error);
            alert('Failed to update task status. Please try again.');
        }
    }

    // Initial load of tasks
    fetchTasks();
});