from django.shortcuts import render


def login(request):
    return render(request, 'login.html')

def student_attendance_records(request):
    return render(request, 'student_attendance_records.html')

def schedule(request):
    return render(request, 'schedule.html')

def account_management(request):
    return render(request, 'account_management.html')



