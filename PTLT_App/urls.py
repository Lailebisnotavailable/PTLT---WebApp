from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.login, name='login'),
    path('manage_user', views.manage_user, name='manage_user'),
    path('attendance_logs', views.attendance_logs, name='attendance_logs'),
    path('instructor_schedule', views.instructor_schedule, name='instructor_schedule'),
]