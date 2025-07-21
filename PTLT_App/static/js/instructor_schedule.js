const rooms = ["OITC", "Acad", "New Uitc"];

document.addEventListener("DOMContentLoaded", function () {
    // Edit/Save toggle for course table rows
    document.querySelectorAll(".toggle-course-edit-btn").forEach(button => {
        button.addEventListener("click", function () {
            const row = this.closest("tr");
            const isEditing = this.textContent.trim() === "Save";

            const timein = row.querySelector(".timein");
            const timeout = row.querySelector(".timeout");
            const room = row.querySelector(".room");
            const grace = row.querySelector(".grace");

            if (!isEditing) {
                timein.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timein.textContent.trim()}">`;
                timeout.innerHTML = `<input type="time" class="form-control form-control-sm" value="${timeout.textContent.trim()}">`;

                const currentRoom = room.textContent.trim();
                room.innerHTML = `<select class="form-select form-select-sm">
                    ${rooms.map(r => `<option value="${r}" ${r === currentRoom ? "selected" : ""}>${r}</option>`).join('')}
                </select>`;

                const graceVal = parseInt(grace.textContent) || 0;
                grace.innerHTML = `<input type="number" class="form-control form-control-sm" value="${graceVal}" min="0">`;

                this.textContent = "Save";
                this.classList.replace("btn-outline-primary", "btn-outline-success");
            } else {
                const timeinVal = timein.querySelector("input").value;
                const timeoutVal = timeout.querySelector("input").value;
                if (timeoutVal <= timeinVal) {
                    alert("Time Out must be later than Time In.");
                    timeout.querySelector("input").focus();
                    return;
                }

                if (!confirm("Are you sure you want to save these changes?")) return;

                timein.textContent = timeinVal;
                timeout.textContent = timeoutVal;
                room.textContent = room.querySelector("select").value;
                grace.textContent = `${grace.querySelector("input").value} minutes`;

                this.textContent = "Edit";
                this.classList.replace("btn-outline-success", "btn-outline-primary");
            }
        });
    });

    // Export Schedule as PDF
    const exportBtn = document.querySelector('.custom-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const element = document.getElementById('schedule-overview');
            const opt = {
                margin: 0.5,
                filename: 'Schedule_Overview.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }

    // Help Guide Modal Logic
    const helpBtn = document.getElementById("helpBtn");
    const helpImage = document.getElementById("helpImage");
    const prevBtn = document.getElementById("prevHelp");
    const nextBtn = document.getElementById("nextHelp");

    let helpSteps = [];
    const helpDataEl = document.getElementById("help-data");
    if (helpDataEl) {
        try {
            const parsed = JSON.parse(helpDataEl.textContent);
            helpSteps = parsed.steps;
        } catch (e) {
            console.error("Invalid help step data:", e);
        }
    }

    let currentStep = 0;

    function updateHelpStep() {
        helpImage.src = helpSteps[currentStep];

        // Disable/Enable buttons and apply visual class
        prevBtn.disabled = currentStep === 0;
        nextBtn.disabled = currentStep === helpSteps.length - 1;

        prevBtn.classList.toggle("disabled", prevBtn.disabled);
        nextBtn.classList.toggle("disabled", nextBtn.disabled);
    }

    if (helpImage && helpSteps.length > 0) {
        updateHelpStep(); // Load first image on open

        prevBtn.addEventListener("click", () => {
            if (currentStep > 0) {
                currentStep--;
                updateHelpStep();
            }
        });

        nextBtn.addEventListener("click", () => {
            if (currentStep < helpSteps.length - 1) {
                currentStep++;
                updateHelpStep();
            }
        });
    }

    if (helpBtn) {
        helpBtn.addEventListener("click", function () {
            const modal = new bootstrap.Modal(document.getElementById("helpGuideModal"));
            modal.show();
        });
    }
});
