import './App.css'
import { GridDragTest } from './GridDragTest'

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 1260, margin: '0 auto' }}>
      <header style={{ padding: '20px 24px 12px', borderBottom: '2px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>react-draggable — Test de grid</h1>
      </header>

      <GridDragTest />
    </div>
  )
}

export default App
