from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Recipe, RecipeImage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']


class RecipeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImage
        fields = ['id', 'image', 'caption', 'is_primary', 'created_at']


class RecipeSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = RecipeImageSerializer(many=True, read_only=True)
    ingredients_list = serializers.ReadOnlyField(source='get_ingredients_list')
    tags_list = serializers.ReadOnlyField(source='get_tags_list')

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'ingredients', 'instructions',
            'prep_time', 'cook_time', 'servings', 'category', 'category_id',
            'tags', 'created_by', 'created_at', 'updated_at', 'is_favorite',
            'images', 'ingredients_list', 'tags_list'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RecipeListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    tags_list = serializers.ReadOnlyField(source='get_tags_list')

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'prep_time', 'cook_time',
            'servings', 'category', 'created_by', 'created_at',
            'is_favorite', 'primary_image', 'tags_list'
        ]

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return RecipeImageSerializer(primary_image).data
        first_image = obj.images.first()
        if first_image:
            return RecipeImageSerializer(first_image).data
        return None