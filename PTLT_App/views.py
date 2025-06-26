from django.shortcuts import render


def login(request):
    return render(request, 'login.html')

def manage_user(request):
    return render(request, 'manage_user.html')

def attendance_logs(request):
    return render(request, 'attendance_logs.html')

def instructor_schedule(request):
    return render(request, 'instructor_schedule.html')
