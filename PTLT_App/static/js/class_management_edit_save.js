// para sa table na javacript
const professors = ["Prof. Reyes", "Prof. Santos", "Prof. Garcia"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

document.addEventListener("DOMContentLoaded", function () {
    // Handle Edit/Save
    document.querySelectorAll('.toggle-edit-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        const row = button.closest('tr');
        const isEditing = button.textContent.trim() === "Save";

        const profCell = row.querySelector('.professor');
        const timeInCell = row.querySelector('.timein');
        const timeOutCell = row.querySelector('.timeout');
        const dayCell = row.querySelector('.day');

        if (!isEditing) {
            const currentProf = profCell.textContent.trim();
            profCell.innerHTML = `<select class="form-select form-select-sm">${professors.map(p => 
                `<option value="${p}" ${p === currentProf ? 'selected' : ''}>${p}</option>`).join('')}</select>`;

            timeInCell.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timeInCell.textContent.trim()}">`;
            timeOutCell.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timeOutCell.textContent.trim()}">`;

            const currentDay = dayCell.textContent.trim();
            dayCell.innerHTML = `<select class="form-select form-select-sm">${days.map(d => 
                `<option value="${d}" ${d === currentDay ? 'selected' : ''}>${d}</option>`).join('')}</select>`;

            button.textContent = "Save";
            button.classList.replace("btn-outline-primary", "btn-outline-success");
        } else {
            const selectedTimeIn = timeInCell.querySelector('input').value;
            const selectedTimeOut = timeOutCell.querySelector('input').value;

            if (selectedTimeOut <= selectedTimeIn) {
                alert("Time Out must be later than Time In.");
                timeOutCell.querySelector('input').focus();
                return;
            }

            if (!confirm("Are you sure you want to save these changes?")) return;

            const selectedProf = profCell.querySelector('select').value;
            const selectedDay = dayCell.querySelector('select').value;

            profCell.textContent = selectedProf;
            timeInCell.textContent = selectedTimeIn;
            timeOutCell.textContent = selectedTimeOut;
            dayCell.textContent = selectedDay;

            button.textContent = "Edit";
            button.classList.replace("btn-outline-success", "btn-outline-primary");
        }
    });
});


    // Handle Delete
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const row = button.closest('tr');
            const confirmDelete = confirm("Are you sure you want to delete this row?");
            if (confirmDelete) {
                row.remove(); // Delete row from UI only (no DB)
            }
        });
    });

    // para sa inputs — validate Time Out > Time In
    const form = document.querySelector('form'); // Your subject creation form
    const timeInInput = document.getElementById("time_in");
    const timeOutInput = document.getElementById("time_out");

    if (form && timeInInput && timeOutInput) {
        form.addEventListener("submit", function (e) {
            const timeIn = timeInInput.value;
            const timeOut = timeOutInput.value;

            if (timeIn && timeOut && timeOut <= timeIn) {
                e.preventDefault(); // prevent form submission
                alert("Time Out must be later than Time In.");
                timeOutInput.focus();
            }
        });
    }
});
