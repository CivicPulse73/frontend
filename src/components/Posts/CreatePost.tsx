import { useEffect, useState } from 'react';
import { roleService, Role } from '../../services/roleService';
import { RoleTag } from './RoleTag';

interface CreatePostProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onSuccess }) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  useEffect(() => {
    const loadRoles = async () => {
      await roleService.ensureRolesLoaded();
      setAvailableRoles(roleService.getRoles());
    };
    loadRoles();
  }, []);

  const filteredRoles = availableRoles.filter(role => 
    role.role_name.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.abbreviation.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(roleSearchQuery.toLowerCase())
  );

  const handleRoleSelect = (role: Role) => {
    if (!selectedRoles.find(r => r.id === role.id)) {
      setSelectedRoles([...selectedRoles, role].sort((a, b) => a.h_order - b.h_order));
    }
  };

  const handleRoleRemove = (roleId: string) => {
    setSelectedRoles(selectedRoles.filter(r => r.id !== roleId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...existing code...
    
    const postData = {
      // ...existing code...
      tags: selectedRoles.map(role => role.abbreviation),
    };
    
    // ...existing code...
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* ...existing code... */}
        
        {/* Role Tags Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag Roles (Optional)
          </label>
          
          {/* Selected Roles */}
          {selectedRoles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedRoles.map((role) => (
                <div key={role.id} className="relative">
                  <RoleTag role={role} showTooltip={false} />
                  <button
                    type="button"
                    onClick={() => handleRoleRemove(role.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Role Search */}
          <input
            type="text"
            placeholder="Search roles..."
            value={roleSearchQuery}
            onChange={(e) => setRoleSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Available Roles */}
          {roleSearchQuery && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  disabled={selectedRoles.find(r => r.id === role.id)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{role.abbreviation}</span>
                      <span className="text-gray-600 ml-2">{role.role_name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{role.level}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* ...existing code... */}
      </div>
    </div>
  );
};