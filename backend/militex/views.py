# backend/militex/views.py
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def csrf(request):
    """
    Sets the CSRF cookie for the frontend
    """
    return JsonResponse({'status': 'success',})

def index(request):
    return render(request, 'index.html')
