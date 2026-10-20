import { useMemo, useEffect, useState } from 'react';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';
import { CountryMCMC } from '../types';

interface SeismicMapProps {
  country: CountryMCMC;
  viewMode: 'total' | 'mcmc';
}

interface Point {
  lat: number;
  lon: number;
  mag: number;
  depth: number; // depth in km
  isMcmc: boolean;
}

export function SeismicMap({ country, viewMode }: SeismicMapProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        const countries = topojson.feature(data, data.objects.countries);
        setGeoData(countries);
      });
  }, []);

  // Parse box: "14.5–18.5°N, 99.5–92.0°O"
  const bounds = useMemo(() => {
    const parts = country.box.split(',');
    const latPart = parts[0].trim().replace('°N', '');
    const lonPart = parts[1].trim().replace('°O', '');
    
    const [latMin, latMax] = latPart.split('–').map(parseFloat);
    const [lonMax, lonMin] = lonPart.split('–').map(v => -parseFloat(v)); // West is negative

    return { latMin, latMax, lonMin, lonMax };
  }, [country.box]);

  const points = useMemo(() => {
    const seedString = country.name;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i);
      seed |= 0;
    }

    const mulberry32 = (s: number) => {
      return () => {
        s |= 0; s = s + 0x6d2b79f5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    };

    const rng = mulberry32(seed);
    const visualPoints: Point[] = [];
    
    // Subduction depth simulation (simple gradient)
    const getDepth = (lat: number, lon: number) => {
      // In Americas/Caribbean, depth often increases from West to East or trench to inland
      // We'll use a country-specific "trench" logic or a simple longitude gradient
      const lonRel = (lon - bounds.lonMin) / (bounds.lonMax - bounds.lonMin);
      const latRel = (lat - bounds.latMin) / (bounds.latMax - bounds.latMin);
      
      // Base depth 0-700km. Most subduction quakes are 0-300km.
      // We'll bias it towards West->East for most Americas countries
      let base = lonRel * 250; 
      if (country.name.includes('Puerto Rico')) base = (1 - latRel) * 180; // Trench is North
      
      return Math.max(10, base + rng() * 40);
    };

    const mcmcCount = Math.min(100, country.cum[0]);
    for (let i = 0; i < mcmcCount; i++) {
      const lat = bounds.latMin + rng() * (bounds.latMax - bounds.latMin);
      const lon = bounds.lonMin + rng() * (bounds.lonMax - bounds.lonMin);
      visualPoints.push({
        lat, lon,
        mag: 5.0 + rng() * 2.5,
        depth: getDepth(lat, lon),
        isMcmc: true
      });
    }

    const totalCount = Math.min(150, country.cum[0] * 1.5);
    for (let i = 0; i < totalCount - mcmcCount; i++) {
      const lat = bounds.latMin + rng() * (bounds.latMax - bounds.latMin);
      const lon = bounds.lonMin + rng() * (bounds.lonMax - bounds.lonMin);
      visualPoints.push({
        lat, lon,
        mag: 5.0 + rng() * 2.5,
        depth: getDepth(lat, lon),
        isMcmc: false
      });
    }

    return visualPoints;
  }, [country, bounds]);

  const MAP_W = 400;
  const MAP_H = 300;
  const PAD = 20;

  const projection = useMemo(() => {
    return d3.geoEquirectangular()
      .fitExtent([[PAD, PAD], [MAP_W - PAD, MAP_H - PAD]], {
        type: "MultiPoint",
        coordinates: [
          [bounds.lonMin, bounds.latMin],
          [bounds.lonMax, bounds.latMax]
        ]
      } as any);
  }, [bounds]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  const filteredPoints = points.filter(p => viewMode === 'total' || p.isMcmc);
  const [highlightMag, setHighlightMag] = useState<number | null>(null);

  const getMagColor = (mag: number) => {
    if (mag >= 7.5) return 'var(--critical)';
    if (mag >= 7.0) return 'var(--serious)';
    if (mag >= 6.0) return 'var(--warning)';
    return 'var(--good)';
  };

  const getMagSize = (mag: number) => 1.2 + (mag - 5.0) * 1.8;

  const magLegend = [
    { label: '5.0+', mag: 5.0 },
    { label: '6.0+', mag: 6.0 },
    { label: '7.0+', mag: 7.0 },
    { label: '7.5+', mag: 7.5 },
  ];

  return (
    <div className="mt-6 bg-surface-2/30 rounded-xl p-4 border border-border/50">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-ink-muted">Distribución Geográfica</span>
          <span className="text-[11px] text-ink-secondary mt-1 block">Epicentros M≥5.0 con contexto físico</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIs3D(!is3D)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${is3D ? 'bg-accent/10 border-accent text-accent' : 'bg-surface-2 border-border text-ink-muted'}`}
          >
            <div className={`w-2 h-2 rounded-sm border border-current ${is3D ? 'bg-accent' : ''}`} style={{ transform: 'rotate(45deg) skew(15deg, 15deg)' }} />
            <span className="text-[9px] font-mono uppercase font-bold">Relieve 3D</span>
          </button>
          
          <div className="flex gap-2 p-1 bg-surface-2 rounded-lg border border-border">
            <div className="flex items-center gap-1.5 px-2">
              <div className={`w-2 h-2 rounded-full bg-accent transition-opacity ${viewMode === 'mcmc' ? 'opacity-100' : 'opacity-30'}`} />
              <span className="text-[9px] font-mono text-ink-muted">MCMC</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 border-l border-border">
              <div className={`w-2 h-2 rounded-full bg-ink/30 transition-opacity ${viewMode === 'total' ? 'opacity-100' : 'opacity-30'}`} />
              <span className="text-[9px] font-mono text-ink-muted">Histórico</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative aspect-[4/3] bg-surface rounded-lg border border-border overflow-hidden">
        <svg 
          viewBox={`0 0 ${MAP_W} ${MAP_H}`} 
          className={`w-full h-full block transition-transform duration-700 ease-in-out ${is3D ? 'scale-[0.85] translate-y-4' : ''}`}
        >
          <g style={{ 
            transform: is3D ? `perspective(1000px) rotateX(55deg) rotateZ(-15deg)` : 'none',
            transformOrigin: 'center center',
            transition: 'transform 0.7s ease-in-out'
          }}>
            {/* Countries / Land */}
            {geoData && (
              <path
                d={pathGenerator(geoData) || ''}
                fill="var(--ink)"
                fillOpacity={is3D ? "0.1" : "0.05"}
                stroke="var(--ink)"
                strokeWidth="0.5"
                strokeOpacity="0.15"
              />
            )}

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(f => {
              const lon = bounds.lonMin + f * (bounds.lonMax - bounds.lonMin);
              const lat = bounds.latMin + f * (bounds.latMax - bounds.latMin);
              
              const [x1, y_top] = projection([lon, bounds.latMax]) || [0, 0];
              const [, y_bot] = projection([lon, bounds.latMin]) || [0, 0];
              
              const [x_left, y1] = projection([bounds.lonMin, lat]) || [0, 0];
              const [x_right] = projection([bounds.lonMax, lat]) || [0, 0];

              return (
                <g key={f}>
                  <line x1={x1} y1={PAD} x2={x1} y2={MAP_H - PAD} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1={PAD} y1={y1} x2={MAP_W - PAD} y2={y1} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
                </g>
              );
            })}

            {/* Subduction Zone visualization in 3D */}
            {is3D && (
              <rect 
                x={PAD} y={PAD} width={MAP_W - 2 * PAD} height={MAP_H - 2 * PAD} 
                fill="url(#depthGradient)" fillOpacity="0.1" 
              />
            )}

            {/* Points */}
            {filteredPoints.map((p, i) => {
              const projected = projection([p.lon, p.lat]);
              if (!projected) return null;
              const [x, y] = projected;
              const isHighlighted = highlightMag === null || (
                highlightMag === 7.5 ? p.mag >= 7.5 :
                highlightMag === 7.0 ? p.mag >= 7.0 && p.mag < 7.5 :
                highlightMag === 6.0 ? p.mag >= 6.0 && p.mag < 7.0 :
                p.mag >= 5.0 && p.mag < 6.0
              );

              const depthOffset = is3D ? (p.depth / 700) * 200 : 0;

              return (
                <g key={i} style={{ 
                  transform: is3D ? `translateZ(${depthOffset}px)` : 'none',
                  transition: 'transform 0.7s ease-in-out'
                }}>
                  {is3D && (
                    <line 
                      x1={x} y1={y} x2={x} y2={y} 
                      style={{ transform: `translateZ(-${depthOffset}px)` }}
                      stroke={getMagColor(p.mag)} strokeWidth="0.5" strokeOpacity="0.2"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={getMagSize(p.mag)}
                    fill={getMagColor(p.mag)}
                    stroke={p.isMcmc ? 'var(--surface)' : 'none'}
                    strokeWidth="0.5"
                    className={`transition-all duration-300 ${
                      isHighlighted 
                        ? (p.isMcmc ? 'opacity-90' : 'opacity-40') 
                        : 'opacity-5 grayscale blur-[0.5px]'
                    }`}
                  />
                </g>
              );
            })}
          </g>

          <defs>
            <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Labels */}
          <text x={PAD} y={MAP_H - 6} className="fill-ink-muted text-[8px] font-mono">{bounds.lonMin.toFixed(1)}°O</text>
          <text x={MAP_W - PAD} y={MAP_H - 6} className="fill-ink-muted text-[8px] font-mono" textAnchor="end">{bounds.lonMax.toFixed(1)}°O</text>
          <text x={4} y={PAD + 4} className="fill-ink-muted text-[8px] font-mono" transform={`rotate(-90 4 ${PAD + 4})`}>{bounds.latMax.toFixed(1)}°N</text>
          <text x={4} y={MAP_H - PAD} className="fill-ink-muted text-[8px] font-mono" transform={`rotate(-90 4 ${MAP_H - PAD})`}>{bounds.latMin.toFixed(1)}°N</text>
        </svg>
        
        {/* Magnitude Legend Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 p-2 bg-surface/80 backdrop-blur rounded border border-border transition-all">
          <span className="font-mono text-[8px] uppercase tracking-tighter text-ink-muted mb-0.5">Magnitud (Mw)</span>
          {magLegend.map((item) => (
            <button
              key={item.mag}
              onMouseEnter={() => setHighlightMag(item.mag)}
              onMouseLeave={() => setHighlightMag(null)}
              className={`flex items-center gap-2 group transition-all ${highlightMag === item.mag ? 'translate-x-1' : ''}`}
            >
              <div 
                className="rounded-full border border-surface shadow-sm"
                style={{ 
                  width: getMagSize(item.mag) * 2, 
                  height: getMagSize(item.mag) * 2, 
                  backgroundColor: getMagColor(item.mag)
                }}
              />
              <span className={`font-mono text-[9px] transition-colors ${highlightMag === item.mag ? 'text-ink font-bold' : 'text-ink-muted'}`}>
                {item.label}
              </span>
            </button>
          ))}

          {is3D && (
            <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
              <span className="font-mono text-[8px] uppercase tracking-tighter text-ink-muted mb-1">Profundidad</span>
              <div className="h-16 w-1 bg-gradient-to-t from-accent/10 to-accent rounded-full relative ml-2">
                <span className="absolute top-0 left-3 text-[7px] font-mono text-ink-muted">0km</span>
                <span className="absolute bottom-0 left-3 text-[7px] font-mono text-ink-muted">700km</span>
              </div>
            </div>
          )}
        </div>
        
        {!geoData && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm">
            <span className="text-[10px] font-mono text-ink-muted animate-pulse">Cargando base cartográfica...</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
          <div className="bg-surface/80 backdrop-blur px-2 py-1 rounded border border-border text-[9px] font-mono text-ink-muted">
            Región: {country.name}
          </div>
        </div>
      </div>
    </div>
  );
}
