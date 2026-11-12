import { lazy, Suspense, useEffect } from 'react'
import { Route, Router, Switch, useLocation } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import { flushPendingSaves } from './components/hooks'
import { Logo } from './components/Logo'
import { Sidebar, TabBar } from './components/Nav'
import { Toaster } from './components/Toaster'
import { UpdatePrompt } from './components/UpdatePrompt'
import { useLoadError, useReady } from './data/store'
import { Cigars } from './screens/Cigars'
import { Home } from './screens/Home'
import { Journal } from './screens/Journal'
import { LogFinish } from './screens/LogFinish'
import { LogPicker } from './screens/LogPicker'
import { LogScores } from './screens/LogScores'

// The front page, the journal, the cigar list, and the quick log open at once. The other
// screens load the first time they are opened. Every one is kept on the device, so this
// works with no signal.
const Compare = lazy(() => import('./screens/Compare').then((m) => ({ default: m.Compare })))
const Humidor = lazy(() => import('./screens/Humidor').then((m) => ({ default: m.Humidor })))
const LogFull = lazy(() => import('./screens/LogFull').then((m) => ({ default: m.LogFull })))
const Lounge = lazy(() => import('./screens/Lounge').then((m) => ({ default: m.Lounge })))
const Picks = lazy(() => import('./screens/Picks').then((m) => ({ default: m.Picks })))
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })))
const Stats = lazy(() => import('./screens/Stats').then((m) => ({ default: m.Stats })))
const Wishlist = lazy(() => import('./screens/Wishlist').then((m) => ({ default: m.Wishlist })))

// Dev tools are compiled out of the production build.
const DevScreen = import.meta.env.DEV ? lazy(() => import('./dev/DevScreen')) : null

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** Which lithograph fills the page behind this screen. */
function groundFor(path: string): string {
  if (path.startsWith('/journal') || path.startsWith('/smokes')) return 'salon'
  if (path.startsWith('/cigars')) return 'cigar'
  if (path.startsWith('/humidor')) return 'humidor'
  if (path.startsWith('/lounge')) return 'salon'
  if (path.startsWith('/picks')) return 'salon'
  if (path.startsWith('/wishlist')) return 'cigar'
  if (path.startsWith('/stats')) return 'medal'
  if (path.startsWith('/compare')) return 'pair'
  if (path.startsWith('/log')) return 'cigar'
  return 'villa'
}

function Shell() {
  // Only these two. A save changes neither, so the shell is not redrawn by one.
  const ready = useReady()
  const loadError = useLoadError()
  const [path, navigate] = useLocation()
  const inFlow = path.startsWith('/log')

  // Start each screen at the top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on every route change
  useEffect(() => {
    // Block body on purpose: newer Chrome returns a Promise from scrollTo.
    window.scrollTo(0, 0)
  }, [path])

  // Save anything still being typed when the page is hidden or closed.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushPendingSaves()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flushPendingSaves)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flushPendingSaves)
    }
  }, [])

  // "/" focuses search, "n" starts a new log. Neither fires while typing in a field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return
      if (document.querySelector('dialog[open]')) return
      if (event.key === '/') {
        event.preventDefault()
        // Focus the search on this screen if it has one, otherwise go to the journal's.
        const find = () =>
          document.querySelector<HTMLElement>('#journal-search, #cigar-list-search, #lounge-search')
        if (!find()) navigate('/journal')
        requestAnimationFrame(() => find()?.focus())
      } else if (event.key === 'n') {
        event.preventDefault()
        navigate('/log')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  if (loadError) {
    return (
      <>
        <UpdatePrompt />
        <div className="page">
          <h1>Could not open your journal</h1>
          <p className="error-text" role="alert">
            {loadError}
          </p>
          <p className="muted">Your data has not been changed. Close the app and open it again.</p>
        </div>
      </>
    )
  }

  if (!ready) {
    return (
      <>
        <UpdatePrompt />
        <div className="splash" role="status" aria-label="Opening your journal">
          <Logo className="splash-mark" />
        </div>
      </>
    )
  }

  return (
    <div className={inFlow ? 'app in-flow' : 'app'} data-ground={groundFor(path)}>
      <Sidebar />
      <main className="app-main">
        <UpdatePrompt />
        <Suspense fallback={<div className="page" aria-busy="true" />}>
          <Switch>
            <Route path="/">
              <Home />
            </Route>
            <Route path="/journal">
              <Journal />
            </Route>
            <Route path="/smokes/:id">{(params) => <Journal selectedId={params.id} />}</Route>
            <Route path="/log">
              <LogPicker />
            </Route>
            <Route path="/log/:id/scores">{(params) => <LogScores id={params.id} />}</Route>
            <Route path="/log/:id/finish">{(params) => <LogFinish id={params.id} />}</Route>
            <Route path="/log/:id/full/:step">
              {(params) => <LogFull id={params.id} step={params.step} />}
            </Route>
            <Route path="/humidor">
              <Humidor />
            </Route>
            <Route path="/humidor/:id">{(params) => <Humidor selectedId={params.id} />}</Route>
            <Route path="/stats">
              <Stats />
            </Route>
            <Route path="/cigars">
              <Cigars />
            </Route>
            <Route path="/cigars/:id">{(params) => <Cigars selectedId={params.id} />}</Route>
            <Route path="/lounge">
              <Lounge />
            </Route>
            <Route path="/lounge/:id">{(params) => <Lounge selectedId={params.id} />}</Route>
            <Route path="/picks">
              <Picks />
            </Route>
            <Route path="/wishlist">
              <Wishlist />
            </Route>
            <Route path="/compare">
              <Compare />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            {DevScreen && (
              <Route path="/dev">
                <DevScreen />
              </Route>
            )}
            <Route>
              <Home />
            </Route>
          </Switch>
        </Suspense>
      </main>
      {!inFlow && <TabBar />}
      <Toaster />
    </div>
  )
}

export function App() {
  return (
    <Router hook={useHashLocation}>
      <Shell />
    </Router>
  )
}
