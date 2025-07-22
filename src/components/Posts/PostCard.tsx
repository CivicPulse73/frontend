import { useEffect, useState } from 'react';
import { roleService } from '../../services/roleService';
import { RoleTag } from './RoleTag';

interface PostCardProps {
  post: any; // Define your post type
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onVote, onSave, onShare }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    // Load roles if they're used in the post
    const loadRoles = async () => {
      if (post.tags && post.tags.length > 0) {
        await roleService.ensureRolesLoaded();
        const postRoles = post.tags
          .map(tag => roleService.getRoleByAbbreviation(tag) || roleService.getRoleByName(tag))
          .filter(Boolean) as Role[];
        setRoles(postRoles.sort((a, b) => a.h_order - b.h_order));
      }
    };
    loadRoles();
  }, [post.tags]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* ...existing code... */}
      
      {/* Role Tags */}
      {roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {roles.map((role) => (
            <RoleTag key={role.id} role={role} />
          ))}
        </div>
      )}
      
      {/* ...existing code... */}
    </div>
  );
};