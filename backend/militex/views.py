# backend/militex/views.py
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.core.management import call_command

def run_import(request):
    call_command('runscript', 'import_parsed_data')
    return JsonResponse({'status': 'done'})
@ensure_csrf_cookie
def csrf(request):
    """
    Sets the CSRF cookie for the frontend
    """
    return JsonResponse({'status': 'success',})

def index(request):
    return render(request, 'index.html')
