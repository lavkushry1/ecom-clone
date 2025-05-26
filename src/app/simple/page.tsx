export default function SimplePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Flipkart Clone is Working!
        </h1>
        <p className="text-gray-600 mb-8">
          Your Next.js application is running successfully.
        </p>
        <div className="space-x-4">
          <a 
            href="/debug" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Debug Info
          </a>
          <a 
            href="/products" 
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Products
          </a>
        </div>
      </div>
    </div>
  );
}
