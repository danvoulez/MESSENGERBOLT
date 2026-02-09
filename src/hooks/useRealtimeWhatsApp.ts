import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { WhatsAppMessage } from '../types';

export function useRealtimeWhatsApp(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Load initial messages
    loadMessages();

    // 🔥 SUBSCRIBE TO NEW MESSAGES
    const subscription = supabase
      .channel(`whatsapp:chat_id=eq.${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload: any) => {
          console.log('💬 New WhatsApp message:', payload);
          const newMessage = mapDatabaseMessage(payload.new);
          setMessages(prev => [...prev, newMessage]);
          
          // Play notification sound for incoming messages
          if (!newMessage.isOwn) {
            playNotificationSound();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload: any) => {
          console.log('📝 WhatsApp message updated:', payload);
          const updatedMessage = mapDatabaseMessage(payload.new);
          setMessages(prev => prev.map(m => 
            m.id === updatedMessage.id ? updatedMessage : m
          ));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, user]);

  const loadMessages = async () => {
    if (!chatId || !user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
    } else if (data) {
      setMessages(data.map(mapDatabaseMessage));
    }
    setLoading(false);
  };

  const mapDatabaseMessage = (dbMsg: any): WhatsAppMessage => ({
    id: dbMsg.id,
    sender: dbMsg.sender,
    content: dbMsg.content,
    isOwn: dbMsg.is_own,
    status: dbMsg.status,
    type: dbMsg.type,
    timestamp: new Date(dbMsg.created_at)
  });

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  return { messages, loading, refetch: loadMessages };
}
