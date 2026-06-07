interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  color?: string;
}

export default function SliderInput({
  label, value, min, max, step = 1, onChange, lowLabel, highLabel, color = 'var(--primary)',
}: SliderInputProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span
          className="text-lg font-bold min-w-[2rem] text-right"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #e2e8f0 ${percent}%, #e2e8f0 100%)`,
        }}
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">{lowLabel}</span>
          <span className="text-[10px] text-slate-400">{highLabel}</span>
        </div>
      )}
    </div>
  );
}
