import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Message, Task, Contract, WhatsAppChat, WhatsAppMessage } from '../types'

export function useDatabase() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Messages
  const addMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        author: message.author,
        content: message.content,
        thread_id: message.threadId
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding message:', error)
      return null
    }

    return {
      id: data.id,
      author: data.author,
      content: data.content,
      threadId: data.thread_id,
      timestamp: new Date(data.created_at)
    } as Message
  }

  const getMessages = async (threadId?: string): Promise<Message[]> => {
    if (!user) return []

    let query = supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (threadId) {
      query = query.eq('thread_id', threadId)
    } else {
      query = query.is('thread_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data.map(msg => ({
      id: msg.id,
      author: msg.author,
      content: msg.content,
      threadId: msg.thread_id,
      timestamp: new Date(msg.created_at)
    }))
  }

  // Tasks
  const addTask = async (task: Omit<Task, 'id'>) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        description: task.description,
        priority: task.priority,
        suggestion: task.suggestion,
        suggestion_action: task.suggestionAction,
        category: task.category,
        completed: task.completed || false
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding task:', error)
      return null
    }

    return {
      id: data.id,
      description: data.description,
      priority: data.priority,
      suggestion: data.suggestion,
      suggestionAction: data.suggestion_action,
      category: data.category,
      completed: data.completed
    } as Task
  }

  const getTasks = async (): Promise<Task[]> => {
    if (!user) return []

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return data.map(task => ({
      id: task.id,
      description: task.description,
      priority: task.priority,
      suggestion: task.suggestion,
      suggestionAction: task.suggestion_action,
      category: task.category,
      completed: task.completed
    }))
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return false

    const { error } = await supabase
      .from('tasks')
      .update({
        ...(updates.description && { description: updates.description }),
        ...(updates.priority && { priority: updates.priority }),
        ...(updates.suggestion && { suggestion: updates.suggestion }),
        ...(updates.suggestionAction && { suggestion_action: updates.suggestionAction }),
        ...(updates.category && { category: updates.category }),
        ...(updates.completed !== undefined && { completed: updates.completed })
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating task:', error)
      return false
    }

    return true
  }

  // Contracts
  const addContract = async (contract: Omit<Contract, 'id' | 'createdAt'>) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        who: contract.who,
        did: contract.did,
        this_object: contract.thisObject,
        when_date: contract.when,
        witness: contract.witness || '',
        if_ok: contract.ifOk,
        if_doubt: contract.ifDoubt,
        if_not: contract.ifNot,
        status: contract.status
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding contract:', error)
      return null
    }

    return {
      id: data.id,
      who: data.who,
      did: data.did,
      thisObject: data.this_object,
      when: data.when_date,
      witness: data.witness,
      ifOk: data.if_ok,
      ifDoubt: data.if_doubt,
      ifNot: data.if_not,
      status: data.status,
      createdAt: new Date(data.created_at)
    } as Contract
  }

  const getContracts = async (): Promise<Contract[]> => {
    if (!user) return []

    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contracts:', error)
      return []
    }

    return data.map(contract => ({
      id: contract.id,
      who: contract.who,
      did: contract.did,
      thisObject: contract.this_object,
      when: contract.when_date,
      witness: contract.witness,
      ifOk: contract.if_ok,
      ifDoubt: contract.if_doubt,
      ifNot: contract.if_not,
      status: contract.status,
      createdAt: new Date(contract.created_at)
    }))
  }

  // WhatsApp Chats
  const addWhatsAppChat = async (chat: Omit<WhatsAppChat, 'id' | 'timestamp'>) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('whatsapp_chats')
      .insert({
        user_id: user.id,
        name: chat.name,
        last_message: chat.lastMessage,
        unread_count: chat.unreadCount,
        avatar_url: chat.avatar,
        is_archived: chat.isArchived || false,
        tags: chat.tags || [],
        notes: chat.notes || '',
        priority: chat.priority || 'low'
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding WhatsApp chat:', error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      lastMessage: data.last_message,
      timestamp: new Date(data.updated_at),
      unreadCount: data.unread_count,
      avatar: data.avatar_url,
      isArchived: data.is_archived,
      tags: data.tags,
      notes: data.notes,
      priority: data.priority
    } as WhatsAppChat
  }

  const getWhatsAppChats = async (): Promise<WhatsAppChat[]> => {
    if (!user) return []

    const { data, error } = await supabase
      .from('whatsapp_chats')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching WhatsApp chats:', error)
      return []
    }

    return data.map(chat => ({
      id: chat.id,
      name: chat.name,
      lastMessage: chat.last_message,
      timestamp: new Date(chat.updated_at),
      unreadCount: chat.unread_count,
      avatar: chat.avatar_url,
      isArchived: chat.is_archived,
      tags: chat.tags,
      notes: chat.notes,
      priority: chat.priority
    }))
  }

  // WhatsApp Messages
  const addWhatsAppMessage = async (message: Omit<WhatsAppMessage, 'id' | 'timestamp'>, chatId: string) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: user.id,
        chat_id: chatId,
        sender: message.sender,
        content: message.content,
        is_own: message.isOwn,
        status: message.status,
        message_type: message.type || 'text',
        is_pinned: message.isPinned || false,
        reactions: message.reactions || []
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding WhatsApp message:', error)
      return null
    }

    // Update chat's last message
    await supabase
      .from('whatsapp_chats')
      .update({
        last_message: message.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .eq('user_id', user.id)

    return {
      id: data.id,
      sender: data.sender,
      content: data.content,
      timestamp: new Date(data.created_at),
      isOwn: data.is_own,
      status: data.status,
      type: data.message_type,
      isPinned: data.is_pinned,
      reactions: data.reactions
    } as WhatsAppMessage
  }

  const getWhatsAppMessages = async (chatId: string): Promise<WhatsAppMessage[]> => {
    if (!user) return []

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching WhatsApp messages:', error)
      return []
    }

    return data.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      isOwn: msg.is_own,
      status: msg.status,
      type: msg.message_type,
      isPinned: msg.is_pinned,
      reactions: msg.reactions
    }))
  }

  return {
    loading,
    // Messages
    addMessage,
    getMessages,
    // Tasks
    addTask,
    getTasks,
    updateTask,
    // Contracts
    addContract,
    getContracts,
    // WhatsApp
    addWhatsAppChat,
    getWhatsAppChats,
    addWhatsAppMessage,
    getWhatsAppMessages
  }
}