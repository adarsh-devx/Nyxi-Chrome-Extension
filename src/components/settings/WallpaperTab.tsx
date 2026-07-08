import React, { useRef, useState } from 'react';
import { Upload, Trash2, Check, Video, Image, Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useWallpaper } from '../../context/WallpaperContext';

export const WallpaperTab: React.FC = () => {
  const {
    wallpapers,
    activeWallpaper,
    isVideoMuted,
    isVideoPlaying,
    shouldLoop,
    isShuffleEnabled,
    setActiveWallpaperById,
    uploadWallpaper,
    deleteWallpaper,
    setVideoPlaying,
    setVideoMuted,
    setShouldLoop,
    setShuffleEnabled,
    triggerRandomWallpaper,
    getWallpaperUrl,
  } = useWallpaper();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats
    const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!supportedTypes.includes(file.type)) {
      setUploadError('Unsupported file format! Please upload PNG, JPG, GIF, WEBP, MP4, or WEBM.');
      return;
    }

    // Limit to 500MB (IndexedDB binary storage easily supports large files)
    const limit = 500 * 1024 * 1024;
    if (file.size > limit) {
      setUploadError('File is too large! Maximum file size is 500MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadWallpaper(file);
    } catch (err) {
      setUploadError('Failed to upload wallpaper. Try a smaller file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const presetList = wallpapers.filter((w) => !w.isCustom);
  const customList = wallpapers.filter((w) => w.isCustom);

  return (
    <div className="flex flex-col gap-6 select-none h-full overflow-y-auto pr-1">
      {/* Upload area */}
      <div>
        <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-2">Upload Custom Wallpaper</h4>
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-white/5 cursor-pointer transition-all ${
            isUploading
              ? 'border-white/20 opacity-60 pointer-events-none'
              : 'border-white/10 hover:border-[var(--accent-color)]/55 hover:bg-white/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
          <Upload className={`w-8 h-8 mb-2 ${isUploading ? 'animate-bounce text-white/50' : 'text-white/40'}`} />
          <span className="text-white/80 font-medium text-sm">
            {isUploading ? 'Uploading file...' : 'Choose image, GIF, or video'}
          </span>
          <span className="text-white/35 text-xs mt-1">PNG, JPG, GIF, WEBP, MP4, WEBM (Max 500MB)</span>
        </div>
        {uploadError && <p className="text-red-400 text-xs mt-2 font-medium">{uploadError}</p>}
      </div>

      {/* Video controls (only active when video background is loaded) */}
      {activeWallpaper.type === 'video' && (
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-around">
          <button
            onClick={() => setVideoPlaying(!isVideoPlaying)}
            className="flex flex-col items-center gap-1 text-white/65 hover:text-white transition-colors"
            title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 text-[var(--accent-color)]" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">Play/Pause</span>
          </button>

          <button
            onClick={() => setVideoMuted(!isVideoMuted)}
            className="flex flex-col items-center gap-1 text-white/65 hover:text-white transition-colors"
            title={isVideoMuted ? 'Unmute' : 'Mute'}
          >
            {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-[var(--accent-color)]" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider">Mute</span>
          </button>

          <button
            onClick={() => setShouldLoop(!shouldLoop)}
            className="flex flex-col items-center gap-1 text-white/65 hover:text-white transition-colors"
            title={shouldLoop ? 'Disable Loop' : 'Enable Loop'}
          >
            <RotateCcw className={`w-5 h-5 ${shouldLoop ? 'text-[var(--accent-color)]' : ''}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Loop</span>
          </button>
        </div>
      )}

      {/* Playback Shuffle Options */}
      <div className="flex gap-3">
        <button
          onClick={() => setShuffleEnabled(!isShuffleEnabled)}
          className={`flex-1 py-2 px-3 border rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            isShuffleEnabled
              ? 'bg-[var(--accent-color)] border-transparent text-white shadow-lg shadow-[var(--accent-color)]/25'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
          }`}
        >
          Shuffle Wallpapers
        </button>
        <button
          onClick={triggerRandomWallpaper}
          className="py-2 px-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl font-bold text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
        >
          Randomize
        </button>
      </div>

      {/* Preset Wallpapers Catalog */}
      <div>
        <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Default Catalog</h4>
        <div className="grid grid-cols-2 gap-3">
          {presetList.map((wp) => (
            <div
              key={wp.id}
              onClick={() => setActiveWallpaperById(wp.id)}
              className={`group relative rounded-xl aspect-[16/10] overflow-hidden border cursor-pointer bg-slate-950/40 transition-all ${
                activeWallpaper.id === wp.id
                  ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/30 scale-[1.02]'
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              {wp.type === 'dynamic' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900">
                  <div className="w-8 h-8 rounded-full border border-white/10 border-t-[var(--accent-color)] animate-spin mb-2" />
                  <span className="text-tiny font-bold uppercase tracking-wider text-white/50">Dynamic stars</span>
                </div>
              ) : (
                <img src={wp.url} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              )}

              {/* Overlay Label */}
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/60 backdrop-blur-sm p-1-5 flex items-center justify-between text-left">
                <span className="text-white/80 font-medium text-tiny truncate max-w-[80%]">{wp.name}</span>
                {activeWallpaper.id === wp.id && <Check className="w-3-5 h-3-5 text-[var(--accent-color)] shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Wallpapers catalog */}
      {customList.length > 0 && (
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-wider uppercase mb-3">Custom Library</h4>
          <div className="grid grid-cols-2 gap-3">
            {customList.map((wp) => (
              <div
                key={wp.id}
                onClick={() => setActiveWallpaperById(wp.id)}
                className={`group relative rounded-xl aspect-[16/10] overflow-hidden border cursor-pointer bg-slate-950/40 transition-all ${
                  activeWallpaper.id === wp.id
                    ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/30 scale-[1.02]'
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {wp.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <video src={getWallpaperUrl(wp)} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute top-1-5 right-1-5 p-1 rounded bg-black/50 text-white/70">
                      <Video className="w-3 h-3" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img src={getWallpaperUrl(wp)} alt={wp.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute top-1-5 right-1-5 p-1 rounded bg-black/50 text-white/70">
                      <Image className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {/* Delete button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWallpaper(wp.id);
                  }}
                  className="absolute top-1-5 left-1-5 p-1-5 rounded-lg bg-black/60 hover:bg-red-500/70 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Custom Wallpaper"
                >
                  <Trash2 className="w-3-5 h-3-5" />
                </button>

                {/* Name Label */}
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/60 backdrop-blur-sm p-1-5 flex items-center justify-between text-left">
                  <span className="text-white/80 font-medium text-tiny truncate max-w-[80%]">{wp.name}</span>
                  {activeWallpaper.id === wp.id && <Check className="w-3-5 h-3-5 text-[var(--accent-color)] shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
