// Store project data in arrays. The data is also saved in the browser. Person 1 Angel Bhardwaj  Line 1 to 34
let employees = JSON.parse(localStorage.getItem("employees")) || []; 
let shifts = JSON.parse(localStorage.getItem("shifts")) || [];

const employeeForm = document.getElementById("employeeForm");
const shiftForm = document.getElementById("shiftForm");
const assignmentForm = document.getElementById("assignmentForm");

const today = new Date().toISOString().split("T")[0];
document.getElementById("shiftDate").value = today;
document.getElementById("scheduleDate").value = today;

// Save the latest data in browser storage.
function saveData() {
    localStorage.setItem("employees", JSON.stringify(employees));
    localStorage.setItem("shifts", JSON.stringify(shifts));
}

// Add a new employee profile.
employeeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const employee = {
        id: Date.now(),
        name: document.getElementById("employeeName").value.trim(),
        role: document.getElementById("employeeRole").value.trim(),
        availability: document.getElementById("employeeAvailability").value.trim()
    }; 

    employees.push(employee);
    saveData();
    employeeForm.reset();
    renderAll();
}); //Person 1 Angel Bhardwaj 

// Check whether the employee's entered available days include the shift day.  Person 1 Angel Bhardwaj 118 to 173
function isAvailable(employee, dateText) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = dayNames[new Date(dateText + "T12:00:00").getDay()];
    const availableDays = employee.availability.toLowerCase().split(",").map(function(value) {
        return value.trim().slice(0, 3);
    });
    return availableDays.includes(day.toLowerCase());
}   
function showMessage(message, isError) {
    const messageBox = document.getElementById("message");
    messageBox.textContent = message;
    messageBox.className = isError ? "message error" : "message success";
}

// Show employee profiles and provide a delete option. 
function renderEmployees() {
    const list = document.getElementById("employeeList");
    list.innerHTML = "";

    if (employees.length === 0) {
        list.innerHTML = '<p class="empty">No employees added yet.</p>';
    }

    employees.forEach(function(employee) {       
        const card = document.createElement("div");
        card.className = "item";

        const details = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = employee.name;
        const info = document.createElement("p");
        info.textContent = "Role: " + employee.role + " | Available: " + employee.availability;
        details.append(name, info);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            employees = employees.filter(function(person) {
                return person.id !== employee.id;
            });
            shifts.forEach(function(shift) {
                shift.assigned = shift.assigned.filter(function(id) {
                    return id !== employee.id;
                });
            });
            saveData();
            renderAll();
        });

        card.append(details, deleteButton);
        list.appendChild(card);
    });
}   // Person 1 Angel Bhardwaj