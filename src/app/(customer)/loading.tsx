'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function CustomerLoading() {
  return (
    <div className="space-y-4 animate-fade-in-up pb-24">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full" />

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-24 flex-shrink-0 rounded-full" />
        ))}
      </div>

      {/* Menu items list skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image placeholder */}
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom cart bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-background border-t p-4 shadow-lg z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
