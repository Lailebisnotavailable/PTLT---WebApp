from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("Welcome to PTLT")

def login(request):
    return render(request, 'login.html')



