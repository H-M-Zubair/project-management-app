'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { Status, Tag, TaskWithRelations } from '@/lib/supabase';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import { CreateTaskDialog } from './create-task-dialog';
import { EditTaskDialog } from './edit-task-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
  tasks: TaskWithRelations[];
  statuses: Status[];
  tags: Tag[];
  onTasksChange: () => void;
}

export function KanbanBoard({ projectId, tasks, statuses, tags, onTasksChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatusId = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status_id === newStatusId) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: newStatusId }),
      });

      if (response.ok) {
        onTasksChange();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setEditingTask(task);
  };

  return (
    <>
      <div className="mb-6">
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statuses.map((status) => {
            const statusTasks = tasks.filter((task) => task.status_id === status.id);
            return (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={statusTasks}
                onTaskClick={handleTaskClick}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectId={projectId}
        statuses={statuses}
        tags={tags}
        onSuccess={onTasksChange}
      />

      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          task={editingTask}
          statuses={statuses}
          tags={tags}
          onSuccess={onTasksChange}
        />
      )}
    </>
  );
}
