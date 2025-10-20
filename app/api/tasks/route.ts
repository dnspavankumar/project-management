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

    jwt.verify(token, process.env.JWT_SECRET!);

    const { title, description, project, assignedTo, priority, deadline } = await req.json();

    await dbConnect();

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
