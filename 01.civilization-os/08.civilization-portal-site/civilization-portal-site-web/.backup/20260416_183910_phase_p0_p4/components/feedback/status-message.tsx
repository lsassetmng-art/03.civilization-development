type Props = {
  title: string;
  description: string;
};

export function StatusMessage({ title, description }: Props) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm opacity-80">{description}</p>
    </div>
  );
}
