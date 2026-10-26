import Link from "next/link";

export default function NotFound() {
  return (
    <div className="narrow">
      <h1>Page introuvable</h1>
      <p>
        Cet article n&apos;existe pas (ou plus). Vous pouvez le{" "}
        <Link href="/create">créer vous-même</Link> ou{" "}
        <Link href="/">parcourir les articles existants</Link>.
      </p>
    </div>
  );
}
