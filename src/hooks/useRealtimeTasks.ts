import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';

export function useRealtimeTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Initial load
    loadTasks();

    // 🔥 REAL-TIME SUBSCRIPTION
    const subscription = supabase
      .channel(`tasks:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('🔔 Task change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask = mapDatabaseTask(payload.new);
            setTasks(prev => [newTask, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = mapDatabaseTask(payload.new);
            setTasks(prev => prev.map(t => 
              t.id === updatedTask.id ? updatedTask : t
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading tasks:', error);
    } else if (data) {
      setTasks(data.map(mapDatabaseTask));
    }
    setLoading(false);
  };

  const mapDatabaseTask = (dbTask: any): Task => ({
    id: dbTask.id,
    description: dbTask.description,
    priority: dbTask.priority,
    suggestion: dbTask.suggestion,
    suggestionAction: dbTask.suggestion_action,
    category: dbTask.category,
    completed: dbTask.completed
  });

  return { tasks, loading, refetch: loadTasks };
}
