import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    await dbConnect();

    const query = projectId ? { project: projectId } : {};
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { title, description, project, assignedTo, priority, deadline } = await req.json();

    await dbConnect();

    const User = (await import('@/models/User')).default;
    const Project = (await import('@/models/Project')).default;

    // Verify the assigned user is from the same company
    if (assignedTo) {
      const currentUser = await User.findById(decoded.userId);
      const assignedUser = await User.findById(assignedTo);
      const projectDoc = await Project.findById(project);

      if (!currentUser || !assignedUser || !projectDoc) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
      }

      if (assignedUser.company.toString() !== currentUser.company.toString()) {
        return NextResponse.json(
          { error: 'Cannot assign tasks to users from different companies' },
          { status: 403 }
        );
      }

      if (projectDoc.company.toString() !== currentUser.company.toString()) {
        return NextResponse.json(
          { error: 'Cannot create tasks for projects from different companies' },
          { status: 403 }
        );
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      deadline,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating task' },
      { status: 500 }
    );
  }
}
