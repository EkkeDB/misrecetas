from django.contrib import admin
from .models import BodyPart, Stretch, StretchImage, StretchRoutine, RoutineStretch


class StretchImageInline(admin.TabularInline):
    model = StretchImage
    extra = 1


class RoutineStretchInline(admin.TabularInline):
    model = RoutineStretch
    extra = 1


@admin.register(BodyPart)
class BodyPartAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Stretch)
class StretchAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty_level', 'duration', 'created_by', 'is_favorite', 'created_at']
    list_filter = ['difficulty_level', 'body_parts', 'is_favorite', 'created_at', 'created_by']
    search_fields = ['title', 'description', 'tags']
    filter_horizontal = ['body_parts']
    inlines = [StretchImageInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StretchImage)
class StretchImageAdmin(admin.ModelAdmin):
    list_display = ['stretch', 'caption', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']


@admin.register(StretchRoutine)
class StretchRoutineAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'created_at']
    list_filter = ['created_at', 'created_by']
    search_fields = ['name', 'description']
    inlines = [RoutineStretchInline]
    readonly_fields = ['created_at', 'updated_at']