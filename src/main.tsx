import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore } from './data/store'
import { startSync } from './sync/auto'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import './styles/finish.css'

// Sync starts only once the journal has loaded, and never holds it up.
void initStore().then(() => startSync())

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
