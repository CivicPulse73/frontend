const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface Role {
  id: string;
  role_name: string;
  abbreviation: string;
  h_order: number;
  role_type: string;
  description: string;
  level: string;
  is_elected: boolean;
  term_length: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RoleMapping {
  [key: string]: Role;
}

/**
 * Enhanced role service with caching, error handling, and performance optimizations
 */
class RoleService {
  private roles: Role[] = [];
  private roleMapping: RoleMapping = {};
  private isLoaded = false;
  private isLoading = false;
  private lastFetchTime = 0;
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch roles from the API with caching and error handling
   */
  async fetchRoles(): Promise<Role[]> {
    // Return cached data if still valid
    const now = Date.now();
    if (this.isLoaded && (now - this.lastFetchTime) < this.cacheExpiration) {
      return this.roles;
    }

    // Prevent concurrent requests
    if (this.isLoading) {
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (!this.isLoading) {
            if (this.isLoaded) {
              resolve(this.roles);
            } else {
              reject(new Error('Failed to load roles'));
            }
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    this.isLoading = true;

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch roles'}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from roles API');
      }

      this.roles = data.data.map((role: any) => ({
        ...role,
        // Ensure required fields have defaults
        h_order: role.h_order ?? 999,
        description: role.description || '',
        abbreviation: role.abbreviation || '',
        role_type: role.role_type || 'Other',
        level: role.level || 'Local',
        is_elected: Boolean(role.is_elected),
        term_length: role.term_length || 0,
        status: role.status || 'active'
      }));

      this.buildMapping();
      this.isLoaded = true;
      this.lastFetchTime = now;
      
      return this.roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      this.isLoaded = false;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Build efficient lookup mappings for roles
   */
  private buildMapping(): void {
    this.roleMapping = {};
    
    this.roles.forEach(role => {
      // Map by abbreviation (case-insensitive)
      if (role.abbreviation) {
        this.roleMapping[role.abbreviation.toLowerCase()] = role;
      }
      
      // Map by role name (case-insensitive)
      this.roleMapping[role.role_name.toLowerCase()] = role;
      
      // Map by ID for fast lookups
      this.roleMapping[role.id] = role;
    });
  }

  /**
   * Get all roles sorted by hierarchy order
   */
  getRoles(): Role[] {
    return [...this.roles].sort((a, b) => a.h_order - b.h_order);
  }

  /**
   * Get role by abbreviation (case-insensitive)
   */
  getRoleByAbbreviation(abbreviation: string): Role | undefined {
    if (!abbreviation) return undefined;
    return this.roleMapping[abbreviation.toLowerCase()];
  }

  /**
   * Get role by name (case-insensitive)
   */
  getRoleByName(name: string): Role | undefined {
    if (!name) return undefined;
    return this.roleMapping[name.toLowerCase()];
  }

  /**
   * Get role by ID
   */
  getRoleById(id: string): Role | undefined {
    if (!id) return undefined;
    return this.roleMapping[id];
  }

  /**
   * Get roles filtered and sorted by type
   */
  getSortedRolesByType(roleType?: string): Role[] {
    let filteredRoles = this.roles;
    
    if (roleType) {
      filteredRoles = this.roles.filter(role => 
        role.role_type.toLowerCase() === roleType.toLowerCase()
      );
    }
    
    return filteredRoles.sort((a, b) => a.h_order - b.h_order);
  }

  /**
   * Get roles by level (National, State, Local)
   */
  getRolesByLevel(level: string): Role[] {
    return this.roles
      .filter(role => role.level.toLowerCase() === level.toLowerCase())
      .sort((a, b) => a.h_order - b.h_order);
  }

  /**
   * Get only elected roles
   */
  getElectedRoles(): Role[] {
    return this.roles
      .filter(role => role.is_elected)
      .sort((a, b) => a.h_order - b.h_order);
  }

  /**
   * Check if roles are loaded
   */
  isRolesLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Check if roles are currently loading
   */
  isRolesLoading(): boolean {
    return this.isLoading;
  }

  /**
   * Ensure roles are loaded, fetch if necessary
   */
  async ensureRolesLoaded(): Promise<void> {
    if (!this.isLoaded && !this.isLoading) {
      await this.fetchRoles();
    }
  }

  /**
   * Force refresh roles from server
   */
  async refreshRoles(): Promise<Role[]> {
    this.isLoaded = false;
    this.lastFetchTime = 0;
    return this.fetchRoles();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.roles = [];
    this.roleMapping = {};
    this.isLoaded = false;
    this.lastFetchTime = 0;
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { isLoaded: boolean; isLoading: boolean; lastFetchTime: number; cacheAge: number } {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      lastFetchTime: this.lastFetchTime,
      cacheAge: Date.now() - this.lastFetchTime
    };
  }
}

export const roleService = new RoleService();
