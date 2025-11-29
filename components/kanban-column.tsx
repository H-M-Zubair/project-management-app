'use client';

import { useDroppable } from '@dnd-kit/core';
import { Status, TaskWithRelations } from '@/lib/supabase';
import { TaskCard } from './task-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: Status;
  tasks: TaskWithRelations[];
  onTaskClick: (task: TaskWithRelations) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  const getStatusColor = (slug: string) => {
    switch (slug) {
      case 'todo':
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'done':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700';
    }
  };

  const getHeaderColor = (slug: string) => {
    switch (slug) {
      case 'todo':
        return 'text-slate-700 dark:text-slate-300';
      case 'in_progress':
        return 'text-blue-700 dark:text-blue-300';
      case 'done':
        return 'text-green-700 dark:text-green-300';
      default:
        return 'text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border-2 p-4 min-h-[600px] transition-colors',
        getStatusColor(status.slug),
        isOver && 'ring-2 ring-slate-400 dark:ring-slate-500'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn('font-semibold text-lg', getHeaderColor(status.slug))}>
          {status.name}
        </h3>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-600">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
