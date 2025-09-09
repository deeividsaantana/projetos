import React from "react";
import { Mail, Github, Linkedin } from "lucide-react";
import "./App.css";

export default function App() {
  return (
    <div className="app">

      {/* Navbar */}
      <header className="navbar">
        <div className="logo">Deivid Santana</div>
        <ul className="nav-links">
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#projetos">Projetos</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </header>

      {/* Hero com animação */}
      <section className="hero">
        <h1 className="hero-title">Olá, eu sou Deivid Santana</h1>
        <p className="hero-subtitle">
          Estudante de TI e jovem aprendiz em Help Desk, focado em infraestrutura de redes, suporte técnico e soluções digitais.
        </p>
        <a href="#projetos" className="btn-primary">Ver Projetos</a>
      </section>

      {/* Sobre */}
      <section id="sobre" className="section about">
        <h2>Sobre Mim</h2>
        <p>
          Atualmente estudo Tecnologia da Informação e atuo como jovem aprendiz na área de Help Desk.  
          Tenho foco em infraestrutura de TI, incluindo manutenção de computadores, configuração de redes, suporte a usuários e troubleshooting de sistemas.  
          Sou dedicado, curioso e procuro sempre aprimorar minhas habilidades práticas em ambientes corporativos e projetos de estudo.
        </p>
        <a href="https://www.linkedin.com/in/deivid-santana-546b45297?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" className="btn-linkedin">
          <Linkedin size={20} /> Meu LinkedIn
        </a>
      </section>

      {/* Projetos */}
      <section id="projetos" className="section projetos">
        <h2>Projetos</h2>
        <div className="cards">
          <div className="card">
            <h3>Suporte Técnico Simulado</h3>
            <p>Treinamento prático de atendimento e solução de problemas de computadores e redes.</p>
          </div>
          <div className="card">
            <h3>Monitoramento de Rede</h3>
            <p>Projeto de configuração e monitoramento de redes internas usando ferramentas de TI.</p>
          </div>
          <div className="card">
            <h3>Portfólio Online</h3>
            <p>Site criado para apresentar minhas habilidades, aprendizados e projetos.</p>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="section contato">
        <h2>Contato</h2>
        <p>Entre em contato comigo pelas redes abaixo:</p>
        <div className="icons">
          <a href="mailto:deivid.santana019@gmail.com"><Mail size={32} /></a>
          <a href="https://github.com/seunome"><Github size={32} /></a>
          <a href="https://www.linkedin.com/in/deivid-santana-546b45297?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank"><Linkedin size={32} /></a>
        </div>
      </section>

      <footer>
        © {new Date().getFullYear()} Deivid Santana – Todos os direitos reservados.
      </footer>
    </div>
  );
}
