import { Metadata } from 'next';
import VoiceOrdering from '@/components/voice/voice-ordering';

export const metadata: Metadata = {
  title: 'Commande Vocale - KFM DELICE',
  description: 'Passez vos commandes à la voix',
};
export default function VoiceOrderPage() {
  return (
    <div className="container mx-auto p-6">
      <VoiceOrdering />
    </div>
  );
}
