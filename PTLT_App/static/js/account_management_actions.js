document.addEventListener('DOMContentLoaded', () => {
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => {
            const isEditing = editBtn.innerText === 'Save';
            const fields = row.querySelectorAll('.editable');

            if (isEditing) {
                // Save
                const data = {
                    user_id: row.querySelector('.user_id').innerText.trim(),
                    email: row.querySelector('.email').innerText.trim(),
                    role: row.querySelector('.role').innerText.trim(),
                };

                const accountId = row.getAttribute('data-id');
                fetch(`/update_account/${accountId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(res => {
                    if (res.ok) {
                        fields.forEach(field => field.contentEditable = "false");
                        editBtn.innerText = 'Edit';
                    } else {
                        alert('Failed to update.');
                    }
                });

            } else {
                // Enable editing
                fields.forEach(field => field.contentEditable = "true");
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
                    } else {
                        alert('Failed to delete.');
                    }
                });
            }
        });
    });

    function getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }
});
