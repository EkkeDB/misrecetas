from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('images/', views.RecipeImageUploadView.as_view(), name='recipe-image-upload'),
    path('images/<int:pk>/', views.RecipeImageDetailView.as_view(), name='recipe-image-detail'),
    path('shopping-list/', views.generate_shopping_list, name='generate-shopping-list'),
]