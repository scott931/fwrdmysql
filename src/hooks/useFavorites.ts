import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3002/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('forward_africa_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      setError('Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addToFavorites = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch('http://localhost:3002/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('forward_africa_token')}`
        },
        body: JSON.stringify({ course_id: courseId })
      });

      if (!response.ok) {
        throw new Error('Failed to add to favorites');
      }

      await fetchFavorites(); // Refresh favorites list
    } catch (err) {
      setError('Failed to add to favorites');
      console.error('Error adding to favorites:', err);
    }
  }, [user?.id, fetchFavorites]);

  const removeFromFavorites = useCallback(async (courseId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:3002/api/favorites/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('forward_africa_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from favorites');
      }

      await fetchFavorites(); // Refresh favorites list
    } catch (err) {
      setError('Failed to remove from favorites');
      console.error('Error removing from favorites:', err);
    }
  }, [user?.id, fetchFavorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    fetchFavorites
  };
};