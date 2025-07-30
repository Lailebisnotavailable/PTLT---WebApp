from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from django.db.models import Q
import json
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth import logout
from django.utils.safestring import mark_safe
from django.core.serializers.json import DjangoJSONEncoder
from datetime import time
from django.views.decorators.http import require_POST

from django.shortcuts import render, redirect
from .models import Account
from .models import CourseSection
from .models import ClassSchedule


@transaction.atomic 
def login_view(request):
    
    # Check if any accounts exist
    if not Account.objects.exists():
        # Create default admin and instructor accounts
        default_accounts = [
            {
                'user_id': 'admin001',
                'email': 'admin@example.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'Admin',
                'password': 'admin',  # Plaintext; will be hashed
                'sex': 'Other',
                'status': 'Active'
            },
            {
                'user_id': 'instructor001',
                'email': 'instructor@example.com',
                'first_name': 'Instructor',
                'last_name': 'User',
                'role': 'Instructor',
                'password': 'instructor',
                'sex': 'Other',
                'status': 'Active'
            }
        ]

        for acc in default_accounts:
            # Create Django built-in User
            user = User.objects.create_user(
                username=acc['user_id'],
                email=acc['email'],
                password=acc['password'],
                first_name=acc['first_name'],
                last_name=acc['last_name']
            )

            # Save also to your custom Account model
            Account.objects.create(
                user_id=acc['user_id'],
                email=acc['email'],
                first_name=acc['first_name'],
                last_name=acc['last_name'],
                role=acc['role'],
                password=acc['password'],  # Store plaintext or hash? Up to you, but it's safer to hash
                sex=acc['sex'],
                status=acc['status'],
                course_section=None
            )
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            # Find the User with this email
            user_obj = User.objects.get(email=email)

            # Now authenticate using the username (which is user_id or custom set)
            user = authenticate(request, username=user_obj.username, password=password)

            if user is not None:
                login(request, user)  # Start session

                try:
                    # Match the custom Account model by email
                    account = Account.objects.get(email=email)

                    # Store session details
                    request.session['user_id'] = account.user_id
                    request.session['role'] = account.role

                    # Redirect based on role
                    if account.role == 'Admin':
                        return redirect('account_management')
                    elif account.role == 'Instructor':
                        return redirect('schedule')
                    else:
                        messages.error(request, "Unknown user role.")
                        return redirect('login')

                except Account.DoesNotExist:
                    messages.error(request, "Custom account not found.")
                    print("Account lookup failed")
                    return redirect('login')
            else:
                messages.error(request, "Invalid credentials.")
                print("Auth failed")
                return redirect('login')

        except User.DoesNotExist:
            messages.error(request, "No user with that email.")
            print("User email not found")
            return redirect('login')
        
    return render(request, 'login.html')

def logout_view(request):
    logout(request)  # Destroys session and logs out user
    return redirect('login') 



def create_instructor(request):
    if request.method == 'POST':
        form_type = request.POST.get('form_type')

        if form_type == 'instructor_form':
            # Instructor form submitted
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

        elif form_type == 'course_section_form':
            # Course & section form submitted
            course_name = request.POST.get('course_name')
            section_name = request.POST.get('section_name')

            try:
                course_section = CourseSection.objects.create(
                    course_name=course_name,
                    section_name=section_name
                )
                messages.success(request, f'Course Section "{course_section.course_section}" created successfully!')
                return redirect('create_instructor')
            except Exception as e:
                messages.error(request, f'Error: {str(e)}')

    return render(request, 'create_instructor.html')


def forgot_password(request):
    return render(request, 'forgot_password.html')

def student_attendance_records(request):
    return render(request, 'student_attendance_records.html')

def schedule(request):
    return render(request, 'schedule.html')

def account_management(request):
    role_filter = request.GET.get('role', '')
    status_filter = request.GET.get('status', '')
    search_query = request.GET.get('search', '')

    accounts = Account.objects.all()

    if role_filter:
        accounts = accounts.filter(role__iexact=role_filter)
    if status_filter:
        accounts = accounts.filter(status__iexact=status_filter)
    if search_query:
        accounts = accounts.filter(
            Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query)
        )

    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        html = render_to_string('partials/account_table_body.html', {'accounts': accounts})
        return JsonResponse({'html': html})

    return render(request, 'account_management.html', {'accounts': accounts})



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
    course_sections = CourseSection.objects.all()

    if request.method == 'POST':
        course_code = request.POST.get('course_code')
        course_name = request.POST.get('course_name')
        time_in = request.POST.get('time_in')
        time_out = request.POST.get('time_out')
        day = request.POST.get('day')
        course_section_str = request.POST.get('course_section')

        try:
            section_obj = CourseSection.objects.get(course_section=course_section_str)
        except CourseSection.DoesNotExist:
            section_obj = None

        ClassSchedule.objects.create(
            course_code=course_code,
            course_title=course_name,
            time_in=time_in,
            time_out=time_out,
            days=day,
            course_section=section_obj,
            professor=None,
            student_count=0,
            grace_period=0,
            remote_device='-',
            room_assignment='-',
        )

    classes = ClassSchedule.objects.all()

    # Get instructors only
    instructors = Account.objects.filter(role="Instructor").values("first_name", "last_name")
    instructors_json = json.dumps(list(instructors), cls=DjangoJSONEncoder)

    return render(request, 'class_management.html', {
        'course_sections': course_sections,
        'classes': classes,
        'instructors_json': instructors_json
    })


@csrf_exempt
def update_class_schedule(request, pk):
    if request.method == "POST":
        try:
            cls = ClassSchedule.objects.get(id=pk)
            data = json.loads(request.body)

            prof_name = data.get("professor_name", "").strip()
            if prof_name:
                try:
                    first, last = prof_name.split(" ", 1)
                    professor = Account.objects.get(first_name=first, last_name=last)
                    cls.professor = professor
                except Account.DoesNotExist:
                    cls.professor = None

            cls.time_in = data.get("time_in")
            cls.time_out = data.get("time_out")
            cls.days = data.get("day")
            cls.save()

            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)})


@csrf_exempt
def delete_class_schedule(request, pk):
    if request.method == "POST":
        try:
            cls = ClassSchedule.objects.get(id=pk)
            cls.delete()
            return JsonResponse({"status": "deleted"})
        except:
            return JsonResponse({"status": "error"}, status=400)

def attendance_report_template(request):
    return render(request, 'attendance_report_template.html')