document.addEventListener('DOMContentLoaded', () => {
    setupRowButtons();

    // 🔁 Fetch when dropdowns change
    ['role', 'status'].forEach(id => {
        const dropdown = document.getElementById(id);
        dropdown.addEventListener('change', fetchFilteredAccounts);
    });

    // 🔁 Search filter with debounce
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(fetchFilteredAccounts, 300); // debounce to reduce spam
    });

    function fetchFilteredAccounts() {
        const role = document.getElementById('role').value;
        const status = document.getElementById('status').value;
        const search = searchInput.value;

        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (status) params.append('status', status);
        if (search) params.append('search', search);

        fetch(`/account_management/?${params.toString()}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector('tbody').innerHTML = data.html;
            setupRowButtons();  // Re-bind to new rows
        })
        .catch(err => {
            console.error('Filtering fetch error:', err);
        });
    }

    function setupRowButtons() {
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => {
                const isEditing = editBtn.innerText === 'Save';
                const fields = row.querySelectorAll('.editable');

                if (isEditing) {
                    const data = {
                        user_id: row.querySelector('.user_id').innerText.trim(),
                        first_name: row.querySelector('.first_name').innerText.trim(),
                        last_name: row.querySelector('.last_name').innerText.trim(),
                        role: row.querySelector('.role select')?.value || row.querySelector('.role').innerText.trim(),
                        email: row.querySelector('.email').innerText.trim(),
                    };

                    const accountId = row.getAttribute('data-id');

                    fetch(`/update_account/${accountId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCSRFToken(),
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status === 'success' || json.status === 'no_changes') {
                            fields.forEach(field => {
                                field.contentEditable = "false";
                                if (field.classList.contains('role')) {
                                    const selected = field.querySelector('select')?.value;
                                    field.textContent = selected || field.textContent;
                                }
                            });
                            editBtn.innerText = 'Edit';
                            if (json.status === 'success') {
                                alert('Saved successfully!');
                            }
                        } else {
                            alert('Failed to update: ' + (json.message || 'unknown error'));
                            cancelEdit(fields, editBtn);
                        }
                    })
                    .catch(() => {
                        alert('Something went wrong.');
                        cancelEdit(fields, editBtn);
                    });

                } else {
                    fields.forEach(field => {
                        const original = field.textContent.trim();
                        field.setAttribute('data-original', original);

                        if (field.classList.contains('role')) {
                            const select = document.createElement('select');
                            select.classList.add('form-select', 'form-select-sm');
                            ['Instructor', 'Student', 'Admin'].forEach(option => {
                                const opt = document.createElement('option');
                                opt.value = option;
                                opt.text = option;
                                if (option === original) opt.selected = true;
                                select.appendChild(opt);
                            });
                            field.innerHTML = '';
                            field.appendChild(select);
                        } else {
                            field.contentEditable = "true";
                        }
                    });

                    editBtn.innerText = 'Save';
                }
            });

            deleteBtn.addEventListener('click', () => {
                const accountId = row.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this account?')) {
                    fetch(`/delete_account/${accountId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCSRFToken()
                        }
                    }).then(res => {
                        if (res.ok) {
                            row.remove();
                            alert('Account deleted.');
                        } else {
                            alert('Failed to delete.');
                        }
                    });
                }
            });
        });
    }

    function cancelEdit(fields, editBtn) {
        fields.forEach(field => {
            const original = field.getAttribute('data-original');
            if (field.classList.contains('role') && field.querySelector('select')) {
                field.textContent = original;
            } else {
                field.textContent = original;
                field.contentEditable = "false";
            }
        });
        editBtn.innerText = 'Edit';
    }

    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
});
