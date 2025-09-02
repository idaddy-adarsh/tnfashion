'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Banner } from '@/types'
import { Pencil, Trash2, Plus, Eye, EyeOff, MoveUp, MoveDown, Upload, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AdminBanners() {
  const { data: session, status } = useSession()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    link: '',
    buttonText: 'Shop Now',
    displayOrder: 0,
    isActive: true
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !session.user.isAdmin) {
      redirect('/auth/signin')
      return
    }

    fetchBanners()
  }, [session, status])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners')
      const data = await response.json()
      
      if (data.success) {
        setBanners(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that we have an image (either uploaded file or existing image for edit)
    if (!selectedFile && !formData.image) {
      alert('Please select an image for the banner')
      return
    }
    
    setUploading(true)
    
    try {
      let imageUrl = formData.image
      
      // Upload new image if a file is selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }
      
      // Prepare banner data
      const bannerData = {
        ...formData,
        image: imageUrl
      }
      
      const url = editingBanner 
        ? `/api/admin/banners/${editingBanner._id}`
        : '/api/admin/banners'
      
      const method = editingBanner ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchBanners()
        resetForm()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchBanners()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      const response = await fetch(`/api/admin/banners/${banner._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...banner,
          isActive: !banner.isActive
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        fetchBanners()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      buttonText: banner.buttonText || 'Shop Now',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive
    })
    // Clear upload states when editing
    setSelectedFile(null)
    setImagePreview('')
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      link: '',
      buttonText: 'Shop Now',
      displayOrder: 0,
      isActive: true
    })
    setSelectedFile(null)
    setImagePreview('')
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setEditingBanner(null)
    setShowAddForm(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const event = { target: { files: [file] } } as any
      handleFileSelect(event)
    }
  }

  const removeSelectedImage = () => {
    setSelectedFile(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/admin/upload/banner', {
      method: 'POST',
      body: formData,
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed')
    }
    
    return data.imageUrl
  }

  const updateDisplayOrder = async (bannerId: string, newOrder: number) => {
    const banner = banners.find(b => b._id === bannerId)
    if (!banner) return

    try {
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...banner,
          displayOrder: newOrder
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        fetchBanners()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || !session.user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
              <p className="text-gray-600 mt-1">Manage homepage slideshow banners</p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image *
                </label>
                
                {/* Upload Area */}
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-md mx-auto">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : formData.image ? (
                    <div className="space-y-4">
                      <div className="relative w-full max-w-md mx-auto">
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={formData.image}
                            alt="Current banner"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Current banner image</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mx-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-gray-600 mb-2">Drag and drop an image here, or click to select</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                      </p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>

                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {selectedFile ? 'Uploading...' : (editingBanner ? 'Updating...' : 'Creating...')}
                      </>
                    ) : (
                      <>{editingBanner ? 'Update' : 'Create'} Banner</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Banners ({banners.length})</h2>
          </div>

          {banners.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No banners found. Create your first banner to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {banners.map((banner) => (
                <div key={banner._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Banner Image */}
                    <div className="w-24 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          Order: {banner.displayOrder}
                        </span>
                        {banner.isActive ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-600 mb-1">{banner.subtitle}</p>
                      )}
                      {banner.description && (
                        <p className="text-sm text-gray-500 truncate">{banner.description}</p>
                      )}
                      {banner.link && (
                        <a 
                          href={banner.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {banner.link}
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDisplayOrder(banner._id, banner.displayOrder - 1)}
                        disabled={banner.displayOrder === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateDisplayOrder(banner._id, banner.displayOrder + 1)}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(banner)}
                      >
                        {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
