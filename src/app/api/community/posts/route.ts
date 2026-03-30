import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/community/posts - fetch all posts with user info
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(authHeader.slice(7));
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const posts = await prisma.communityPost.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true } },
        votes: { where: { userId: payload.userId } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const postsWithUserData = posts.map((post) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      category: post.category,
      tags: JSON.parse(post.tags || '[]'),
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      createdAt: post.createdAt.toISOString(),
      user: {
        name: post.user.name,
        email: post.user.email,
        avatarColor: post.user.avatarColor,
      },
      currentUserVote: post.votes.length > 0 ? post.votes[0].voteType : null,
    }));

    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.communityPost.count();

    return NextResponse.json({
      success: true,
      posts: postsWithUserData,
      stats: { totalUsers, totalPosts },
    });
  } catch (error) {
    console.error('Community posts GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/community/posts - create a new post
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyToken(authHeader.slice(7));
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: postBody, category, tags } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (!postBody?.trim()) {
      return NextResponse.json({ success: false, error: 'Body is required' }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: payload.userId,
        title: title.trim(),
        body: postBody.trim(),
        category: category || 'discussion',
        tags: JSON.stringify(tags || []),
      },
      include: {
        user: { select: { name: true, email: true, avatarColor: true } },
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        category: post.category,
        tags: JSON.parse(post.tags),
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        createdAt: post.createdAt.toISOString(),
        user: {
          name: post.user.name,
          email: post.user.email,
          avatarColor: post.user.avatarColor,
        },
      },
    });
  } catch (error) {
    console.error('Community posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
