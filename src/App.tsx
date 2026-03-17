import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

function App() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
              T
            </div>
            <span className="text-lg font-semibold tracking-tight">TestBot</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              {dark ? "●" : "○"}
            </span>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:pt-36 md:pb-28 max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-mono tracking-wide border-violet-500/30 text-violet-500">
            EXPERIMENT.01
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
            Build
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              something
            </span>
            <br />
            cool.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
            A playground for testing bots, automations, and whatever wild ideas come to mind.
          </p>
          <div className="flex gap-3">
            <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 border-0 text-white shadow-lg shadow-violet-500/25">
              Start Building
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full px-8">
              Learn More →
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "∞", label: "Possibilities" },
            { value: "0", label: "Limits" },
            { value: "1", label: "You" },
          ].map((s) => (
            <div key={s.label} className="text-center py-8 rounded-2xl bg-card/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
            Batteries Included
          </h2>
          <p className="text-sm text-muted-foreground">Modern stack, zero compromise.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: "⚡",
              title: "Vite + React",
              desc: "Instant HMR, blazing builds. Because waiting is for chumps.",
              color: "from-amber-500/20 to-orange-500/20",
            },
            {
              icon: "🎨",
              title: "shadcn/ui",
              desc: "Copy-paste components that actually look good. Revolutionary.",
              color: "from-violet-500/20 to-purple-500/20",
            },
            {
              icon: "🌊",
              title: "Tailwind CSS v4",
              desc: "Utility-first CSS that doesn't make you want to cry.",
              color: "from-cyan-500/20 to-blue-500/20",
            },
            {
              icon: "🔒",
              title: "TypeScript",
              desc: "Strict mode on. Because 'undefined is not a function' gets old.",
              color: "from-emerald-500/20 to-green-500/20",
            },
          ].map((f) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-300 bg-card/50"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardContent className="relative p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-12 md:p-16 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <h2 className="relative text-3xl md:text-4xl font-black tracking-tight mb-4">
            Ready to experiment?
          </h2>
          <p className="relative text-white/70 mb-8 max-w-md mx-auto">
            This is your sandbox. Break things, build things, learn things.
          </p>
          <Button size="lg" variant="secondary" className="relative rounded-full px-8 font-semibold">
            Let's Go 🚀
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>Built with 💜 by 小美</span>
          <span className="font-mono">2026</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
