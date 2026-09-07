# 🚀 SynerRH

O **SynerRH** é uma aplicação Full Stack de Gestão de Pessoas e Desempenho, desenvolvida para centralizar informações sobre colaboradores, avaliações de desempenho, Planos de Desenvolvimento Individual (PDI), feedbacks, ciclos de avaliação e indicadores estratégicos de RH.

O projeto une minha experiência profissional na área administrativa aos conhecimentos adquiridos em Análise e Desenvolvimento de Sistemas, aplicando tecnologia a um contexto real de negócio.

* **🌐 Projeto online:** [https://synerrh-frontend.onrender.com/](https://synerrh-frontend.onrender.com/)
* **💻 Repositório:** [https://github.com/nataliapastre-dev/SynerRH](https://github.com/nataliapastre-dev/SynerRH)

---

## 📸 Demonstração da Aplicação

<div align="center">
  <a href="https://postimg.cc/gallery/gLQS0nX" target="_blank">
    <img src="https://i.postimg.cc/rppQjTtP/syner-RH-cover.jpg" alt="SynerRH - Gestão e Desenvolvimento de Colaboradores" width="100%" />
  </a>
 

---

## 💡 Como surgiu o projeto

O SynerRH não nasceu como um sistema completo de gestão de pessoas. 

Sua primeira versão chamava-se **People Performance**, focada inicialmente no acompanhamento de desempenho dos colaboradores. O projeto nasceu da fusão de dois pilares da minha trajetória: mais de uma década de vivência na área administrativa — lidando com processos, dados, atendimento e gestão — com a minha formação em Análise e Desenvolvimento de Sistemas.

Ao iniciar minha transição para a tecnologia, vi a oportunidade de transformar essa bagagem corporativa em código, criando uma aplicação com forte contexto de negócio e aplicando na prática meus conhecimentos de desenvolvimento.

Com o tempo, o escopo expandiu-se muito além da performance, incorporando a gestão de colaboradores, ciclos de avaliação, PDIs, feedbacks, cronogramas e indicadores estratégicos. Diante dessa evolução, o nome *People Performance* deixou de refletir a magnitude da plataforma, dando lugar ao **SynerRH**.

O nome traduz a **sinergia** entre pessoas, gestão, desenvolvimento e tecnologia. Mais do que um portfólio de programação, o SynerRH consolida a ponte entre o meu passado corporativo e a minha carreira como desenvolvedora: de um lado, a visão crítica de processos, organização e dados; do outro, a engenharia de uma aplicação full stack robusta, do frontend ao banco de dados.

---

## 🎯 Objetivo

O objetivo do SynerRH é simular uma aplicação corporativa capaz de centralizar informações importantes para a gestão e o desenvolvimento de colaboradores.

Durante sua construção, o projeto permitiu aplicar na prática conceitos como:

* Desenvolvimento Frontend e Backend
* Componentização e responsividade
* Criação e consumo de API REST
* Regras de negócio
* Modelagem e relacionamentos de banco de dados
* Integração entre frontend, backend e banco
* Versionamento com Git e GitHub
* Configuração de ambiente
* Migração de banco de dados
* Deploy de uma aplicação Full Stack

---

---

## ✨ Funcionalidades

O sistema conta com:

* 📊 **Dashboard** com indicadores de Gestão de Pessoas
* 👥 **Colaboradores** e perfis individuais
* 🎯 **Avaliações de desempenho** e ciclos de avaliação
* 📈 **PDI** com acompanhamento de progresso e status
* 💬 **Feedbacks** dos colaboradores
* 📅 **Cronograma** de atividades e ciclos
* 🤖 **People Insights** para análise dos dados do sistema
* 🔎 **Pesquisas e filtros** avançados
* 📱 **Interface responsiva** para desktop e dispositivos móveis

---

## 🛠️ Tecnologias

### Frontend
* React
* TypeScript
* Vite
* Tailwind CSS

### Backend
* Node.js
* TypeScript
* Fastify
* API REST

### Banco de Dados
* PostgreSQL
* Prisma ORM

### Infraestrutura e Versionamento
* Render
* Git
* GitHub

---

A aplicação utiliza **PostgreSQL** em produção, com o **Prisma ORM** responsável pelo acesso, modelagem e relacionamento dos dados.

---


---

## 📊 Ambiente de demonstração

O sistema conta com uma base de dados demonstrativa estruturada com **24 colaboradores**, contemplando também avaliações de desempenho, PDIs, feedbacks, ciclos e todas as informações necessárias para explorar as funcionalidades da plataforma.

> *Nota: Os dados apresentados possuem finalidade exclusivamente demonstrativa.*

---

## 🌐 Aplicação publicada

O SynerRH está online e pronto para ser acessado diretamente pelo navegador:

🔗 **[https://synerrh-frontend.onrender.com/](https://synerrh-frontend.onrender.com/)**

O ambiente em produção integra o seguinte fluxo tecnológico: `React/Vite` → `Fastify` → `Prisma` → `PostgreSQL` (frontend, backend e banco de dados totalmente conectados).

*Observação: por utilizar infraestrutura gratuita de hospedagem, o primeiro carregamento após períodos de inatividade pode levar alguns segundos enquanto o serviço é reiniciado.*

---

## 📚 Documentação

Todo o processo de concepção e desenvolvimento do SynerRH foi rigorosamente documentado. Enquanto este README oferece uma visão macro e executiva da aplicação, a documentação técnica e detalhada do projeto encontra-se disponível na pasta `docs/` do repositório.

Nela, estão registrados a fundo tópicos essenciais como:
* A transição e evolução do *People Performance* para o **SynerRH**
* Arquitetura e estrutura organizacional do sistema
* Regras de negócio e detalhamento das funcionalidades
* Arquitetura de frontend e backend
* Modelagem de banco de dados e contrato de API
* Decisões técnicas e arquiteturais tomadas
* Desafios enfrentados, problemas encontrados e soluções implementadas
* Histórico de evolução e o processo de deploy

Essa documentação serve para registrar não apenas o produto final entregue, mas todo o raciocínio, os aprendizados e as decisões estratégicas que moldaram a construção do SynerRH.

---

---

## 🏗️ Arquitetura

O SynerRH adota uma arquitetura desacoplada, com frontend e backend independentes que se comunicam por meio de uma API REST robusta.

```text
React + TypeScript
        ↓
     API REST
        ↓
Fastify + TypeScript
        ↓
   Prisma ORM
        ↓
    PostgreSQL
