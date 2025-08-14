export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dresser</h2>
        <p className="text-gray-600">Preparing your smart wardrobe...</p>
      </div>
    </div>
  )
}
