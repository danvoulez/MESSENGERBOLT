import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PresenceUser {
  user_id: string;
  online_at: string;
  presence_ref?: string;
}

export function usePresence() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('online-users');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
        console.log('👥 Online users:', users.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('👤 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('👋 User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      channel.track({
        user_id: user.id,
        online_at: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(heartbeat);
      channel.unsubscribe();
    };
  }, [user]);

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.some(u => u.user_id === userId);
  };

  return { onlineUsers, isUserOnline };
}
