import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    const { data: posts, error: postsError } = await supabase
      .from('CommunityPost')
      .select('*, User(id, name, email, avatarColor), PostVote(userId, voteType)')
      .order('createdAt', { ascending: false })
      .limit(50);

    if (postsError) {
      console.error('Posts query error:', postsError);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }

    const postsWithUserData = (posts || []).map((post: any) => ({
      id: post.id,
      title: post.title,
      body: post.body,
      category: post.category,
      tags: JSON.parse(post.tags || '[]'),
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      createdAt: post.createdAt,
      user: {
        name: post.User?.name,
        email: post.User?.email,
        avatarColor: post.User?.avatarColor,
      },
      currentUserVote: (post.PostVote || []).some((v: any) => v.userId === payload.userId)
        ? (post.PostVote || []).find((v: any) => v.userId === payload.userId)?.voteType || null
        : null,
    }));

    const { count: totalUsers } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true });

    const { count: totalPosts } = await supabase
      .from('CommunityPost')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      posts: postsWithUserData,
      stats: { totalUsers: totalUsers || 0, totalPosts: totalPosts || 0 },
    });
  } catch (error) {
    console.error('Community posts GET error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
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

    const { data: post, error: createError } = await supabase
      .from('CommunityPost')
      .insert({
        userId: payload.userId,
        title: title.trim(),
        body: postBody.trim(),
        category: category || 'discussion',
        tags: JSON.stringify(tags || []),
      })
      .select('*, User(name, email, avatarColor)')
      .single();

    if (createError || !post) {
      console.error('Post creation error:', createError);
      return NextResponse.json({ success: false, error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        body: post.body,
        category: post.category,
        tags: JSON.parse(post.tags || '[]'),
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        createdAt: post.createdAt,
        user: {
          name: (post.User as any)?.name,
          email: (post.User as any)?.email,
          avatarColor: (post.User as any)?.avatarColor,
        },
      },
    });
  } catch (error) {
    console.error('Community posts POST error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
