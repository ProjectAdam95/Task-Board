// Retrieve tasks and nextId from localStorage
// 1. Initializes the taskList with tasks from localStorage (or an empty array if none exist)
// 2. Sets nextId to the next available task ID from localStorage (or 1 if none exist).
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
// Increments nextId variable and returns the new value
function generateTaskId() {
  return nextId++;
}

// Create a task card
// 1. The createTaskCard function initializes the due date and today's date using dayjs, 
// 2. Sets up a variable cardColor to determine the color of the task card based on the due date.
function createTaskCard(task) {
  const dueDate = dayjs(task.dueDate);
  const today = dayjs();
  let cardColor = "";

  // Determines the card colour based on the due date
  if (dueDate.isBefore(today, 'day')) {
    cardColor = "bg-danger";
  } else if (dueDate.diff(today, 'day') <= 3) {
    cardColor = "bg-warning";
  }

  // Returns the html string for the task card
  return `
    <div class="card mb-3 ${cardColor}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small>Due: ${dueDate.format('YYYY-MM-DD')}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `;
}

// Render the task list
// 1. Removes existing cards. Deletes all task cards currently displayed in the lanes
// 2. Append New Card. Adds the task cards from the taskList array to their respective lanes based on the task status
// 3.  Make cards draggable.  Makes each task card draggable, ensuring they come to the front when dragged and 
//    return to their original position if not dropped in a valid area.
function renderTaskList() {
  $(".lane .card").remove();
  taskList.forEach(task => {
    $(`#${task.status}-cards`).append(createTaskCard(task));
  });
  $(".card").draggable({
    revert: "invalid",
    start: function(event, ui) {
      $(this).css("z-index", 1000);
    },
    stop: function(event, ui) {
      $(this).css("z-index", "");
    }
  });
}

// Handle adding a new task
// 1. The handleAddTask function prevents the default form submission
// 2. Collects task details from the form
// 3. Creates a new task, adds it to the task list, updates localStorage
// 4. Re-renders the task list, and hides the modal form
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#taskTitle").val();
  const description = $("#taskDescription").val();
  const dueDate = $("#taskDueDate").val();
  const newTask = {
    id: generateTaskId(),
    title,
    description,
    dueDate,
    status: "to-do"
  };
  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
  renderTaskList();
  $("#formModal").modal("hide");
}

// Handle deleting a task
// 1. The handleDeleteTask function removes a task from the task list based on its ID
// 2. Updates the task list in localStorage, and re-renders the task list
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new status lane
// 1. The handleDrop function updates the status of a dropped task by changing its status based on the new lane it was dropped into 
// 2. Saves the updated task list to localStorage, and re-renders the task list
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  const newStatus = $(this).attr("id");
  const task = taskList.find(task => task.id === taskId);
  task.status = newStatus;
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker.
// 1. Initializes the task list 
// 2. Makes lanes droppable 
// 3. Sets up the date picker
// 4. Attaches event handlers for adding and deleting tasks when the document is fully loaded.
$(document).ready(function () {
  renderTaskList();

  $(".lane").droppable({
    accept: ".card",
    drop: handleDrop
  });

  $("#taskDueDate").datepicker({
    dateFormat: "yy-mm-dd"
  });

  $("#addTaskForm").on("submit", handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);
});
