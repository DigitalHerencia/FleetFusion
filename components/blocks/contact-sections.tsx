import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { safeHref } from "@/lib/utils/strings";

export interface ContactMethod {
  icon: ReactNode;
  title: string;
  description: string;
  action: { label: string; href: string };
}

export interface ContactWithCardsProps {
  title?: string;
  description?: string;
  contactMethods: ContactMethod[];
  className?: string;
}

export function ContactWithCards({
  title = "Get in touch",
  description = "Choose your preferred way to reach us.",
  contactMethods,
  className,
}: ContactWithCardsProps) {
  const cardTones = ["bg-primary/10", "bg-secondary/10"];

  return (
    <section className={cn("px-4 py-16 md:px-8 lg:px-16", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
            {title}
          </h2>
          <p className="text-lg font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {contactMethods.map((method, index) => (
            <Card key={method.title} className={cardTones[index % 2]}>
              <CardContent className="space-y-4 p-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center border-3 border-foreground bg-card shadow-[3px_3px_0px_hsl(var(--shadow-color))]">
                  {method.icon}
                </div>
                <h3 className="text-lg font-black uppercase">{method.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {method.description}
                </p>
                <Button variant="outline" asChild>
                  <a href={safeHref(method.action.href)}>
                    {method.action.label}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactInline({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action: { label: string; href: string };
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_hsl(var(--shadow-color))] sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-black uppercase">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild>
        <a href={safeHref(action.href)}>{action.label}</a>
      </Button>
    </section>
  );
}

export const ContactSections = {
  WithCards: ContactWithCards,
  Inline: ContactInline,
};
