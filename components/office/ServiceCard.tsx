type ServiceCardData = {
  slug: string;
  title: string;
  description: string;
  locale: string;
};

type ServiceCardProps = {
  service: ServiceCardData;
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const excerpt =
    service.description.length > 160
      ? `${service.description.slice(0, 160)}…`
      : service.description;

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {service.locale.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col space-y-3">
        <h2 className="text-xl font-semibold text-foreground transition group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {service.title}
        </h2>
        <p className="flex-1 text-sm leading-7 text-foreground/75">{excerpt}</p>
      </div>
    </article>
  );
}
