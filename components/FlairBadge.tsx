/*
  ============================================================
  components/FlairBadge.tsx — A single flair badge
  ============================================================

  TIP FOR LEARNERS:
  This is a React "component". A component is a reusable piece of UI.
  Think of it like a custom HTML tag: <FlairBadge flair={...} />

  In React, components are functions that:
  1. Accept "props" (inputs, like HTML attributes)
  2. Return JSX (HTML-like syntax that React turns into real HTML)

  FILE NAMING: Component files use PascalCase (CapitalizedWords).
  Regular utility files use camelCase (lowercaseFirst).
*/

import { Flair } from "@/types";

/*
  "interface" defines the shape of the props this component accepts.
  TypeScript will warn you if you pass the wrong props.
*/
interface FlairBadgeProps {
  flair: Flair;
  /*
    "size" has a default value — see how we use it below.
    The "?" means it's optional — you don't HAVE to pass it.
  */
  size?: "sm" | "base";
}

/*
  This is the component itself.
  It's a function that takes "props" and returns JSX.

  The syntax "{ flair, size = 'base' }" is called "destructuring":
  it pulls the flair and size properties out of the props object.
  size = 'base' sets a default value if size isn't passed.
*/
export function FlairBadge({ flair, size = "base" }: FlairBadgeProps) {
  return (
    /*
      We use the CSS class "flair" from globals.css.
      The "data-category" attribute is how our CSS knows which color to use.
      In CSS: .flair[data-category="corruption"] { color: red; }
    */
    <span
      className={`flair ${size === "sm" ? "text-xs" : ""}`}
      data-category={flair.category}
    >
      {/* Conditionally render the emoji — only if it exists */}
      {flair.emoji && (
        <span aria-hidden="true">{flair.emoji}</span>
        /* aria-hidden="true" hides the emoji from screen readers
           because screen readers would read "fire emoji" which is noisy */
      )}
      {flair.label}
    </span>
  );
}
