# serializers.py
from rest_framework import serializers
from .models import Account, ClassSchedule, AttendanceRecord, FingerprintRegistration

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}  # Don't return password in responses
        }

class ClassScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSchedule
        fields = '__all__'

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_title = serializers.CharField(source='class_schedule.course_title', read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = '__all__'

class FingerprintRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FingerprintRegistration
        fields = '__all__'

# Simplified serializers for mobile sync
class MobileAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['user_id', 'email', 'first_name', 'last_name', 'role', 'sex', 'status']

class MobileAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'date', 'class_schedule', 'student', 'time_in', 'time_out', 'status']