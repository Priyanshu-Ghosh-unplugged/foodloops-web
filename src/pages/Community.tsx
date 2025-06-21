import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';

// Mock data and functions
const mockPosts = [
  {
    id: 1,
    content: 'Welcome to the FoodLoops community! Share your tips on reducing food waste.',
    author_id: 'system',
    created_at: new Date().toISOString(),
    likes: 5,
    user: { name: 'FoodLoops Bot' },
    comments: [
      { id: 1, content: 'Great to be here!', author_id: 'user1', created_at: new Date().toISOString(), user: { name: 'Eco Warrior' } }
    ]
  }
];

const getMockPosts = async () => {
  return Promise.resolve({ data: mockPosts, error: null });
};

const createMockPost = async (content, author_id) => {
  const newPost = {
    id: Math.random(),
    content,
    author_id,
    created_at: new Date().toISOString(),
    likes: 0,
    user: { name: 'You' }, // Placeholder user
    comments: []
  };
  mockPosts.unshift(newPost);
  return Promise.resolve({ data: [newPost], error: null });
};

const Community = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Using mock function
    const { data, error } = await getMockPosts();
    if (error) {
      toast.error('Failed to fetch posts');
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Post cannot be empty');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }

    setLoading(true);
    // Using mock function
    const { error } = await createMockPost(newPostContent, user.sub);
    if (error) {
      toast.error('Failed to create post');
      console.error('Error creating post:', error);
    } else {
      setNewPostContent('');
      await fetchPosts(); // Refresh posts
    }
    setLoading(false);
  };

  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error('You must be logged in to like a post');
      return;
    }
    // This is a placeholder and will not persist
    toast.info('Liking posts is temporarily disabled.');
  };

  const handleAddComment = async (postId, commentContent) => {
    if (!commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }
    // This is a placeholder and will not persist
    toast.info('Commenting is temporarily disabled.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community Hub</h1>

      {/* Create Post */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Share something with the community</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              disabled={!user || loading}
            />
            <Button onClick={handleCreatePost} disabled={!user || loading} className="self-end">
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={handleLikePost} 
            onAddComment={handleAddComment}
            currentUser={user}
          />
        ))}
        {loading && <p>Loading posts...</p>}
      </div>
    </div>
  );
};

// PostCard component
const PostCard = ({ post, onLike, onAddComment, currentUser }) => {
  const [comment, setComment] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    onAddComment(post.id, comment);
    setComment('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="font-semibold">{post.user?.name || 'Anonymous'}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => onLike(post.id)} disabled={!currentUser}>
            <ThumbsUp className="w-4 h-4 mr-2" />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" disabled={!currentUser}>
            <MessageSquare className="w-4 h-4 mr-2" />
            {post.comments?.length || 0}
          </Button>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          {post.comments?.map((c) => (
            <div key={c.id} className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
              <span className="font-semibold">{c.user?.name || 'Anonymous'}: </span>
              {c.content}
            </div>
          ))}
        </div>

        {/* Add Comment */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-4">
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default Community;
