import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

export async function POST(req: Request) {
  try {
    const { name, email, password, companyName } = await req.json();

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Find or create company
    let company = await Company.findOne({ name: companyName });
    if (!company) {
      company = await Company.create({ name: companyName });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      company: company._id,
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}
