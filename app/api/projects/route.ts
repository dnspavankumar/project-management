import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    await dbConnect();

    const projects = await Project.find({
      $or: [{ owner: decoded.userId }, { members: decoded.userId }],
    }).populate('owner', 'name email').populate('members', 'name email');

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching projects' },
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
    const { name, description } = await req.json();

    await dbConnect();

    const User = (await import('@/models/User')).default;
    const currentUser = await User.findById(decoded.userId);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const project = await Project.create({
      name,
      description,
      owner: decoded.userId,
      company: currentUser.company,
      members: [decoded.userId],
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating project' },
      { status: 500 }
    );
  }
}
