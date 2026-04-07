// Public Order Tracking Page - No authentication required
import { Metadata } from 'next';
import PublicTrackingClient from './client';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  
  return {
    title: `Suivi de commande #${orderId.slice(-6).toUpperCase()}`,
    description: 'Suivez votre commande en temps réel',
    robots: { index: false, follow: false },
  };
}

export default async function PublicTrackingPage({ params }: PageProps) {
  const { orderId } = await params;
  return <PublicTrackingClient orderId={orderId} />;
}
