import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';

import { getSupabaseAdmin } from '@/lib/supabase';
const supabaseAdmin = getSupabaseAdmin();
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .select(`
      *,
      status:statuses(*),
      assigned_user:users(id, name, email),
      project:projects(*)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!task || (task.project as any)?.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const { data: taskTags } = await supabaseAdmin
    .from('task_tags')
    .select('tag:tags(*)')
    .eq('task_id', task.id);

  const taskWithTags = {
    ...task,
    tags: taskTags?.map((tt) => tt.tag) || [],
  };

  return NextResponse.json(taskWithTags);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, priority, status_id, tag_ids } = body;

  const { data: existingTask } = await supabaseAdmin
    .from('tasks')
    .select('project:projects(user_id)')
    .eq('id', params.id)
    .maybeSingle();

  if (!existingTask || (existingTask.project as any)?.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const updateData: any = { updated_at: new Date().toISOString() };
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (status_id !== undefined) updateData.status_id = status_id;

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (tag_ids !== undefined) {
    await supabase.from('task_tags').delete().eq('task_id', params.id);

    if (tag_ids.length > 0) {
      const taskTags = tag_ids.map((tag_id: string) => ({
        task_id: params.id,
        tag_id,
      }));

      await supabase.from('task_tags').insert(taskTags);
    }
  }

  return NextResponse.json(task);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log("Deleting task with id:", params.id);

  const { data: existingTask } = await supabaseAdmin
    .from('tasks')
    .select('project:projects(user_id)')
    .eq('id', params.id)
    .single();

  if (!existingTask || (existingTask.project as any)?.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
