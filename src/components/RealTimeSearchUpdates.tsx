/**
 * Real-time Search Updates Notification Component
 * Shows notifications for new search results in real-time
 */

import React, { useState, useEffect } from 'react';
import { SearchUpdateEvent } from '../services/websocket';
import { useSearchSubscription } from '../hooks/useWebSocketSearch';

interface RealTimeSearchUpdatesProps {
  query: string;
  entityTypes?: ('user' | 'post' | 'representative')[];
  enabled?: boolean;
  onUpdateClick?: (event: SearchUpdateEvent) => void;
  className?: string;
}

export const RealTimeSearchUpdates: React.FC<RealTimeSearchUpdatesProps> = ({
  query,
  entityTypes = ['user', 'post', 'representative'],
  enabled = true,
  onUpdateClick,
  className = ""
}) => {
  const { updates, isSubscribed } = useSearchSubscription(query, entityTypes, enabled);
  const [visibleUpdates, setVisibleUpdates] = useState<SearchUpdateEvent[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Show only recent updates that haven't been dismissed
  useEffect(() => {
    const recentUpdates = updates
      .filter(update => !dismissed.has(update.entity_id))
      .slice(0, 5); // Show max 5 notifications

    setVisibleUpdates(recentUpdates);
  }, [updates, dismissed]);

  // Auto-dismiss updates after 10 seconds
  useEffect(() => {
    if (visibleUpdates.length > 0) {
      const timer = setTimeout(() => {
        const newDismissed = new Set(dismissed);
        visibleUpdates.forEach(update => {
          newDismissed.add(update.entity_id);
        });
        setDismissed(newDismissed);
      }, 10000);

      return () => clearTimeout(timer);
    }
    // No cleanup needed if no visible updates
    return undefined;
  }, [visibleUpdates, dismissed]);

  const handleDismiss = (entityId: string) => {
    setDismissed(prev => new Set(prev).add(entityId));
  };

  const handleUpdateClick = (event: SearchUpdateEvent) => {
    if (onUpdateClick) {
      onUpdateClick(event);
    }
    handleDismiss(event.entity_id);
  };

  const getUpdateIcon = (eventType: string, entityType: string) => {
    if (eventType === 'new_result') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (eventType === 'updated_result') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (eventType === 'engagement_update') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </div>
      );
    }

    // Default icon
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const getUpdateMessage = (event: SearchUpdateEvent) => {
    const { event_type, entity_type, data } = event;

    if (event_type === 'new_result') {
      if (entity_type === 'user') {
        return `New user: ${data.full_name || data.username}`;
      } else if (entity_type === 'post') {
        return `New post: ${data.title || 'Untitled'}`;
      } else if (entity_type === 'representative') {
        return `New representative: ${data.full_name}`;
      }
    }

    if (event_type === 'updated_result') {
      if (entity_type === 'user') {
        return `User updated: ${data.full_name || data.username}`;
      } else if (entity_type === 'post') {
        return `Post updated: ${data.title || 'Untitled'}`;
      } else if (entity_type === 'representative') {
        return `Representative updated: ${data.full_name}`;
      }
    }

    if (event_type === 'engagement_update') {
      return `${data.metric_type} updated: ${data.value}`;
    }

    return `${entity_type} ${event_type.replace('_', ' ')}`;
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'post':
        return 'bg-green-100 text-green-800';
      case 'representative':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!enabled || !query.trim() || !isSubscribed || visibleUpdates.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {visibleUpdates.map((update, index) => (
        <div
          key={`${update.entity_id}-${update.timestamp}`}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm cursor-pointer transform transition-all duration-300 hover:scale-105 animate-slide-in"
          onClick={() => handleUpdateClick(update)}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start">
            {getUpdateIcon(update.event_type, update.entity_type)}
            
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEntityTypeColor(update.entity_type)}`}>
                  {update.entity_type}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(update.entity_id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-gray-900 mt-1">
                {getUpdateMessage(update)}
              </p>
              
              <p className="text-xs text-gray-500 mt-1">
                {new Date(update.timestamp).toLocaleTimeString()}
              </p>
              
              {update.relevance_score && (
                <div className="mt-2">
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Relevance:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${update.relevance_score * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {Math.round(update.relevance_score * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeSearchUpdates;
