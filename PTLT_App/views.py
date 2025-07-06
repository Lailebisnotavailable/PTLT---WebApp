from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Account

def login(request):
    return render(request, 'login.html')

from django.contrib import messages

def create_instructor(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        role = request.POST.get('role')
        password = request.POST.get('password')
        sex = request.POST.get('sex')

        if Account.objects.filter(user_id=user_id).exists():
            messages.error(request, 'User ID already exists.')
        elif Account.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
        else:
            Account.objects.create(
                user_id=user_id,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=role,
                password=password,
                sex=sex
            )
            messages.success(request, 'Instructor account created successfully!')
            return redirect('create_instructor')

    return render(request, 'create_instructor.html')


def forgot_password(request):
    return render(request, 'forgot_password.html')

def student_attendance_records(request):
    return render(request, 'student_attendance_records.html')

def schedule(request):
    return render(request, 'schedule.html')

def account_management(request):
    accounts = Account.objects.all()
    return render(request, 'account_management.html', {'accounts': accounts})

from django.views.decorators.csrf import csrf_exempt
@csrf_exempt
def delete_account(request, account_id):
    if request.method == 'POST':
        acc = get_object_or_404(Account, id=account_id)
        acc.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)

@csrf_exempt
def update_account(request, account_id):
    print("1")
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # 👈 Debug
            
            account = get_object_or_404(Account, id=account_id)

            # Direct assignment from data
            account.user_id = data.get('user_id', account.user_id)
            account.first_name = data.get('first_name', account.first_name)
            account.last_name = data.get('last_name', account.last_name)
            account.role = data.get('role', account.role)
            account.email = data.get('email', account.email)

            account.save()

            return JsonResponse({'status': 'success'})
        except Exception as e:
            print("Error updating account:", str(e))
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'invalid_request'})

def class_management(request):
    return render(request, 'class_management.html')

def attendance_report_template(request):
    return render(request, 'attendance_report_template.html')