from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('forgot_password', views.forgot_password, name='forgot_password'),
    path('student_attendance_records', views.student_attendance_records, name='student_attendance_records'),
    path('schedule', views.schedule, name='schedule'),
    path('account_management/', views.account_management, name='account_management'),
    path('delete_account/<int:account_id>/', views.delete_account, name='delete_account'),
    path('update_account/<int:account_id>/', views.update_account, name='update_account'),
    path('class_management', views.class_management, name='class_management'),
    path('update_class_schedule/<int:pk>/', views.update_class_schedule, name='update_class_schedule'),
    path('delete_class_schedule/<int:pk>/', views.delete_class_schedule, name='delete_class_schedule'),
    path('attendance_report_template', views.attendance_report_template, name='attendance_report_template'),
    path('create_instructor', views.create_instructor, name='create_instructor'),
]