'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Radio,
  Mic,
  SkipForward,
  SkipBack,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Wifi,
  Heart,
  Share2,
  Sparkles,
  Music,
  Globe2,
  Zap
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  country: string;
  countryCode: string;
  genre: string;
  streamUrl: string;
  imageUrl: string;
  homepage: string;
  isLive: boolean;
  bitrate: number;
  codec: string;
  listeners: number;
  votes: number;
  language: string;
  color?: string;
  featured?: boolean;
}

interface NewsBriefing {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

// Pre-written news briefings for TTS
const NEWS_BRIEFINGS: NewsBriefing[] = [
  {
    id: 'daily-1',
    title: 'AfriVerse Daily Briefing',
    content: `Good day, and welcome to your AfriVerse Daily Briefing. Here are today's top stories from across Africa. 
    
    In Nigeria, the Lagos State government announced new infrastructure projects worth over 500 million dollars, aimed at improving transportation.
    
    South Africa's economy showed signs of recovery this quarter, with the manufacturing sector reporting strong growth.
    
    Kenya's tech hub continues to attract global investors, with major startups securing funding this week.
    
    That's your briefing for today. Stay informed with AfriVerse.`,
    category: 'Daily Briefing',
    icon: '📰'
  },
  {
    id: 'tech-1',
    title: 'Tech Africa Update',
    content: `Welcome to Tech Africa Update on AfriVerse Radio.
    
    Nigerian fintech continues to lead innovation, with mobile payments reaching new heights across West Africa.
    
    South Africa's AI research sector grows with new investments in Cape Town and Johannesburg.
    
    Kenya's M-Pesa celebrates another milestone in digital transactions.
    
    Rwanda's digital transformation shows impressive results with most government services now online.
    
    Stay connected with AfriVerse Tech.`,
    category: 'Technology',
    icon: '💻'
  },
  {
    id: 'sports-1',
    title: 'African Sports Roundup',
    content: `Welcome to the African Sports Roundup on AfriVerse Radio.
    
    In football, African teams prepare for continental championships with Nigeria, Morocco, and Senegal as favorites.
    
    South Africa's Springboks continue their Rugby Championship preparations.
    
    Kenya's marathoners dominate international races with multiple podium finishes.
    
    Ethiopian distance runners set new records ahead of upcoming competitions.
    
    That's your sports update. Stay active with AfriVerse.`,
    category: 'Sports',
    icon: '⚽'
  },
  {
    id: 'business-1',
    title: 'Business & Markets',
    content: `Welcome to Business and Markets on AfriVerse Radio.
    
    Nigerian Stock Exchange reports gains with banking stocks leading the rally.
    
    South Africa's rand strengthens against major currencies on positive economic data.
    
    Egypt's Suez Canal reports record revenues, boosting the national economy.
    
    Morocco continues attracting foreign investment, particularly in automotive.
    
    That's your business update. Prosper with AfriVerse.`,
    category: 'Business',
    icon: '📈'
  },
  {
    id: 'entertainment-1',
    title: 'Entertainment Weekly',
    content: `Welcome to Entertainment Weekly on AfriVerse Radio.
    
    Afrobeats continues its global takeover with Nigerian artists topping international charts.
    
    South African Amapiano sees major collaborations with international artists announced.
    
    Nollywood's latest productions break box office records across Africa.
    
    Lagos Fashion Week showcases Africa's best designers to the world.
    
    Stay entertained with AfriVerse.`,
    category: 'Entertainment',
    icon: '🎬'
  }
];

// Animated waveform component
function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: isPlaying ? `${Math.random() * 24 + 8}px` : '8px',
            animationDelay: `${i * 100}ms`,
            animationDuration: '300ms'
          }}
        />
      ))}
    </div>
  );
}

// Floating particle effect
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}
        />
      ))}
    </div>
  );
}

export default function RadioPlayer() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [featuredStations, setFeaturedStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stations' | 'briefings'>('stations');
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentBriefing, setCurrentBriefing] = useState<NewsBriefing | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([20, 40, 60, 40, 20]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const visualizerInterval = useRef<NodeJS.Timeout | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('radioFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
    const savedVolume = localStorage.getItem('radioVolume');
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Visualizer animation
  useEffect(() => {
    if (isPlaying && !isBuffering) {
      visualizerInterval.current = setInterval(() => {
        setVisualizerBars([
          Math.random() * 60 + 20,
          Math.random() * 80 + 20,
          Math.random() * 100 + 20,
          Math.random() * 80 + 20,
          Math.random() * 60 + 20,
        ]);
      }, 150);
    } else {
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
      }
      setVisualizerBars([20, 40, 60, 40, 20]);
    }
    return () => {
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
      }
    };
  }, [isPlaying, isBuffering]);

  // Fetch stations
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/radio');
      const data = await response.json();

      if (data.success) {
        setStations(data.stations);
        setFeaturedStations(data.featured || []);
        setGenres(data.genres);
        setCountries(data.countries);
        if (data.featured?.length > 0 && !currentStation) {
          setCurrentStation(data.featured[0]);
        } else if (data.stations.length > 0 && !currentStation) {
          setCurrentStation(data.stations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch radio data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentStation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Audio volume effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('radioVolume', volume.toString());
  }, [volume, isMuted]);

  // Setup audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    
    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setHasError(false);
      retryCountRef.current = 0;
    });
    
    audio.addEventListener('waiting', () => {
      setIsBuffering(true);
    });
    
    audio.addEventListener('canplay', () => {
      setIsBuffering(false);
    });
    
    audio.addEventListener('error', () => {
      setIsBuffering(false);
      
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => {
          if (audioRef.current && currentStation) {
            audioRef.current.load();
            audioRef.current.play().catch(() => {});
          }
        }, 1000 * retryCountRef.current);
      } else {
        setHasError(true);
        setIsPlaying(false);
        setErrorMessage('Unable to connect. Try another station.');
      }
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeAttribute('src');
    };
  }, [currentStation]);

  const playStation = async (station: RadioStation) => {
    // Stop any TTS
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentBriefing(null);
    }
    
    setHasError(false);
    setErrorMessage('');
    retryCountRef.current = 0;
    
    if (currentStation?.id === station.id && isPlaying) {
      pauseAudio();
      return;
    }
    
    setCurrentStation(station);
    setIsBuffering(true);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = station.streamUrl;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Playback error:', error);
        setIsBuffering(false);
        setHasError(true);
        setErrorMessage('Click play to start streaming');
      }
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    setIsBuffering(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFavorite = (stationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(stationId)) {
      newFavorites.delete(stationId);
    } else {
      newFavorites.add(stationId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('radioFavorites', JSON.stringify([...newFavorites]));
  };

  const shareStation = (station: RadioStation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `Listen to ${station.name} on AfriVerse Radio`,
        text: station.description,
        url: `${window.location.origin}/radio?station=${station.id}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/radio?station=${station.id}`);
      alert('Link copied!');
    }
  };

  const playBriefing = (briefing: NewsBriefing) => {
    // Stop radio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    if ('speechSynthesis' in window) {
      if (currentBriefing?.id === briefing.id && isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setCurrentBriefing(null);
        return;
      }
      
      speechSynthesis.cancel();
      setCurrentBriefing(briefing);
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(briefing.content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = volume;
      
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
        || voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const retryConnection = () => {
    if (currentStation) {
      setHasError(false);
      retryCountRef.current = 0;
      playStation(currentStation);
    }
  };

  const playNext = () => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const nextIndex = (currentIndex + 1) % stations.length;
    playStation(stations[nextIndex]);
  };

  const playPrevious = () => {
    const currentIndex = stations.findIndex(s => s.id === currentStation?.id);
    const prevIndex = currentIndex === 0 ? stations.length - 1 : currentIndex - 1;
    playStation(stations[prevIndex]);
  };

  // Filter stations
  const filteredStations = stations.filter(station => {
    const matchesGenre = selectedGenre === 'all' || station.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || station.country.toLowerCase().includes(selectedCountry.toLowerCase());
    return matchesGenre && matchesCountry;
  });

  // Sort favorites first
  const sortedStations = [...filteredStations].sort((a, b) => {
    const aFav = favorites.has(a.id) ? 1 : 0;
    const bFav = favorites.has(b.id) ? 1 : 0;
    return bFav - aFav;
  });

  // Group by country
  const stationsByCountry = sortedStations.reduce((acc, station) => {
    if (!acc[station.country]) {
      acc[station.country] = [];
    }
    acc[station.country].push(station);
    return acc;
  }, {} as Record<string, RadioStation[]>);

  const currentColor = currentStation?.color || '#f97316';

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${currentColor}15 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 50%, #9333ea10 0%, transparent 40%),
                       radial-gradient(ellipse at 20% 80%, ${currentColor}10 0%, transparent 40%),
                       #030712`
        }}
      />
      <FloatingParticles />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero / Now Playing */}
        <div className="relative pt-8 pb-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${currentColor}, #9333ea)`,
                    boxShadow: `0 8px 32px ${currentColor}40`
                  }}
                >
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    AfriVerse Radio
                  </h1>
                  <p className="text-sm text-gray-500">Live African music • {stations.length} stations</p>
                </div>
              </div>
              
              {/* Live Badge */}
              {isPlaying && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-400">LIVE</span>
                </div>
              )}
            </div>

            {/* Now Playing Card */}
            <div 
              className="relative rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10"
              style={{ 
                background: `linear-gradient(135deg, ${currentColor}15, #1f1f2e80)`,
                boxShadow: `0 24px 64px -16px ${currentColor}30`
              }}
            >
              {/* Glow Effect */}
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-30 transition-all duration-1000"
                style={{ background: currentColor }}
              />
              
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Album Art with Visualizer */}
                  <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                    <div 
                      className={`w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 ${
                        isPlaying && !isBuffering ? 'scale-105' : ''
                      }`}
                      style={{ boxShadow: `0 20px 60px -10px ${currentColor}50` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentStation?.imageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                        alt={currentStation?.name || 'Radio'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400';
                        }}
                      />
                      
                      {/* Overlay with visualizer */}
                      {isPlaying && !isBuffering && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4">
                          <div className="flex items-end gap-1 h-12">
                            {visualizerBars.map((height, i) => (
                              <div
                                key={i}
                                className="w-2 rounded-full transition-all duration-150"
                                style={{ 
                                  height: `${height}%`,
                                  background: `linear-gradient(to top, ${currentColor}, #fbbf24)`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Floating badges */}
                    {isPlaying && !isBuffering && (
                      <div className="absolute -top-2 -right-2 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        <Wifi className="w-3 h-3" />
                        ON AIR
                      </div>
                    )}
                  </div>

                  {/* Info & Controls */}
                  <div className="flex-1 flex flex-col justify-between text-center lg:text-left">
                    <div>
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">
                          {isBuffering ? '⏳ Connecting...' : isPlaying ? '🎵 Now Playing' : '📻 Select a station'}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                        {currentBriefing?.title || currentStation?.name || 'AfriVerse Radio'}
                      </h2>
                      
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {currentBriefing?.category || currentStation?.description || 'African sounds 24/7'}
                      </p>
                      
                      {currentStation && !currentBriefing && (
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                          <span 
                            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                            style={{ background: `${currentColor}20`, color: currentColor }}
                          >
                            <Globe2 className="w-3 h-3" />
                            {currentStation.country}
                          </span>
                          <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 flex items-center gap-1.5">
                            <Music className="w-3 h-3" />
                            {currentStation.genre.split(',')[0]}
                          </span>
                          <span className="px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" />
                            {currentStation.bitrate}kbps {currentStation.codec}
                          </span>
                        </div>
                      )}
                      
                      {hasError && (
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {errorMessage}
                          <button
                            onClick={retryConnection}
                            className="ml-2 px-3 py-1 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <button
                          onClick={playPrevious}
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all"
                          disabled={isBuffering}
                        >
                          <SkipBack className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => currentStation && playStation(currentStation)}
                          disabled={isBuffering || !currentStation}
                          className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                          style={{ 
                            background: `linear-gradient(135deg, ${currentColor}, #9333ea)`,
                            boxShadow: `0 8px 32px ${currentColor}50`
                          }}
                        >
                          {isBuffering ? (
                            <Loader2 className="w-7 h-7 animate-spin" />
                          ) : isPlaying ? (
                            <Pause className="w-7 h-7" />
                          ) : (
                            <Play className="w-7 h-7 ml-1" />
                          )}
                        </button>
                        
                        <button
                          onClick={playNext}
                          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all"
                          disabled={isBuffering}
                        >
                          <SkipForward className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Volume & Actions */}
                      <div className="flex items-center justify-center lg:justify-start gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full">
                          <button onClick={toggleMute} className="opacity-70 hover:opacity-100 transition-opacity">
                            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              setVolume(parseFloat(e.target.value));
                              setIsMuted(false);
                            }}
                            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-orange-500"
                          />
                        </div>
                        
                        {currentStation && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => toggleFavorite(currentStation.id, e)}
                              className={`p-2.5 rounded-full transition-all ${
                                favorites.has(currentStation.id) 
                                  ? 'text-red-400 bg-red-400/20 scale-110' 
                                  : 'text-gray-500 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${favorites.has(currentStation.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => shareStation(currentStation, e)}
                              className="p-2.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pb-12">
          {/* Tabs */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'stations'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Radio className="w-4 h-4" />
              Live Stations
            </button>
            <button
              onClick={() => setActiveTab('briefings')}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'briefings'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Mic className="w-4 h-4" />
              News Briefings
            </button>
          </div>

          {activeTab === 'stations' ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-8">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="all">🌍 All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                >
                  <option value="all">🎵 All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Featured Stations */}
              {featuredStations.length > 0 && selectedCountry === 'all' && selectedGenre === 'all' && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-xl font-bold">Featured Stations</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredStations.map(station => (
                      <div
                        key={station.id}
                        onClick={() => playStation(station)}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          currentStation?.id === station.id ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-950' : ''
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${station.color || '#f97316'}30, #1a1a2e)`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="relative p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={station.imageUrl}
                                alt={station.name}
                                className="w-20 h-20 rounded-xl object-cover shadow-lg"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=f97316&color=fff&size=100`;
                                }}
                              />
                              {currentStation?.id === station.id && isPlaying && !isBuffering && (
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <AudioVisualizer isPlaying={true} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg text-white truncate group-hover:text-orange-400 transition-colors">
                                {station.name}
                              </h4>
                              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{station.description}</p>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{ background: `${station.color || '#f97316'}30`, color: station.color || '#f97316' }}
                                >
                                  {station.country}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => toggleFavorite(station.id, e)}
                              className={`p-2 rounded-full transition-all ${
                                favorites.has(station.id) ? 'text-red-400' : 'text-gray-500 opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-5 h-5 ${favorites.has(station.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stations by Country */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading stations...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(stationsByCountry).map(([country, countryStations]) => (
                    <div key={country}>
                      <div className="flex items-center gap-2 mb-4">
                        <Globe2 className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-300">{country}</h3>
                        <span className="text-sm text-gray-600">({countryStations.length})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {countryStations.map(station => (
                          <div
                            key={station.id}
                            onClick={() => playStation(station)}
                            className={`group relative bg-white/5 hover:bg-white/10 rounded-xl p-3 cursor-pointer transition-all duration-300 hover:scale-105 border border-transparent ${
                              currentStation?.id === station.id ? 'border-orange-500/50 bg-orange-500/10' : ''
                            }`}
                          >
                            {/* Favorite badge */}
                            {favorites.has(station.id) && (
                              <div className="absolute top-2 right-2 z-10">
                                <Heart className="w-3 h-3 text-red-400 fill-current" />
                              </div>
                            )}
                            
                            <div className="relative mb-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={station.imageUrl}
                                alt={station.name}
                                className="w-full aspect-square rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=f97316&color=fff&size=200`;
                                }}
                              />
                              
                              {/* Play overlay */}
                              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg transition-opacity ${
                                currentStation?.id === station.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}>
                                {currentStation?.id === station.id && isPlaying && !isBuffering ? (
                                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                    <Pause className="w-5 h-5" />
                                  </div>
                                ) : currentStation?.id === station.id && isBuffering ? (
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: station.color || '#f97316' }}
                                  >
                                    <Play className="w-5 h-5 ml-0.5" />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <h4 className="font-medium text-sm text-white truncate mb-0.5">
                              {station.name}
                            </h4>
                            <p className="text-xs text-gray-500 truncate">
                              {station.genre.split(',')[0]}
                            </p>
                            
                            {/* Playing indicator */}
                            {currentStation?.id === station.id && isPlaying && !isBuffering && (
                              <div className="mt-2 flex items-center justify-center gap-1">
                                <span className="text-[10px] text-green-400">Playing</span>
                                <AudioVisualizer isPlaying={true} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* News Briefings */
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-5 mb-6 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">AI News Briefings</h3>
                    <p className="text-sm text-gray-400">
                      Listen to curated news briefings from across Africa using text-to-speech technology.
                    </p>
                  </div>
                </div>
              </div>
              
              {NEWS_BRIEFINGS.map(briefing => (
                <div
                  key={briefing.id}
                  onClick={() => playBriefing(briefing)}
                  className={`group relative bg-white/5 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:bg-white/10 border border-transparent ${
                    currentBriefing?.id === briefing.id ? 'border-purple-500/50 bg-purple-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      currentBriefing?.id === briefing.id && isSpeaking
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110'
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      {currentBriefing?.id === briefing.id && isSpeaking ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        briefing.icon
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{briefing.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-white/5 rounded-full">
                          {briefing.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ~2 min
                        </span>
                      </div>
                    </div>
                    
                    {currentBriefing?.id === briefing.id && isSpeaking && (
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <span 
                            key={i}
                            className="w-1 bg-purple-500 rounded-full animate-bounce"
                            style={{ 
                              height: `${Math.random() * 16 + 8}px`,
                              animationDelay: `${i * 100}ms`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coming Soon */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm text-gray-500 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Coming Soon
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400">🎙️ Podcasts</span>
              <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400">🎧 Live DJ Sets</span>
              <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400">💬 Song Requests</span>
              <span className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400">🎤 Artist Interviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
