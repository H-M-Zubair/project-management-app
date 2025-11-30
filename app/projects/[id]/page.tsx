'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { KanbanBoard } from '@/components/kanban-board';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Project, Status, Tag, TaskWithRelations } from '@/lib/supabase';
import { } from '@radix-ui/react-alert-dialog';
import { AlertDialogFooter, AlertDialogHeader ,AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProjectPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus === 'authenticated' && projectId) {
      fetchProjectData();
    }
  }, [authStatus, projectId]);

  const [isDeleting, setIsDeleting] = useState(false);
  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, statusesRes, tagsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch('/api/statuses'),
        fetch('/api/tags'),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setStatuses(statusesData);
      }

      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
  setIsDeleting(true);
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      router.push('/dashboard');
    } else {
      console.error('Failed to delete project');
    }
  } catch (error) {
    console.error('Error deleting project:', error);
  } finally {
    setIsDeleting(false);
  }
};

  const refreshTasks = () => {
    fetchProjectData();
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Project not found</h2>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {project.name}
            </h2>
           
            {project.description && (
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <KanbanBoard
          projectId={projectId}
          tasks={tasks}
          statuses={statuses}
          tags={tags}
          onTasksChange={refreshTasks}
        />

         <h3 className='my-4'>
              <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm" className="gap-2">
      <Trash2 className="w-4 h-4" />
      Delete Project
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Project</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure? This will delete the project and all associated tasks. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeleteProject}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
            </h3>
      </main>
    </div>
  );
}
