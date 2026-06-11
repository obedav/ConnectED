function PostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5 pt-0.5">
          <div className="h-3.5 w-32 rounded-md bg-gray-200" />
          <div className="h-3 w-20 rounded-md bg-gray-100" />
        </div>
      </div>
      {/* Body */}
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full rounded-md bg-gray-100" />
        <div className="h-3.5 w-5/6 rounded-md bg-gray-100" />
        <div className="h-3.5 w-4/6 rounded-md bg-gray-100" />
      </div>
      {/* Actions */}
      <div className="mt-4 flex gap-5 border-t border-gray-50 pt-3">
        <div className="h-4 w-12 rounded-md bg-gray-100" />
        <div className="h-4 w-12 rounded-md bg-gray-100" />
        <div className="ml-auto h-4 w-8 rounded-md bg-gray-100" />
      </div>
    </div>
  )
}

export default function FeedLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* CreatePost skeleton */}
      <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 w-48 rounded-md bg-gray-100" />
            <div className="h-3.5 w-full rounded-md bg-gray-100" />
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
          <div className="h-3 w-8 rounded bg-gray-100" />
          <div className="h-7 w-16 rounded-md bg-gray-200" />
        </div>
      </div>

      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </div>
  )
}
