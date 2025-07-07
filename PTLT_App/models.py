from django.db import models
from django.utils import timezone

class CourseSection(models.Model):
    course_name = models.CharField(max_length=100)
    section_name = models.CharField(max_length=50)
    course_section = models.CharField(max_length=150, unique=True, editable=False)

    def save(self, *args, **kwargs):
        self.course_section = f"{self.course_name} {self.section_name}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.course_section


class Account(models.Model):
    user_id = models.CharField(max_length=50, unique=True, verbose_name="User ID")
    email = models.EmailField(unique=True, verbose_name="Email Address")
    first_name = models.CharField(max_length=100, verbose_name="First Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    role = models.CharField(max_length=50, choices=[('Admin', 'Admin'), ('Instructor', 'Instructor')], verbose_name="Role")
    password = models.CharField(max_length=255, verbose_name="Password")
    sex = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], verbose_name="Sex")
    
    course_section = models.ForeignKey(CourseSection, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Course & Section")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"


class FingerprintRegistration(models.Model):
    user_id = models.CharField(max_length=50, unique=True, verbose_name="School ID Number")
    email = models.EmailField(verbose_name="Email Address")
    first_name = models.CharField(max_length=100, verbose_name="First Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    
    role = models.CharField(
        max_length=20,
        choices=[('student', 'Student'), ('instructor', 'Instructor')],
        verbose_name="Role"
    )
    
    sex = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')],
        verbose_name="Sex"
    )

    course_section = models.ForeignKey(CourseSection, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Course & Section")

    fingerprint_data = models.BinaryField(verbose_name="Fingerprint Data")
    date_registered = models.DateTimeField(default=timezone.now, verbose_name="Date of Registration")

    device_id = models.CharField(max_length=100, verbose_name="Registered From Device", blank=True, null=True)
    synced = models.BooleanField(default=False, verbose_name="Synced to Cloud")

    def __str__(self):
        return f"{self.date_registered} - {self.user_id} - {self.role}"


class ClassSchedule(models.Model):
    professor = models.ForeignKey(Account, on_delete=models.CASCADE, limit_choices_to={'role': 'Instructor'}, verbose_name="Professor")
    course_title = models.CharField(max_length=255, verbose_name="Course Title")
    course_code = models.CharField(max_length=50, verbose_name="Course Code")

    course_section = models.ForeignKey(CourseSection, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Course & Section")

    time_in = models.TimeField(verbose_name="Time In")
    time_out = models.TimeField(verbose_name="Time Out")

    days = models.CharField(max_length=50, verbose_name="Day/s")  # E.g. "Mon/Wed/Fri"
    grace_period = models.PositiveIntegerField(verbose_name="Grace Period (minutes)")
    student_count = models.PositiveIntegerField(verbose_name="Student Count")

    remote_device = models.CharField(max_length=100, verbose_name="Remote Device (Serial or Name)")
    room_assignment = models.CharField(max_length=100, verbose_name="Room Assignment")

    def __str__(self):
        return f"{self.course_code} - {self.course_section} ({self.professor.last_name})"


class AttendanceRecord(models.Model):
    date = models.DateField(default=timezone.now, verbose_name="Date")

    class_schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, verbose_name="Class Schedule")
    professor = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'Instructor'}, verbose_name="Professor")
    student = models.ForeignKey(FingerprintRegistration, on_delete=models.CASCADE, verbose_name="Student")

    course_section = models.ForeignKey(CourseSection, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Course & Section")

    time_in = models.TimeField(verbose_name="Time In")
    time_out = models.TimeField(verbose_name="Time Out", null=True, blank=True)

    fingerprint_data = models.BinaryField(verbose_name="Fingerprint Data")

    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Late', 'Late'),
        ('Absent', 'Absent'),
        ('Excused', 'Excused'),
        ('No time-out', 'No time-out'),
    ]
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, verbose_name="Status")

    def __str__(self):
        return f"{self.date} - {self.student.user_id} - {self.status}"
