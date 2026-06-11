export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-72 rounded-md bg-gray-100" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded-md bg-gray-200" />
                <div className="h-3 w-1/2 rounded-md bg-gray-100" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded-md bg-gray-100" />
              <div className="h-3 w-5/6 rounded-md bg-gray-100" />
              <div className="h-3 w-4/6 rounded-md bg-gray-100" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-6 w-16 rounded-full bg-gray-100" />
              <div className="h-6 w-12 rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
