type ProjectCardData = {
  slug: string;
  title: string;
  description: string;
  locale: string;
  createdAt?: Date;
};

type ProjectCardProps = {
  project: ProjectCardData;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const excerpt =
    project.description.length > 160
      ? `${project.description.slice(0, 160)}…`
      : project.description;

  const publishedAt = project.createdAt
    ? project.createdAt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-foreground/10 bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {project.locale.toUpperCase()}
        </span>
        {publishedAt ? (
          <span className="text-xs text-foreground/60">{publishedAt}</span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col space-y-3">
        <h2 className="text-xl font-semibold text-foreground transition group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {project.title}
        </h2>
        <p className="flex-1 text-sm leading-7 text-foreground/75">{excerpt}</p>
      </div>
    </article>
  );
}
