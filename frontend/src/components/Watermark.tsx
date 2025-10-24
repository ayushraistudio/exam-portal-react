import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'

interface WatermarkProps {
  contestId?: string
  isVisible?: boolean
  text?: string
}

export default function Watermark({ contestId, isVisible = true, text }: WatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!isVisible || !user) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to cover the entire viewport
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Create watermark text
    const watermarkText = text || `${user.username} | ${contestId || 'Contest'} | ${new Date().toISOString()}`
    
    // Configure text style
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw watermark pattern
    const spacing = 200
    const angle = -45 * Math.PI / 180 // 45 degrees in radians

    for (let x = -spacing; x < canvas.width + spacing; x += spacing) {
      for (let y = -spacing; y < canvas.height + spacing; y += spacing) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
      }
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [isVisible, user, contestId])

  if (!isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        opacity: 0.1,
        mixBlendMode: 'multiply'
      }}
    />
  )
}
