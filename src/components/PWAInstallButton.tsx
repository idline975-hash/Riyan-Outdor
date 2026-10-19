import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share, X, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed as a standalone PWA
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aplikasi Terpasang (PWA)</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback modal for browsers that don't support beforeinstallprompt yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleAction}
          title="Pasang aplikasi di layar utama perangkat"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Pasang PWA</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleAction}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md active:scale-98 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black">Pasang di Home Screen</div>
              <div className="text-[10px] text-emerald-100 font-medium">Buka cepat seperti aplikasi native</div>
            </div>
          </div>
          <span className="text-[10px] font-black bg-white/25 px-2 py-0.5 rounded-full uppercase">
            PWA
          </span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 border border-emerald-800/40 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                Aplikasi Home Screen (PWA)
              </div>
              <div className="text-xs font-bold text-white truncate">
                Pasang di Layar Utama HP / Tablet untuk akses instan &amp; offline
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAction}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-[11px] rounded-xl shrink-0 transition-all cursor-pointer shadow-xs"
          >
            Pasang Sekarang
          </button>
        </div>
      )}

      {/* Guided iOS / Browser Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Pasang di Layar Utama (Home Screen)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Akses cepat tanpa browser bar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  Ketuk tombol <strong className="text-slate-900">Bagikan (Share)</strong> <Share className="w-3.5 h-3.5 inline text-blue-600" /> di bilah browser (Safari bawah / Chrome kanan atas).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  Gulir ke bawah lalu pilih menu <strong className="text-slate-900">Tambahkan ke Layar Utama (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  Ketuk <strong className="text-emerald-700 font-extrabold">Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di menu utama ponsel Anda.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Mengerti, Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
