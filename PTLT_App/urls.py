from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('student_attendance_records', views.student_attendance_records, name='student_attendance_records'),
    path('schedule', views.schedule, name='schedule'),
    path('account_management', views.account_management, name='account_management'),
    path('class_management', views.class_management, name='class_management'),
    path('attendance_report_template', views.attendance_report_template, name='attendance_report_template'),
]