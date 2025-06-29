from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import BodyPart, Stretch, StretchImage, StretchRoutine, RoutineStretch
from .serializers import (
    BodyPartSerializer, StretchSerializer, StretchListSerializer,
    StretchImageSerializer, StretchRoutineSerializer, RoutineStretchSerializer
)


class BodyPartListCreateView(generics.ListCreateAPIView):
    serializer_class = BodyPartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BodyPart.objects.all()


class BodyPartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BodyPartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BodyPart.objects.all()


class StretchListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['body_parts', 'difficulty_level', 'is_favorite']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'title', 'difficulty_level', 'duration']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return StretchListSerializer
        return StretchSerializer

    def get_queryset(self):
        return Stretch.objects.filter(created_by=self.request.user).prefetch_related('body_parts', 'images')


class StretchDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StretchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Stretch.objects.filter(created_by=self.request.user).prefetch_related('body_parts', 'images')


class StretchImageUploadView(generics.CreateAPIView):
    serializer_class = StretchImageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        stretch_id = request.data.get('stretch_id')
        try:
            stretch = Stretch.objects.get(id=stretch_id, created_by=request.user)
        except Stretch.DoesNotExist:
            return Response({'error': 'Stretch not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(stretch=stretch)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StretchImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StretchImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StretchImage.objects.filter(stretch__created_by=self.request.user)


class StretchRoutineListCreateView(generics.ListCreateAPIView):
    serializer_class = StretchRoutineSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_queryset(self):
        return StretchRoutine.objects.filter(created_by=self.request.user).prefetch_related('routinestretch_set__stretch')


class StretchRoutineDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StretchRoutineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StretchRoutine.objects.filter(created_by=self.request.user).prefetch_related('routinestretch_set__stretch')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_stretch_to_routine(request, routine_id):
    try:
        routine = StretchRoutine.objects.get(id=routine_id, created_by=request.user)
    except StretchRoutine.DoesNotExist:
        return Response({'error': 'Routine not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = RoutineStretchSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(routine=routine)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_stretch_from_routine(request, routine_id, stretch_id):
    try:
        routine = StretchRoutine.objects.get(id=routine_id, created_by=request.user)
        routine_stretch = RoutineStretch.objects.get(routine=routine, stretch_id=stretch_id)
        routine_stretch.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except (StretchRoutine.DoesNotExist, RoutineStretch.DoesNotExist):
        return Response({'error': 'Routine or stretch not found'}, status=status.HTTP_404_NOT_FOUND)