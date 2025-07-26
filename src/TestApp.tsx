function TestApp() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">
        CivicPulse Test Page
      </h1>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Testing CSS
        </h2>
        <p className="text-gray-600 mb-4">
          If you can see this styled page, CSS is working correctly.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  )
}

export default TestApp
