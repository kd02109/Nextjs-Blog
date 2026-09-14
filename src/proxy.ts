import { getAllPosts } from '@/lib/content';
import { projectObj } from '@/util/project';
import { NextResponse, type NextRequest } from 'next/server';

const contentPaths = new Set([
  ...getAllPosts().map(post =>
    post.brand.trim() === 'blog'
      ? `/blogs/${post.url}`
      : `/projects/${post.url}`,
  ),
  ...projectObj.map(project => `/projects/${project.link}`),
]);

export function proxy(request: NextRequest) {
  if (!contentPaths.has(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blogs/:path+', '/projects/:path+'],
};
