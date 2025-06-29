'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { 
  ChefHat, 
  StretchHorizontal as Stretch, 
  Plus, 
  Clock, 
  Heart,
  TrendingUp 
} from 'lucide-react'
import { recipeAPI, stretchAPI } from '@/lib/api'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: recipes = [] } = useQuery({
    queryKey: ['recent-recipes'],
    queryFn: () => recipeAPI.getRecipes({ ordering: '-created_at', limit: 5 }),
    select: (response) => response.data.results || response.data,
  })

  const { data: stretches = [] } = useQuery({
    queryKey: ['recent-stretches'],
    queryFn: () => stretchAPI.getStretches({ ordering: '-created_at', limit: 5 }),
    select: (response) => response.data.results || response.data,
  })

  const { data: favoriteRecipes = [] } = useQuery({
    queryKey: ['favorite-recipes'],
    queryFn: () => recipeAPI.getRecipes({ is_favorite: true, limit: 3 }),
    select: (response) => response.data.results || response.data,
  })

  const { data: favoriteStretches = [] } = useQuery({
    queryKey: ['favorite-stretches'],
    queryFn: () => stretchAPI.getStretches({ is_favorite: true, limit: 3 }),
    select: (response) => response.data.results || response.data,
  })

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-primary-100">
          Ready to cook something delicious or stretch it out?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ChefHat className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Stretch className="h-8 w-8 text-secondary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Stretches</p>
              <p className="text-2xl font-bold text-gray-900">{stretches.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {favoriteRecipes.length + favoriteStretches.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipes.filter((r: any) => 
                  new Date(r.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-primary-600" />
            Recipes
          </h2>
          <div className="space-y-4">
            <Link
              href="/recipes/new"
              className="flex items-center justify-between p-4 border-2 border-dashed border-primary-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium text-primary-700">Add New Recipe</span>
              </div>
            </Link>
            <Link
              href="/recipes"
              className="block w-full btn-primary"
            >
              View All Recipes
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Stretch className="h-5 w-5 mr-2 text-secondary-600" />
            Stretches
          </h2>
          <div className="space-y-4">
            <Link
              href="/stretches/new"
              className="flex items-center justify-between p-4 border-2 border-dashed border-secondary-200 rounded-lg hover:border-secondary-400 hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center">
                <Plus className="h-5 w-5 text-secondary-600 mr-3" />
                <span className="font-medium text-secondary-700">Add New Stretch</span>
              </div>
            </Link>
            <Link
              href="/stretches"
              className="block w-full btn-secondary"
            >
              View All Stretches
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Recipes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Recent Recipes
            </h2>
          </div>
          <div className="p-6">
            {recipes.length > 0 ? (
              <div className="space-y-4">
                {recipes.slice(0, 3).map((recipe: any) => (
                  <Link
                    key={recipe.id}
                    href={`/recipes/${recipe.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      {recipe.primary_image?.image && (
                        <img
                          src={recipe.primary_image.image}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                        <p className="text-sm text-gray-500">
                          {recipe.category?.name} • {recipe.prep_time}min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/recipes"
                  className="block text-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all recipes →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recipes yet</p>
                <Link
                  href="/recipes/new"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create your first recipe
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Stretches */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              Recent Stretches
            </h2>
          </div>
          <div className="p-6">
            {stretches.length > 0 ? (
              <div className="space-y-4">
                {stretches.slice(0, 3).map((stretch: any) => (
                  <Link
                    key={stretch.id}
                    href={`/stretches/${stretch.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      {stretch.primary_image?.image && (
                        <img
                          src={stretch.primary_image.image}
                          alt={stretch.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{stretch.title}</h3>
                        <p className="text-sm text-gray-500">
                          {stretch.body_parts?.map((bp: any) => bp.name).join(', ')} • {stretch.duration}s
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/stretches"
                  className="block text-center text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  View all stretches →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Stretch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No stretches yet</p>
                <Link
                  href="/stretches/new"
                  className="text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  Create your first stretch
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}