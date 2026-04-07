'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Star,
  Send,
  CheckCircle,
  Utensils,
  Users,
  Music,
  Sparkles,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  { id: 'food', name: 'Cuisine', icon: Utensils, description: 'Qualité des plats' },
  { id: 'service', name: 'Service', icon: Users, description: 'Accueil et service' },
  { id: 'ambiance', name: 'Ambiance', icon: Music, description: 'Atmosphère et cadre' },
  { id: 'cleanliness', name: 'Propreté', icon: Sparkles, description: 'Hygiène et propreté' },
];

export default function FeedbackFormPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const tableId = params.tableId as string;
  const tableNumber = tableId.replace('table-', 'T').toUpperCase();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une note',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId,
          tableNumber,
          rating,
          categories: selectedCategories,
          comment: comment || null,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          demo: true
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre avis. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Merci !</h1>
            <p className="text-muted-foreground mb-6">
              Votre avis a bien été envoyé. Nous apprécions votre feedback !
            </p>
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              KFM DELICE vous remercie pour votre visite
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-orange-600 text-white py-4 px-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">KFM DELICE</h1>
          <p className="text-orange-100 text-center text-sm">Votre avis nous importe</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-8">
        {/* Table Info */}
        <Card className="mb-6 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Table</p>
                <p className="text-2xl font-bold text-orange-600">{tableNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date().toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Section */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Comment était votre expérience ?</CardTitle>
            <CardDescription>Cliquez sur une étoile pour noter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(i)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(i)}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      i <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && 'Sélectionnez une note'}
              {rating === 1 && '😤 Très déçu'}
              {rating === 2 && '😕 Déçu'}
              {rating === 3 && '😐 Correct'}
              {rating === 4 && '😊 Bien'}
              {rating === 5 && '🤩 Excellent !'}
            </p>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Que souhaitez-vous noter ?</CardTitle>
            <CardDescription>Sélectionnez les aspects à évaluer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                      <span className={`font-medium text-sm ${isSelected ? 'text-orange-600' : ''}`}>
                        {category.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comment */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Un commentaire ?</CardTitle>
            <CardDescription>Partagez votre expérience (optionnel)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Racontez-nous votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              {comment.length}/500
            </p>
          </CardContent>
        </Card>

        {/* Optional Contact */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Vos coordonnées</CardTitle>
            <CardDescription>Optionnel, pour une réponse personnalisée</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-sm">Nom</Label>
              <Input
                id="name"
                placeholder="Votre nom"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">Téléphone</Label>
              <Input
                id="phone"
                placeholder="+225 XX XX XX XX XX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Envoyer mon avis
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Vos données restent confidentielles et ne seront utilisées que pour améliorer nos services.
        </p>
      </main>
    </div>
  );
}
