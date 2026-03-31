import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { translate, TRANSLATOR_OPTIONS, type MemeLanguage } from '../utils/memeTranslators'
import { buildCartUrl } from '../utils/cartUrl'
import '../styles/translator.css'

const DC_ORIGIN = 'https://www.donorschoose.org'
const PROXY_PREFIX = '/dc-site'
const DEFAULT_PATH = '/donors/search.html'
const PROJECT_RE = /\/project\/[^/]+\/(\d+)/

function toProxyUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('donorschoose.org')) {
      return PROXY_PREFIX + u.pathname + u.search
    }
  } catch {
    // not a full URL — treat as path
    if (url.startsWith('/')) return PROXY_PREFIX + url
  }
  return PROXY_PREFIX + DEFAULT_PATH
}

function toDisplayUrl(proxyPath: string): string {
  const stripped = proxyPath.replace(new RegExp(`^${PROXY_PREFIX}`), '')
  return DC_ORIGIN + (stripped || '/')
}

function extractProjectId(path: string): string | null {
  const m = path.match(PROJECT_RE)
  return m ? m[1] : null
}

export default function TranslatorApp() {
  const navigate = useNavigate()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [addressBar, setAddressBar] = useState(DC_ORIGIN + DEFAULT_PATH)
  const [iframeSrc, setIframeSrc] = useState(PROXY_PREFIX + DEFAULT_PATH)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<MemeLanguage | null>(null)

  const isProjectPage = projectId !== null

  /* ── Navigation ── */

  const navigateTo = useCallback((url: string) => {
    const proxied = toProxyUrl(url)
    setIframeSrc(proxied)
    setAddressBar(toDisplayUrl(proxied))
    setActiveLanguage(null)
    setShowMenu(false)
  }, [])

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigateTo(addressBar)
  }

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentWindow?.document
      const loc = iframeRef.current?.contentWindow?.location
      if (!loc || !doc) return

      // Override frame-busting CSS that hides the body
      doc.body.style.display = 'block'

      // Update address bar with real path
      const path = loc.pathname + loc.search
      setAddressBar(toDisplayUrl(path))

      // Detect project page
      setProjectId(extractProjectId(path))
      setActiveLanguage(null)
      setShowMenu(false)

      // Rewrite links to stay on proxy and remove target="_top"
      const anchors = doc.querySelectorAll('a[href]')
      anchors.forEach((a) => {
        // Remove target="_top" which would break out of iframe
        if (a.getAttribute('target') === '_top') {
          a.removeAttribute('target')
        }

        const href = a.getAttribute('href')
        if (!href) return
        if (href.startsWith('https://www.donorschoose.org')) {
          a.setAttribute('href', href.replace(DC_ORIGIN, PROXY_PREFIX))
        } else if (href.startsWith('https://donorschoose.org')) {
          a.setAttribute('href', href.replace('https://donorschoose.org', PROXY_PREFIX))
        } else if (href.startsWith('/') && !href.startsWith(PROXY_PREFIX)) {
          // Relative paths need proxy prefix
          a.setAttribute('href', PROXY_PREFIX + href)
        }
      })

      // Rewrite form actions too
      const forms = doc.querySelectorAll('form[action]')
      forms.forEach((f) => {
        const action = f.getAttribute('action')
        if (action && action.startsWith('/') && !action.startsWith(PROXY_PREFIX)) {
          f.setAttribute('action', PROXY_PREFIX + action)
        }
      })

      // Intercept clicks to catch dynamically generated links
      doc.addEventListener('click', (e: Event) => {
        const anchor = (e.target as Element).closest?.('a[href]')
        if (!anchor) return
        const href = anchor.getAttribute('href')
        if (!href) return
        if (href.startsWith('https://www.donorschoose.org') || href.startsWith('https://donorschoose.org')) {
          e.preventDefault()
          const proxied = href.replace(DC_ORIGIN, PROXY_PREFIX).replace('https://donorschoose.org', PROXY_PREFIX)
          iframeRef.current!.contentWindow!.location.href = proxied
        }
      })
    } catch {
      // cross-origin — can't access
    }
  }

  /* ── Translation ── */

  const handleTranslate = async (language: MemeLanguage) => {
    setShowMenu(false)
    setIsTranslating(true)

    // Small delay so overlay renders
    await new Promise((r) => setTimeout(r, 100))

    try {
      const doc = iframeRef.current?.contentWindow?.document
      if (!doc) return

      // Walk all text nodes and translate
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const tag = node.parentElement?.tagName
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT
          }
          return node.textContent && node.textContent.trim().length > 1
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT
        },
      })

      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)

      // Translate in batches to stay responsive
      const BATCH = 50
      for (let i = 0; i < nodes.length; i += BATCH) {
        const batch = nodes.slice(i, i + BATCH)
        batch.forEach((node) => {
          if (node.textContent) {
            node.textContent = translate(node.textContent, language)
          }
        })
        if (i + BATCH < nodes.length) {
          await new Promise((r) => setTimeout(r, 0))
        }
      }

      setActiveLanguage(language)
    } catch {
      // ignore errors
    }

    setIsTranslating(false)
    fireConfetti()
  }

  /* ── Confetti ── */

  const fireConfetti = () => {
    const scalar = 2
    const translateShape = confetti.shapeFromText({ text: '🗣️', scalar })

    const defaults = {
      spread: 160,
      ticks: 100,
      gravity: 0.6,
      decay: 0.96,
      startVelocity: 20,
      shapes: [translateShape],
      scalar,
    }

    confetti({ ...defaults, particleCount: 30, origin: { x: 0.2, y: 0.0 } })
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.5, y: 0.0 } })
    confetti({ ...defaults, particleCount: 30, origin: { x: 0.8, y: 0.0 } })
  }

  /* ── Donate ── */

  const donateUrl = projectId
    ? buildCartUrl([{ proposalId: projectId, amount: 10 }])
    : '#'

  /* ── Render ── */

  const langLabel = activeLanguage
    ? TRANSLATOR_OPTIONS.find((o) => o.id === activeLanguage)?.label
    : null

  return (
    <div className="translator-app">
      {/* Top bar */}
      <div className="translator-topbar">
        <button className="translator-home-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <div className="translator-address-bar">
          <input
            value={addressBar}
            onChange={(e) => setAddressBar(e.target.value)}
            onKeyDown={handleAddressKeyDown}
            placeholder="Enter a DonorsChoose URL..."
          />
          <button className="translator-go-btn" onClick={() => navigateTo(addressBar)}>
            Go
          </button>
        </div>
      </div>

      {/* Badge showing active translation */}
      {langLabel && (
        <div className="translator-badge">
          Translated to {langLabel}
        </div>
      )}

      {/* Iframe */}
      <div className="translator-iframe-wrap">
        <div className="translator-iframe-inner">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="translator-iframe"
            onLoad={handleIframeLoad}
          />
          {isTranslating && (
            <div className="translator-overlay">
              <div className="translator-spinner" />
              <span className="translator-overlay-text">Translating...</span>
            </div>
          )}
        </div>
      </div>

      {/* FAB + Language menu (project pages only) */}
      {isProjectPage && (
        <>
          <button
            className={`translator-fab${showMenu ? ' active' : ''}`}
            onClick={() => setShowMenu((v) => !v)}
          >
            🗣️
          </button>

          {showMenu && (
            <div className="translator-lang-menu">
              {TRANSLATOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className="translator-lang-btn"
                  onClick={() => handleTranslate(opt.id)}
                >
                  <span className="lang-emoji">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="translator-donate-bar">
            <a
              className="translator-donate-btn"
              href={donateUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              🎁 Donate to this project
            </a>
          </div>
        </>
      )}
    </div>
  )
}
