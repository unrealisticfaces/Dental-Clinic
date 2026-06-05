import { useState, useRef, useEffect } from 'react';
import { Monitor, Cast, AlertCircle, Volume2, Upload, Play, Pause, SkipForward, SkipBack, Trash2, Settings, ShieldAlert } from 'lucide-react';

export default function TVSettings() {
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(true);
  
  const [playlist, setPlaylist] = useState(() => JSON.parse(localStorage.getItem('tv_playlist') || '[]'));
  const [currentIndex, setCurrentIndex] = useState(() => Number(localStorage.getItem('tv_currentIndex')) || 0);
  const [isPlaying, setIsPlaying] = useState(() => localStorage.getItem('tv_isPlaying') === 'true');
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('tv_volume')) || 100);
  const [videoFit, setVideoFit] = useState(() => localStorage.getItem('tv_videoFit') || 'contain');
  
  const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('tv_playlist', JSON.stringify(playlist)); }, [playlist]);
  useEffect(() => { localStorage.setItem('tv_currentIndex', currentIndex.toString()); }, [currentIndex]);
  useEffect(() => { localStorage.setItem('tv_isPlaying', isPlaying.toString()); }, [isPlaying]);
  useEffect(() => { localStorage.setItem('tv_volume', volume.toString()); }, [volume]);
  useEffect(() => { localStorage.setItem('tv_videoFit', videoFit); }, [videoFit]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tv_currentIndex') setCurrentIndex(Number(e.newValue));
      if (e.key === 'tv_isPlaying') setIsPlaying(e.newValue === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
  };

  const handleFilesAdded = (e) => {
    const files = Array.from(e.target.files);
    const newVideos = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setPlaylist(prev => {
      const updated = [...prev, ...newVideos];
      if (prev.length === 0) setIsPlaying(true);
      return updated;
    });
  };

  const removeVideo = (id) => {
    setPlaylist(prev => {
      const updated = prev.filter(v => v.id !== id);
      if (updated.length === 0) setIsPlaying(false);
      return updated;
    });
  };

  const updateScreens = (screenDetails) => {
    setScreens(screenDetails.screens);
    if (screenDetails.screens.length > 0 && !selectedScreen) {
      setSelectedScreen(screenDetails.currentScreen.label || screenDetails.currentScreen.id);
    }
  };

  const detectScreens = async () => {
    try {
      if ('getScreenDetails' in window) {
        const screenDetails = await window.getScreenDetails();
        setPermissionGranted(true);
        updateScreens(screenDetails);
        
        screenDetails.addEventListener('screenschange', async () => {
          const updatedDetails = await window.getScreenDetails();
          updateScreens(updatedDetails);
        });
      } else {
        alert("Your browser does not support multi-monitor placement. Please use Google Chrome.");
      }
    } catch (err) {
      setPermissionGranted(false);
    }
  };

  const launchTV = async () => {
    try {
      if ('getScreenDetails' in window && screens.length > 0) {
        const screenDetails = await window.getScreenDetails();
        const targetScreen = screenDetails.screens.find(s => (s.label || s.id) === selectedScreen) || screenDetails.currentScreen;
        
        // Aggressive popup command forces Chrome to detach the window to the specific monitor coordinates
        const windowFeatures = `popup=1,left=${targetScreen.availLeft},top=${targetScreen.availTop},width=${targetScreen.availWidth},height=${targetScreen.availHeight}`;
        const newWindow = window.open('/queue', 'TV_DISPLAY', windowFeatures);
        
        if (!newWindow) {
          alert("Pop-up Blocked! Please click the icon in your address bar to allow pop-ups for this site.");
        }
      } else {
        window.open('/queue', 'TV_DISPLAY', 'popup=1,width=1920,height=1080');
      }
    } catch (err) {
      window.open('/queue', 'TV_DISPLAY', 'popup=1');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 h-full flex flex-col">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
          <Monitor className="text-amber-500" size={28} />
          TV System Console
        </h2>
        <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest">
          Manage playlist, playback controls, and external displays remotely.
        </p>
      </div>

      {!permissionGranted && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded text-red-900 flex items-start gap-3 shadow-sm">
          <ShieldAlert size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest">Browser Permission Required</h3>
            <p className="text-xs font-semibold mt-1">
              Google Chrome is blocking access to your monitors. Click the <strong>Lock Icon</strong> next to your URL, go to <strong>Site Settings</strong>, and set both <strong>Window Management</strong> and <strong>Pop-ups</strong> to "Allow". Reload this page after.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden text-white flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black tracking-widest text-amber-500 uppercase">Media Playlist</h3>
                <p className="text-slate-400 text-[10px] font-bold mt-1 tracking-widest uppercase">Local MP4 files</p>
              </div>
              <input type="file" accept="video/*" multiple className="hidden" ref={fileInputRef} onChange={handleFilesAdded} />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg cursor-pointer"
              >
                <Upload size={14} /> Add Videos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-900/50 custom-scrollbar">
              {playlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50">
                  <Upload size={32} className="text-slate-500 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest">Playlist is empty</p>
                </div>
              ) : (
                playlist.map((video, idx) => (
                  <div key={video.id} className={`flex items-center justify-between p-3 rounded-lg border ${currentIndex === idx ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-900 border-slate-700'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      {currentIndex === idx && isPlaying ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse flex-shrink-0">
                          <Play size={10} className="text-slate-900 ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <p className={`text-xs font-bold truncate ${currentIndex === idx ? 'text-amber-500' : 'text-slate-300'}`}>
                        {video.name}
                      </p>
                    </div>
                    <button onClick={() => removeVideo(video.id)} className="text-slate-500 hover:text-red-500 p-2 cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center justify-center gap-6 mb-6">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={playlist.length === 0}
                  className="text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={playlist.length === 0}
                  className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:shadow-none cursor-pointer transition-all"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                <button 
                  onClick={() => setCurrentIndex(prev => (prev + 1) % playlist.length)}
                  disabled={playlist.length === 0}
                  className="text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <Volume2 size={16} className="text-slate-400" />
                <input 
                  type="range" min="0" max="100" 
                  value={volume} onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs font-mono font-bold text-slate-400 w-8 text-right">{volume}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden text-white">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-black tracking-widest text-amber-500 uppercase">Hardware Configuration</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <button 
                onClick={detectScreens}
                className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-6 py-3 rounded transition-all font-bold text-xs uppercase tracking-widest shadow-lg cursor-pointer"
              >
                <Monitor size={16} /> Scan For Displays
              </button>

              {screens.length > 0 ? (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Output Display</label>
                  <select 
                    value={selectedScreen} onChange={(e) => setSelectedScreen(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-bold tracking-wider p-3 rounded outline-none cursor-pointer uppercase text-xs"
                  >
                    {screens.map((screen, idx) => (
                      <option key={idx} value={screen.label || screen.id}>
                        {screen.label || `DISPLAY ${idx + 1}`} ({screen.availWidth}x{screen.availHeight})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-center py-4 opacity-50">
                  <p className="text-[10px] font-bold tracking-widest uppercase">No external monitors detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden text-white">
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-sm font-black tracking-widest text-amber-500 uppercase">Visual Layout</h3>
            </div>
            <div className="p-6">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <Settings size={14} /> Video Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setVideoFit('contain')}
                  className={`p-4 rounded border flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${videoFit === 'contain' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Fit Width</span>
                  <span className="text-[9px] font-semibold text-center opacity-70">Shows entire video (Adds black bars)</span>
                </button>
                <button 
                  onClick={() => setVideoFit('cover')}
                  className={`p-4 rounded border flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${videoFit === 'cover' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Fill Screen</span>
                  <span className="text-[9px] font-semibold text-center opacity-70">No black bars (Crops top/bottom)</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={launchTV}
            className="flex items-center justify-center w-full gap-3 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-5 rounded transition-all font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            <Cast size={18} /> Launch Fullscreen TV Mode
          </button>
        </div>

      </div>
    </div>
  );
}
