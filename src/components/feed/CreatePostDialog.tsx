
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Image, Video, Link2, Type } from 'lucide-react';
import { useCreatePost } from '@/hooks/usePosts';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionProvider';
import { toast } from 'sonner';

export function CreatePostDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'link'>('text');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useSession();
  const createPost = useCreatePost();

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const uploadMedia = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('post-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const fetchLinkPreview = async (url: string) => {
    try {
      // This is a simple implementation - in production you'd want a proper link preview service
      return {
        title: 'Link Preview',
        description: 'Click to view this link',
        image: null
      };
    } catch (error) {
      console.error('Error fetching link preview:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && postType === 'text') {
      toast.error('Please enter some content');
      return;
    }

    if (postType === 'link' && !linkUrl.trim()) {
      toast.error('Please enter a link URL');
      return;
    }

    if ((postType === 'image' || postType === 'video') && !mediaFile) {
      toast.error(`Please select a ${postType} file`);
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrl = null;
      let linkPreview = null;

      if (mediaFile && (postType === 'image' || postType === 'video')) {
        mediaUrl = await uploadMedia(mediaFile);
      }

      if (postType === 'link' && linkUrl) {
        linkPreview = await fetchLinkPreview(linkUrl);
      }

      const hashtags = extractHashtags(content);

      await createPost.mutateAsync({
        content: content.trim() || null,
        post_type: postType,
        media_url: mediaUrl,
        media_type: mediaFile?.type || null,
        link_url: postType === 'link' ? linkUrl : null,
        link_title: linkPreview?.title || null,
        link_description: linkPreview?.description || null,
        link_image: linkPreview?.image || null,
        hashtags: hashtags.length > 0 ? hashtags : null,
      });

      // Reset form
      setContent('');
      setLinkUrl('');
      setMediaFile(null);
      setPostType('text');
      setOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <Tabs value={postType} onValueChange={(value) => setPostType(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text">
              <Type className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="image">
              <Image className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="link">
              <Link2 className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="What's on your mind? Use #hashtags to categorize your post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            <TabsContent value="image" className="mt-0">
              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              <div>
                <Label htmlFor="video">Video</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-0">
              <div>
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || createPost.isPending}
          >
            {isUploading || createPost.isPending ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
