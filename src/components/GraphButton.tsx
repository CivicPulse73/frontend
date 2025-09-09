import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import GraphModal from './GraphModal'

interface GraphButtonProps {
  userId: string
  className?: string
}

export default function GraphButton({
  userId,
  className = ''
}: GraphButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          group flex flex-col items-center justify-center transition-all duration-200 py-2 px-3 rounded-lg cursor-pointer
          hover:bg-blue-50 hover:shadow-sm
          ${className}
        `}
        title="View eVote trends and analytics"
        aria-label="View trends"
      >
        {/* Icon */}
        <div className="font-bold text-xl text-blue-600 group-hover:text-blue-700 group-hover:scale-105 transition-all duration-200 flex items-center">
          <TrendingUp className="w-6 h-6" />
        </div>
        
        {/* Label */}
        <div className="text-gray-500 font-medium leading-tight text-xs group-hover:text-blue-600 transition-colors duration-200">
          eVote trends
        </div>
      </button>

      {showModal && (
        <GraphModal
          userId={userId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
