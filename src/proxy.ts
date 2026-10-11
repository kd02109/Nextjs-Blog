import { getAllPosts } from '@/lib/content';
import { getPublicPostPath } from '@/config/post-routes';
import { projectObj } from '@/util/project';
import { NextResponse, type NextRequest } from 'next/server';

const contentPaths = new Set([
  ...getAllPosts().map(getPublicPostPath),
  ...projectObj.map(project => `/projects/${project.link}`),
]);

export function proxy(request: NextRequest) {
  if (!contentPaths.has(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blog/:path+', '/projects/:path+'],
};
