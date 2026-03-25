export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FS</span>
          </div>
          <span className="font-semibold text-lg">Fullstack App</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#stack" className="hover:text-foreground transition-colors">Stack</a>
          <a href="#structure" className="hover:text-foreground transition-colors">Structure</a>
          <a href="#api" className="hover:text-foreground transition-colors">API</a>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        <section className="text-center space-y-4">
          <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            Ready to build
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Fullstack TypeScript Starter
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A clean, scalable foundation with React, Vite, Tailwind CSS on the frontend and
            Node.js, Express, TypeScript with MySQL on the backend.
          </p>
        </section>

        <section id="stack" className="space-y-6">
          <h2 className="text-2xl font-semibold">Tech Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Frontend",
                items: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "TanStack Query"],
                color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              },
              {
                label: "Backend",
                items: ["Node.js", "Express 5", "TypeScript", "mysql2", "Pino logging"],
                color: "bg-green-500/10 text-green-600 dark:text-green-400",
              },
            ].map(({ label, items, color }) => (
              <div key={label} className="rounded-xl border border-border p-6 space-y-4">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}>
                  {label}
                </span>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="structure" className="space-y-6">
          <h2 className="text-2xl font-semibold">Project Structure</h2>
          <div className="rounded-xl border border-border bg-muted/30 p-6 font-mono text-sm space-y-1 leading-relaxed">
            {[
              { indent: 0, text: "/" },
              { indent: 1, text: "├── client/          # React + Vite + Tailwind frontend" },
              { indent: 2, text: "│   ├── src/" },
              { indent: 3, text: "│   │   ├── components/   # Reusable UI components" },
              { indent: 3, text: "│   │   ├── pages/        # Page-level components" },
              { indent: 3, text: "│   │   ├── hooks/        # Custom React hooks" },
              { indent: 3, text: "│   │   └── lib/          # Utilities & helpers" },
              { indent: 2, text: "│   └── vite.config.ts" },
              { indent: 1, text: "├── server/          # Node.js + Express + TypeScript backend" },
              { indent: 2, text: "│   ├── src/" },
              { indent: 3, text: "│   │   ├── config/       # DB connection (MySQL)" },
              { indent: 3, text: "│   │   ├── middlewares/  # Error handler, 404" },
              { indent: 3, text: "│   │   ├── routes/       # API route handlers" },
              { indent: 3, text: "│   │   ├── app.ts        # Express app setup" },
              { indent: 3, text: "│   │   └── index.ts      # Entry point" },
              { indent: 1, text: "├── lib/             # Shared workspace libraries" },
              { indent: 1, text: "└── pnpm-workspace.yaml" },
            ].map(({ text }, i) => (
              <div key={i} className="text-muted-foreground">
                {text}
              </div>
            ))}
          </div>
        </section>

        <section id="api" className="space-y-6">
          <h2 className="text-2xl font-semibold">API Endpoints</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Method</th>
                  <th className="text-left px-4 py-3 font-medium">Path</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { method: "GET", path: "/api/healthz", desc: "Health check — returns server status" },
                ].map(({ method, path, desc }) => (
                  <tr key={path}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400 text-xs bg-green-500/10 px-2 py-0.5 rounded">
                        {method}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{path}</td>
                    <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Add your routes in <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">artifacts/api-server/src/routes/</code> and register them in <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">routes/index.ts</code>.
          </p>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        Fullstack Starter — React + Vite + Tailwind · Node.js + Express + MySQL
      </footer>
    </div>
  );
}
