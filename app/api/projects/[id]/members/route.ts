import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import jwt from 'jsonwebtoken';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const { userId } = await req.json();

    await dbConnect();

    const project = await Project.findById(params.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    const updatedProject = await Project.findById(params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error adding member' },
      { status: 500 }
    );
  }
}
