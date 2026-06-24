import { useRef } from 'react'

const HorizontalScrollRow = ({ children, className = '' }) => {
  const rowRef = useRef(null)
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0 })

  const startDrag = (event) => {
    if (!rowRef.current) return
    dragState.current = {
      active: true,
      startX: event.pageX,
      scrollLeft: rowRef.current.scrollLeft
    }
    rowRef.current.classList.add('cursor-grabbing')
  }

  const stopDrag = () => {
    dragState.current.active = false
    rowRef.current?.classList.remove('cursor-grabbing')
  }

  const moveDrag = (event) => {
    if (!dragState.current.active || !rowRef.current) return
    event.preventDefault()
    const delta = event.pageX - dragState.current.startX
    rowRef.current.scrollLeft = dragState.current.scrollLeft - delta * 1.15
  }

  return (
    <div
      ref={rowRef}
      onMouseDown={startDrag}
      onMouseLeave={stopDrag}
      onMouseUp={stopDrag}
      onMouseMove={moveDrag}
      className={`no-scrollbar -mx-5 flex cursor-grab select-none gap-3 overflow-x-auto px-5 ${className}`}
    >
      {children}
    </div>
  )
}

export default HorizontalScrollRow
