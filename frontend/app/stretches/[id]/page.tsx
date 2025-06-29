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
  RotateCcw,
  StretchHorizontal as StretchIcon,
  Tag,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { stretchAPI } from '@/lib/api'

interface StretchPageProps {
  params: Promise<{
    id: string
  }>
}

export default function StretchPage(props: StretchPageProps) {
  const params = use(props.params);
  const router = useRouter()
  const queryClient = useQueryClient()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: stretch, isLoading } = useQuery({
    queryKey: ['stretch', params.id],
    queryFn: () => stretchAPI.getStretch(parseInt(params.id)),
    select: (response) => response.data,
  })

  const deleteStretchMutation = useMutation({
    mutationFn: stretchAPI.deleteStretch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stretches'] })
      toast.success('Stretch deleted successfully')
      router.push('/stretches')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete stretch')
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: (data: { id: number; is_favorite: boolean }) =>
      stretchAPI.updateStretch(data.id, { is_favorite: data.is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stretch', params.id] })
      queryClient.invalidateQueries({ queryKey: ['stretches'] })
      toast.success(stretch?.is_favorite ? 'Removed from favorites' : 'Added to favorites')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update favorite status')
    },
  })

  const handleDelete = () => {
    deleteStretchMutation.mutate(parseInt(params.id))
  }

  const handleToggleFavorite = () => {
    if (stretch) {
      toggleFavoriteMutation.mutate({
        id: stretch.id,
        is_favorite: !stretch.is_favorite,
      })
    }
  }

  const nextImage = () => {
    if (stretch?.images && stretch.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === stretch.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (stretch?.images && stretch.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? stretch.images.length - 1 : prev - 1
      )
    }
  }

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

  if (!stretch) {
    return (
      <div className="text-center py-12">
        <StretchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Stretch not found</h3>
        <Link href="/stretches" className="text-secondary-600 hover:text-secondary-700">
          ← Back to stretches
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/stretches"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Stretches
        </Link>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              stretch.is_favorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${stretch.is_favorite ? 'fill-current' : ''}`} />
          </button>
          
          {stretch.video_url && (
            <a
              href={stretch.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <Play className="h-5 w-5" />
            </a>
          )}
          
          <Link
            href={`/stretches/${stretch.id}/edit`}
            className="p-2 rounded-full bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors"
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

      {/* Stretch Images */}
      {stretch.images && stretch.images.length > 0 && (
        <div className="relative bg-white rounded-lg shadow overflow-hidden">
          <div className="relative h-64 md:h-96">
            <Image
              src={stretch.images[currentImageIndex].image}
              alt={stretch.title}
              fill
              className="object-cover"
            />
            
            {stretch.images.length > 1 && (
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
                  {stretch.images.map((_: any, index: number) => (
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

      {/* Stretch Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{stretch.title}</h1>
            <p className="text-gray-600">{stretch.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            {stretch.is_favorite && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Favorite
              </div>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(stretch.difficulty_level)}`}>
              {stretch.difficulty_level}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          {stretch.duration && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>Duration: {stretch.duration}s</span>
            </div>
          )}
          {stretch.repetitions && (
            <div className="flex items-center">
              <RotateCcw className="h-4 w-4 mr-1" />
              <span>Reps: {stretch.repetitions}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Added {new Date(stretch.created_at).toLocaleDateString()}</span>
          </div>
          {stretch.video_url && (
            <a
              href={stretch.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              <span>Watch Video</span>
            </a>
          )}
        </div>

        {/* Body Parts */}
        {stretch.body_parts && stretch.body_parts.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Target Areas:</h3>
            <div className="flex flex-wrap gap-2">
              {stretch.body_parts.map((bodyPart: any) => (
                <span
                  key={bodyPart.id}
                  className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {bodyPart.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {stretch.tags_list && stretch.tags_list.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stretch.tags_list.map((tag: string, index: number) => (
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

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <StretchIcon className="h-5 w-5 mr-2 text-secondary-600" />
          Instructions
        </h2>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {stretch.instructions}
          </pre>
        </div>
      </div>

      {/* Video Section */}
      {stretch.video_url && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Play className="h-5 w-5 mr-2 text-blue-600" />
            Video Demonstration
          </h2>
          <a
            href={stretch.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
            <span>Open Video in New Tab</span>
          </a>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Stretch</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{stretch.title}&quot;? This action cannot be undone.
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
                disabled={deleteStretchMutation.isPending}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteStretchMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}