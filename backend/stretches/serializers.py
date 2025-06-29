from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BodyPart, Stretch, StretchImage, StretchRoutine, RoutineStretch


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class BodyPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = BodyPart
        fields = ['id', 'name', 'description', 'created_at']


class StretchImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = StretchImage
        fields = ['id', 'image', 'caption', 'is_primary', 'created_at']


class StretchSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    body_parts = BodyPartSerializer(many=True, read_only=True)
    body_part_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    images = StretchImageSerializer(many=True, read_only=True)
    tags_list = serializers.ReadOnlyField(source='get_tags_list')

    class Meta:
        model = Stretch
        fields = [
            'id', 'title', 'description', 'instructions', 'duration',
            'repetitions', 'body_parts', 'body_part_ids', 'difficulty_level',
            'video_url', 'tags', 'created_by', 'created_at', 'updated_at',
            'is_favorite', 'images', 'tags_list'
        ]

    def create(self, validated_data):
        body_part_ids = validated_data.pop('body_part_ids', [])
        validated_data['created_by'] = self.context['request'].user
        stretch = super().create(validated_data)
        if body_part_ids:
            stretch.body_parts.set(body_part_ids)
        return stretch

    def update(self, instance, validated_data):
        body_part_ids = validated_data.pop('body_part_ids', None)
        stretch = super().update(instance, validated_data)
        if body_part_ids is not None:
            stretch.body_parts.set(body_part_ids)
        return stretch


class StretchListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    body_parts = BodyPartSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()
    tags_list = serializers.ReadOnlyField(source='get_tags_list')

    class Meta:
        model = Stretch
        fields = [
            'id', 'title', 'description', 'duration', 'repetitions',
            'body_parts', 'difficulty_level', 'created_by', 'created_at',
            'is_favorite', 'primary_image', 'tags_list'
        ]

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return StretchImageSerializer(primary_image).data
        first_image = obj.images.first()
        if first_image:
            return StretchImageSerializer(first_image).data
        return None


class RoutineStretchSerializer(serializers.ModelSerializer):
    stretch = StretchListSerializer(read_only=True)
    stretch_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RoutineStretch
        fields = ['id', 'stretch', 'stretch_id', 'order', 'custom_duration', 'custom_repetitions']


class StretchRoutineSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    routine_stretches = RoutineStretchSerializer(source='routinestretch_set', many=True, read_only=True)

    class Meta:
        model = StretchRoutine
        fields = [
            'id', 'name', 'description', 'created_by', 'created_at',
            'updated_at', 'routine_stretches'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)