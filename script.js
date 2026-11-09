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

// Create a shift after checking its time.    Person 2 Nikita Thakur 36 to 65
shiftForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value; 

    if (start >= end) {      
        showMessage("End time must be later than start time.", true);
        return;
    }

    const shift = {
        id: Date.now(),
        name: document.getElementById("shiftName").value.trim(),
        date: document.getElementById("shiftDate").value,
        start: start,
        end: end,
        required: Number(document.getElementById("requiredStaff").value),
        assigned: []
    };

    shifts.push(shift);
    saveData();
    shiftForm.reset();
    document.getElementById("shiftDate").value = today;
    document.getElementById("requiredStaff").value = 1;
    renderAll();
    showMessage("Shift created successfully.", false);
});   //Person 2 Nikita Thakur

// Assign an employee to a selected shift.     // Person 3 Anika 67 to 116
assignmentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const employeeId = Number(document.getElementById("employeeSelect").value);
    const shiftId = Number(document.getElementById("shiftSelect").value);

    const employee = employees.find(function(person) {
        return person.id === employeeId;
    });
    const shift = shifts.find(function(item) {
        return item.id === shiftId;
    });

    if (!employee || !shift) {
        showMessage("Please select an employee and a shift.", true);
        return;
    }

    if (shift.assigned.includes(employeeId)) {
        showMessage("This employee is already assigned to this shift.", true);
        return;
    }

    if (!isAvailable(employee, shift.date)) {
        showMessage(employee.name + " is not available on that day.", true);
        return;
    }

    const hasConflict = shifts.some(function(otherShift) {
        if (otherShift.id === shift.id || otherShift.date !== shift.date) {
            return false;
        }

        const alreadyAssigned = otherShift.assigned.includes(employeeId);
        const timesOverlap = shift.start < otherShift.end && shift.end > otherShift.start;
        return alreadyAssigned && timesOverlap;
    });

    if (hasConflict) {
        showMessage("Conflict detected: this employee has an overlapping shift.", true);
        return;
    }

    shift.assigned.push(employeeId);  
    saveData();
    renderAll();
    showMessage("Employee assigned successfully.", false);
    assignmentForm.reset();
});  // Person 3 Anika

// Check whether the employee's entered available days include the shift day.   Person 1 Angel Bhardwaj Line 118 to 173
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
}  //Person 1 Angel Bhardwaj 

// Fill the employee and shift selection boxes. Person 3 Anika Line 175 to 196
function renderOptions() {
    const employeeSelect = document.getElementById("employeeSelect");
    const shiftSelect = document.getElementById("shiftSelect");

    employeeSelect.innerHTML = '<option value="">Select employee</option>';
    shiftSelect.innerHTML = '<option value="">Select shift</option>';

    employees.forEach(function(employee) {
        const option = document.createElement("option");
        option.value = employee.id;
        option.textContent = employee.name;
        employeeSelect.appendChild(option);
    });   

    shifts.forEach(function(shift) {
        const option = document.createElement("option");
        option.value = shift.id;
        option.textContent = shift.name + " - " + shift.date + " (" + shift.start + ")";
        shiftSelect.appendChild(option);
    });
}   //Person 3 Anika

// Show shifts for the selected date and their staffing status.  Person 3 Nikita Thakur Line 198 to 252
function renderSchedule() {
    const list = document.getElementById("scheduleList");
    const selectedDate = document.getElementById("scheduleDate").value;
    list.innerHTML = "";

    const dailyShifts = shifts.filter(function(shift) {
        return shift.date === selectedDate;
    });

    if (dailyShifts.length === 0) {
        list.innerHTML = '<p class="empty">No shifts scheduled for this date.</p>';
        return;
    }

    dailyShifts.sort(function(a, b) {
        return a.start.localeCompare(b.start);
    });

    dailyShifts.forEach(function(shift) {
        const card = document.createElement("div");
        card.className = "item";

        const heading = document.createElement("strong");
        heading.textContent = shift.name + " (" + shift.start + " - " + shift.end + ")";

        const staff = document.createElement("p");
        staff.textContent = "Staff required: " + shift.required +
            " | Assigned: " + shift.assigned.length +
            " | " + (shift.assigned.length >= shift.required ? "Staffing complete" : "Needs more staff");

        const names = document.createElement("p");
        const assignedNames = shift.assigned.map(function(id) {
            const person = employees.find(function(employee) {
                return employee.id === id;
            });
            return person ? person.name : "";
        }).filter(Boolean);
        names.textContent = "Employees: " + (assignedNames.length ? assignedNames.join(", ") : "None");

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete Shift";
        deleteButton.addEventListener("click", function() {
            shifts = shifts.filter(function(item) {
                return item.id !== shift.id;
            });
            saveData();
            renderAll();
        });

        card.append(heading, staff, names, deleteButton);
        list.appendChild(card);
    });
}    // Person 3 Nikita Thakur

// Update the staffing summary cards.  // Person 3 Anika 254 to 276
function renderSummary() {
    const assigned = shifts.filter(function(shift) {
        return shift.assigned.length >= shift.required;
    }).length;

    document.getElementById("totalEmployees").textContent = employees.length;
    document.getElementById("totalShifts").textContent = shifts.length;
    document.getElementById("assignedShifts").textContent = assigned;
    document.getElementById("unassignedShifts").textContent = shifts.length - assigned;
}

function renderAll() {
    renderEmployees();
    renderOptions();
    renderSchedule();
    renderSummary();
}

document.getElementById("scheduleDate").addEventListener("change", renderSchedule);

// Display saved data when the page opens.
renderAll();  // Person 3 Anika 