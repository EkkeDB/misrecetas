'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Heart,
  ChefHat
} from 'lucide-react'
import { recipeAPI } from '@/lib/api'

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', searchTerm, selectedCategory, showFavoritesOnly],
    queryFn: () => recipeAPI.getRecipes({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      is_favorite: showFavoritesOnly || undefined,
    }),
    placeholderData: (previousData) => previousData,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => recipeAPI.getCategories(),
    select: (response) => response.data,
  })

  const recipes = recipesData?.data?.results || recipesData?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Recipes</h1>
          <p className="text-gray-600">Your collection of precious family recipes</p>
        </div>
        <Link
          href="/recipes/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Recipe</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Favorites Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorites"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="favorites" className="text-sm font-medium text-gray-700">
              Favorites only
            </label>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('')
              setShowFavoritesOnly(false)
            }}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative h-48">
                {recipe.primary_image?.image ? (
                  <Image
                    src={recipe.primary_image.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <ChefHat className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {recipe.is_favorite && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <Heart className="h-4 w-4 text-white fill-current" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {recipe.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {recipe.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {recipe.prep_time && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{recipe.prep_time}min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                  </div>
                  {recipe.category && (
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                      {recipe.category.name}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || showFavoritesOnly
              ? 'Try adjusting your filters or search terms.'
              : "Start building your recipe collection by adding your first recipe."}
          </p>
          <Link href="/recipes/new" className="btn-primary">
            Add Your First Recipe
          </Link>
        </div>
      )}
    </div>
  )
}