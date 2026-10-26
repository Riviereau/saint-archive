import type { Metadata } from "next";
import { PostForm } from "@/components/PostForm";
import { RateLimitBar } from "@/components/RateLimitBar";

export const metadata: Metadata = {
  title: "Nouvel article",
  description: "Ajouter un article à l'archive collaborative.",
};

export default function CreatePage() {
  return (
    <div className="narrow">
      <div className="page-head">
        <h1>Nouvel article</h1>
        <p className="muted">
          Aucun compte requis. Votre pseudo est facultatif; sans lui, l&apos;article est publié sous
          « Anonyme ».
        </p>
      </div>

      <RateLimitBar />
      <PostForm mode="create" />
    </div>
  );
}
