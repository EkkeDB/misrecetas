'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ChefHat, StretchHorizontal as Stretch, Heart, Clock } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Tailwind Test */}
      <div className="bg-red-500 text-white p-4 text-center">
        Tailwind is working!
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <ChefHat className="h-16 w-16 text-primary-600" />
              <Heart className="h-12 w-12 text-red-500" />
              <Stretch className="h-16 w-16 text-secondary-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Family Recipes & 
            <span className="text-primary-600"> Stretches</span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your personal collection of grandma&apos;s recipes and stretching routines. 
            Keep family traditions alive and stay healthy, all in one place.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <ChefHat className="h-12 w-12 text-primary-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4">Family Recipes</h3>
              <p className="text-gray-600 mb-4">
                Store and organize your precious family recipes with photos, 
                ingredients, and step-by-step instructions.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Photo galleries for each recipe</li>
                <li>• Shopping list generation</li>
                <li>• Categories and tags</li>
                <li>• Mobile-friendly interface</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <Stretch className="h-12 w-12 text-secondary-600 mb-4 mx-auto" />
              <h3 className="text-2xl font-semibold mb-4">Stretching Routines</h3>
              <p className="text-gray-600 mb-4">
                Never forget your stretches again. Organize by body part 
                and create custom routines.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Organize by body parts</li>
                <li>• Video link support</li>
                <li>• Custom routines</li>
                <li>• Duration and rep tracking</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </button>
            <button
              onClick={() => router.push('/register')}
              className="btn-outline text-lg px-8 py-3"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}