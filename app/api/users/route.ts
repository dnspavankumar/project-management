import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    await dbConnect();

    // Get current user to find their company
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only return users from the same company
    const users = await User.find({ company: currentUser.company }, 'name email company');

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: 500 }
    );
  }
}
