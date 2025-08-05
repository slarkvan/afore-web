'use client'

import { useEffect, useState } from 'react'
import { useCategoryStore, Category } from '@/stores/categoryStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory,
    toggleCategoryStatus,
    getParentCategories,
    getCategoriesByParent
  } = useCategoryStore()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteCategory(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleToggleStatus = async (id: string) => {
    await toggleCategoryStatus(id)
  }

  const renderCategoryRows = (parentCategories: Category[]) => {
    const rows: JSX.Element[] = []
    
    parentCategories.forEach(category => {
      rows.push(
        <TableRow key={category.id}>
          <TableCell className="font-medium">{category.name}</TableCell>
          <TableCell>
            <Badge variant="outline">Parent</Badge>
          </TableCell>
          <TableCell>{category.description || '-'}</TableCell>
          <TableCell>{category.sortOrder}</TableCell>
          <TableCell>
            <Badge variant={category.isActive ? 'default' : 'secondary'}>
              {category.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(category.id)}
              >
                {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingCategory(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={deleteConfirm === category.id ? 'text-red-600 bg-red-50' : ''}
                onClick={() => handleDelete(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      )

      // Add child categories
      const children = getCategoriesByParent(category.id)
      children.forEach(child => {
        rows.push(
          <TableRow key={child.id} className="bg-muted/50">
            <TableCell className="font-medium pl-8">├─ {child.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{category.name}</Badge>
            </TableCell>
            <TableCell>{child.description || '-'}</TableCell>
            <TableCell>{child.sortOrder}</TableCell>
            <TableCell>
              <Badge variant={child.isActive ? 'default' : 'secondary'}>
                {child.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(child.id)}
                >
                  {child.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCategory(child)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={deleteConfirm === child.id ? 'text-red-600 bg-red-50' : ''}
                  onClick={() => handleDelete(child.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )
      })
    })

    return rows
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories with hierarchical structure
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Create a new category or subcategory
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">{error}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Parent categories are shown first, followed by their subcategories indented below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Create your first category to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderCategoryRows(getParentCategories())}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSuccess={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}