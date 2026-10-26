import Link from "next/link";
import type { Flair } from "@/types";

/* Petite étiquette. Si "href" est fourni, elle devient un lien de filtre. */
export function FlairTag({ flair, href }: { flair: Flair; href?: string }) {
  const className = `tag tag--${flair.kind}${flair.id === "source" ? " tag--ok" : ""}${
    flair.id === "a-verifier" ? " tag--warn" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {flair.label}
      </Link>
    );
  }
  return <span className={className}>{flair.label}</span>;
}
