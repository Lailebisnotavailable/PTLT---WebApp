from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('student_attendance_records', views.student_attendance_records, name='student_attendance_records'),
    path('schedule', views.schedule, name='schedule'),
    path('account_management', views.account_management, name='account_management'),
]