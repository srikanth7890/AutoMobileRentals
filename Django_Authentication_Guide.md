# Django User Authentication - Quick Guide

## What is Django Authentication?

Django's built-in authentication system handles user login, logout, registration, and permissions automatically. It's secure, tested, and ready to use out of the box.

## Key Features

- **User Management**: Create, login, logout users
- **Password Security**: Automatic hashing and validation
- **Session Management**: Secure user sessions
- **Permissions**: Control who can access what
- **Security**: Protection against common attacks

## Simple Example

### 1. Setup URLs

```python
# urls.py
from django.contrib.auth import views as auth_views
from django.urls import path

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
]
```

### 2. Create Login Template

```html
<!-- templates/registration/login.html -->
<form method="post">
    {% csrf_token %}
    <div>
        <label>Username:</label>
        {{ form.username }}
    </div>
    <div>
        <label>Password:</label>
        {{ form.password }}
    </div>
    <button type="submit">Login</button>
</form>
```

### 3. Protect Views

```python
# views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render

@login_required
def dashboard_view(request):
    return render(request, 'dashboard.html', {
        'user': request.user
    })
```

### 4. Check User Status in Templates

```html
<!-- templates/dashboard.html -->
{% if user.is_authenticated %}
    <h1>Welcome, {{ user.username }}!</h1>
    <a href="{% url 'logout' %}">Logout</a>
{% else %}
    <a href="{% url 'login' %}">Login</a>
{% endif %}
```

## Key Benefits

- **Quick Setup**: 3 lines of code for basic auth
- **Secure**: Built-in protection against attacks
- **Flexible**: Easy to customize and extend
- **Tested**: Used by millions of applications

## Common Use Cases

- **Admin Panels**: Protect sensitive areas
- **User Dashboards**: Personal user spaces
- **API Authentication**: Secure API endpoints
- **Content Management**: User-specific content

That's it! Django handles all the complex security stuff behind the scenes, so you can focus on building your application features.
