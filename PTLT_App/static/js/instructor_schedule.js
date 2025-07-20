const rooms = ["OITC", "Acad", "New Uitc"];

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".toggle-course-edit-btn").forEach(button => {
        button.addEventListener("click", function () {
            const row = this.closest("tr");
            const isEditing = this.textContent.trim() === "Save";

            const timein = row.querySelector(".timein");
            const timeout = row.querySelector(".timeout");
            const room = row.querySelector(".room");
            const grace = row.querySelector(".grace");

            if (!isEditing) {
                // Convert cells to editable form
                timein.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timein.textContent.trim()}">`;
                timeout.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timeout.textContent.trim()}">`;

                const currentRoom = room.textContent.trim();
                room.innerHTML = `<select class="form-select form-select-sm">
                    ${rooms.map(r => `<option value="${r}" ${r === currentRoom ? "selected" : ""}>${r}</option>`).join('')}
                </select>`;

                // Parse the number from "15 minutes" or fallback to 0
                const graceVal = parseInt(grace.textContent) || 0;
                grace.innerHTML = `<input type="number" class="form-control form-control-sm" value="${graceVal}" min="0">`;

                this.textContent = "Save";
                this.classList.replace("btn-outline-primary", "btn-outline-success");
            } else {
                // Validate Time
                const timeinVal = timein.querySelector("input").value;
                const timeoutVal = timeout.querySelector("input").value;
                if (timeoutVal <= timeinVal) {
                    alert("Time Out must be later than Time In.");
                    timeout.querySelector("input").focus();
                    return;
                }

                if (!confirm("Are you sure you want to save these changes?")) return;

                // Save input values back to plain text
                timein.textContent = timein.querySelector("input").value;
                timeout.textContent = timeout.querySelector("input").value;
                room.textContent = room.querySelector("select").value;
                grace.textContent = `${grace.querySelector("input").value} minutes`;

                this.textContent = "Edit";
                this.classList.replace("btn-outline-success", "btn-outline-primary");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const exportBtn = document.querySelector('.custom-btn');
    exportBtn.addEventListener('click', function () {
        const element = document.getElementById('schedule-overview');
        const opt = {
            margin:       0.5,
            filename:     'Schedule_Overview.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
    });
});

