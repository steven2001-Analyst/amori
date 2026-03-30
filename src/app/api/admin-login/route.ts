import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'stevensaleh100@outlook.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'datatrack2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const isValid =
      (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) ||
      (username === ADMIN_EMAIL && password === ADMIN_PASSWORD);

    if (isValid) {
      return NextResponse.json({
        success: true,
        isAdmin: true,
        adminEmail: ADMIN_EMAIL,
        adminName: 'Admin'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin credentials.' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}
