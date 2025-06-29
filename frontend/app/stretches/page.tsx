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
  RotateCcw, 
  Heart,
  StretchHorizontal as StretchIcon
} from 'lucide-react'
import { stretchAPI } from '@/lib/api'

export default function StretchesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBodyPart, setSelectedBodyPart] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const { data: stretchesData, isLoading } = useQuery({
    queryKey: ['stretches', searchTerm, selectedBodyPart, selectedDifficulty, showFavoritesOnly],
    queryFn: () => stretchAPI.getStretches({
      search: searchTerm || undefined,
      body_parts: selectedBodyPart || undefined,
      difficulty_level: selectedDifficulty || undefined,
      is_favorite: showFavoritesOnly || undefined,
    }),
    placeholderData: (previousData) => previousData,
  })

  const { data: bodyParts = [] } = useQuery({
    queryKey: ['body-parts'],
    queryFn: () => stretchAPI.getBodyParts(),
    select: (response) => response.data,
  })

  const stretches = stretchesData?.data?.results || stretchesData?.data || []

  const difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ]

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stretching Routines</h1>
          <p className="text-gray-600">Your collection of stretches and routines</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/stretches/routines"
            className="btn-secondary flex items-center space-x-2"
          >
            <StretchIcon className="h-4 w-4" />
            <span>View Routines</span>
          </Link>
          <Link
            href="/stretches/new"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stretch</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search stretches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Body Part Filter */}
          <select
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value)}
            className="input"
          >
            <option value="">All Body Parts</option>
            {bodyParts.map((bodyPart: any) => (
              <option key={bodyPart.id} value={bodyPart.id}>
                {bodyPart.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="input"
          >
            <option value="">All Levels</option>
            {difficultyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
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
              className="rounded border-gray-300 text-secondary-600 focus:ring-secondary-500"
            />
            <label htmlFor="favorites" className="text-sm font-medium text-gray-700">
              Favorites only
            </label>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedBodyPart('')
              setSelectedDifficulty('')
              setShowFavoritesOnly(false)
            }}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stretches Grid */}
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
      ) : stretches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stretches.map((stretch: any) => (
            <Link
              key={stretch.id}
              href={`/stretches/${stretch.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative h-48">
                {stretch.primary_image?.image ? (
                  <Image
                    src={stretch.primary_image.image}
                    alt={stretch.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gray-200 flex items-center justify-center">
                    <StretchIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {stretch.is_favorite && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                    <Heart className="h-4 w-4 text-white fill-current" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(stretch.difficulty_level)}`}>
                    {stretch.difficulty_level}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {stretch.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {stretch.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-4">
                    {stretch.duration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{stretch.duration}s</span>
                      </div>
                    )}
                    {stretch.repetitions && (
                      <div className="flex items-center">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        <span>{stretch.repetitions} reps</span>
                      </div>
                    )}
                  </div>
                </div>

                {stretch.body_parts && stretch.body_parts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {stretch.body_parts.slice(0, 3).map((bodyPart: any) => (
                      <span
                        key={bodyPart.id}
                        className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs"
                      >
                        {bodyPart.name}
                      </span>
                    ))}
                    {stretch.body_parts.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{stretch.body_parts.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <StretchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stretches found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedBodyPart || selectedDifficulty || showFavoritesOnly
              ? 'Try adjusting your filters or search terms.'
              : "Start building your stretch collection by adding your first stretch."}
          </p>
          <Link href="/stretches/new" className="btn-primary">
            Add Your First Stretch
          </Link>
        </div>
      )}
    </div>
  )
}