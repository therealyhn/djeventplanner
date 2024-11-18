const viewBtn = document.getElementById("toggleViewBtn");
const addEventBtn = document.getElementById("addEventBtn");
const eventListView = document.getElementById("eventListView");
const calendarView = document.getElementById("calendarView");
const eventModal = document.getElementById("eventModal");
const cancelBtn = document.getElementById("cancelModalBtn");
const saveBtn = document.getElementById("saveEventBtn");
const searchBar = document.getElementById("searchBar");
const noEvents = document.getElementById("noEvents");
const calendarGrid = document.getElementById("calendarGrid");
const currentMonthLabel = document.getElementById("currentMonthLabel");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("events")) || [];

let currentEventIndex = -1;

window.addEventListener('resize', function () {
    // Check if window height has shrunk due to keyboard (typically on mobile)
    if (window.innerHeight < 500) {  // Adjust the threshold if needed
        document.querySelector('.modal').style.maxHeight = '60vh';  // Adjust modal height
    } else {
        document.querySelector('.modal').style.maxHeight = '100vh';  // Reset modal height
    }
});


// Toggle between event list and calendar views
viewBtn.addEventListener("click", () => {
    if (eventListView.style.display == "none") {
        eventListView.style.display = "block";
        calendarView.style.display = "none";
        viewBtn.innerHTML = "Calendar View";
        searchBar.style.display = "block";
        addEventBtn.style.display = "block";
    } else {
        eventListView.style.display = "none";
        calendarView.style.display = "block";
        viewBtn.innerHTML = "Event List View";
        searchBar.style.display = "none";
        addEventBtn.style.display = "none";
        renderCalendar();
    }
});

// Add event button
addEventBtn.addEventListener("click", () => {
    openModalForNewEvent(); // Open the modal for new event
    document.getElementById('modalOverlay').style.display = 'block'; // Show the overlay
});

// Cancel button to close modal
cancelBtn.addEventListener("click", () => {
    eventModal.style.display = "none";
    clearModalInputs();
    document.body.classList.remove("modal-open");  // Remove class to revert background
});

// Open modal for new event
function openModalForNewEvent() {
    clearModalInputs();
    saveBtn.textContent = "Save Event"; // Ensure the button text is "Save Event" for new event
    currentEventIndex = -1; // Reset the event index for new event
    eventModal.style.display = "block";
    document.body.classList.add("modal-open");  // Add class to darken the background
}

// Clear input fields in the modal
function clearModalInputs() {
    const titleInput = document.getElementById("eventTitle");
    const dateInput = document.getElementById("eventDate");
    const timeInput = document.getElementById("eventTime");
    const descriptionInput = document.getElementById("eventDescription");
    const locationInput = document.getElementById("eventLocation");

    titleInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    locationInput.value = "";
    descriptionInput.value = "";
}

// Load events from localStorage and apply filter
document.addEventListener("DOMContentLoaded", () => {
    loadEventsFromLocalStorage();
    searchBar.addEventListener("keyup", filterEvents);
});

// Save event
saveBtn.addEventListener("click", function () {
    const titleInput = document.getElementById("eventTitle");
    const dateInput = document.getElementById("eventDate");
    const timeInput = document.getElementById("eventTime");
    const descriptionInput = document.getElementById("eventDescription");
    const locationInput = document.getElementById("eventLocation");

    const title = titleInput.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const description = descriptionInput.value;
    const location = locationInput.value;

    if (!title || !date || !time) {
        alert("Please fill out all required fields.");
        return;
    }

    const event = { title, date, time, location, description };

    // Get events from localStorage
    const events = JSON.parse(localStorage.getItem("events")) || [];

    if (currentEventIndex !== -1) {
        // If an event is being edited, remove the old event
        events.splice(currentEventIndex, 1); // Remove the old event
    }

    // Add the new (or edited) event to the list
    events.push(event);

    // Sort events by date (ascending order, upcoming events on top)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Save updated events back to localStorage
    localStorage.setItem("events", JSON.stringify(events));

    // Close the modal and clear inputs
    eventModal.style.display = "none";
    clearModalInputs();

    // Re-render calendar and event list
    renderCalendar();
    loadEventsFromLocalStorage();
});



// Add event to list
function addEventToListView(event) {
    const eventCard = document.createElement("div");
    eventCard.classList.add("event-card");
    eventCard.style.display = "block";

    eventCard.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
    `;

    // Check if event date has passed
    const currentDate = new Date();
    const eventDate = new Date(event.date);

    if (eventDate < currentDate) {
        eventCard.style.borderColor = "#4A90E2";
        eventCard.style.borderWidth = "5px";
        eventCard.style.opacity = "0.5";
    }

    eventListView.appendChild(eventCard);

}

// Save and sort events to localStorage
function saveEventToLocalStorage(event) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    events.push(event);
    localStorage.setItem("events", JSON.stringify(events));
}

// Update event in localStorage
function updateEventInLocalStorage(updatedEvent) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    events[currentEventIndex] = updatedEvent; // Update the event at the stored index

    localStorage.setItem("events", JSON.stringify(events));
    displaySortedEvents(events); // Display updated events
    displayEventsInCalendar();
}

// Load and display events from localStorage
function loadEventsFromLocalStorage() {
    const events = JSON.parse(localStorage.getItem("events")) || [];

    if (events.length === 0) {
        noEvents.style.display = "block";
    } else {
        noEvents.style.display = "none";
    }

    // Sort events by date (ascending order, upcoming events on top)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    displaySortedEvents(events);  // Display sorted events
    displayEventsInCalendar();
}



// Display sorted events
function displaySortedEvents(events) {
    eventListView.innerHTML = ""; // Clear current events

    if (events.length === 0) {
        noEvents.style.display = "block";
    } else {
        noEvents.style.display = "none";
    }

    // Add each event to the list view
    events.forEach(addEventToListView);
}

// Delete event button
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("deleteBtn")) {
        const eventCard = e.target.closest(".event-card");
        const eventTitle = eventCard.querySelector("h3").textContent;
        const eventDate = eventCard.querySelector("p").textContent.split(":")[1].trim();

        // Remove the event from the event list view
        eventListView.removeChild(eventCard);

        // Get events from localStorage
        const events = JSON.parse(localStorage.getItem("events")) || [];

        // Filter out the event to delete (match by title and date)
        const updatedEvents = events.filter(event => !(event.title === eventTitle && event.date === eventDate));

        // Save the updated events back to localStorage
        localStorage.setItem("events", JSON.stringify(updatedEvents));

        // Re-render the calendar view and event list
        renderCalendar(); // Re-render calendar after deletion
        loadEventsFromLocalStorage(); // Reload events into list view
    }
});


// Edit event button
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("editBtn")) {
        const eventCard = e.target.closest(".event-card");
        const eventTitle = eventCard.children[0].textContent;
        const eventDate = eventCard.children[1].textContent.split(":")[1].trim();
        const eventTime = eventCard.children[2].textContent.split(":")[1].trim();
        const eventLocation = eventCard.children[3].textContent.split(":")[1].trim();
        const eventDescription = eventCard.children[4].textContent.split(":")[1].trim();

        const titleInput = document.getElementById("eventTitle");
        const dateInput = document.getElementById("eventDate");
        const timeInput = document.getElementById("eventTime");
        const locationInput = document.getElementById("eventLocation");
        const descriptionInput = document.getElementById("eventDescription");

        titleInput.value = eventTitle;
        dateInput.value = eventDate;
        timeInput.value = eventTime;
        locationInput.value = eventLocation;
        descriptionInput.value = eventDescription;

        // Change button text to "Save Edit"
        saveBtn.textContent = "Save Edit";

        // Store the index of the event being edited
        currentEventIndex = findEventIndex(eventTitle, eventDate);

        // Open the modal
        eventModal.style.display = "block";
    }
});

// Find the event index for editing
function findEventIndex(title, date) {
    const events = JSON.parse(localStorage.getItem("events"));
    return events.findIndex(event => event.title === title && event.date === date);
}


// Filter events based on search input
function filterEvents() {
    const searchTerm = searchBar.value.toLowerCase();
    const events = JSON.parse(localStorage.getItem("events")) || [];

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.date.includes(searchTerm) ||
        event.time.includes(searchTerm)
    );

    displayFilteredEvents(filteredEvents);
}

// Display filtered events
function displayFilteredEvents(events) {
    eventListView.innerHTML = ""; // Clear the current list of events

    events.forEach(addEventToListView); // Display each filtered event
}

function generateCalendar() {
    const calendarGrid = document.getElementById("calendarGrid");
    calendarGrid.innerHTML = ""; // Clear existing calendar content

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get the first day and number of days in the current month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-cell", "empty-cell");
        calendarGrid.appendChild(emptyCell);
    }

    // Create cells for each day of the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");
        cell.innerHTML = `<span class="date-number">${day}</span>`;
        cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarGrid.appendChild(cell);
    }

    displayEventsInCalendar(); // Display events after generating calendar
}

function displayEventsInCalendar() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const calendarCells = document.querySelectorAll(".calendar-cell");

    // Re-apply event titles to the calendar
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const matchingCell = Array.from(calendarCells).find(cell => cell.dataset.date === event.date);

        if (matchingCell) {
            const eventElement = document.createElement("p");
            eventElement.classList.add("calendar-event");
            eventElement.textContent = event.title;

            // Add click event to edit the event
            eventElement.addEventListener("click", () => {
                openEditEventModal(event);
            });

            matchingCell.appendChild(eventElement);
        }
    });
}

function openEditEventModal(event) {
    const titleInput = document.getElementById("eventTitle");
    const dateInput = document.getElementById("eventDate");
    const timeInput = document.getElementById("eventTime");
    const locationInput = document.getElementById("eventLocation");
    const descriptionInput = document.getElementById("eventDescription");

    titleInput.value = event.title;
    dateInput.value = event.date;
    timeInput.value = event.time;
    locationInput.value = event.location;
    descriptionInput.value = event.description;

    saveBtn.textContent = "Save Edit";
    currentEventIndex = findEventIndex(event.title, event.date);
    eventModal.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    loadEventsFromLocalStorage();
    generateCalendar(); // Generate the calendar on page load
    searchBar.addEventListener("keyup", filterEvents);
});

// Generate and display events in the calendar after month change
function renderCalendar() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Clear the existing calendar grid before rendering
    calendarGrid.innerHTML = '';

    // Set the month label
    currentMonthLabel.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    // Get the first and last days of the month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.classList.add("calendar-cell", "empty");
        calendarGrid.appendChild(emptyCell);
    }

    // Generate cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const cell = document.createElement("div");
        cell.classList.add("calendar-cell");

        // Add day number
        const dayNumber = document.createElement("span");
        dayNumber.classList.add("date-number");
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Filter and display events for this day
        const dayEvents = events.filter(event => event.date === dateStr);

        if (dayEvents.length > 0) {
            dayEvents.forEach(event => {
                const eventTitle = document.createElement("p");
                eventTitle.textContent = event.title;
                cell.appendChild(eventTitle);
            });
        }

        calendarGrid.appendChild(cell);
    }
}


// Update calendar view after month change
function updateCalendarView() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const calendarCells = document.querySelectorAll(".calendar-cell");
    const currentDate = new Date();

    // Add events to calendar cells
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const matchingCell = Array.from(calendarCells).find(cell => cell.dataset.date === event.date);

        if (matchingCell) {
            const eventElement = document.createElement("p");
            eventElement.classList.add("calendar-event");
            eventElement.textContent = event.title;

            // Add click event to edit the event
            eventElement.addEventListener("click", () => {
                openEditEventModal(event);
            });

            matchingCell.appendChild(eventElement);
        }
    });
}

// Button to change the month (prev month)
prevMonthBtn.addEventListener("click", () => {
    changeMonth(-1);
    renderCalendar(); // Re-render calendar with updated month
});

// Button to change the month (next month)
nextMonthBtn.addEventListener("click", () => {
    changeMonth(1);
    renderCalendar(); // Re-render calendar with updated month
});

// Function to handle month changes
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar(); // Re-render calendar after month change
}

// Initial render
renderCalendar();

