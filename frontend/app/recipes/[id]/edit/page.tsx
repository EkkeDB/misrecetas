'use client'

import { useState, use, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { recipeAPI } from '@/lib/api'

interface RecipeForm {
  title: string
  description: string
  ingredients: string
  instructions: string
  prep_time?: number
  cook_time?: number
  servings?: number
  category_id?: number
  tags: string
  is_favorite: boolean
}

interface EditRecipePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditRecipePage(props: EditRecipePageProps) {
  const params = use(props.params);
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeForm>({
    defaultValues: {
      is_favorite: false,
    },
  })

  // Load existing recipe data
  const { data: recipe, isLoading: recipeLoading } = useQuery({
    queryKey: ['recipe', params.id],
    queryFn: () => recipeAPI.getRecipe(parseInt(params.id)),
    select: (response) => response.data,
  })

  // Load categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => recipeAPI.getCategories(),
    select: (response) => response.data,
  })

  // Reset form with recipe data when loaded
  useEffect(() => {
    if (recipe) {
      reset({
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prep_time: recipe.prep_time || undefined,
        cook_time: recipe.cook_time || undefined,
        servings: recipe.servings || undefined,
        category_id: recipe.category?.id || undefined,
        tags: recipe.tags || '',
        is_favorite: recipe.is_favorite,
      })
    }
  }, [recipe, reset])

  const updateRecipeMutation = useMutation({
    mutationFn: (data: RecipeForm) => recipeAPI.updateRecipe(parseInt(params.id), data),
    onSuccess: async (response) => {
      const recipeId = response.data.id

      // Upload images if any
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map((file, index) => {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('recipe_id', recipeId.toString())
          formData.append('is_primary', (index === 0).toString())
          return recipeAPI.uploadImage(formData)
        })

        try {
          await Promise.all(uploadPromises)
        } catch (error) {
          toast.error('Recipe updated but some images failed to upload')
        }
      }

      queryClient.invalidateQueries({ queryKey: ['recipe', params.id] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe updated successfully!')
      router.push(`/recipes/${recipeId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update recipe')
    },
  })

  const onSubmit = async (data: RecipeForm) => {
    updateRecipeMutation.mutate(data)
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

  if (recipeLoading) {
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

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Recipe not found</h3>
        <Link href="/recipes" className="text-primary-600 hover:text-primary-700">
          ← Back to recipes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href={`/recipes/${params.id}`}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Recipe
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Recipe</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                {...register('title', { required: 'Title is required' })}
                type="text"
                className="input"
                placeholder="Enter recipe title"
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
                placeholder="Brief description of the recipe"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (minutes)
              </label>
              <input
                {...register('prep_time', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Prep time must be positive' }
                })}
                type="number"
                className="input"
                placeholder="0"
                min="0"
              />
              {errors.prep_time && (
                <p className="mt-1 text-sm text-red-600">{errors.prep_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (minutes)
              </label>
              <input
                {...register('cook_time', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Cook time must be positive' }
                })}
                type="number"
                className="input"
                placeholder="0"
                min="0"
              />
              {errors.cook_time && (
                <p className="mt-1 text-sm text-red-600">{errors.cook_time.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                {...register('servings', { 
                  valueAsNumber: true,
                  min: { value: 1, message: 'Servings must be at least 1' }
                })}
                type="number"
                className="input"
                placeholder="1"
                min="1"
              />
              {errors.servings && (
                <p className="mt-1 text-sm text-red-600">{errors.servings.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category_id', { valueAsNumber: true })}
                className="input"
              >
                <option value="">Select a category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input"
                placeholder="Enter tags separated by commas (e.g., italian, pasta, vegetarian)"
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
          <h2 className="text-xl font-semibold mb-6">Ingredients</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients List *
            </label>
            <textarea
              {...register('ingredients', { required: 'Ingredients are required' })}
              rows={8}
              className="textarea"
              placeholder="Enter each ingredient on a new line&#10;Example:&#10;2 cups flour&#10;1 tsp salt&#10;3 eggs"
            />
            {errors.ingredients && (
              <p className="mt-1 text-sm text-red-600">{errors.ingredients.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter each ingredient on a new line
            </p>
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
              placeholder="Enter detailed cooking instructions..."
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
            href={`/recipes/${params.id}`}
            className="btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Recipe...' : 'Update Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}