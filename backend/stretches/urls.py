from django.urls import path
from . import views

urlpatterns = [
    path('body-parts/', views.BodyPartListCreateView.as_view(), name='bodypart-list-create'),
    path('body-parts/<int:pk>/', views.BodyPartDetailView.as_view(), name='bodypart-detail'),
    path('', views.StretchListCreateView.as_view(), name='stretch-list-create'),
    path('<int:pk>/', views.StretchDetailView.as_view(), name='stretch-detail'),
    path('images/', views.StretchImageUploadView.as_view(), name='stretch-image-upload'),
    path('images/<int:pk>/', views.StretchImageDetailView.as_view(), name='stretch-image-detail'),
    path('routines/', views.StretchRoutineListCreateView.as_view(), name='routine-list-create'),
    path('routines/<int:pk>/', views.StretchRoutineDetailView.as_view(), name='routine-detail'),
    path('routines/<int:routine_id>/stretches/', views.add_stretch_to_routine, name='add-stretch-to-routine'),
    path('routines/<int:routine_id>/stretches/<int:stretch_id>/', views.remove_stretch_from_routine, name='remove-stretch-from-routine'),
]