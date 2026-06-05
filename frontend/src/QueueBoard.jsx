import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Stethoscope, VolumeX, MonitorPlay } from 'lucide-react';

export default function QueueBoard() {
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());
  
  // Remote controlled state
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [videoFit, setVideoFit] = useState('contain');
  
  const [isAudioMutedByBrowser, setIsAudioMutedByBrowser] = useState(true);
  const videoRef = useRef(null);

  // Sync state from local storage (The Remote Control Bridge)
  const syncState = () => {
    setPlaylist(JSON.parse(localStorage.getItem('tv_playlist') || '[]'));
    setCurrentIndex(Number(localStorage.getItem('tv_currentIndex')) || 0);
    setIsPlaying(localStorage.getItem('tv_isPlaying') === 'true');
    setVolume(Number(localStorage.getItem('tv_volume')) || 100);
    setVideoFit(localStorage.getItem('tv_videoFit') || 'contain');
  };

  useEffect(() => {
    syncState(); // Initial load
    window.addEventListener('storage', syncState); // Listen for changes from Settings tab
    return () => window.removeEventListener('storage', syncState);
  }, []);

  // Handle Playback Engine
  useEffect(() => {
    if (!videoRef.current || playlist.length === 0) return;
    
    videoRef.current.volume = volume / 100;
    
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsAudioMutedByBrowser(false))
          .catch(() => {
            setIsAudioMutedByBrowser(true);
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, currentIndex, volume, playlist]);

  const handleVideoEnded = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    localStorage.setItem('tv_currentIndex', nextIndex.toString()); // Update settings tab UI
  };

  const forceUnmuteAndFullscreen = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch (err) {}

    if (videoRef.current && isAudioMutedByBrowser) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume / 100;
      setIsAudioMutedByBrowser(false);
      if (isPlaying) videoRef.current.play();
    }
  };

  // Poll Database for Queue
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/queue/today', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQueue(res.data);
      } catch (err) {}
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  // Clock
  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const formatQueueNumber = (id) => `N-${String(id).padStart(3, '0')}`;

  const nowServing = queue.length > 0 ? queue[0] : null;
  const waitingList = queue.slice(1, 6);

  const currentVideo = playlist[currentIndex]?.url || '';

  return (
    <div onClick={forceUnmuteAndFullscreen} className="h-screen w-screen bg-black text-white overflow-hidden flex font-sans fixed inset-0 z-50">
      
      {/* LEFT QUEUE PANEL (Slimmer 25%) */}
      <div className="w-[25%] h-full bg-slate-900 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)] z-20 border-r border-slate-800">
        
        {/* Time Header */}
        <div className="py-6 bg-slate-950 border-b border-slate-800 flex flex-col items-center justify-center text-center shadow-lg">
          <p className="text-amber-500 font-mono text-3xl xl:text-4xl font-bold tracking-widest drop-shadow-md">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Now Serving Card */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-900 relative">
          <div className="absolute top-4 w-full text-center">
             <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CURRENTLY SERVING</h2>
          </div>

          {nowServing ? (
            <div className="w-full bg-slate-950 border-2 border-amber-500 rounded-xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.2)] text-center relative overflow-hidden transform scale-105 transition-all">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-2 animate-pulse">Ticket Number</p>
              <h3 className="text-5xl xl:text-7xl font-black text-white font-mono tracking-tighter mb-6">
                {formatQueueNumber(nowServing.id)}
              </h3>
              
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 inline-block min-w-[80%]">
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                  <Stethoscope size={10} /> Provider
                </p>
                <p className="text-sm font-bold text-slate-200 uppercase tracking-widest truncate">
                  {nowServing.dentist_name || 'UNASSIGNED'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square max-h-[300px] bg-slate-950/40 border border-slate-800 rounded-xl flex flex-col items-center justify-center opacity-40">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">QUEUE IS EMPTY</p>
            </div>
          )}
        </div>

        {/* Compact Next In Line */}
        <div className="h-[35%] bg-slate-950 flex flex-col border-t border-slate-800">
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-[9px] font-black text-amber-500 uppercase tracking-widest">NEXT IN LINE</h2>
          </div>
          
          <div className="flex-1 overflow-hidden px-4 py-3 space-y-2">
            {waitingList.length > 0 ? (
              waitingList.map((patient, index) => (
                <div key={patient.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center gap-4">
                  <div className="w-12 h-12 flex-shrink-0 bg-slate-950 border border-slate-700 rounded-md flex items-center justify-center text-amber-500 font-black text-xl font-mono shadow-inner">
                    {formatQueueNumber(patient.id)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Scheduled</p>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">
                      {patient.appointment_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 mt-2">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">NO WAITING PATIENTS</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT VIDEO PANEL (75%) */}
      <div className="w-[75%] h-full relative bg-black flex items-center justify-center">
        {playlist.length > 0 ? (
          <video 
            ref={videoRef}
            src={currentVideo} 
            onEnded={handleVideoEnded}
            className={`w-full h-full pointer-events-none ${videoFit === 'cover' ? 'object-cover' : 'object-contain'}`}
          />
        ) : (
          <div className="flex flex-col items-center opacity-30">
            <MonitorPlay size={64} className="text-slate-500 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">NO MEDIA LOADED</p>
          </div>
        )}
        
        {/* Audio Unlock Overlay */}
        {isAudioMutedByBrowser && playlist.length > 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40 backdrop-blur-sm cursor-pointer transition-opacity">
            <div className="bg-slate-900/90 border border-amber-500 px-6 py-4 rounded-xl flex items-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <VolumeX className="text-amber-500" size={32} />
              <div>
                <h3 className="text-white font-black tracking-widest uppercase">Start TV Display</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Click anywhere to enter fullscreen and enable audio</p>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}