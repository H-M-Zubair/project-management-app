'use client';

import { useDraggable } from '@dnd-kit/core';
import { TaskWithRelations } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GripVertical, AlertCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TaskCardProps {
  task: TaskWithRelations;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging = false, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="w-3 h-3" />;
      case 'medium':
        return <Minus className="w-3 h-3" />;
      case 'low':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer hover:shadow-md transition-all group',
        isDragging && 'opacity-50 rotate-3 scale-105 shadow-xl'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-slate-50 mb-2 line-clamp-2">
              {task.title}
            </h4>

            {task.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{
                    backgroundColor: tag.color + '20',
                    color: tag.color,
                    borderColor: tag.color + '40',
                  }}
                  className="text-xs border"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn('text-xs capitalize gap-1', getPriorityColor(task.priority))}
              >
                {getPriorityIcon(task.priority)}
                {task.priority}
              </Badge>

              <span className="text-xs text-slate-500 dark:text-slate-500">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
