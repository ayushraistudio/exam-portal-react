import { useEffect, useRef } from 'react'
import { Question } from '../types'

interface QuestionCanvasProps {
  question: Question
  selectedAnswer?: number
  onAnswerSelect?: (answer: number) => void
  onAnswerChange?: (answer: number) => void
  isSubmitted?: boolean
  showCorrectAnswer?: boolean
}

export default function QuestionCanvas({
  question,
  selectedAnswer,
  onAnswerSelect,
  onAnswerChange,
  isSubmitted = false,
  showCorrectAnswer = false
}: QuestionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = Math.max(400, container.clientHeight)
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Draw question text
    ctx.fillStyle = '#111827'
    ctx.font = '18px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const padding = 24
    const lineHeight = 28
    const maxWidth = canvas.width - (padding * 2)

    // Wrap text function
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ')
      let line = ''
      let currentY = y

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x, currentY)
      return currentY + lineHeight
    }

    // Draw question number and text
    let currentY = padding
    ctx.fillText(`Question ${question.order}:`, padding, currentY)
    currentY += lineHeight + 8

    currentY = wrapText(question.text, padding, currentY, maxWidth, lineHeight) + 16

    // Draw options
    ctx.font = '16px Inter, sans-serif'
    question.options.forEach((option, index) => {
      const optionY = currentY + (index * 60)
      
      // Draw option circle
      ctx.beginPath()
      ctx.arc(padding + 20, optionY + 20, 8, 0, 2 * Math.PI)
      
      if (selectedAnswer === index) {
        ctx.fillStyle = '#3b82f6'
        ctx.fill()
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw inner circle for selected
        ctx.beginPath()
        ctx.arc(padding + 20, optionY + 20, 4, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      } else {
        ctx.strokeStyle = '#d1d5db'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw option text
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      
      const optionText = `${String.fromCharCode(65 + index)}) ${option}`
      wrapText(optionText, padding + 40, optionY + 20, maxWidth - 40, lineHeight)
    })

    // Draw correct answer indicator (if showing results)
    if (showCorrectAnswer && question.correctAnswer !== undefined) {
      const correctY = currentY + (question.correctAnswer * 60)
      
      // Draw green border around correct answer
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.strokeRect(
        padding + 10,
        correctY - 5,
        maxWidth - 20,
        50
      )

      // Draw "Correct Answer" label
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.fillText('Correct Answer', padding + 20, correctY - 10)
    }

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [question, selectedAnswer, showCorrectAnswer])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSubmitted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is on an option circle
    const padding = 24
    const optionHeight = 60
    const circleX = padding + 20
    const startY = padding + 100 // Approximate start of options

    for (let i = 0; i < question.options.length; i++) {
      const optionY = startY + (i * optionHeight)
      const circleY = optionY + 20
      
      const distance = Math.sqrt((x - circleX) ** 2 + (y - circleY) ** 2)
      
      if (distance <= 12) { // Click within circle radius
        onAnswerSelect?.(i)
        onAnswerChange?.(i)
        break
      }
    }
  }

  return (
    <div className="question-canvas-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="question-canvas w-full cursor-pointer"
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}
      />
    </div>
  )
}
