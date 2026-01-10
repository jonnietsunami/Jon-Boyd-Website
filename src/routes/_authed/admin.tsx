import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { LogOut, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { logout } from '../../server/functions/auth'
import { getSiteContent, updateSiteContent } from '../../server/functions/content'
import {
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../server/functions/social'
import {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../../server/functions/videos'
import {
  getSubscribers,
  exportSubscribersCSV,
  deleteSubscriber,
} from '../../server/functions/subscribers'

export const Route = createFileRoute('/_authed/admin')({
  loader: async () => {
    const [content, socialLinks, videos, subscribers] = await Promise.all([
      getSiteContent(),
      getAllSocialLinks(),
      getAllVideos(),
      getSubscribers(),
    ])
    return { content, socialLinks, videos, subscribers }
  },
  component: AdminPage,
})

function AdminPage() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="bio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bio">Bio</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="bio">
            <BioEditor content={data.content} />
          </TabsContent>

          <TabsContent value="social">
            <SocialLinksManager links={data.socialLinks} />
          </TabsContent>

          <TabsContent value="videos">
            <VideoManager videos={data.videos} />
          </TabsContent>

          <TabsContent value="subscribers">
            <SubscriberList subscribers={data.subscribers} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

// Bio Editor Component
function BioEditor({ content }: { content: typeof Route.types.loaderData.content }) {
  const [bioText, setBioText] = useState(content?.bio_text || '')
  const [heroTitle, setHeroTitle] = useState(content?.hero_title || '')
  const [heroSubtitle, setHeroSubtitle] = useState(content?.hero_subtitle || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSiteContent({
        data: { bio_text: bioText, hero_title: heroTitle, hero_subtitle: heroSubtitle },
      })
      toast.success('Saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero Title</label>
          <Input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="Jon Boyd"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Hero Subtitle</label>
          <Input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Comedian"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio Text</label>
          <Textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Write your bio here..."
            rows={10}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}

// Social Links Manager Component
function SocialLinksManager({
  links: initialLinks,
}: {
  links: typeof Route.types.loaderData.socialLinks
}) {
  const [links, setLinks] = useState(initialLinks)
  const [newPlatform, setNewPlatform] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAdd = async () => {
    if (!newPlatform || !newUrl) return
    setIsAdding(true)
    try {
      await createSocialLink({
        data: { platform: newPlatform, url: newUrl, display_order: links.length },
      })
      toast.success('Added')
      setNewPlatform('')
      setNewUrl('')
      setDialogOpen(false)
      // Refresh would be better, but for now just show success
      window.location.reload()
    } catch {
      toast.error('Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSocialLink({ data: { id } })
      setLinks(links.filter((l) => l.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateSocialLink({ data: { id, is_active: !isActive } })
      setLinks(links.map((l) => (l.id === id ? { ...l, is_active: !isActive } : l)))
      toast.success('Updated')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Links</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Input
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  placeholder="instagram, youtube, twitter, etc."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL</label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAdd} disabled={isAdding} className="w-full">
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Active</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.platform}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-xs">
                  {link.url}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(link.id, link.is_active)}
                  >
                    {link.is_active ? 'Yes' : 'No'}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Video Manager Component
function VideoManager({
  videos: initialVideos,
}: {
  videos: typeof Route.types.loaderData.videos
}) {
  const [videos, setVideos] = useState(initialVideos)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAdd = async () => {
    if (!newTitle || !newUrl) return
    setIsAdding(true)
    try {
      await createVideo({
        data: {
          title: newTitle,
          youtube_url: newUrl,
          description: newDescription,
          display_order: videos.length,
        },
      })
      toast.success('Added')
      setNewTitle('')
      setNewUrl('')
      setNewDescription('')
      setDialogOpen(false)
      window.location.reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo({ data: { id } })
      setVideos(videos.filter((v) => v.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await updateVideo({ data: { id, is_active: !isActive } })
      setVideos(videos.map((v) => (v.id === id ? { ...v, is_active: !isActive } : v)))
      toast.success('Updated')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Videos</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Video title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">YouTube URL</label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Video description"
                  rows={3}
                />
              </div>
              <Button onClick={handleAdd} disabled={isAdding} className="w-full">
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <img
                src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`}
                alt={video.title}
                className="w-24 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{video.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {video.description || 'No description'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggle(video.id, video.is_active)}
              >
                {video.is_active ? 'Active' : 'Hidden'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(video.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Subscriber List Component
function SubscriberList({
  subscribers: initialSubscribers,
}: {
  subscribers: typeof Route.types.loaderData.subscribers
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)

  const handleExport = async () => {
    try {
      const csv = await exportSubscribersCSV()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported')
    } catch {
      toast.error('Failed to export')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber({ data: { id } })
      setSubscribers(subscribers.filter((s) => s.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Email Subscribers ({subscribers.length})</CardTitle>
        <Button size="sm" onClick={handleExport}>
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {sub.first_name || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(sub.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
