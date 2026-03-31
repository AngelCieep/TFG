import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Draggable from 'react-draggable'

// ── Constantes del sistema de grid (grid.md §2 y §3) ──────────────────────────
const COLS = 12
const ROW_HEIGHT = 80        // px fijo para el test (en producción las filas son dinámicas)
const CONTAINER_WIDTH = 960  // px
const MAX_ROWS = 50           // máximo de filas expandibles durante el drag
const HEADER_H = 28           // altura del header interno de cada bloque

// ── Paleta de colores para bloques hijos ──────────────────────────────────────
const CHILD_COLORS = ['#fde68a', '#a7f3d0', '#bfdbfe', '#fca5a5', '#d9f99d', '#fbcfe8', '#e9d5ff', '#fed7aa']
let childIdCounter = 1

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface ChildItem {
  id: string
  label: string
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
  color: string
}

interface LayoutItem {
  id: string
  label: string
  colStart: number   // base 1
  colSpan: number
  rowStart: number   // base 1
  rowSpan: number
  color: string
  innerCols: number  // columnas del grid interior
  innerRows: number  // filas del grid interior
  children: ChildItem[]
}

// ── Estado inicial — layout de ejemplo ────────────────────────────────────────
const INITIAL_LAYOUT: LayoutItem[] = [
  { id: 'header', label: 'Header',  colStart: 1,  colSpan: 12, rowStart: 1, rowSpan: 1, color: '#4f8ef7', innerCols: 4, innerRows: 2, children: [] },
  { id: 'left',   label: 'Left',    colStart: 1,  colSpan: 3,  rowStart: 2, rowSpan: 3, color: '#f76b4f', innerCols: 2, innerRows: 3, children: [] },
  { id: 'main',   label: 'Main',    colStart: 4,  colSpan: 6,  rowStart: 2, rowSpan: 2, color: '#4fb87f', innerCols: 3, innerRows: 2, children: [] },
  { id: 'right',  label: 'Right',   colStart: 10, colSpan: 3,  rowStart: 2, rowSpan: 2, color: '#f7d44f', innerCols: 2, innerRows: 2, children: [] },
  { id: 'footer', label: 'Footer',  colStart: 4,  colSpan: 9,  rowStart: 4, rowSpan: 1, color: '#b44ff7', innerCols: 4, innerRows: 1, children: [] },
]

// ── Cálculo de filas totales (grid.md §4) ──────────────────────────────────────
// totalRows = max(rowStart_i + rowSpan_i - 1)
function calcTotalRows(items: LayoutItem[]): number {
  return Math.max(...items.map(i => i.rowStart + i.rowSpan - 1))
}

// ── InnerGridItem: bloque hijo arrastrable dentro de un GridItem ───────────────
interface InnerGridItemProps {
  child: ChildItem
  innerCellWidth: number
  innerRowHeight: number
  innerCols: number
  innerRows: number
  onStop: (id: string, colStart: number, rowStart: number) => void
  onDelete: (id: string) => void
  onEdit: (id: string, colSpan: number, rowSpan: number) => void
}

function InnerGridItem({ child, innerCellWidth, innerRowHeight, innerCols, innerRows, onStop, onDelete, onEdit }: InnerGridItemProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [zIndex, setZIndex] = useState(10)
  const [editing, setEditing] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number } | null>(null)
  const [form, setForm] = useState({ colSpan: child.colSpan, rowSpan: child.rowSpan })

  const maxColSpan = innerCols - child.colStart + 1
  const maxRowSpan = innerRows - child.rowStart + 1

  function handleConfirm() {
    const colSpan = Math.max(1, Math.min(form.colSpan, maxColSpan))
    const rowSpan = Math.max(1, Math.min(form.rowSpan, maxRowSpan))
    onEdit(child.id, colSpan, rowSpan)
    setEditing(false)
  }

  const x = (child.colStart - 1) * innerCellWidth
  const y = (child.rowStart - 1) * innerRowHeight
  const w = child.colSpan * innerCellWidth
  const h = child.rowSpan * innerRowHeight

  return (
    <>
      <Draggable
        nodeRef={nodeRef}
        grid={[innerCellWidth, innerRowHeight]}
        position={{ x, y }}
        onStart={() => setZIndex(1000)}
        onStop={(_, data) => {
          setZIndex(10)
          const newCol = Math.max(1, Math.min(Math.round(data.x / innerCellWidth) + 1, innerCols - child.colSpan + 1))
          const newRow = Math.max(1, Math.min(Math.round(data.y / innerRowHeight) + 1, innerRows - child.rowSpan + 1))
          onStop(child.id, newCol, newRow)
        }}
        bounds={{
          left: 0,
          top: 0,
          right: (innerCols - child.colSpan) * innerCellWidth,
          bottom: (innerRows - child.rowSpan) * innerRowHeight,
        }}
      >
        <div
          ref={nodeRef}
          style={{
            position: 'absolute',
            width: w,
            height: h,
            background: child.color,
            border: '1.5px solid rgba(0,0,0,0.2)',
            borderRadius: 4,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            userSelect: 'none',
            fontSize: 11,
            fontWeight: 600,
            color: '#333',
            zIndex,
          }}
        >
          <span style={{ pointerEvents: 'none' }}>{child.label}</span>
          <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
            <button
              ref={buttonRef}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                if (!editing) {
                  const rect = buttonRef.current!.getBoundingClientRect()
                  setPopoverPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                  setForm({ colSpan: child.colSpan, rowSpan: child.rowSpan })
                }
                setEditing(v => !v)
              }}
              style={{
                width: 16, height: 16,
                border: 'none', borderRadius: 3,
                background: 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                fontSize: 9, padding: 0, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Editar tamaño"
            >
              ✎
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onDelete(child.id) }}
              style={{
                width: 16, height: 16,
                border: 'none', borderRadius: 3,
                background: 'rgba(0,0,0,0.2)',
                cursor: 'pointer',
                fontSize: 9, padding: 0, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Eliminar"
            >
              ✕
            </button>
          </div>
        </div>
      </Draggable>

      {editing && popoverPos && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: popoverPos.top,
            right: popoverPos.right,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '10px 12px',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            minWidth: 180,
            cursor: 'default',
            textAlign: 'left',
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 12 }}>Editar card</p>

          <label style={{ display: 'block', fontSize: 11, marginBottom: 6 }}>
            <strong>colSpan</strong> (1–{maxColSpan})
            <input
              type="number" min={1} max={maxColSpan}
              value={form.colSpan}
              onChange={(e) => setForm(f => ({ ...f, colSpan: parseInt(e.target.value) || 1 }))}
              style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
            />
          </label>

          <label style={{ display: 'block', fontSize: 11, marginBottom: 10 }}>
            <strong>rowSpan</strong> (1–{maxRowSpan})
            <input
              type="number" min={1} max={maxRowSpan}
              value={form.rowSpan}
              onChange={(e) => setForm(f => ({ ...f, rowSpan: parseInt(e.target.value) || 1 }))}
              style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1, background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 4, padding: '5px 0',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
              }}
            >
              Aplicar
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                flex: 1, background: '#f3f4f6',
                border: '1px solid #ccc', borderRadius: 4, padding: '5px 0',
                cursor: 'pointer', fontSize: 11,
              }}
            >
              Cancelar
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── GridItem: bloque principal arrastrable con grid interior ──────────────────
interface GridItemProps {
  item: LayoutItem
  cellWidth: number
  onStop: (id: string, colStart: number, rowStart: number) => void
  onEdit: (id: string, colSpan: number, rowSpan: number, innerCols: number, innerRows: number) => void
  onFocus: () => number
  onDragMove: (previewEnd: number) => void
  onDragEnd: () => void
  onAddChild: (parentId: string) => void
  onChildStop: (parentId: string, childId: string, colStart: number, rowStart: number) => void
  onChildDelete: (parentId: string, childId: string) => void
  onChildEdit: (parentId: string, childId: string, colSpan: number, rowSpan: number) => void
}

function GridItem({ item, cellWidth, onStop, onEdit, onFocus, onDragMove, onDragEnd, onAddChild, onChildStop, onChildDelete, onChildEdit }: GridItemProps) {
  const nodeRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number } | null>(null)
  const [form, setForm] = useState({ colSpan: item.colSpan, rowSpan: item.rowSpan, innerCols: item.innerCols, innerRows: item.innerRows })
  const [zIndex, setZIndex] = useState(1)

  const x = (item.colStart - 1) * cellWidth
  const y = (item.rowStart - 1) * ROW_HEIGHT
  const w = item.colSpan * cellWidth
  const h = item.rowSpan * ROW_HEIGHT
  const maxColSpan = COLS - item.colStart + 1
  const innerAreaH = h - HEADER_H
  const innerCellWidth = w / item.innerCols
  const innerRowHeight = Math.max(1, innerAreaH / item.innerRows)

  function handleConfirm() {
    const colSpan = Math.max(1, Math.min(form.colSpan, maxColSpan))
    const rowSpan = Math.max(1, form.rowSpan)
    const innerCols = Math.max(1, form.innerCols)
    const innerRows = Math.max(1, form.innerRows)
    onEdit(item.id, colSpan, rowSpan, innerCols, innerRows)
    setEditing(false)
  }

  return (
  <>
    <Draggable
      nodeRef={nodeRef}
      handle=".block-header"
      grid={[cellWidth, ROW_HEIGHT]}
      position={{ x, y }}
      onStart={() => { setZIndex(onFocus()) }}
      onDrag={(_, data) => {
        const curRow = Math.floor(data.y / ROW_HEIGHT) + 1
        onDragMove(curRow + item.rowSpan - 1)
      }}
      bounds={{
        left: 0,
        top: 0,
        right:  (COLS     - item.colSpan) * cellWidth,
        bottom: (MAX_ROWS - item.rowSpan) * ROW_HEIGHT,
      }}
      onStop={(_, data) => {
        onDragEnd()
        const newCol = Math.round(data.x / cellWidth) + 1
        const newRow = Math.round(data.y / ROW_HEIGHT) + 1
        onStop(item.id, newCol, newRow)
      }}
    >
      <div
        ref={nodeRef}
        style={{
          position: 'absolute',
          width: w,
          height: h,
          background: item.color,
          border: '2px solid rgba(0,0,0,0.18)',
          borderRadius: 6,
          boxSizing: 'border-box',
          userSelect: 'none',
          zIndex,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header del bloque (zona de arrastre) ── */}
        <div
          className="block-header"
          style={{
            height: HEADER_H,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 6px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
            boxSizing: 'border-box',
            cursor: 'grab',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 12, color: '#222', pointerEvents: 'none' }}>
            {item.label}
            <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.6, marginLeft: 6 }}>
              col {item.colStart}+{item.colSpan} · row {item.rowStart}+{item.rowSpan}
            </span>
          </span>

          <div style={{ display: 'flex', gap: 4 }}>
            {/* Botón añadir hijo */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onAddChild(item.id) }}
              style={{
                width: 20, height: 20,
                border: 'none', borderRadius: 4,
                background: 'rgba(0,0,0,0.15)',
                cursor: 'pointer',
                fontSize: 16, fontWeight: 700,
                padding: 0, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Añadir bloque hijo"
            >
              +
            </button>

            {/* Botón edición */}
            <button
              ref={buttonRef}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                if (!editing) {
                  const rect = buttonRef.current!.getBoundingClientRect()
                  setPopoverPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                  setForm({ colSpan: item.colSpan, rowSpan: item.rowSpan, innerCols: item.innerCols, innerRows: item.innerRows })
                }
                setEditing(v => !v)
              }}
              style={{
                width: 20, height: 20,
                border: 'none', borderRadius: 4,
                background: 'rgba(0,0,0,0.15)',
                cursor: 'pointer',
                fontSize: 12, padding: 0, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Editar tamaño"
            >
              ✎
            </button>
          </div>
        </div>

        {/* ── Área interior: grid overlay + bloques hijos ── */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Grid overlay — columnas internas */}
          {Array.from({ length: item.innerCols }).map((_, i) => (
            <div
              key={`ic-${i}`}
              style={{
                position: 'absolute',
                left: i * innerCellWidth,
                top: 0,
                width: innerCellWidth,
                height: '100%',
                borderRight: i < item.innerCols - 1 ? '1px dashed rgba(0,0,0,0.28)' : 'none',
                boxSizing: 'border-box',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Grid overlay — filas internas */}
          {Array.from({ length: item.innerRows }).map((_, i) => (
            <div
              key={`ir-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                top: i * innerRowHeight,
                width: '100%',
                height: innerRowHeight,
                borderBottom: i < item.innerRows - 1 ? '1px dashed rgba(0,0,0,0.28)' : 'none',
                boxSizing: 'border-box',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Bloques hijos */}
          {item.children.map(child => (
            <InnerGridItem
              key={child.id}
              child={child}
              innerCellWidth={innerCellWidth}
              innerRowHeight={innerRowHeight}
              innerCols={item.innerCols}
              innerRows={item.innerRows}
              onStop={(childId, colStart, rowStart) => onChildStop(item.id, childId, colStart, rowStart)}
              onDelete={(childId) => onChildDelete(item.id, childId)}
              onEdit={(childId, colSpan, rowSpan) => onChildEdit(item.id, childId, colSpan, rowSpan)}
            />
          ))}

          {/* Mensaje vacío */}
          {item.children.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'rgba(0,0,0,0.3)', pointerEvents: 'none',
            }}>
              Pulsa + para añadir cards
            </div>
          )}
        </div>
      </div>
    </Draggable>

    {/* ── Popover de edición (portal → siempre encima) ── */}
    {editing && popoverPos && createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: popoverPos.top,
          right: popoverPos.right,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '10px 12px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          minWidth: 200,
          cursor: 'default',
          textAlign: 'left',
        }}
      >
        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 12 }}>Editar bloque</p>

        {/* ── Tamaño en el grid exterior ── */}
        <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Tamaño en el grid
        </p>

        <label style={{ display: 'block', fontSize: 11, marginBottom: 6 }}>
          <strong>colSpan</strong> (1–{maxColSpan})
          <input
            type="number" min={1} max={maxColSpan}
            value={form.colSpan}
            onChange={(e) => setForm(f => ({ ...f, colSpan: parseInt(e.target.value) || 1 }))}
            style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', fontSize: 11, marginBottom: 10 }}>
          <strong>rowSpan</strong> (≥1)
          <input
            type="number" min={1}
            value={form.rowSpan}
            onChange={(e) => setForm(f => ({ ...f, rowSpan: parseInt(e.target.value) || 1 }))}
            style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
          />
        </label>

        <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '8px 0' }} />

        {/* ── División del grid interior ── */}
        <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Grid interior
        </p>

        <label style={{ display: 'block', fontSize: 11, marginBottom: 6 }}>
          <strong>Columnas internas</strong> (≥1)
          <input
            type="number" min={1}
            value={form.innerCols}
            onChange={(e) => setForm(f => ({ ...f, innerCols: parseInt(e.target.value) || 1 }))}
            style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
          />
        </label>

        <label style={{ display: 'block', fontSize: 11, marginBottom: 10 }}>
          <strong>Filas internas</strong> (≥1)
          <input
            type="number" min={1}
            value={form.innerRows}
            onChange={(e) => setForm(f => ({ ...f, innerRows: parseInt(e.target.value) || 1 }))}
            style={{ display: 'block', width: '100%', marginTop: 3, boxSizing: 'border-box' }}
          />
        </label>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 4, padding: '5px 0',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
            }}
          >
            Aplicar
          </button>
          <button
            onClick={() => setEditing(false)}
            style={{
              flex: 1, background: '#f3f4f6',
              border: '1px solid #ccc', borderRadius: 4, padding: '5px 0',
              cursor: 'pointer', fontSize: 11,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>,
      document.body
    )}
  </>
  )
}

// ── GridDragTest ───────────────────────────────────────────────────────────────
export function GridDragTest() {
  const [layout, setLayout] = useState<LayoutItem[]>(INITIAL_LAYOUT)
  const [dragPreviewRows, setDragPreviewRows] = useState<number | null>(null)
  const topZRef = useRef(1)

  const cellWidth = CONTAINER_WIDTH / COLS
  const rows = calcTotalRows(layout)
  const displayRows = Math.max(rows, dragPreviewRows ?? 0)

  function handleStop(id: string, newColStart: number, newRowStart: number) {
    setLayout(prev =>
      prev.map(item => item.id === id ? { ...item, colStart: newColStart, rowStart: newRowStart } : item)
    )
  }

  function handleDragMove(previewEnd: number) { setDragPreviewRows(previewEnd) }
  function handleDragEnd()                     { setDragPreviewRows(null) }
  function handleFocus(): number               { topZRef.current += 1; return topZRef.current }

  function handleEdit(id: string, colSpan: number, rowSpan: number, innerCols: number, innerRows: number) {
    setLayout(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        const colStart = Math.min(item.colStart, COLS - colSpan + 1)
        // Clamp children al nuevo tamaño de grid interior
        const children = item.children.map(c => {
          const cs = Math.min(c.colStart, innerCols)
          const rs = Math.min(c.rowStart, innerRows)
          return {
            ...c,
            colStart: cs,
            rowStart: rs,
            colSpan: Math.min(c.colSpan, innerCols - cs + 1),
            rowSpan: Math.min(c.rowSpan, innerRows - rs + 1),
          }
        })
        return { ...item, colStart, colSpan, rowSpan, innerCols, innerRows, children }
      })
    )
  }

  function handleAddChild(parentId: string) {
    setLayout(prev =>
      prev.map(item => {
        if (item.id !== parentId) return item
        const newChild: ChildItem = {
          id: `child-${childIdCounter++}`,
          label: `Card ${item.children.length + 1}`,
          colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 1,
          color: CHILD_COLORS[item.children.length % CHILD_COLORS.length],
        }
        return { ...item, children: [...item.children, newChild] }
      })
    )
  }

  function handleChildStop(parentId: string, childId: string, colStart: number, rowStart: number) {
    setLayout(prev =>
      prev.map(item => {
        if (item.id !== parentId) return item
        return { ...item, children: item.children.map(c => c.id === childId ? { ...c, colStart, rowStart } : c) }
      })
    )
  }

  function handleChildEdit(parentId: string, childId: string, colSpan: number, rowSpan: number) {
    setLayout(prev =>
      prev.map(item => {
        if (item.id !== parentId) return item
        return {
          ...item,
          children: item.children.map(c => {
            if (c.id !== childId) return c
            return {
              ...c,
              colSpan: Math.max(1, Math.min(colSpan, item.innerCols - c.colStart + 1)),
              rowSpan: Math.max(1, Math.min(rowSpan, item.innerRows - c.rowStart + 1)),
            }
          }),
        }
      })
    )
  }

  function handleChildDelete(parentId: string, childId: string) {
    setLayout(prev =>
      prev.map(item => {
        if (item.id !== parentId) return item
        return { ...item, children: item.children.filter(c => c.id !== childId) }
      })
    )
  }

  return (
    <section style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Test de grid — sistema de cuadrícula (12 columnas)</h2>
      <p style={{ color: '#555', marginTop: 0 }}>
        Arrastra los bloques por el <strong>header</strong>. Pulsa <strong>+</strong> para añadir
        cards internas. Usa <strong>✎</strong> para editar tamaño y división del grid interior.
      </p>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Contenedor del grid ── */}
        <div
          style={{
            position: 'relative',
            width: CONTAINER_WIDTH,
            height: displayRows * ROW_HEIGHT,
            flexShrink: 0,
            background: '#f4f4f4',
            border: '1px solid #ccc',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          {/* Overlay columnas */}
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={`col-${i}`} style={{
              position: 'absolute', left: i * cellWidth, top: 0,
              width: cellWidth, height: '100%',
              borderRight: i < COLS - 1 ? '2px solid rgba(0,0,0,0.2)' : 'none',
              boxSizing: 'border-box', pointerEvents: 'none',
            }} />
          ))}

          {/* Overlay filas */}
          {Array.from({ length: displayRows }).map((_, i) => {
            const isExtra = i >= rows
            return (
              <div key={`row-${i}`} style={{
                position: 'absolute', left: 0, top: i * ROW_HEIGHT,
                width: '100%', height: ROW_HEIGHT,
                background: isExtra ? 'rgba(37,99,235,0.04)' : undefined,
                borderBottom: i < displayRows - 1
                  ? isExtra ? '2px dashed rgba(37,99,235,0.35)' : '2px solid rgba(0,0,0,0.2)'
                  : 'none',
                boxSizing: 'border-box', pointerEvents: 'none',
              }} />
            )
          })}

          {/* Etiquetas de columna */}
          {Array.from({ length: COLS }).map((_, i) => (
            <div key={`label-${i}`} style={{
              position: 'absolute', left: i * cellWidth, top: 4, width: cellWidth,
              textAlign: 'center', fontSize: 9, fontWeight: 700,
              color: 'rgba(0,0,0,0.45)', pointerEvents: 'none', zIndex: 0,
            }}>
              {i + 1}
            </div>
          ))}

          {/* Bloques arrastrables */}
          {layout.map(item => (
            <GridItem
              key={item.id}
              item={item}
              cellWidth={cellWidth}
              onStop={handleStop}
              onEdit={handleEdit}
              onFocus={handleFocus}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onAddChild={handleAddChild}
              onChildStop={handleChildStop}
              onChildDelete={handleChildDelete}
              onChildEdit={handleChildEdit}
            />
          ))}
        </div>

        {/* ── JSON en tiempo real ── */}
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13 }}>Layout JSON</p>
          <pre style={{
            background: '#1e1e1e', color: '#d4d4d4',
            padding: 16, borderRadius: 8, fontSize: 11, lineHeight: 1.6,
            overflow: 'auto', maxHeight: rows * ROW_HEIGHT, margin: 0,
          }}>
            {JSON.stringify(
              layout.map(({ id, label, colStart, colSpan, rowStart, rowSpan, innerCols, innerRows, children }) => ({
                id, label,
                layout: { colStart, colSpan, rowStart, rowSpan },
                inner: { cols: innerCols, rows: innerRows },
                children: children.map(c => ({
                  id: c.id, label: c.label,
                  layout: { colStart: c.colStart, colSpan: c.colSpan, rowStart: c.rowStart, rowSpan: c.rowSpan },
                })),
              })),
              null, 2,
            )}
          </pre>
          <p style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
            totalRows = max(rowStart + rowSpan − 1) = <strong>{rows}</strong>
          </p>
        </div>
      </div>
    </section>
  )
}

