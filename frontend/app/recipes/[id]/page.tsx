'use client'

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  Clock,
  Users,
  ChefHat,
  Tag,
  Calendar,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { recipeAPI } from '@/lib/api'

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

export default function RecipePage(props: RecipePageProps) {
  const params = use(props.params);
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', params.id],
    queryFn: () => recipeAPI.getRecipe(parseInt(params.id)),
    select: (response) => response.data,
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: recipeAPI.deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Recipe deleted successfully')
      router.push('/recipes')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete recipe')
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (data: { id: number; is_favorite: boolean }) =>
      recipeAPI.updateRecipe(data.id, { is_favorite: data.is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', params.id] })
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success(recipe?.is_favorite ? 'Removed from favorites' : 'Added to favorites')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update favorite status')
    },
  })

  const handleDelete = () => {
    deleteRecipeMutation.mutate(parseInt(params.id))
  }

  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavoriteMutation.mutate({
        id: recipe.id,
        is_favorite: !recipe.is_favorite,
      })
    }
  }

  const generateShoppingList = () => {
    if (recipe) {
      const ingredients = recipe.ingredients_list || []
      const shoppingList = ingredients.join('\n')
      
      // Create a downloadable text file
      const blob = new Blob([shoppingList], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recipe.title}-shopping-list.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Shopping list downloaded!')
    }
  }

  const nextImage = () => {
    if (recipe?.images && recipe.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === recipe.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (recipe?.images && recipe.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? recipe.images.length - 1 : prev - 1
      )
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
      <div className="flex items-center justify-between">
        <Link
          href="/recipes"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Recipes
        </Link>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              recipe.is_favorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${recipe.is_favorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={generateShoppingList}
            className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="p-2 rounded-full bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </Link>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recipe Images */}
      {recipe.images && recipe.images.length > 0 && (
        <div className="relative bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-64 md:h-96">
            <Image
              src={recipe.images[currentImageIndex].image}
              alt={recipe.title}
              fill
              className="object-cover"
            />
            
            {recipe.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {recipe.images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
          {recipe.is_favorite && (
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Favorite
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {recipe.prep_time && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Prep: {recipe.prep_time}min</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Cook: {recipe.cook_time}min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>Serves {recipe.servings}</span>
            </div>
          )}
          {recipe.category && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              <span>{recipe.category.name}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added {new Date(recipe.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {recipe.tags_list && recipe.tags_list.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recipe.tags_list.map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-secondary-600" />
            Ingredients
          </h2>
          <ul className="space-y-2">
            {recipe.ingredients_list?.map((ingredient: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-secondary-600 mr-2">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={generateShoppingList}
            className="mt-4 btn-secondary text-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Download Shopping List
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-primary-600" />
            Instructions
          </h2>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
              {recipe.instructions}
            </pre>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Recipe</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{recipe.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteRecipeMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}