import { Metadata } from 'next';
import PrintSettings from '@/components/printing/print-settings';

export const metadata: Metadata = {
  title: 'Impression Thermique - KFM DELICE',
  description: 'Configuration des imprimantes thermiques',
};
export default function PrintingPage() {
  return (
    <div className="container mx-auto p-6">
      <PrintSettings />
    </div>
  );
}
