interface RatingSliderProps {
  label: string;
  id: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function RatingSlider({ label, id, value, onChange }: RatingSliderProps) {
  return (
    <div className="rating-slider">
      <div className="rating-slider-header">
        <label htmlFor={id} className="rating-label">
          {label}
        </label>
        <span className="rating-value">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        id={id}
        name={id}
        min="0"
        max="5"
        step="0.1"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}