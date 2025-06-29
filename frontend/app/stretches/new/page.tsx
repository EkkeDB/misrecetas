'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, X, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { stretchAPI } from '@/lib/api'

interface StretchForm {
  title: string
  description: string
  instructions: string
  duration?: number
  repetitions?: number
  body_part_ids: number[]
  difficulty_level: string
  video_url: string
  tags: string
  is_favorite: boolean
}

export default function NewStretchPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StretchForm>({
    defaultValues: {
      difficulty_level: 'beginner',
      is_favorite: false,
      body_part_ids: [],
    },
  })

  const selectedBodyParts = watch('body_part_ids')

  const { data: bodyParts = [] } = useQuery({
    queryKey: ['body-parts'],
    queryFn: () => stretchAPI.getBodyParts(),
    select: (response) => response.data,
  })

  const createStretchMutation = useMutation({
    mutationFn: stretchAPI.createStretch,
    onSuccess: async (response) => {
      const stretchId = response.data.id

      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file, index) => {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('stretch_id', stretchId.toString())
          formData.append('is_primary', (index === 0).toString())
          return stretchAPI.uploadImage(formData)
        })

        try {
          await Promise.all(uploadPromises)
        } catch (error) {
          toast.error('Stretch created but some images failed to upload')
        }
      }

      queryClient.invalidateQueries({ queryKey: ['stretches'] })
      toast.success('Stretch created successfully!')
      router.push(`/stretches/${stretchId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create stretch')
    },
  })

  const onSubmit = async (data: StretchForm) => {
    createStretchMutation.mutate(data)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages(prev => [...prev, ...files])

    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreview(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreview[index])
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleBodyPartToggle = (bodyPartId: number) => {
    const current = selectedBodyParts || []
    if (current.includes(bodyPartId)) {
      setValue('body_part_ids', current.filter(id => id !== bodyPartId))
    } else {
      setValue('body_part_ids', [...current, bodyPartId])
    }
  }

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/stretches"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Stretches
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Stretch</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stretch Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input"
                placeholder="Enter stretch title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className="textarea"
                placeholder="Brief description of the stretch"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <input
                {...register('duration', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Duration must be positive' }
                })}
                type="number"
                className="input"
                placeholder="30"
                min="0"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repetitions
              </label>
              <input
                {...register('repetitions', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Repetitions must be at least 1' }
                })}
                type="number"
                className="input"
                placeholder="3"
                min="1"
              />
              {errors.repetitions && (
                <p className="mt-1 text-sm text-red-600">{errors.repetitions.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                {...register('difficulty_level')}
                className="input"
              >
                {difficultyLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <div className="relative">
                <input
                  {...register('video_url')}
                  type="url"
                  className="input pr-10"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Parts *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {bodyParts.map((bodyPart: any) => (
                  <button
                    key={bodyPart.id}
                    type="button"
                    onClick={() => handleBodyPartToggle(bodyPart.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedBodyParts?.includes(bodyPart.id)
                        ? 'bg-secondary-100 border-secondary-500 text-secondary-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {bodyPart.name}
                  </button>
                ))}
              </div>
              {!selectedBodyParts?.length && (
                <p className="mt-1 text-sm text-red-600">Please select at least one body part</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input"
                placeholder="Enter tags separated by commas (e.g., morning, flexibility, core)"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('is_favorite')}
                  type="checkbox"
                  className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Mark as favorite
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Instructions</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step-by-Step Instructions *
            </label>
            <textarea
              {...register('instructions', { required: 'Instructions are required' })}
              rows={10}
              className="textarea"
              placeholder="Enter detailed instructions for performing this stretch..."
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Photos</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 bg-secondary-500 text-white px-2 py-1 rounded text-xs">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/stretches"
            className="btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !selectedBodyParts?.length}
            className="btn-secondary disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Stretch...' : 'Create Stretch'}
          </button>
        </div>
      </form>
    </div>
  )
}