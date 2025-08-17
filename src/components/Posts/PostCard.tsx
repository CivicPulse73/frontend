import { useState } from 'react';

interface PostCardProps {
  post: any; // Define your post type
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote, onSave, onShare }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Post content - role system removed */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">{post.title}</h3>
        <p className="text-gray-700">{post.content}</p>
      </div>
    </div>
  );
};