const routes = [
  { label: "画像アップロードで作成", href: "/persona-menu/persona-create/image-upload", className: "left-1/2 top-4 -translate-x-1/2", description: "画像からPersonaを作成します。VTuber等からの移行もこのルートに含めます。" },
  { label: "パーツ選択で作成", href: "/persona-menu/persona-create/parts-select", className: "left-4 top-1/2 -translate-y-1/2", description: "髪型・顔・服装・属性などを選んでPersonaを作成します。" },
  { label: "AI自動生成", href: "/persona-menu/persona-create/ai-generate", className: "right-4 top-1/2 -translate-y-1/2", description: "条件入力からAIでPersonaを自動生成します。" },
  { label: "下書きから再開", href: "/persona-menu/persona-create/drafts", className: "bottom-4 left-1/2 -translate-x-1/2", description: "途中保存したPersona作成を再開します。" },
];

export default function PersonaCreateMenuPage() {
  const nodeClass = "absolute flex h-32 w-32 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-center text-sm font-semibold text-slate-900 shadow-md transition hover:scale-[1.03] hover:shadow-lg";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <section className="mx-auto max-w-5xl">
        <header className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">PersonaBuilder</p>
          <h1 className="text-2xl font-bold">Persona作成</h1>
          <p className="mt-2 text-sm text-slate-600">作成方法を選択してください。途中でドラフト保存できます。</p>
        </header>

        <div className="relative mx-auto mt-6 h-[520px] w-full max-w-[720px]">
          <a href="/persona-menu" className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 px-3 text-center text-lg font-bold text-white shadow-lg">Persona作成</a>
          {routes.map((route) => (
            <a key={route.href} href={route.href} className={`${nodeClass} ${route.className}`}>{route.label}</a>
          ))}
        </div>

        <section className="grid gap-3 md:grid-cols-2">
          {routes.map((route) => (
            <a key={route.href} href={route.href} className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
              <h2 className="font-semibold">{route.label}</h2>
              <p className="mt-1 text-sm text-slate-600">{route.description}</p>
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}
