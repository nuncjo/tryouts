from django.urls import path

from todos.views import DetailsTodo, ListTodo

urlpatterns = [
    path('', ListTodo.as_view()),
    path('<int:pk>', DetailsTodo.as_view()),
]
