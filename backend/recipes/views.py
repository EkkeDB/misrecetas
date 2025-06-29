from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Category, Recipe, RecipeImage
from .serializers import CategorySerializer, RecipeSerializer, RecipeListSerializer, RecipeImageSerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.all()


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.all()


class RecipeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_favorite']
    search_fields = ['title', 'description', 'ingredients', 'tags']
    ordering_fields = ['created_at', 'title', 'prep_time', 'cook_time']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return RecipeListSerializer
        return RecipeSerializer

    def get_queryset(self):
        return Recipe.objects.filter(created_by=self.request.user).prefetch_related('images', 'category')


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Recipe.objects.filter(created_by=self.request.user).prefetch_related('images', 'category')


class RecipeImageUploadView(generics.CreateAPIView):
    serializer_class = RecipeImageSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        recipe_id = request.data.get('recipe_id')
        try:
            recipe = Recipe.objects.get(id=recipe_id, created_by=request.user)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recipe=recipe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecipeImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecipeImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RecipeImage.objects.filter(recipe__created_by=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_shopping_list(request):
    recipe_ids = request.data.get('recipe_ids', [])
    recipes = Recipe.objects.filter(id__in=recipe_ids, created_by=request.user)
    
    all_ingredients = []
    for recipe in recipes:
        ingredients_list = recipe.get_ingredients_list()
        all_ingredients.extend(ingredients_list)
    
    # Remove duplicates while preserving order
    unique_ingredients = []
    seen = set()
    for ingredient in all_ingredients:
        if ingredient.lower() not in seen:
            unique_ingredients.append(ingredient)
            seen.add(ingredient.lower())
    
    return Response({
        'shopping_list': unique_ingredients,
        'recipe_count': len(recipes)
    })