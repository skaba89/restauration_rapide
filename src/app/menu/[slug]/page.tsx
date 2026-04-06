// Public menu page - server component
import { Suspense } from 'react';
import PublicMenuClient from './client';

interface MenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;
  return <PublicMenuClient slug={slug} />;
}
