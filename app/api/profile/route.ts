import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Project from '@/models/Project';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await dbConnect();

    const user = await User.findById(decoded.userId)
      .populate('company', 'name')
      .select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get task statistics
    const allTasks = await Task.find().populate('project');
    const userTasks = allTasks.filter((task: any) => 
      task.assignedTo?.toString() === decoded.userId
    );

    const completedTasks = userTasks.filter((task: any) => task.status === 'completed').length;
    const pendingTasks = userTasks.filter((task: any) => task.status !== 'completed').length;
    const totalTasks = userTasks.length;

    // Get project count
    const projectCount = await Project.countDocuments({
      $or: [{ owner: decoded.userId }, { members: decoded.userId }],
    });

    return NextResponse.json({
      user,
      stats: {
        completedTasks,
        pendingTasks,
        totalTasks,
        projectCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { name, email } = await req.json();

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email },
      { new: true }
    ).select('-password');

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}
