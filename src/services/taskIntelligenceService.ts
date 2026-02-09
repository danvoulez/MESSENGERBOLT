import { Task } from '../types';

interface UrgencyAnalysis {
  score: number; // 0-100
  reasoning: string;
  suggestedPriority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedTimeToComplete: string;
  recommendations: string[];
}

interface TaskAction {
  label: string;
  icon?: string;
  action: string; // 'navigate' | 'call' | 'email' | 'whatsapp'
  data?: any;
}

class TaskIntelligenceService {
  /**
   * Analyze task urgency based on multiple factors
   */
  analyzeUrgency(task: Task): UrgencyAnalysis {
    let score = 0;
    const recommendations: string[] = [];

    // Priority weight
    const priorityScores = {
      urgent: 40,
      high: 30,
      medium: 15,
      low: 5
    };
    score += priorityScores[task.priority as keyof typeof priorityScores] || 10;

    // Keyword analysis
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'immediate', 'hoje', 'agora', 'vencimento'];
    const description = task.description.toLowerCase();
    
    const urgentMatches = urgentKeywords.filter(keyword => description.includes(keyword));
    if (urgentMatches.length > 0) {
      score += urgentMatches.length * 10;
      recommendations.push(`Contains urgent keywords: ${urgentMatches.join(', ')}`);
    }

    // Category-based urgency
    if (task.category === 'payment') {
      score += 15;
      recommendations.push('Payment-related tasks are time-sensitive');
    }
    if (task.category === 'contract') {
      score += 10;
      recommendations.push('Contract tasks often have deadlines');
    }

    // Determine suggested priority
    let suggestedPriority: 'urgent' | 'high' | 'medium' | 'low';
    if (score >= 60) {
      suggestedPriority = 'urgent';
    } else if (score >= 40) {
      suggestedPriority = 'high';
    } else if (score >= 20) {
      suggestedPriority = 'medium';
    } else {
      suggestedPriority = 'low';
    }

    // Estimate time to complete
    const estimatedTimeToComplete = this.estimateCompletionTime(task);

    return {
      score: Math.min(score, 100),
      reasoning: recommendations.join('. '),
      suggestedPriority,
      estimatedTimeToComplete,
      recommendations
    };
  }

  /**
   * Generate contextual quick actions for a task
   */
  generateQuickActions(task: Task): TaskAction[] {
    const actions: TaskAction[] = [];

    // Always allow marking as complete
    actions.push({
      label: 'Mark as Complete',
      icon: 'CheckCircle',
      action: 'complete',
      data: { taskId: task.id }
    });

    // Category-specific actions
    if (task.category === 'contract') {
      actions.push({
        label: 'View Contract',
        icon: 'FileText',
        action: 'navigate',
        data: { screen: 'new' }
      });
    }

    if (task.category === 'whatsapp' || task.category === 'client') {
      actions.push({
        label: 'Send Message',
        icon: 'MessageCircle',
        action: 'navigate',
        data: { screen: 'whatsapp' }
      });
    }

    if (task.category === 'payment') {
      actions.push({
        label: 'Send Payment Reminder',
        icon: 'DollarSign',
        action: 'whatsapp',
        data: { message: 'payment_reminder' }
      });
    }

    // Add snooze option
    actions.push({
      label: 'Snooze',
      icon: 'Clock',
      action: 'snooze',
      data: { taskId: task.id }
    });

    return actions;
  }

  /**
   * Estimate time to complete based on task complexity
   */
  private estimateCompletionTime(task: Task): string {
    const description = task.description.toLowerCase();
    const wordCount = description.split(' ').length;

    // Simple heuristic
    if (wordCount < 10) {
      return '5-15 minutes';
    } else if (wordCount < 30) {
      return '15-30 minutes';
    } else if (task.category === 'contract') {
      return '1-2 hours';
    } else {
      return '30-60 minutes';
    }
  }

  /**
   * Sort tasks by intelligent priority
   */
  sortByIntelligence(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const scoreA = this.analyzeUrgency(a).score;
      const scoreB = this.analyzeUrgency(b).score;
      return scoreB - scoreA;
    });
  }
}

export const taskIntelligenceService = new TaskIntelligenceService();
