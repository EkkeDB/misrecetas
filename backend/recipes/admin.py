from django.contrib import admin
from .models import Category, Recipe, RecipeImage


class RecipeImageInline(admin.TabularInline):
    model = RecipeImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'created_by', 'prep_time', 'cook_time', 'servings', 'is_favorite', 'created_at']
    list_filter = ['category', 'is_favorite', 'created_at', 'created_by']
    search_fields = ['title', 'description', 'ingredients', 'tags']
    inlines = [RecipeImageInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RecipeImage)
class RecipeImageAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'caption', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']