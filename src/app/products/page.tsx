'use client';

import { Suspense } from 'react';
import { ProductsPageContent } from './products-content';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
