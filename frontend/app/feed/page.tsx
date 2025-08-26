import { Suspense } from 'react';
import FeedClient from './FeedClient';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function FeedLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Knowledge Feed</h1>
          <p className="text-muted mt-1">Discover questions, share insights, and build your reputation</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted">Loading feed...</p>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedLoading />}>
      <FeedClient />
    </Suspense>
  );
}
