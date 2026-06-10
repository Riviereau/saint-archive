/*
  ============================================================
  components/FlairPicker.tsx — Multi-select flair chooser
  ============================================================

  TIP FOR LEARNERS:
  This is an "interactive" component — it has STATE.

  STATE is data that can change over time and causes the UI to
  re-render when it does. For example, the list of selected flairs
  changes when the user clicks them.

  React's "useState" hook manages state. The syntax is:
    const [value, setValue] = useState(initialValue);
    - "value" is the current state
    - "setValue(newValue)" updates the state (and re-renders the UI)
    - "initialValue" is what it starts as

  This component uses CONTROLLED STATE — the parent component owns
  the state (selectedFlairIds) and passes it down as props.
  This is called "lifting state up" — the parent knows what's selected.
*/

"use client"; // This line tells Next.js this component needs to run in the browser

import { AVAILABLE_FLAIRS, Flair } from "@/types";
import { FlairBadge } from "./FlairBadge";

interface FlairPickerProps {
  /*
    The currently selected flair IDs (owned by the parent).
  */
  selectedIds: string[];
  /*
    A callback the parent passes in.
    When the user selects/deselects a flair, we call this function
    to tell the parent about the change.
    This is the "controlled component" pattern.
  */
  onChange: (ids: string[]) => void;
  /*
    Maximum number of flairs the user can select.
    Defaults to 3 (see the destructuring default below).
  */
  maxSelect?: number;
}

export function FlairPicker({
  selectedIds,
  onChange,
  maxSelect = 3,
}: FlairPickerProps) {

  /*
    This function handles a click on a flair button.
    "flairId" is the ID of the flair that was clicked.
  */
  function handleToggle(flairId: string) {
    // Is this flair currently selected?
    const isSelected = selectedIds.includes(flairId);

    if (isSelected) {
      // Remove it: filter returns a new array WITHOUT this ID
      onChange(selectedIds.filter((id) => id !== flairId));
    } else {
      // Don't add more than the max
      if (selectedIds.length >= maxSelect) return;
      // Add it: spread the old array, add the new ID
      onChange([...selectedIds, flairId]);
    }
  }

  return (
    <div>
      {/* ---- Flair buttons grid ---- */}
      <div className="flair-picker">
        {/*
          ".map()" iterates over AVAILABLE_FLAIRS and returns a JSX element
          for each one. This is how React renders lists.

          IMPORTANT: Each element in a list needs a unique "key" prop.
          React uses this to track which items changed between renders.
        */}
        {AVAILABLE_FLAIRS.map((flair: Flair) => {
          const isSelected = selectedIds.includes(flair.id);
          const isDisabled = !isSelected && selectedIds.length >= maxSelect;

          return (
            <button
              key={flair.id}       // Required "key" for list items
              type="button"        // Prevents form submission on click!
              onClick={() => handleToggle(flair.id)}
              disabled={isDisabled}
              /*
                Template literal — backtick strings let you embed expressions.
                The class list changes based on whether this flair is selected.
              */
              className={`flair-picker__item ${
                isSelected ? "flair-picker__item--selected" : ""
              }`}
              /*
                Accessibility: tell screen readers whether this is pressed.
                "aria-pressed" is a standard ARIA attribute for toggle buttons.
              */
              aria-pressed={isSelected}
              aria-label={`${isSelected ? "Retirer" : "Ajouter"} le flair ${flair.label}`}
            >
              <FlairBadge flair={flair} size="sm" />
            </button>
          );
        })}
      </div>

      {/* ---- Counter and hint ---- */}
      <p className="form-hint" style={{ marginTop: "8px" }}>
        {selectedIds.length}/{maxSelect} flair{maxSelect > 1 ? "s" : ""} sélectionné{selectedIds.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
