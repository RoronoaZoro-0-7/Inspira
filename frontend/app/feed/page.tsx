import FeedClient from './FeedClient';

export const dynamic = 'force-dynamic';

export default function FeedPage() {
  return <FeedClient />;
}

function FeedLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Knowledge Feed</h1>
          <p className="text-muted mt-1">Discover questions, share insights, and build your reputation</p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted">Loading feed...</p>
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={<FeedLoading />}>
      <FeedContent />
    </Suspense>
  )
}
