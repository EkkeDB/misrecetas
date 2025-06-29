'use client'

import { useState, use, useEffect } from 'react'
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

interface EditStretchPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditStretchPage(props: EditStretchPageProps) {
  const params = use(props.params);
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StretchForm>({
    defaultValues: {
      difficulty_level: 'beginner',
      is_favorite: false,
      body_part_ids: [],
    },
  })

  const selectedBodyParts = watch('body_part_ids')

  // Load existing stretch data
  const { data: stretch, isLoading: stretchLoading } = useQuery({
    queryKey: ['stretch', params.id],
    queryFn: () => stretchAPI.getStretch(parseInt(params.id)),
    select: (response) => response.data,
  })

  // Load body parts
  const { data: bodyParts = [] } = useQuery({
    queryKey: ['body-parts'],
    queryFn: () => stretchAPI.getBodyParts(),
    select: (response) => response.data,
  })

  // Reset form with stretch data when loaded
  useEffect(() => {
    if (stretch) {
      reset({
        title: stretch.title,
        description: stretch.description,
        instructions: stretch.instructions,
        duration: stretch.duration || undefined,
        repetitions: stretch.repetitions || undefined,
        body_part_ids: stretch.body_parts?.map((bp: any) => bp.id) || [],
        difficulty_level: stretch.difficulty_level || 'beginner',
        video_url: stretch.video_url || '',
        tags: stretch.tags || '',
        is_favorite: stretch.is_favorite,
      })
    }
  }, [stretch, reset])

  const updateStretchMutation = useMutation({
    mutationFn: (data: StretchForm) => stretchAPI.updateStretch(parseInt(params.id), data),
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
          toast.error('Stretch updated but some images failed to upload')
        }
      }

      queryClient.invalidateQueries({ queryKey: ['stretch', params.id] })
      queryClient.invalidateQueries({ queryKey: ['stretches'] })
      toast.success('Stretch updated successfully!')
      router.push(`/stretches/${stretchId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update stretch')
    },
  })

  const onSubmit = async (data: StretchForm) => {
    updateStretchMutation.mutate(data)
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
    const updated = current.includes(bodyPartId)
      ? current.filter(id => id !== bodyPartId)
      : [...current, bodyPartId]
    setValue('body_part_ids', updated)
  }

  if (stretchLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  if (!stretch) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Stretch not found</h3>
        <Link href="/stretches" className="text-primary-600 hover:text-primary-700">
          ← Back to stretches
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/stretches/${params.id}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Stretch
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Stretch</h1>
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
                  min: { value: 1, message: 'Duration must be positive' }
                })}
                type="number"
                className="input"
                placeholder="30"
                min="1"
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
                  min: { value: 1, message: 'Repetitions must be positive' }
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
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                {...register('video_url')}
                type="url"
                className="input"
                placeholder="https://youtube.com/watch?v=..."
              />
              {watch('video_url') && (
                <div className="mt-2">
                  <a
                    href={watch('video_url')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Preview video
                  </a>
                </div>
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
                placeholder="Enter tags separated by commas (e.g., flexibility, yoga, morning)"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  {...register('is_favorite')}
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Mark as favorite
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Body Parts</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bodyParts.map((bodyPart: any) => (
              <div key={bodyPart.id}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(selectedBodyParts || []).includes(bodyPart.id)}
                    onChange={() => handleBodyPartToggle(bodyPart.id)}
                    className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{bodyPart.name}</span>
                </label>
              </div>
            ))}
          </div>
          {bodyParts.length === 0 && (
            <p className="text-gray-500 text-sm">
              No body parts available. 
              <Link href="/stretches/body-parts" className="text-primary-600 hover:text-primary-700 ml-1">
                Create one first
              </Link>
            </p>
          )}
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
              placeholder="Enter detailed stretch instructions..."
            />
            {errors.instructions && (
              <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Add New Photos</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Additional Photos
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
                      <div className="absolute bottom-1 left-1 bg-primary-500 text-white px-2 py-1 rounded text-xs">
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
            href={`/stretches/${params.id}`}
            className="btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Stretch...' : 'Update Stretch'}
          </button>
        </div>
      </form>
    </div>
  )
}