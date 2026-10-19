import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, SlidersHorizontal, Check, Minimize2 } from 'lucide-react';

export type UiScaleOption = '75' | '80' | '85' | '88' | '90' | '95' | '100';

interface ScaleSelectorProps {
  currentScale: UiScaleOption;
  onSelectScale: (scale: UiScaleOption) => void;
  variant?: 'compact' | 'full';
}

const SCALE_PRESETS: { value: UiScaleOption; label: string; desc: string }[] = [
  { value: '75', label: '75%', desc: 'Sangat Kecil (Maksimal Data)' },
  { value: '80', label: '80%', desc: 'Ekstra Ringkas' },
  { value: '85', label: '85%', desc: 'Kecil Kompak' },
  { value: '88', label: '88%', desc: 'Kompak Rekomendasi' },
  { value: '90', label: '90%', desc: 'Sedang Ringkas' },
  { value: '95', label: '95%', desc: 'Hampir Penuh' },
  { value: '100', label: '100%', desc: 'Standar / Asli' },
];

export const ScaleSelector: React.FC<ScaleSelectorProps> = ({
  currentScale,
  onSelectScale,
  variant = 'compact',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentIndex = SCALE_PRESETS.findIndex((p) => p.value === currentScale);

  const handleZoomOut = () => {
    if (currentIndex > 0) {
      onSelectScale(SCALE_PRESETS[currentIndex - 1].value);
    }
  };

  const handleZoomIn = () => {
    if (currentIndex < SCALE_PRESETS.length - 1) {
      onSelectScale(SCALE_PRESETS[currentIndex + 1].value);
    }
  };

  return (
    <div className="relative inline-block shrink-0" ref={dropdownRef}>
      {/* Quick Controller Pill */}
      <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 rounded-xl p-0.5 text-xs font-bold transition-all shadow-2xs shrink-0">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={currentIndex === 0}
          title="Perkecil Tampilan (-)"
          className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Pilih Skala Ukuran Tampilan Aplikasi"
          className="px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-[11px] font-black text-slate-800 hover:text-blue-600 flex items-center gap-0.5 cursor-pointer whitespace-nowrap"
        >
          <span>{currentScale}%</span>
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          disabled={currentIndex === SCALE_PRESETS.length - 1}
          title="Perbesar Tampilan (+)"
          className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1.5 px-2 border-b border-slate-100 text-slate-800 font-extrabold text-[11px]">
            <div className="flex items-center gap-1.5">
              <Minimize2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Ukuran Tampilan (Zoom)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Pilih skala</span>
          </div>

          <div className="space-y-0.5 mt-1.5">
            {SCALE_PRESETS.map((preset) => {
              const isSelected = preset.value === currentScale;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onSelectScale(preset.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold">{preset.label}</span>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {preset.desc}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] px-1 text-slate-400">
            <span>Rekomendasi kasir: <strong>88%</strong></span>
            <button
              type="button"
              onClick={() => {
                onSelectScale('88');
                setIsOpen(false);
              }}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Reset 88%
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
