import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RouterRoot from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterRoot />
  </StrictMode>,
)
