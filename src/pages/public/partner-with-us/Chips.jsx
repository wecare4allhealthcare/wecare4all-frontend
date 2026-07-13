export default function Chips({ options, selected, onChange }) {
  const toggle = (o) =>
    onChange(
      selected.includes(o) ? selected.filter((s) => s !== o) : [...selected, o],
    );
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
      {options.map((o) => (
        <div
          key={o}
          className={`pw-chip${selected.includes(o) ? " on" : ""}`}
          onClick={() => toggle(o)}
        >
          <span>{selected.includes(o) ? "✓" : "○"}</span>
          {o}
        </div>
      ))}
    </div>
  );
}
