/*
  lib/diff.ts — Comparaison ligne par ligne de deux textes
  (plus longue sous-séquence commune), sans dépendance externe.
*/

export interface DiffLine {
  type: "same" | "add" | "del";
  text: string;
}

export type DiffItem = DiffLine | { type: "gap"; hidden: number };

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");

  // On retire le début et la fin identiques pour réduire le travail
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const x = a.slice(start, endA);
  const y = b.slice(start, endB);
  const n = x.length;
  const m = y.length;
  const middle: DiffLine[] = [];

  if (n * m > 4_000_000) {
    // Texte énorme : on affiche simplement tout l'ancien puis tout le nouveau
    for (const text of x) middle.push({ type: "del", text });
    for (const text of y) middle.push({ type: "add", text });
  } else {
    const w = m + 1;
    const table = new Uint32Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * w + j] =
          x[i] === y[j]
            ? table[(i + 1) * w + j + 1] + 1
            : Math.max(table[(i + 1) * w + j], table[i * w + j + 1]);
      }
    }

    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (x[i] === y[j]) {
        middle.push({ type: "same", text: x[i] });
        i++;
        j++;
      } else if (table[(i + 1) * w + j] >= table[i * w + j + 1]) {
        middle.push({ type: "del", text: x[i] });
        i++;
      } else {
        middle.push({ type: "add", text: y[j] });
        j++;
      }
    }
    while (i < n) middle.push({ type: "del", text: x[i++] });
    while (j < m) middle.push({ type: "add", text: y[j++] });
  }

  return [
    ...a.slice(0, start).map((text): DiffLine => ({ type: "same", text })),
    ...middle,
    ...a.slice(endA).map((text): DiffLine => ({ type: "same", text })),
  ];
}

/** Ne garde que les lignes modifiées et quelques lignes autour. */
export function withContext(lines: DiffLine[], context = 2): DiffItem[] {
  const keep = new Array<boolean>(lines.length).fill(false);
  lines.forEach((line, i) => {
    if (line.type === "same") return;
    const from = Math.max(0, i - context);
    const to = Math.min(lines.length - 1, i + context);
    for (let k = from; k <= to; k++) keep[k] = true;
  });

  const out: DiffItem[] = [];
  let hidden = 0;
  lines.forEach((line, i) => {
    if (keep[i]) {
      if (hidden > 0) {
        out.push({ type: "gap", hidden });
        hidden = 0;
      }
      out.push(line);
    } else {
      hidden++;
    }
  });
  if (hidden > 0) out.push({ type: "gap", hidden });
  return out;
}
