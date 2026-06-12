const rawBasePath = import.meta.env.BASE_URL || '/';

const normalizedBasePath = rawBasePath === '/' ? '' : rawBasePath.replace(/\/$/, '');

export function withBasePath(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return `${normalizedBasePath}${normalizedPath}`;
}