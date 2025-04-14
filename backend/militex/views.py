from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({'message': 'CSRF cookie set'})

def index(request):
    return render(request, 'index.html')
