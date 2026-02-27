import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Calculator from './CalculatorComponent'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Calculator />
  </StrictMode>
)
