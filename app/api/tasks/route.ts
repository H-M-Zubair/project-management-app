import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  const projectCheck = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!projectCheck.data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      status:statuses(*),
      assigned_user:users(id, name, email)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taskIds = data.map((task) => task.id);
  let taskTagsData: any[] = [];

  if (taskIds.length > 0) {
    const { data: taskTagsResult } = await supabase
      .from('task_tags')
      .select('task_id, tag:tags(*)')
      .in('task_id', taskIds);

    taskTagsData = taskTagsResult || [];
  }

  const tasksWithTags = data.map((task) => ({
    ...task,
    tags: taskTagsData
      .filter((tt) => tt.task_id === task.id)
      .map((tt) => tt.tag),
  }));

  return NextResponse.json(tasksWithTags);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, priority, project_id, status_id, tag_ids } = body;

  if (!title || !project_id || !status_id) {
    return NextResponse.json(
      { error: 'Title, project_id, and status_id are required' },
      { status: 400 }
    );
  }

  const projectCheck = await supabase
    .from('projects')
    .select('id')
    .eq('id', project_id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!projectCheck.data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description || '',
      priority: priority || 'medium',
      project_id,
      status_id,
      assigned_user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (tag_ids && tag_ids.length > 0) {
    const taskTags = tag_ids.map((tag_id: string) => ({
      task_id: task.id,
      tag_id,
    }));

    await supabase.from('task_tags').insert(taskTags);
  }

  return NextResponse.json(task);
}
