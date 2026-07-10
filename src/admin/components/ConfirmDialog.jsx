export default function ConfirmDialog({ open, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/40 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <p className="text-sm text-onyx leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-onyx px-3 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium text-mint-cream bg-blood-red hover:bg-blood-red/90 rounded px-4 py-2 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
