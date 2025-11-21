import { Routes, Route } from 'react-router-dom'
import HomePage from './routes/HomePage'
import PairingDrawPage from './routes/PairingDrawPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pairing-draw" element={<PairingDrawPage />} />
    </Routes>
  )
}

export default App
