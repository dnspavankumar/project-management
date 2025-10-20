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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const { userId } = await req.json();

    await dbConnect();

    const User = (await import('@/models/User')).default;
    const project = await Project.findById(params.id);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify the user being added is from the same company
    const userToAdd = await User.findById(userId);
    const currentUser = await User.findById(decoded.userId);

    if (!userToAdd || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userToAdd.company.toString() !== currentUser.company.toString()) {
      return NextResponse.json(
        { error: 'Cannot add users from different companies' },
        { status: 403 }
      );
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
