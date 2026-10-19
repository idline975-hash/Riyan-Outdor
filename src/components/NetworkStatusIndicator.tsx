import React, { useState } from 'react';
import { Wifi, WifiOff, CloudCheck, RefreshCw, X } from 'lucide-react';

interface NetworkStatusIndicatorProps {
  isOnline: boolean;
  isConnected: boolean;
  pendingCount: number;
  syncToastMessage: string | null;
  onDismissToast: () => void;
  hidePill?: boolean;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  isOnline,
  isConnected,
  pendingCount,
  syncToastMessage,
  onDismissToast,
  hidePill = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Toast Notification when background sync finishes */}
      {syncToastMessage && (
        <div className="fixed top-16 sm:top-5 right-3 sm:right-6 z-50 max-w-sm w-full p-3.5 bg-emerald-900 text-white rounded-2xl shadow-xl border border-emerald-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-2.5">
            <CloudCheck className="w-5 h-5 text-emerald-300 shrink-0" />
            <p className="text-xs font-bold leading-tight">{syncToastMessage}</p>
          </div>
          <button
            type="button"
            onClick={onDismissToast}
            className="p-1 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pill Badge in Top Header */}
      {!hidePill && (
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          title={
            !isOnline
              ? 'Perangkat sedang Offline - Mode lokal & antrian sync aktif'
              : isConnected
              ? 'Terhubung Realtime - Data tersinkronisasi dua arah'
              : 'Menyambungkan ke Server Realtime...'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
            !isOnline
              ? 'bg-amber-500/15 text-amber-800 border-amber-300'
              : isConnected
              ? 'bg-emerald-500/15 text-emerald-800 border-emerald-300'
              : 'bg-blue-500/15 text-blue-800 border-blue-300'
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Offline</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-black">
                  {pendingCount}
                </span>
              )}
            </>
          ) : isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Live Realtime</span>
              <span className="sm:hidden">Live</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </>
          )}
        </button>
      )}

      {/* Details Popover */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4.5 shadow-2xl border border-slate-200 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                {!isOnline ? (
                  <WifiOff className="w-5 h-5 text-amber-500" />
                ) : (
                  <Wifi className="w-5 h-5 text-emerald-500" />
                )}
                <h4 className="text-sm font-extrabold text-slate-900">
                  Status Sinkronisasi &amp; Jaringan
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status Internet:</span>
                <span
                  className={`font-black ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}
                >
                  {isOnline ? '● Online (Terhubung)' : '○ Offline (Terputus)'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">WebSocket Server:</span>
                <span
                  className={`font-black ${isConnected ? 'text-emerald-700' : 'text-amber-700'}`}
                >
                  {isConnected ? '● Connected (Aktif)' : '○ Reconnecting...'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Antrean Sync Offline:</span>
                <span
                  className={`font-black ${
                    pendingCount > 0 ? 'text-amber-700' : 'text-slate-700'
                  }`}
                >
                  {pendingCount} perubahan pending
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug pt-1">
                ℹ️ Jika offline, semua transaksi tetap dapat diinput dan disimpan dengan aman di penyimpanan lokal. Begitu koneksi internet pulih, sistem secara otomatis mengeksekusi <em>Background Sync</em> ke server.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
