import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardLayout from '@/components/Layout/DashboardLayout';

// Mock data and functions
const mockPosts = [
  {
    id: 1,
    user: { name: 'Alice', avatarUrl: '/placeholder.svg' },
    timestamp: '2 hours ago',
    content: 'Just saved a bunch of vegetables from going to waste! Made a delicious soup. #foodwastehero',
    likes: 15,
    liked: false,
    comments: [
      { id: 1, user: { name: 'Bob', avatarUrl: '/placeholder.svg' }, content: 'That sounds amazing! Recipe?' },
      { id: 2, user: { name: 'Charlie', avatarUrl: '/placeholder.svg' }, content: 'Inspiring!' },
    ],
  },
  // Add more mock posts if needed
];

const CommunityPage = () => {
    const [posts, setPosts] = useState(mockPosts);
    const [newPostContent, setNewPostContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [newComment, setNewComment] = useState('');

    const handleLike = (postId: number) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
    };

    const handlePostSubmit = () => {
        if (!newPostContent.trim()) return;
        const newPost = {
            id: Date.now(),
            user: { name: 'You', avatarUrl: '/placeholder.svg' },
            timestamp: 'Just now',
            content: newPostContent,
            likes: 0,
            liked: false,
            comments: [],
        };
        setPosts([newPost, ...posts]);
        setNewPostContent('');
    };

    const handleCommentSubmit = (postId: number) => {
        if (!newComment.trim()) return;
        const newCommentObj = {
            id: Date.now(),
            user: { name: 'You', avatarUrl: '/placeholder.svg' },
            content: newComment,
        };
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newCommentObj] } : p));
        setNewComment('');
        setReplyingTo(null);
    };
    
    const sortedPosts = useMemo(() => {
        return [...posts].sort((a, b) => b.id - a.id);
      }, [posts]);


  return (
    <DashboardLayout
      title="Community Hub"
      description="Connect with fellow FoodLoopers, share tips, and see what's happening."
    >
        <div className="space-y-6">
            {/* Post Input */}
            <Card>
                <CardHeader>
                    <CardTitle>Share an Update</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Textarea
                        placeholder="What's on your mind? Share a recipe, a food-saving tip, or a great find!"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                    />
                    <Button onClick={handlePostSubmit} className="self-end">
                        Post
                    </Button>
                </CardContent>
            </Card>

            {/* Feed */}
            <div className="space-y-4">
                {sortedPosts.map((post) => (
                    <Card key={post.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar>
                                <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
                                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{post.user.name}</p>
                                <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                            <div className="mt-4 flex items-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => handleLike(post.id)}
                                >
                                    <ThumbsUp
                                        className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`}
                                    />
                                    {post.likes}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() =>
                                        setReplyingTo(replyingTo === post.id ? null : post.id)
                                    }
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    {post.comments.length}
                                </Button>
                            </div>
                            {replyingTo === post.id && (
                                <div className="mt-4 flex flex-col gap-2">
                                    <Textarea
                                        placeholder={`Reply to ${post.user.name}...`}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={2}
                                    />
                                    <Button
                                        onClick={() => handleCommentSubmit(post.id)}
                                        className="self-end"
                                        size="sm"
                                    >
                                        Reply
                                    </Button>
                                </div>
                            )}
                            <div className="mt-4 space-y-2">
                                {post.comments.map((comment) => (
                                    <div key={comment.id} className="flex items-start gap-2 text-sm">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={comment.user.avatarUrl}
                                                alt={comment.user.name}
                                            />
                                            <AvatarFallback>
                                                {comment.user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 rounded-md bg-muted p-2">
                                            <p className="font-semibold">{comment.user.name}</p>
                                            <p>{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
