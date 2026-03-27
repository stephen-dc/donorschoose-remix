import { useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const STATE_ABBR: Record<string, string> = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR',
  California: 'CA', Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  Florida: 'FL', Georgia: 'GA', Hawaii: 'HI', Idaho: 'ID',
  Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH', Oklahoma: 'OK',
  Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX', Utah: 'UT',
  Vermont: 'VT', Virginia: 'VA', Washington: 'WA', 'West Virginia': 'WV',
  Wisconsin: 'WI', Wyoming: 'WY',
}

interface Props {
  loading: boolean
  onStateClick: (abbr: string, name: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Geos = Geographies as React.ComponentType<{ geography: string; children: (args: { geographies: any[] }) => React.ReactNode }>

export default function DartsMap({ loading, onStateClick }: Props) {
  const [clickedState, setClickedState] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleClick(geo: any) {
    if (loading) return
    const name: string = geo.properties.name
    const abbr = STATE_ABBR[name]
    if (!abbr) return
    setClickedState(name)
    onStateClick(abbr, name)
  }

  return (
    <div className="darts-map-container">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        className="darts-map-svg"
      >
        <Geos geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.name
              const isClicked = clickedState === name

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(geo)}
                  style={{
                    default: {
                      fill: isClicked ? '#ea580c' : '#1e293b',
                      stroke: '#0f172a',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: loading ? 'wait' : 'crosshair',
                      opacity: loading && !isClicked ? 0.5 : 1,
                      transition: 'fill 0.15s, opacity 0.2s',
                    },
                    hover: {
                      fill: isClicked ? '#ea580c' : '#ca8a04',
                      stroke: '#0f172a',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: loading ? 'wait' : 'crosshair',
                    },
                    pressed: {
                      fill: '#ea580c',
                      stroke: '#0f172a',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                  }}
                />
              )
            })
          }
        </Geos>
      </ComposableMap>

      {loading && (
        <div className="darts-map-loading">
          <div className="darts-map-loading-inner">
            <span className="darts-spinner">🎯</span>
            <p>Finding a classroom…</p>
          </div>
        </div>
      )}
    </div>
  )
}
