import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const PWAUpdateToast: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodic check for SW update every 60 minutes
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('PWA service worker registration notice:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm w-full p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          {needRefresh ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-blue-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{needRefresh ? 'Pembaruan Tersedia' : 'Siap Offline'}</span>
          </div>

          <p className="text-xs text-slate-300 mt-0.5 leading-snug">
            {needRefresh
              ? 'Versi build baru telah selesai diunduh di latar belakang. Muat ulang sekarang untuk menerapkan fitur terbaru.'
              : 'Aplikasi kasir telah tersimpan di cache lokal dan siap digunakan saat internet terputus.'}
          </p>

          <div className="flex items-center gap-2 mt-3">
            {needRefresh && (
              <button
                type="button"
                onClick={handleUpdate}
                className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Perbarui Sekarang
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
