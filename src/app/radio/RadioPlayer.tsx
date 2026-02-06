'use client';

import { useState, useEffect, useRef } from 'react';
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
  Music,
  Headphones,
  Users,
  Globe,
  Loader2
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  description: string;
  country: string;
  genre: string;
  streamUrl: string;
  imageUrl: string;
  isLive: boolean;
  currentShow?: string;
  listeners?: number;
}

interface NewsBriefing {
  id: string;
  title: string;
  description: string;
  duration: string;
  audioUrl: string;
  publishedAt: string;
  category: string;
  narrator: string;
}

export default function RadioPlayer() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [briefings, setBriefings] = useState<NewsBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stations' | 'briefings'>('stations');
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [currentBriefing, setCurrentBriefing] = useState<NewsBriefing | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stationsRes, briefingsRes] = await Promise.all([
        fetch('/api/radio?type=stations'),
        fetch('/api/radio?type=briefings')
      ]);

      const stationsData = await stationsRes.json();
      const briefingsData = await briefingsRes.json();

      if (stationsData.success) {
        setStations(stationsData.stations);
        setGenres(stationsData.genres);
        if (stationsData.stations.length > 0 && !currentStation) {
          setCurrentStation(stationsData.stations[0]);
        }
      }

      if (briefingsData.success) {
        setBriefings(briefingsData.briefings);
      }
    } catch (error) {
      console.error('Failed to fetch radio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playStation = (station: RadioStation) => {
    if (currentStation?.id === station.id && isPlaying) {
      pauseAudio();
    } else {
      setCurrentStation(station);
      setCurrentBriefing(null);
      setIsPlaying(true);
      
      // In production, this would actually play the stream
      // For now, we'll simulate the player state
      if (audioRef.current) {
        audioRef.current.src = station.streamUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const playBriefing = (briefing: NewsBriefing) => {
    if (currentBriefing?.id === briefing.id && isPlaying) {
      pauseAudio();
    } else {
      setCurrentBriefing(briefing);
      setCurrentStation(null);
      setIsPlaying(true);
      
      if (audioRef.current) {
        audioRef.current.src = briefing.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const pauseAudio = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredStations = selectedGenre === 'all' 
    ? stations 
    : stations.filter(s => s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Hero / Now Playing */}
      <div className="relative py-12 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">AfriVerse Radio</h1>
          </div>
          <p className="text-lg opacity-90 mb-8 max-w-xl">
            24/7 African music, news briefings, and live streams from across the continent.
          </p>

          {/* Now Playing Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 max-w-2xl">
            <div className="flex items-center gap-4">
              {/* Album Art / Station Image */}
              <div className="relative">
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden ${isPlaying ? 'animate-pulse' : ''}`}>
                  <img
                    src={currentStation?.imageUrl || currentBriefing?.audioUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200'}
                    alt="Now Playing"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200';
                    }}
                  />
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-orange-300 uppercase tracking-wide mb-1">
                  {isPlaying ? 'Now Playing' : 'Select a station'}
                </p>
                <h2 className="text-lg md:text-xl font-bold truncate">
                  {currentStation?.name || currentBriefing?.title || 'AfriVerse Radio'}
                </h2>
                <p className="text-sm opacity-80 truncate">
                  {currentStation?.currentShow || currentBriefing?.description || 'African sounds 24/7'}
                </p>
                {currentStation?.listeners && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    {currentStation.listeners.toLocaleString()} listening
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => currentStation ? playStation(currentStation) : currentBriefing && playBriefing(currentBriefing)}
                  className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={toggleMute} className="opacity-70 hover:opacity-100">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        {/* Tab Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'stations'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            Live Stations
          </button>
          <button
            onClick={() => setActiveTab('briefings')}
            className={`px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'briefings'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Mic className="w-4 h-4" />
            News Briefings
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : activeTab === 'stations' ? (
          <>
            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedGenre('all')}
                className={`px-4 py-1 rounded-full text-sm transition-colors ${
                  selectedGenre === 'all'
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                All Genres
              </button>
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-1 rounded-full text-sm transition-colors ${
                    selectedGenre === genre
                      ? 'bg-white text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Stations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map(station => (
                <div
                  key={station.id}
                  onClick={() => playStation(station)}
                  className={`bg-gray-800/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-800 group ${
                    currentStation?.id === station.id ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={station.imageUrl}
                        alt={station.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        {currentStation?.id === station.id && isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6" />
                        )}
                      </div>
                      {station.isLive && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{station.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{station.currentShow}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {station.genre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {station.country}
                        </span>
                      </div>
                    </div>
                  </div>
                  {station.listeners && (
                    <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {station.listeners.toLocaleString()} listening
                      </span>
                      {currentStation?.id === station.id && isPlaying && (
                        <div className="flex gap-1">
                          <span className="w-1 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-4 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* News Briefings */
          <div className="space-y-3">
            {briefings.map(briefing => (
              <div
                key={briefing.id}
                onClick={() => playBriefing(briefing)}
                className={`bg-gray-800/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-800 group ${
                  currentBriefing?.id === briefing.id ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/30 transition-colors">
                    {currentBriefing?.id === briefing.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Play className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{briefing.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{briefing.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {briefing.duration}
                      </span>
                      <span className="bg-gray-700 px-2 py-0.5 rounded-full">
                        {briefing.category}
                      </span>
                      <span>{formatDate(briefing.publishedAt)}</span>
                    </div>
                  </div>
                  {currentBriefing?.id === briefing.id && isPlaying && (
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-4 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/50 to-orange-900/50 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold mb-2">🎙️ Coming Soon</h3>
          <p className="text-gray-400 mb-4">
            AfriVerse Podcasts, AI-Generated News Briefings, and Live DJ Sets
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm">Podcasts</span>
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm">AI Briefings</span>
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm">Live DJ Sets</span>
            <span className="bg-white/10 px-4 py-2 rounded-full text-sm">Music Discovery</span>
          </div>
        </div>
      </div>
    </div>
  );
}
