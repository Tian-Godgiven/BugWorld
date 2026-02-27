import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Tile 拖拽功能
 */
export function useDraggable(elementRef: any, options: {
  disabled?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
} = {}) {
  const isDragging = ref(false)
  const position = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })

  let startX = 0
  let startY = 0

  function handleMouseDown(e: MouseEvent) {
    if (options.disabled) return

    const target = e.target as HTMLElement
    // 只允许从 tile_name 拖拽
    if (!target.classList.contains('tile_name')) return

    isDragging.value = true
    startX = e.clientX - position.value.x
    startY = e.clientY - position.value.y

    if (options.onDragStart) {
      options.onDragStart()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging.value) return

    position.value.x = e.clientX - startX
    position.value.y = e.clientY - startY

    if (elementRef.value) {
      elementRef.value.style.left = position.value.x + 'px'
      elementRef.value.style.top = position.value.y + 'px'
    }
  }

  function handleMouseUp() {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)

    if (options.onDragEnd) {
      options.onDragEnd()
    }
  }

  onMounted(() => {
    if (elementRef.value) {
      elementRef.value.addEventListener('mousedown', handleMouseDown)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('mousedown', handleMouseDown)
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    isDragging,
    position
  }
}

/**
 * Tile z-index 管理
 */
let highestZIndex = 1

export function useZIndex() {
  const zIndex = ref(1)

  function bringToFront() {
    highestZIndex++
    zIndex.value = highestZIndex
  }

  return {
    zIndex,
    bringToFront
  }
}

/**
 * Tile 尺寸调整功能
 */
export function useResizable(elementRef: any, options: {
  disabled?: boolean
  minWidth?: number
  minHeight?: number
} = {}) {
  const isResizing = ref(false)
  const size = ref({ width: 300, height: 400 })

  let startX = 0
  let startY = 0
  let startWidth = 0
  let startHeight = 0

  function handleMouseDown(e: MouseEvent) {
    if (options.disabled) return

    const target = e.target as HTMLElement
    if (!target.classList.contains('resize-handle')) return

    isResizing.value = true
    startX = e.clientX
    startY = e.clientY
    startWidth = elementRef.value.offsetWidth
    startHeight = elementRef.value.offsetHeight

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    e.preventDefault()
    e.stopPropagation()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing.value) return

    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    const newWidth = Math.max(options.minWidth || 200, startWidth + deltaX)
    const newHeight = Math.max(options.minHeight || 50, startHeight + deltaY)

    size.value.width = newWidth
    size.value.height = newHeight

    if (elementRef.value) {
      elementRef.value.style.width = newWidth + 'px'
      elementRef.value.style.height = newHeight + 'px'
    }
  }

  function handleMouseUp() {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  onMounted(() => {
    if (elementRef.value) {
      elementRef.value.addEventListener('mousedown', handleMouseDown)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      elementRef.value.removeEventListener('mousedown', handleMouseDown)
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    isResizing,
    size
  }
}
