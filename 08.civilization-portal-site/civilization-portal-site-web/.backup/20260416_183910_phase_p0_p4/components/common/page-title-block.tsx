type Props = {
  title: string;
  description?: string;
};

export function PageTitleBlock({ title, description }: Props) {
  return (
    <section className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description ? <p className="mt-2 text-sm opacity-80">{description}</p> : null}
    </section>
  );
}
