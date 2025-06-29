from django.db import models
from django.contrib.auth.models import User


class BodyPart(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Stretch(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructions = models.TextField(help_text="Step-by-step instructions")
    duration = models.PositiveIntegerField(help_text="Duration in seconds", null=True, blank=True)
    repetitions = models.PositiveIntegerField(null=True, blank=True)
    body_parts = models.ManyToManyField(BodyPart, related_name='stretches')
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    video_url = models.URLField(blank=True, help_text="YouTube or other video URL")
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_favorite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def get_tags_list(self):
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]


class StretchImage(models.Model):
    stretch = models.ForeignKey(Stretch, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='stretch_images/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']

    def __str__(self):
        return f"{self.stretch.title} - Image {self.id}"


class StretchRoutine(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    stretches = models.ManyToManyField(Stretch, through='RoutineStretch')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class RoutineStretch(models.Model):
    routine = models.ForeignKey(StretchRoutine, on_delete=models.CASCADE)
    stretch = models.ForeignKey(Stretch, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    custom_duration = models.PositiveIntegerField(null=True, blank=True, help_text="Override default duration")
    custom_repetitions = models.PositiveIntegerField(null=True, blank=True, help_text="Override default repetitions")

    class Meta:
        ordering = ['order']
        unique_together = ['routine', 'stretch']