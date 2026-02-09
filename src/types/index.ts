export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  created_at: string;
}

export interface Message {
  id: string;
  author: 'user' | 'system';
  content: string;
  timestamp: Date;
  threadId?: string;
}

export interface Task {
  id: string;
  description: string;
  priority: 'urgent' | 'medium' | 'normal';
  suggestion?: string;
  suggestionAction?: {
    type: string;
    data: any;
    label: string;
  };
  category: string;
  completed?: boolean;
}

export interface Contract {
  id: string;
  who: string;
  did: string;
  thisObject: string;
  when: string;
  witness?: string;
  ifOk: string;
  ifDoubt: string;
  ifNot: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  avatar?: string;
  isArchived?: boolean;
  tags?: string[];
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface WhatsAppMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
  status: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'document' | 'link';
  isPinned?: boolean;
  reactions?: string[];
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  code: string;
  owner_id: string;
  member_count: number;
  is_public: boolean;
  created_at: Date;
}

export interface CircleMembership {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: Date;
}