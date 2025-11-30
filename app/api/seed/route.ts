import { NextRequest, NextResponse } from 'next/server';
import { supabase,getSupabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

const supabaseAdmin = getSupabaseAdmin();
export async function POST(req: NextRequest) {
  try {

    if(!supabaseAdmin || supabaseAdmin === null) {
      throw new Error('Supabase Admin client is not initialized');
    }

    const password = await hashPassword('password123');

    const users = [
      { email: 'john@example.com', name: 'John Doe', password },
      { email: 'jane@example.com', name: 'Jane Smith', password },
      { email: 'bob@example.com', name: 'Bob Johnson', password },
      { email: 'alice@example.com', name: 'Alice Williams', password },
      { email: 'charlie@example.com', name: 'Charlie Brown', password },
      { email: 'diana@example.com', name: 'Diana Prince', password },
      { email: 'eve@example.com', name: 'Eve Davis', password },
      { email: 'frank@example.com', name: 'Frank Miller', password },
      { email: 'grace@example.com', name: 'Grace Lee', password },
      { email: 'henry@example.com', name: 'Henry Wilson', password },
    ];

    const { data: insertedUsers, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(users, { onConflict: 'email' })
      .select();

    if (userError) throw userError;

    const { data: statuses, error: statusError } = await supabaseAdmin
      .from('statuses')
      .select('*');

    if (statusError) throw statusError;

    const todoStatus = statuses.find((s) => s.slug === 'todo');
    const inProgressStatus = statuses.find((s) => s.slug === 'in_progress');
    const doneStatus = statuses.find((s) => s.slug === 'done');

    const projects = [];
    const tags = [];
    const tasks = [];

    const tagColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const priorities = ['low', 'medium', 'high'];

    for (const user of insertedUsers) {
      const userProjects = [
        {
          name: `${user.name}'s Website Redesign`,
          description: 'Modernize company website with new design',
          user_id: user.id,
        },
        {
          name: 'Mobile App Development',
          description: 'Build native mobile app for iOS and Android',
          user_id: user.id,
        },
        {
          name: 'Marketing Campaign',
          description: 'Q4 marketing campaign planning and execution',
          user_id: user.id,
        },
      ];
      projects.push(...userProjects);

      const userTags = [
        { name: 'Frontend', color: tagColors[0], user_id: user.id },
        { name: 'Backend', color: tagColors[1], user_id: user.id },
        { name: 'Design', color: tagColors[2], user_id: user.id },
        { name: 'Bug', color: tagColors[3], user_id: user.id },
        { name: 'Feature', color: tagColors[4], user_id: user.id },
        { name: 'Documentation', color: tagColors[5], user_id: user.id },
      ];
      tags.push(...userTags);
    }

    const { data: insertedProjects, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert(projects)
      .select();

    if (projectError) throw projectError;

    const { data: insertedTags, error: tagError } = await supabaseAdmin
      .from('tags')
      .insert(tags)
      .select();

    if (tagError) throw tagError;

    for (const project of insertedProjects) {
      const userTags = insertedTags.filter((t) => t.user_id === project.user_id);

      const projectTasks = [
        {
          title: 'Setup project repository',
          description: 'Initialize Git repository and setup CI/CD',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: doneStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Design mockups',
          description: 'Create high-fidelity mockups in Figma',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: doneStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Implement authentication',
          description: 'Add user login and registration',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: inProgressStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Build dashboard',
          description: 'Create main dashboard with analytics',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: inProgressStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Add payment integration',
          description: 'Integrate Stripe for payments',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: todoStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Write API documentation',
          description: 'Document all API endpoints',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: todoStatus!.id,
          assigned_user_id: project.user_id,
        },
        {
          title: 'Performance optimization',
          description: 'Optimize database queries and caching',
          priority: priorities[Math.floor(Math.random() * 3)],
          project_id: project.id,
          status_id: todoStatus!.id,
          assigned_user_id: project.user_id,
        },
      ];
      tasks.push(...projectTasks);
    }

    const { data: insertedTasks, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert(tasks)
      .select();

    if (taskError) throw taskError;

    const taskTags = [];
    for (const task of insertedTasks) {
      const project = insertedProjects.find((p) => p.id === task.project_id);
      const userTags = insertedTags.filter((t) => t.user_id === project!.user_id);

      const numTags = Math.floor(Math.random() * 3) + 1;
      const selectedTags = userTags
        .sort(() => 0.5 - Math.random())
        .slice(0, numTags);

      for (const tag of selectedTags) {
        taskTags.push({
          task_id: task.id,
          tag_id: tag.id,
        });
      }
    }

    const { error: taskTagError } = await supabaseAdmin
      .from('task_tags')
      .insert(taskTags);

    if (taskTagError) throw taskTagError;

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      stats: {
        users: insertedUsers.length,
        projects: insertedProjects.length,
        tags: insertedTags.length,
        tasks: insertedTasks.length,
        taskTags: taskTags.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
