    document.addEventListener("DOMContentLoaded", function () {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        // Load instructors passed from Django template
        const instructorsData = JSON.parse(document.getElementById("instructor-list").textContent);
        const professors = instructorsData.map(i => `${i.first_name.trim()} ${i.last_name.trim()}`);

        const createSubjectForm = document.getElementById("createSubjectForm");
        if (createSubjectForm) {
            createSubjectForm.addEventListener("submit", function(e) {
                const timeIn = document.getElementById("time_in").value;
                const timeOut = document.getElementById("time_out").value;

                if (timeOut <= timeIn) {
                    e.preventDefault(); // stop submission
                    alert("Time Out must be later than Time In.");
                }
            });
        }


         const syncToMobileBtn = document.getElementById("syncToMobileBtn");
        if (syncToMobileBtn) {
            syncToMobileBtn.addEventListener("click", async function() {
                // Show loading state
                syncToMobileBtn.disabled = true;
                syncToMobileBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Preparing sync...';
                
                try {
                    // Get account and schedule counts
                    const response = await fetch('/api/trigger-mobile-sync/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken()
                        }
                    });
                    
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        // Show detailed success message
                        let message = '✅ Sync triggered successfully!\n\n';
                        message += 'Master data now available for mobile download:\n';
                        message += `• ${data.data.accounts_available} user accounts\n`;
                        message += `• ${data.data.schedules_available} class schedules\n\n`;
                        message += 'Mobile apps will:\n';
                        message += '• Replace ALL mobile accounts with server data\n';
                        message += '• Update class schedules\n\n';
                        message += 'Open mobile app and press "Sync Now" to download!';
                        
                        alert(message);
                    } else {
                        alert('❌ Sync failed: ' + (data.message || 'Unknown error'));
                    }
                } catch (error) {
                    console.error('Sync error:', error);
                    alert('❌ Sync failed: Network error');
                } finally {
                    // Reset button state
                    syncToMobileBtn.disabled = false;
                    syncToMobileBtn.innerHTML = 'Sync to Mobile App';
                }
            });
}
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

        const importBtn = document.getElementById("importClassBtn");
        const fileInput = document.getElementById("fileInput");

        if (importBtn && fileInput) {
            importBtn.addEventListener("click", function () {
                fileInput.click();
            });

            fileInput.addEventListener("change", async function (event) {
                const file = event.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("csv_file", file);

                try {
                    const response = await fetch("/import_class_schedule/", {
                        method: "POST",
                        headers: {
                            "X-CSRFToken": getCSRFToken()
                        },
                        body: formData
                    });

                    const data = await response.json();

                    if (data.status === "ok") {
                        alert(`✅ Import completed successfully!\n${data.imported} class schedule(s) imported.`);
                        location.reload();
                    } else if (data.status === "partial") {
                        let message = `⚠️ Import partially completed!\n\n`;
                        message += `✅ Successfully imported: ${data.imported} class schedule(s)\n`;
                        message += `⚠️ Skipped: ${data.skipped} class schedule(s)\n\n`;
                        message += `Issues found:\n`;
                        
                        // Make errors more user-friendly
                        const friendlyErrors = data.errors.map(error => {
                            if (error.includes("Professor") && error.includes("not found")) {
                                return "• Some instructors in your file don't exist in the system";
                            } else if (error.includes("Section") && error.includes("not found")) {
                                return "• Some course sections in your file don't exist in the system";
                            } else if (error.includes("Failed to save")) {
                                return "• Some data had formatting issues";
                            } else {
                                return "• " + error.split(":").pop().trim(); // Get the part after the colon
                            }
                        });
                        
                        // Remove duplicates
                        const uniqueErrors = [...new Set(friendlyErrors)];
                        message += uniqueErrors.join("\n");
                        
                        alert(message);
                        if (data.imported > 0) {
                            location.reload();
                        }
                    } else {
                        let message = `❌ Import failed!\n\n`;
                        message += `No class schedules were imported.\n\n`;
                        message += `Please check the following:\n`;
                        
                        // Make errors more user-friendly
                        const friendlyErrors = data.errors.map(error => {
                            if (error.includes("Professor") && error.includes("not found")) {
                                return "• Make sure all instructor IDs in your file exist in the system";
                            } else if (error.includes("Section") && error.includes("not found")) {
                                return "• Make sure all course section IDs in your file are valid";
                            } else if (error.includes("Failed to save")) {
                                return "• Check that your data is properly formatted (times, numbers, etc.)";
                            } else if (error.includes("Failed to read CSV")) {
                                return "• Make sure your file is a valid CSV format";
                            } else {
                                return "• " + error.split(":").pop().trim();
                            }
                        });
                        
                        // Remove duplicates and show unique issues
                        const uniqueErrors = [...new Set(friendlyErrors)];
                        message += uniqueErrors.join("\n");
                        
                        alert(message);
                    }
                } catch (err) {
                    alert("⚠️ Error importing CSV: " + err);
                }
            });
        }

    });
