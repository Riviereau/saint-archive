"use client";

import { AVAILABLE_FLAIRS } from "@/types";
import { LIMITS } from "@/lib/validate";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/* Cases à cocher stylées comme des étiquettes (accessibles au clavier) */
export function FlairPicker({ selectedIds, onChange }: Props) {
  const max = LIMITS.flairs.max;

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
    }
  }

  return (
    <div className="picker" role="group" aria-label="Catégories">
      {AVAILABLE_FLAIRS.map((flair) => {
        const checked = selectedIds.includes(flair.id);
        const disabled = !checked && selectedIds.length >= max;
        return (
          <label
            key={flair.id}
            className={`picker__item${checked ? " picker__item--on" : ""}${disabled ? " picker__item--off" : ""}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(flair.id)}
            />
            {flair.label}
          </label>
        );
      })}
    </div>
  );
}
