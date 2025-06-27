from django.shortcuts import render


def login(request):
    return render(request, 'login.html')

def forgot_password(request):
    return render(request, 'forgot_password.html')

def student_attendance_records(request):
    return render(request, 'student_attendance_records.html')

def schedule(request):
    return render(request, 'schedule.html')

def account_management(request):
    return render(request, 'account_management.html')

def class_management(request):
    return render(request, 'class_management.html')

def attendance_report_template(request):
    return render(request, 'attendance_report_template.html')