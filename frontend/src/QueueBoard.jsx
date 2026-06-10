import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { VolumeX, MonitorPlay } from 'lucide-react';

export default function QueueBoard() {
  const [queue, setQueue] = useState([]);
  const [time, setTime] = useState(new Date());
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [videoFit, setVideoFit] = useState('cover'); 
  const [isAudioMutedByBrowser, setIsAudioMutedByBrowser] = useState(true);
  
  const videoRef = useRef(null);
  const previousServingId = useRef(null);
  const currentTicketRef = useRef(null);
  const lastAnnounceTime = useRef(0);
  const lastChimeRef = useRef(Date.now());

  const formatQueueNumber = (id) => `N-${String(id).padStart(3, '0')}`;

  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      
      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
        
        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playTone(659.25, 0, 1.0);    
      playTone(523.25, 0.5, 1.5);  
    } catch (e) {}
  };

  const announceTicket = useCallback((id, force = false) => {
    if (!id || !('speechSynthesis' in window)) return;
    
    const now = Date.now();
    if (!force && now - lastAnnounceTime.current < 4000) return;
    lastAnnounceTime.current = now;

    playChime();
    
    setTimeout(() => {
      const formattedNumber = formatQueueNumber(id);
      const spelledOut = formattedNumber.replace('-', '. ').split('').join('. ');
      const utterance = new SpeechSynthesisUtterance(`Now serving ticket number. ${spelledOut}.`);
      
      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.name === 'Google UK English Male' || v.name === 'Google US English');
      if (!bestVoice) bestVoice = voices.find(v => v.name.includes('Male') || v.name.includes('David') || v.name.includes('Daniel'));
      
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.8; 
      utterance.pitch = 0.9; 
      
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }, 1500); 
  }, []);

  const syncState = (e) => {
    if (!e || e.key === 'tv_playlist') setPlaylist(JSON.parse(localStorage.getItem('tv_playlist') || '[]'));
    if (!e || e.key === 'tv_currentIndex') setCurrentIndex(Number(localStorage.getItem('tv_currentIndex')) || 0);
    if (!e || e.key === 'tv_isPlaying') setIsPlaying(localStorage.getItem('tv_isPlaying') === 'true');
    if (!e || e.key === 'tv_volume') setVolume(Number(localStorage.getItem('tv_volume')) || 100);
    if (!e || e.key === 'tv_videoFit') setVideoFit(localStorage.getItem('tv_videoFit') || 'cover');
  };

  useEffect(() => {
    syncState(); 
    window.addEventListener('storage', syncState); 
    return () => window.removeEventListener('storage', syncState);
  }, []);

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
    const updatedPlaylist = playlist.filter((_, idx) => idx !== currentIndex);
    let nextIndex = currentIndex;
    if (nextIndex >= updatedPlaylist.length) nextIndex = 0; 
    setPlaylist(updatedPlaylist);
    setCurrentIndex(nextIndex);
    localStorage.setItem('tv_playlist', JSON.stringify(updatedPlaylist));
    localStorage.setItem('tv_currentIndex', nextIndex.toString());
    if (updatedPlaylist.length === 0) {
      setIsPlaying(false);
      localStorage.setItem('tv_isPlaying', 'false');
    }
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
      
      if ('speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance("");
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      }
      playChime();
    }
  };

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const [queueRes, chimeRes] = await Promise.all([
          axios.get(`/api/queue/today?t=${Date.now()}`),
          axios.get(`/api/chime?t=${Date.now()}`)
        ]);

        const freshQueue = queueRes.data;
        const serverChime = chimeRes.data.trigger;
        
        if (freshQueue.length > 0) {
          const currentId = freshQueue[0].id;
          
          if (previousServingId.current !== null && previousServingId.current !== currentId) {
            announceTicket(currentId);
          } else if (serverChime > lastChimeRef.current) {
            announceTicket(currentId, true);
          }
          
          previousServingId.current = currentId;
          currentTicketRef.current = currentId;
        } else {
          previousServingId.current = null;
          currentTicketRef.current = null;
        }
        
        lastChimeRef.current = serverChime;
        setQueue(freshQueue);
      } catch (err) {}
    };
    
    fetchQueue();
    const interval = setInterval(fetchQueue, 1500); 
    return () => clearInterval(interval);
  }, [announceTicket]);

  useEffect(() => {
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const nowServing = queue.length > 0 ? queue[0] : null;
  const waitingList = queue.slice(1);
  const currentVideo = playlist[currentIndex]?.url || '';

  return (
    <div onClick={forceUnmuteAndFullscreen} className="h-screen w-screen bg-[#020813] font-sans flex flex-col fixed inset-0 z-50 overflow-hidden cursor-default select-none">
      <div className="flex w-full h-[88%]">
        <div className="w-[35%] h-full bg-gradient-to-br from-[#061428] to-[#030A16] flex flex-col px-[4vw] py-[5vh] z-10 relative overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.4)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex-none flex flex-col items-start w-full relative z-10">
            <h1 className="text-[3.5vw] font-bold tracking-tight text-white tabular-nums leading-none drop-shadow-md">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-[1vw] font-bold uppercase tracking-[0.35em] text-cyan-400 mt-[1vh]">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-start justify-center w-full relative z-10">
            {nowServing ? (
              <div className="animate-in fade-in duration-700 w-full">
                
                <div className="flex items-center gap-[1vw] mb-[2vh]">
                  <span className="flex h-[1vw] w-[1vw] relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-[1vw] w-[1vw] bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.8)]"></span>
                  </span>
                  <p className="text-[1.2vw] font-bold uppercase tracking-[0.25em] text-cyan-200">
                    Now Serving
                  </p>
                </div>
                
                <div className="text-[9vw] font-black tracking-tighter leading-none font-mono tabular-nums -ml-[0.3vw] text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-50 to-cyan-200 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  {formatQueueNumber(nowServing.id)}
                </div>
                
              </div>
            ) : (
              <div className="w-full opacity-60">
                <p className="text-[2.2vw] font-bold tracking-tight text-white">Queue is empty</p>
                <p className="text-[1vw] font-bold mt-[1vh] uppercase tracking-[0.2em] text-cyan-500">Awaiting Next Patient</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-[65%] h-full bg-[#01040A] relative overflow-hidden">
          {playlist.length > 0 ? (
            <video 
              ref={videoRef}
              src={currentVideo} 
              onEnded={handleVideoEnded}
              className={`w-full h-full pointer-events-none ${videoFit === 'cover' ? 'object-cover' : 'object-contain'}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#030914] shadow-inner">
              <MonitorPlay className="text-[#0D2444] mb-[2vh] w-[5vw] h-[5vw]" />
              <p className="text-[1.2vw] font-bold uppercase tracking-[0.4em] text-[#11315C]">Media Standby</p>
            </div>
          )}
          
          {isAudioMutedByBrowser && playlist.length > 0 && (
            <div className="absolute inset-0 bg-[#061428]/80 flex items-center justify-center z-40 transition-opacity cursor-pointer backdrop-blur-md">
              <div className="text-center flex flex-col items-center">
                <div className="bg-cyan-500 text-white p-[1.8vw] rounded-full animate-pulse mb-[2.5vh] shadow-[0_0_40px_rgba(34,211,238,0.5)]">
                  <VolumeX className="w-[2.5vw] h-[2.5vw]" />
                </div>
                <h3 className="text-white font-bold tracking-widest uppercase text-[1.4vw] mb-[1vh]">Tap to Enable Announcer</h3>
                <p className="text-cyan-200/70 text-[0.9vw] font-medium uppercase tracking-[0.2em]">Browser Interaction Required</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-[12%] w-full bg-[#030A16] flex items-center px-[4vw] z-20 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.6)] relative z-30">
        
        <span className="text-[1.2vw] font-bold tracking-[0.3em] uppercase text-cyan-400 mr-[3vw] flex-shrink-0">
          Waiting List
        </span>

        <div className="w-[2px] h-[30%] bg-cyan-900/50 mr-[3vw] flex-shrink-0 rounded-full"></div>

        <div className="flex-1 flex items-center gap-[1.5vw] relative h-full">
          {waitingList.length > 0 ? (
            <div className="flex items-center gap-[1.5vw] animate-in fade-in duration-500 w-full">
              {waitingList.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-[#0D2444]/40 border border-cyan-800/30 px-[1.5vw] py-[1vh] rounded-full flex items-center justify-center shadow-inner backdrop-blur-sm transition-all"
                >
                  <span className="text-[2vw] font-bold text-cyan-50 tracking-widest font-mono tabular-nums leading-none">
                    {formatQueueNumber(patient.id)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[#11315C] text-[1.1vw] font-bold uppercase tracking-[0.3em]">
              No patients waiting
            </div>
          )}
          
          <div className="absolute right-0 top-0 w-[15vw] h-full bg-gradient-to-l from-[#030A16] to-transparent z-10 pointer-events-none"></div>
        </div>

      </div>

    </div>
  );
}