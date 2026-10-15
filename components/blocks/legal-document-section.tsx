import type { ReactNode } from "react";

export interface LegalDocumentSectionProps {
  updatedAt: string;
  updatedAtDateTime: string;
  updatedAtLabel: string;
  introduction: ReactNode;
  sections: readonly { id: string; title: string; content: ReactNode }[];
}

export function LegalDocumentSection({
  updatedAt,
  updatedAtDateTime,
  updatedAtLabel,
  introduction,
  sections,
}: LegalDocumentSectionProps) {
  return (
    <section className="mx-auto max-w-prose px-6 pb-20 leading-relaxed sm:px-10 lg:px-12">
      <p className="mb-10 text-center text-sm text-primary">
        {updatedAtLabel} <time dateTime={updatedAtDateTime}>{updatedAt}</time>
      </p>
      <div>{introduction}</div>
      {sections.map((section) => (
        <section id={section.id} key={section.id} className="mt-8">
          <h2 className="mb-3 text-xl leading-snug font-bold">
            {section.title}
          </h2>
          <div>{section.content}</div>
        </section>
      ))}
    </section>
  );
}
