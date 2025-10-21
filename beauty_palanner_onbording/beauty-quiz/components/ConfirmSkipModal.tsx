"use client"

export default function ConfirmSkipModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900">Skip this step?</h3>
        <p className="text-sm text-gray-600 mt-2">
          Skipping this may reduce the accuracy of your personalized AI analysis. Are you sure you want to continue?
        </p>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold">Go back</button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">Continue anyway</button>
        </div>
      </div>
    </div>
  )
}
