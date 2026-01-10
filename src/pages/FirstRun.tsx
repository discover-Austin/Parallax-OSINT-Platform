export default function FirstRun({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Parallax</h1>
        <p className="mb-4">First-run setup wizard - Coming soon</p>
        <button onClick={onComplete} className="btn-primary w-full">
          Skip for now
        </button>
      </div>
    </div>
  );
}
