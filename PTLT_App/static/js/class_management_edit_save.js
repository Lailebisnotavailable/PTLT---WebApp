document.addEventListener("DOMContentLoaded", function () {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    // Load instructors passed from Django template
    const instructorsData = JSON.parse(document.getElementById("instructor-list").textContent);
    const professors = instructorsData.map(i => `${i.first_name.trim()} ${i.last_name.trim()}`);

    // Toggle Edit/Save Button
    document.querySelectorAll('.toggle-edit-btn').forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault();

            const row = button.closest('tr');
            const rowId = row.dataset.id;
            const isEditing = button.textContent.trim() === "Save";

            const profCell = row.querySelector('.professor');
            const timeInCell = row.querySelector('.timein');
            const timeOutCell = row.querySelector('.timeout');
            const dayCell = row.querySelector('.day');

            if (!isEditing) {
                const currentProf = profCell.textContent.trim();
                const currentTimeIn = timeInCell.textContent.trim();
                const currentTimeOut = timeOutCell.textContent.trim();
                const currentDay = dayCell.textContent.trim();

                // Generate dropdown for professor
                let dropdownHTML = `<select class="form-select form-select-sm">`;

                // Add all instructors from DB
                dropdownHTML += professors.map(p => {
                    const selected = (p === currentProf) ? 'selected' : '';
                    return `<option value="${p}" ${selected}>${p}</option>`;
                }).join('');

                // Handle case where currentProf is not in list (e.g., deleted instructor)
                if (!professors.includes(currentProf) && currentProf !== "-") {
                    dropdownHTML = `<select class="form-select form-select-sm">
                        <option value="${currentProf}" selected>${currentProf}</option>` + dropdownHTML.replace('<select class="form-select form-select-sm">', '');
                }

                dropdownHTML += `</select>`;
                profCell.innerHTML = dropdownHTML;

                timeInCell.innerHTML = `<input type="time" class="form-control form-control-sm" value="${currentTimeIn}">`;
                timeOutCell.innerHTML = `<input type="time" class="form-control form-control-sm" value="${currentTimeOut}">`;

                dayCell.innerHTML = `<select class="form-select form-select-sm">
                    ${days.map(d =>
                        `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`
                    ).join('')}
                </select>`;

                button.textContent = "Save";
                button.classList.replace("btn-outline-primary", "btn-outline-success");
            } else {
                const selectedProf = profCell.querySelector('select').value;
                const selectedTimeIn = timeInCell.querySelector('input').value;
                const selectedTimeOut = timeOutCell.querySelector('input').value;
                const selectedDay = dayCell.querySelector('select').value;

                if (selectedTimeOut <= selectedTimeIn) {
                    alert("Time Out must be later than Time In.");
                    return;
                }

                if (!confirm("Save changes?")) return;

                const response = await fetch(`/update_class_schedule/${rowId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCSRFToken()
                    },
                    body: JSON.stringify({
                        professor_name: selectedProf,
                        time_in: selectedTimeIn,
                        time_out: selectedTimeOut,
                        day: selectedDay
                    })
                });

                if (response.ok) {
                    profCell.textContent = selectedProf;
                    timeInCell.textContent = selectedTimeIn;
                    timeOutCell.textContent = selectedTimeOut;
                    dayCell.textContent = selectedDay;

                    button.textContent = "Edit";
                    button.classList.replace("btn-outline-success", "btn-outline-primary");
                } else {
                    alert("Failed to save changes.");
                }
            }
        });
    });

    // Delete button
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async function (e) {
            e.preventDefault();

            const row = button.closest('tr');
            const rowId = row.dataset.id;

            if (!confirm("Delete this class?")) return;

            const response = await fetch(`/delete_class_schedule/${rowId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken()
                }
            });

            if (response.ok) {
                row.remove();
            } else {
                alert("Failed to delete.");
            }
        });
    });

    // Helper to get CSRF token
    function getCSRFToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }
});
