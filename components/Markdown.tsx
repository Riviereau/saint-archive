import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { slugify } from "@/lib/utils";

/* Récupère le texte brut d'un titre pour fabriquer son ancre (#id) */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

/* Le HTML brut n'est pas interprété par react-markdown : le contenu des
   utilisateurs ne peut donc pas injecter de balises <script>. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
