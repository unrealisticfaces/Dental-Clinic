import { useState, useRef, useEffect } from 'react';
import { Monitor, Cast, ShieldAlert, Volume2, Upload, Play, Pause, SkipForward, SkipBack, Trash2, Settings } from 'lucide-react';

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

  // Sync Outgoing Changes to LocalStorage
  useEffect(() => { localStorage.setItem('tv_playlist', JSON.stringify(playlist)); }, [playlist]);
  useEffect(() => { localStorage.setItem('tv_currentIndex', currentIndex.toString()); }, [currentIndex]);
  useEffect(() => { localStorage.setItem('tv_isPlaying', isPlaying.toString()); }, [isPlaying]);
  useEffect(() => { localStorage.setItem('tv_volume', volume.toString()); }, [volume]);
  useEffect(() => { localStorage.setItem('tv_videoFit', videoFit); }, [videoFit]);

  // Sync Incoming Changes (If the TV automatically removes a finished video)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tv_currentIndex') setCurrentIndex(Number(e.newValue));
      if (e.key === 'tv_isPlaying') setIsPlaying(e.newValue === 'true');
      if (e.key === 'tv_playlist') setPlaylist(JSON.parse(e.newValue || '[]'));
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
      
      // Adjust index if we delete the currently playing video
      const deletedIndex = prev.findIndex(v => v.id === id);
      if (deletedIndex === currentIndex) {
         let nextIndex = currentIndex;
         if (nextIndex >= updated.length) nextIndex = 0;
         setCurrentIndex(nextIndex);
      } else if (deletedIndex < currentIndex) {
         setCurrentIndex(prevIndex => prevIndex - 1);
      }
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
        
        const windowFeatures = `popup=1,left=${targetScreen.availLeft},top=${targetScreen.availTop},width=${targetScreen.availWidth},height=${targetScreen.availHeight}`;
        const newWindow = window.open('/queue', 'TV_DISPLAY', windowFeatures);
        
        if (!newWindow) {
          alert("Pop-up Blocked! Please allow pop-ups for this site.");
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
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
          <Monitor className="text-blue-600" size={28} />
          TV System Console
        </h2>
        <p className="text-gray-500 mt-2 text-xs font-bold uppercase tracking-widest">
          Manage playlist, playback controls, and external displays remotely.
        </p>
      </div>

      {!permissionGranted && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-start gap-3 shadow-sm">
          <ShieldAlert size={24} className="flex-shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-red-900">Browser Permission Required</h3>
            <p className="text-xs font-medium mt-1 text-red-700">
              Google Chrome is blocking access to your monitors. Click the <strong>Lock Icon</strong> next to your URL, go to <strong>Site Settings</strong>, and set both <strong>Window Management</strong> and <strong>Pop-ups</strong> to "Allow". Reload this page after.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PLAYLIST CARD */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black tracking-widest text-gray-900 uppercase">Media Playlist</h3>
                <p className="text-blue-600 text-[10px] font-bold mt-1 tracking-widest uppercase">Auto-Removes on Finish</p>
              </div>
              <input type="file" accept="video/*" multiple className="hidden" ref={fileInputRef} onChange={handleFilesAdded} />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
              >
                <Upload size={14} /> Add Videos
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white custom-scrollbar">
              {playlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Upload size={32} className="text-gray-400 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Playlist is empty</p>
                </div>
              ) : (
                playlist.map((video, idx) => (
                  <div key={video.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${currentIndex === idx ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      {currentIndex === idx && isPlaying ? (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center animate-pulse flex-shrink-0 shadow-sm">
                          <Play size={10} className="text-white ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <p className={`text-xs font-bold truncate ${currentIndex === idx ? 'text-blue-700' : 'text-gray-700'}`}>
                        {video.name}
                      </p>
                    </div>
                    <button onClick={() => removeVideo(video.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-colors cursor-pointer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center gap-6 mb-6">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={playlist.length === 0}
                  className="text-gray-400 hover:text-gray-800 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={playlist.length === 0}
                  className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md disabled:opacity-50 disabled:shadow-none cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                <button 
                  onClick={() => setCurrentIndex(prev => (prev + 1) % playlist.length)}
                  disabled={playlist.length === 0}
                  className="text-gray-400 hover:text-gray-800 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <Volume2 size={16} className="text-gray-500" />
                <input 
                  type="range" min="0" max="100" 
                  value={volume} onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-xs font-mono font-bold text-gray-500 w-8 text-right">{volume}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SETTINGS CARDS */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-black tracking-widest text-gray-900 uppercase">Hardware Configuration</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <button 
                onClick={detectScreens}
                className="w-full flex justify-center items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-6 py-3 rounded-md transition-all font-bold text-xs uppercase tracking-widest shadow-sm cursor-pointer"
              >
                <Monitor size={16} className="text-blue-600" /> Scan For Displays
              </button>

              {screens.length > 0 ? (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Output Display</label>
                  <select 
                    value={selectedScreen} onChange={(e) => setSelectedScreen(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-800 font-bold tracking-wider p-3 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer uppercase text-xs transition-shadow"
                  >
                    {screens.map((screen, idx) => (
                      <option key={idx} value={screen.label || screen.id}>
                        {screen.label || `DISPLAY ${idx + 1}`} ({screen.availWidth}x{screen.availHeight})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-center py-4 opacity-50 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">No external monitors detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-black tracking-widest text-gray-900 uppercase">Visual Layout</h3>
            </div>
            <div className="p-6">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <Settings size={14} className="text-blue-600" /> Video Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setVideoFit('contain')}
                  className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${videoFit === 'contain' ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Fit Width</span>
                  <span className="text-[9px] font-semibold text-center opacity-70">Shows entire video (Adds black bars)</span>
                </button>
                <button 
                  onClick={() => setVideoFit('cover')}
                  className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${videoFit === 'cover' ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
                >
                  <span className="text-xs font-black uppercase tracking-widest">Fill Screen</span>
                  <span className="text-[9px] font-semibold text-center opacity-70">No black bars (Crops top/bottom)</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={launchTV}
            className="flex items-center justify-center w-full gap-3 bg-gray-900 hover:bg-gray-800 text-white px-6 py-5 rounded-lg transition-all font-black text-sm uppercase tracking-widest shadow-md cursor-pointer mt-auto"
          >
            <Cast size={18} className="text-cyan-400" /> Launch Fullscreen TV Mode
          </button>
        </div>

      </div>
    </div>
  );
}