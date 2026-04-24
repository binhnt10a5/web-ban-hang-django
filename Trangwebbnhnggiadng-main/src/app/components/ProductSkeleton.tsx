export function ProductSkeleton() {
  return (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-[#3a3a3a]"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-[#3a3a3a] rounded w-full"></div>
          <div className="h-4 bg-[#3a3a3a] rounded w-2/3"></div>
        </div>
        
        {/* Rating */}
        <div className="h-3 bg-[#3a3a3a] rounded w-1/2"></div>
        
        {/* Price */}
        <div className="h-6 bg-[#3a3a3a] rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function ProductListSkeleton() {
  return (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden border border-gray-700 flex gap-6 p-4 animate-pulse">
      {/* Image skeleton */}
      <div className="w-48 h-48 flex-shrink-0 bg-[#3a3a3a] rounded-lg"></div>
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-4">
        <div className="h-3 bg-[#3a3a3a] rounded w-1/4"></div>
        <div className="h-6 bg-[#3a3a3a] rounded w-3/4"></div>
        <div className="h-4 bg-[#3a3a3a] rounded w-full"></div>
        <div className="h-4 bg-[#3a3a3a] rounded w-full"></div>
        <div className="h-4 bg-[#3a3a3a] rounded w-2/3"></div>
        <div className="h-3 bg-[#3a3a3a] rounded w-1/3"></div>
        <div className="flex items-center gap-4 pt-2">
          <div className="h-8 bg-[#3a3a3a] rounded w-32"></div>
          <div className="h-8 bg-[#3a3a3a] rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductListSkeletonGroup({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductListSkeleton key={i} />
      ))}
    </div>
  );
}
