import { StatusMessage } from "../feedback/status-message";
import type {
  PortalCmsBlock,
  PortalCmsSection,
} from "../../types/portal-cms-api";

type CmsSectionRendererProps = {
  sections: PortalCmsSection[];
};

const renderBlock = (block: PortalCmsBlock, key: string) => {
  if (block.kind === "paragraph") {
    return (
      <article key={key} className="card">
        <p className="section-copy">{block.body}</p>
      </article>
    );
  }

  if (block.kind === "bullet_list") {
    return (
      <article key={key} className="card">
        <ul className="list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <div key={key}>
      <StatusMessage
        title={block.title}
        message={block.body}
        variant={block.tone}
      />
    </div>
  );
};

export function CmsSectionRenderer({
  sections,
}: CmsSectionRendererProps) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="page-section">
          <h2 className="section-title">{section.title}</h2>
          <div className={section.layout === "grid-2" ? "grid-2" : "stack"}>
            {section.blocks.map((block, index) =>
              renderBlock(block, `${section.id}-${index}`),
            )}
          </div>
        </section>
      ))}
    </>
  );
}
