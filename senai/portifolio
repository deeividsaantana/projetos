import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Linkedin,
  Instagram,
  Mail,
  ExternalLink,
  Sparkles,
  Rocket,
  Palette,
  Code,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

// ==== ONE-FILE REACT PORTFOLIO ====
// Visual premium, animações suaves, pronto para personalizar e publicar no GitHub Pages.
// Dicas de uso no final do arquivo.

const projects = [
  {
    title: "Landing Page Fitness",
    description:
      "Landing focada em conversão para academia: copy enxuta, CTA destacado e depoimentos.",
    tags: ["Next.js", "Tailwind", "Vercel"],
    href: "#",
  },
  {
    title: "E-commerce Minimalista",
    description:
      "Loja com carrinho e checkout simulado. Catálogo limpo e rápido.",
    tags: ["React", "Stripe (mock)", "Zustand"],
    href: "#",
  },
  {
    title: "Site de Restaurante",
    description:
      "Menu dinâmico, reservas por WhatsApp e fotos otimizadas.",
    tags: ["Vite", "Tailwind", "SEO"],
    href: "#",
  },
];

const services = [
  {
    icon: Rocket,
    title: "Landing Pages que Vendem",
    text: "Páginas rápidas, SEO técnico e copy orientada à conversão.",
  },
  {
    icon: Palette,
    title: "Design Premium",
    text: "Layout autoral, tipografia elegante e paletas modernas.",
  },
  {
    icon: Code,
    title: "Sites Profissionais",
    text: "Código limpo, responsivo e fácil de manter.",
  },
];

const stack = [
  "React",
  "Next.js",
  "Vite",
  "Tailwind",
  "TypeScript",
  "Framer Motion",
  "Shadcn/ui",
  "Vercel",
];

function Glass({ className = "", children }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function GradientBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* grade suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.12),transparent_40%)]" />
      {/* blobs animados */}
      <motion.div
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        animate={{ x: [0, -25, 15, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Nav() {
  const links = [
    { id: "servicos", label: "Serviços" },
    { id: "projetos", label: "Projetos" },
    { id: "sobre", label: "Sobre" },
    { id: "contato", label: "Contato" },
  ];
  return (
    <nav className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/40 bg-white/10 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="font-semibold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span>Deivid Santana</span>
          <span className="text-white/60 hidden sm:inline">• Portfólio</span>
        </a>
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-sm text-white/80 hover:text-white transition"
            >
              {l.label}
            </a>
          ))}
          <Button asChild variant="secondary" className="rounded-full">
            <a href="#contato">Vamos conversar</a>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative pt-24 pb-16 md:pt-28 md:pb-24">
      <GradientBackground />
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-white"
          >
            Eu crio <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300">sites deslumbrantes</span>
            <br /> que <span className="underline decoration-cyan-300/60">vendem</span>.
          </motion.h1>
          <p className="mt-5 text-white/80 leading-relaxed max-w-xl">
            Desenvolviment            cd meu-portfolio
            npm install
            npm run devo front-end focado em performance, SEO e conversão. Design autoral com
            atenção aos detalhes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <a href="#projetos">
                Ver projetos
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10">
              <a href="#contato">
                Fale comigo
                <Mail className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {stack.map((s) => (
              <Badge key={s} variant="secondary" className="bg-white/10 text-white border-white/20">
                {s}
              </Badge>
            ))}
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Glass className="p-6 md:p-8">
            <div className="aspect-[4/3] rounded-xl overflow-hidden">
              {/* Placeholder de "mockup" */}
              <div className="h-full w-full bg-gradient-to-br from-white/20 to-white/5 grid place-items-center">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Showcase</p>
                  <p className="text-2xl md:text-3xl font-semibold text-white mt-2">Sites rápidos. Bonitos. Que convertem.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-white/70 text-sm">Disponível para novos projetos</div>
              <div className="flex items-center gap-2">
                <a href="#" aria-label="GitHub" className="p-2 hover:bg-white/10 rounded-lg"><Github className="h-5 w-5" /></a>
                <a href="#" aria-label="LinkedIn" className="p-2 hover:bg-white/10 rounded-lg"><Linkedin className="h-5 w-5" /></a>
                <a href="#" aria-label="Instagram" className="p-2 hover:bg-white/10 rounded-lg"><Instagram className="h-5 w-5" /></a>
              </div>
            </div>
          </Glass>
        </motion.div>
      </div>
    </header>
  );
}

function Services() {
  return (
    <section id="servicos" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white">Como eu te ajudo</h2>
          <span className="text-white/60 text-sm">Processo ágil • Resultados reais</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-white/10 grid place-items-center">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white mt-4">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projetos" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-white">Projetos em destaque</h2>
          <a href="#" className="text-white/70 hover:text-white text-sm flex items-center gap-1">
            Ver repositórios <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card key={p.title} className="group bg-white/5 border-white/10 overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-video bg-gradient-to-br from-cyan-300/20 to-purple-300/20 group-hover:from-cyan-300/30 group-hover:to-purple-300/30 transition" />
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-white font-semibold text-lg">{p.title}</h3>
                  <a
                    href={p.href}
                    className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10"
                    aria-label="Abrir projeto"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-white/70 mt-2 text-sm leading-relaxed">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-white/10 text-white border-white/20">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        <Glass className="p-6 md:p-8 order-2 md:order-1">
          <h3 className="text-white text-2xl font-semibold">Sobre mim</h3>
          <p className="text-white/70 mt-3 leading-relaxed">
            Sou <span className="text-white">Deivid Santana</span>, desenvolvedor front‑end focado em criar experiências digitais
            bonitas e eficientes. Cada projeto é pensado para gerar valor real ao seu negócio.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary" className="bg-white/10 text-white border-white/20">
                {t}
              </Badge>
            ))}
          </div>
        </Glass>
        <div className="order-1 md:order-2">
          <h2 className="text-2xl md:text-4xl font-bold text-white">Design + Código = Resultado</h2>
          <p className="text-white/70 mt-3 leading-relaxed">
            Eu uno estética, performance e estratégia. Isso significa sites mais rápidos, fáceis de usar
            e com mensagens claras, que aumentam conversões.
          </p>
          <ul className="mt-4 space-y-2 text-white/80 text-sm">
            <li>• Foco em Core Web Vitals</li>
            <li>• Acessibilidade e responsividade</li>
            <li>• SEO técnico desde o início</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const email = "mailto:seu.email@exemplo.com?subject=Projeto%20de%20site&body=Olá%20Deivid,%20vamos%20conversar%20sobre%20um%20projeto.";
  return (
    <section id="contato" className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4">
        <Glass className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-semibold">Vamos construir algo incrível?</h3>
              <p className="text-white/70 mt-2">Envie um e-mail ou me chame nas redes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <a href={email}><Mail className="mr-2 h-4 w-4" /> E-mail</a>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full">
                <a href="#"><Github className="mr-2 h-4 w-4" /> GitHub</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/30 text-white hover:bg-white/10">
                <a href="#"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</a>
              </Button>
            </div>
          </div>
        </Glass>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-white/70">
        <p>© {new Date().getFullYear()} Deivid Santana. Todos os direitos reservados.</p>
        <div className="flex items-center gap-2 text-sm">
          <a className="hover:text-white" href="#">Política de Privacidade</a>
          <span className="opacity-40">·</span>
          <a className="hover:text-white" href="#">Termos</a>
        </div>
      </div>
    </footer>
  );
}

export default function Portfolio() {
  // Paleta base escura + vidro + gradientes sutis
  return (
    <div className="min-h-screen text-white bg-slate-950 selection:bg-cyan-500/30">
      <Nav />
      <main>
        <Hero />
        <Services />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />

      {/* Dicas rápidas de publicação (remova antes de publicar):
        1) Crie um projeto Vite: npm create vite@latest meu-portfolio -- --template react
        2) Adicione Tailwind e shadcn/ui seguindo a doc dos dois.
        3) Substitua o App.jsx pelo componente acima.
        4) Deploy no GitHub Pages (gh-pages) ou Vercel.
        5) Personalize: links, e-mail, projetos e imagens.
      */}
    </div>
  );
}
