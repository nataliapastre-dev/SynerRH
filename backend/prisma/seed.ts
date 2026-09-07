
import prisma from "../src/prisma";
async function main() {
  console.log("🌱 Iniciando seed do SynerRH...");

  // =========================================================
  // COLABORADORES
  // =========================================================

  const colaboradores = [
    {
      matricula: "SYR0001",
      nome: "Natália Pastre",
      email: "natalia.pastre@synerhcorp.com.br",
      cargo: "Desenvolvedora Front-end",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2024-02-05"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0002",
      nome: "Ana Souza",
      email: "ana.souza@synerhcorp.com.br",
      cargo: "Analista de Recursos Humanos",
      departamento: "Recursos Humanos",
      dataAdmissao: new Date("2021-04-12"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0003",
      nome: "Carlos Eduardo",
      email: "carlos.eduardo@synerhcorp.com.br",
      cargo: "Desenvolvedor Back-end",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2022-06-20"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0004",
      nome: "Juliana Martins",
      email: "juliana.martins@synerhcorp.com.br",
      cargo: "Product Manager",
      departamento: "Produto",
      dataAdmissao: new Date("2020-09-14"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0005",
      nome: "Bruno Almeida",
      email: "bruno.almeida@synerhcorp.com.br",
      cargo: "UX Designer",
      departamento: "Produto",
      dataAdmissao: new Date("2023-01-09"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0006",
      nome: "Camila Rocha",
      email: "camila.rocha@synerhcorp.com.br",
      cargo: "Analista Financeiro",
      departamento: "Financeiro",
      dataAdmissao: new Date("2019-08-19"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0007",
      nome: "Daniel Oliveira",
      email: "daniel.oliveira@synerhcorp.com.br",
      cargo: "Coordenador de Tecnologia",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2018-03-12"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0008",
      nome: "Eduarda Lima",
      email: "eduarda.lima@synerhcorp.com.br",
      cargo: "Analista de Marketing",
      departamento: "Marketing",
      dataAdmissao: new Date("2022-02-07"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0009",
      nome: "Felipe Santos",
      email: "felipe.santos@synerhcorp.com.br",
      cargo: "Executivo de Vendas",
      departamento: "Comercial",
      dataAdmissao: new Date("2021-07-26"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0010",
      nome: "Gabriela Alves",
      email: "gabriela.alves@synerhcorp.com.br",
      cargo: "Analista de Dados",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2023-06-05"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0011",
      nome: "Henrique Costa",
      email: "henrique.costa@synerhcorp.com.br",
      cargo: "Gerente Financeiro",
      departamento: "Financeiro",
      dataAdmissao: new Date("2017-11-13"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0012",
      nome: "Isabela Ribeiro",
      email: "isabela.ribeiro@synerhcorp.com.br",
      cargo: "Business Partner",
      departamento: "Recursos Humanos",
      dataAdmissao: new Date("2020-01-20"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0013",
      nome: "João Pedro",
      email: "joao.pedro@synerhcorp.com.br",
      cargo: "Desenvolvedor Full Stack",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2022-08-15"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0014",
      nome: "Larissa Mendes",
      email: "larissa.mendes@synerhcorp.com.br",
      cargo: "Analista Comercial",
      departamento: "Comercial",
      dataAdmissao: new Date("2024-04-08"),
      status: "FERIAS" as const,
    },
    {
      matricula: "SYR0015",
      nome: "Lucas Fernandes",
      email: "lucas.fernandes@synerhcorp.com.br",
      cargo: "QA Engineer",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2023-03-27"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0016",
      nome: "Mariana Castro",
      email: "mariana.castro@synerhcorp.com.br",
      cargo: "Analista de Departamento Pessoal",
      departamento: "Recursos Humanos",
      dataAdmissao: new Date("2022-10-17"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0017",
      nome: "Mateus Barbosa",
      email: "mateus.barbosa@synerhcorp.com.br",
      cargo: "Executivo de Vendas",
      departamento: "Comercial",
      dataAdmissao: new Date("2025-01-20"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0018",
      nome: "Patrícia Gomes",
      email: "patricia.gomes@synerhcorp.com.br",
      cargo: "Coordenadora de Marketing",
      departamento: "Marketing",
      dataAdmissao: new Date("2020-08-03"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0019",
      nome: "Rafael Nunes",
      email: "rafael.nunes@synerhcorp.com.br",
      cargo: "DevOps Engineer",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2021-05-24"),
      status: "AFASTADO" as const,
    },
    {
      matricula: "SYR0020",
      nome: "Renata Duarte",
      email: "renata.duarte@synerhcorp.com.br",
      cargo: "Analista de Comunicação",
      departamento: "Marketing",
      dataAdmissao: new Date("2023-11-13"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0021",
      nome: "Ricardo Moraes",
      email: "ricardo.moraes@synerhcorp.com.br",
      cargo: "Gerente Comercial",
      departamento: "Comercial",
      dataAdmissao: new Date("2018-06-18"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0022",
      nome: "Sofia Cardoso",
      email: "sofia.cardoso@synerhcorp.com.br",
      cargo: "Analista de Produto",
      departamento: "Produto",
      dataAdmissao: new Date("2024-09-09"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0023",
      nome: "Thiago Martins",
      email: "thiago.martins@synerhcorp.com.br",
      cargo: "Analista de Suporte",
      departamento: "Tecnologia",
      dataAdmissao: new Date("2022-12-05"),
      status: "ATIVO" as const,
    },
    {
      matricula: "SYR0024",
      nome: "Vanessa Freitas",
      email: "vanessa.freitas@synerhcorp.com.br",
      cargo: "Analista Administrativo",
      departamento: "Administrativo",
      dataAdmissao: new Date("2023-01-16"),
      status: "ATIVO" as const,
    },
  ];

  console.log("👥 Cadastrando colaboradores...");

  for (const colaborador of colaboradores) {
    await prisma.colaborador.upsert({
      where: {
        matricula: colaborador.matricula,
      },
      update: {
        nome: colaborador.nome,
        email: colaborador.email,
        cargo: colaborador.cargo,
        departamento: colaborador.departamento,
        dataAdmissao: colaborador.dataAdmissao,
        status: colaborador.status,
      },
      create: colaborador,
    });
  }

  // =========================================================
  // LIMPEZA DOS DADOS DE DEMONSTRAÇÃO
  // =========================================================

  console.log("🧹 Limpando dados antigos de demonstração...");

  await prisma.feedback.deleteMany();
  await prisma.pDI.deleteMany();
  await prisma.avaliacao.deleteMany();
  await prisma.cicloAvaliacao.deleteMany();

  console.log("✅ Dados antigos de demonstração removidos.");

  // =========================================================
  // MAPA DE COLABORADORES
  // =========================================================

  const colaboradoresBanco = await prisma.colaborador.findMany({
    select: {
      id: true,
      matricula: true,
      nome: true,
    },
  });

  const colaboradorPorMatricula = new Map(
    colaboradoresBanco
      .filter((colaborador) => colaborador.matricula !== null)
      .map((colaborador) => [colaborador.matricula!, colaborador]),
  );

  function obterColaborador(matricula: string) {
    const colaborador = colaboradorPorMatricula.get(matricula);

    if (!colaborador) {
      throw new Error(`Colaborador ${matricula} não encontrado.`);
    }

    return colaborador;
  }

  // =========================================================
  // CICLO DE AVALIAÇÃO
  // =========================================================

  console.log("📅 Cadastrando ciclo de avaliação...");

  const dataInicioCiclo = new Date("2026-08-31");
  const dataFimCiclo = new Date("2026-12-14");

  const ciclo = await prisma.cicloAvaliacao.upsert({
    where: {
      nome_dataInicio_dataFim: {
        nome: "1º Ciclo de Avaliação 2026",
        dataInicio: dataInicioCiclo,
        dataFim: dataFimCiclo,
      },
    },
    update: {
      descricao: "Primeiro ciclo de avaliação de desempenho do SynerRH",
      ativo: true,
    },
    create: {
      nome: "1º Ciclo de Avaliação 2026",
      descricao: "Primeiro ciclo de avaliação de desempenho do SynerRH",
      dataInicio: dataInicioCiclo,
      dataFim: dataFimCiclo,
      ativo: true,
    },
  });

  // =========================================================
  // AVALIAÇÕES
  // =========================================================

  console.log("📝 Cadastrando avaliações...");

  const avaliacoes = [
    {
      matricula: "SYR0001",
      status: "EM_ANDAMENTO" as const,
      nota: null,
      comentario: "Avaliação em andamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0002",
      status: "CONCLUIDA" as const,
      nota: 9.2,
      comentario: "Excelente atuação no suporte às estratégias de pessoas.",
      dataConclusao: new Date("2026-09-02"),
    },
    {
      matricula: "SYR0003",
      status: "CONCLUIDA" as const,
      nota: 7.4,
      comentario: "Bom desempenho técnico, com oportunidade de evolução em comunicação.",
      dataConclusao: new Date("2026-09-03"),
    },
    {
      matricula: "SYR0004",
      status: "CONCLUIDA" as const,
      nota: 9.5,
      comentario: "Excelente liderança de produto e alinhamento entre áreas.",
      dataConclusao: new Date("2026-09-01"),
    },
    {
      matricula: "SYR0005",
      status: "EM_ANDAMENTO" as const,
      nota: null,
      comentario: "Avaliação em andamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0006",
      status: "CONCLUIDA" as const,
      nota: 8.6,
      comentario: "Boa organização e precisão nas análises financeiras.",
      dataConclusao: new Date("2026-09-04"),
    },
    {
      matricula: "SYR0007",
      status: "CONCLUIDA" as const,
      nota: 9.4,
      comentario: "Forte liderança técnica e boa gestão da equipe.",
      dataConclusao: new Date("2026-09-02"),
    },
    {
      matricula: "SYR0008",
      status: "PENDENTE" as const,
      nota: null,
      comentario: null,
      dataConclusao: null,
    },
    {
      matricula: "SYR0009",
      status: "CONCLUIDA" as const,
      nota: 6.8,
      comentario: "Resultados consistentes, mas precisa melhorar o acompanhamento das metas.",
      dataConclusao: new Date("2026-09-03"),
    },
    {
      matricula: "SYR0010",
      status: "CONCLUIDA" as const,
      nota: 9.1,
      comentario: "Ótima capacidade analítica e geração de insights.",
      dataConclusao: new Date("2026-09-01"),
    },
    {
      matricula: "SYR0011",
      status: "CONCLUIDA" as const,
      nota: 8.8,
      comentario: "Boa gestão financeira e excelente visão estratégica.",
      dataConclusao: new Date("2026-09-02"),
    },
    {
      matricula: "SYR0012",
      status: "EM_ANDAMENTO" as const,
      nota: null,
      comentario: "Avaliação em andamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0013",
      status: "CONCLUIDA" as const,
      nota: 8.9,
      comentario: "Bom desempenho em entregas full stack e colaboração com o time.",
      dataConclusao: new Date("2026-09-05"),
    },
    {
      matricula: "SYR0014",
      status: "PENDENTE" as const,
      nota: null,
      comentario: "Avaliação aguardando retorno de férias.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0015",
      status: "CONCLUIDA" as const,
      nota: 8.3,
      comentario: "Boa atenção à qualidade e cobertura de testes.",
      dataConclusao: new Date("2026-09-04"),
    },
    {
      matricula: "SYR0016",
      status: "PENDENTE" as const,
      nota: null,
      comentario: null,
      dataConclusao: null,
    },
    {
      matricula: "SYR0017",
      status: "EM_ANDAMENTO" as const,
      nota: null,
      comentario: "Avaliação em andamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0018",
      status: "CONCLUIDA" as const,
      nota: 9.0,
      comentario: "Excelente coordenação das campanhas e da equipe.",
      dataConclusao: new Date("2026-09-03"),
    },
    {
      matricula: "SYR0019",
      status: "PENDENTE" as const,
      nota: null,
      comentario: "Avaliação aguardando retorno do afastamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0020",
      status: "CONCLUIDA" as const,
      nota: 7.9,
      comentario: "Boa comunicação interna e organização das entregas.",
      dataConclusao: new Date("2026-09-04"),
    },
    {
      matricula: "SYR0021",
      status: "CONCLUIDA" as const,
      nota: 8.7,
      comentario: "Boa liderança comercial e acompanhamento de resultados.",
      dataConclusao: new Date("2026-09-02"),
    },
    {
      matricula: "SYR0022",
      status: "EM_ANDAMENTO" as const,
      nota: null,
      comentario: "Avaliação em andamento.",
      dataConclusao: null,
    },
    {
      matricula: "SYR0023",
      status: "CONCLUIDA" as const,
      nota: 7.2,
      comentario: "Bom atendimento, com oportunidade de evolução na documentação técnica.",
      dataConclusao: new Date("2026-09-05"),
    },
    {
      matricula: "SYR0024",
      status: "PENDENTE" as const,
      nota: null,
      comentario: null,
      dataConclusao: null,
    },
  ];

  for (const avaliacao of avaliacoes) {
    const colaborador = obterColaborador(avaliacao.matricula);

    await prisma.avaliacao.upsert({
      where: {
        colaboradorId_cicloId: {
          colaboradorId: colaborador.id,
          cicloId: ciclo.id,
        },
      },
      update: {
        status: avaliacao.status,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario,
        dataConclusao: avaliacao.dataConclusao,
      },
      create: {
        colaboradorId: colaborador.id,
        cicloId: ciclo.id,
        status: avaliacao.status,
        nota: avaliacao.nota,
        comentario: avaliacao.comentario,
        dataConclusao: avaliacao.dataConclusao,
      },
    });
  }

  // =========================================================
  // PDIs
  // =========================================================

  console.log("🎯 Cadastrando PDIs...");

  const pdis = [
    {
      matricula: "SYR0001",
      titulo: "Aprofundamento em React e TypeScript",
      descricao: "Aprimorar padrões de componentização e tipagem.",
      objetivo: "Evoluir tecnicamente no desenvolvimento front-end.",
      prazo: new Date("2026-11-30"),
      progresso: 65,
      status: "EM_ANDAMENTO" as const,
      responsavel: "Daniel Oliveira",
    },
    {
      matricula: "SYR0002",
      titulo: "People Analytics",
      descricao: "Desenvolver conhecimentos em indicadores de RH.",
      objetivo: "Criar análises estratégicas para apoio à liderança.",
      prazo: new Date("2026-12-10"),
      progresso: 40,
      status: "EM_ANDAMENTO" as const,
      responsavel: "Isabela Ribeiro",
    },
    {
      matricula: "SYR0003",
      titulo: "Comunicação Técnica",
      descricao: "Melhorar comunicação de decisões técnicas.",
      objetivo: "Aumentar clareza na interação com áreas não técnicas.",
      prazo: new Date("2026-08-30"),
      progresso: 45,
      status: "ATRASADO" as const,
      responsavel: "Daniel Oliveira",
    },
    {
      matricula: "SYR0004",
      titulo: "Estratégia de Produto",
      descricao: "Aprimorar práticas de definição de roadmap.",
      objetivo: "Fortalecer tomada de decisão orientada a dados.",
      prazo: new Date("2026-10-31"),
      progresso: 100,
      status: "CONCLUIDO" as const,
      responsavel: "Juliana Martins",
    },
    {
      matricula: "SYR0005",
      titulo: "Design System",
      descricao: "Estruturar padrões visuais reutilizáveis.",
      objetivo: "Melhorar consistência entre produtos.",
      prazo: new Date("2026-12-15"),
      progresso: 25,
      status: "EM_ANDAMENTO" as const,
      responsavel: "Juliana Martins",
    },
    {
      matricula: "SYR0009",
      titulo: "Gestão de Metas Comerciais",
      descricao: "Aprimorar acompanhamento semanal das metas.",
      objetivo: "Aumentar previsibilidade dos resultados comerciais.",
      prazo: new Date("2026-08-25"),
      progresso: 30,
      status: "ATRASADO" as const,
      responsavel: "Ricardo Moraes",
    },
    {
      matricula: "SYR0010",
      titulo: "Machine Learning Aplicado",
      descricao: "Estudar modelos básicos de previsão.",
      objetivo: "Aplicar análises preditivas aos indicadores internos.",
      prazo: new Date("2026-12-20"),
      progresso: 10,
      status: "NAO_INICIADO" as const,
      responsavel: "Daniel Oliveira",
    },
    {
      matricula: "SYR0013",
      titulo: "Arquitetura de Software",
      descricao: "Aprofundar conhecimentos em arquitetura e boas práticas.",
      objetivo: "Melhorar organização e escalabilidade das aplicações.",
      prazo: new Date("2026-11-20"),
      progresso: 70,
      status: "EM_ANDAMENTO" as const,
      responsavel: "Daniel Oliveira",
    },
    {
      matricula: "SYR0015",
      titulo: "Automação de Testes",
      descricao: "Expandir testes automatizados no processo de desenvolvimento.",
      objetivo: "Reduzir falhas em produção.",
      prazo: new Date("2026-10-15"),
      progresso: 100,
      status: "CONCLUIDO" as const,
      responsavel: "Daniel Oliveira",
    },
    {
      matricula: "SYR0017",
      titulo: "Negociação Comercial",
      descricao: "Desenvolver técnicas de negociação consultiva.",
      objetivo: "Melhorar conversão de oportunidades.",
      prazo: new Date("2026-12-05"),
      progresso: 0,
      status: "NAO_INICIADO" as const,
      responsavel: "Ricardo Moraes",
    },
    {
      matricula: "SYR0020",
      titulo: "Comunicação Estratégica",
      descricao: "Aprimorar comunicação com diferentes públicos internos.",
      objetivo: "Aumentar o engajamento das campanhas internas.",
      prazo: new Date("2026-11-15"),
      progresso: 55,
      status: "EM_ANDAMENTO" as const,
      responsavel: "Patrícia Gomes",
    },
    {
      matricula: "SYR0023",
      titulo: "Documentação Técnica",
      descricao: "Melhorar padronização da base de conhecimento.",
      objetivo: "Reduzir recorrência de chamados e facilitar atendimento.",
      prazo: new Date("2026-08-20"),
      progresso: 50,
      status: "ATRASADO" as const,
      responsavel: "Daniel Oliveira",
    },
  ];

  for (const pdi of pdis) {
    const colaborador = obterColaborador(pdi.matricula);

    await prisma.pDI.upsert({
      where: {
        colaboradorId_titulo: {
          colaboradorId: colaborador.id,
          titulo: pdi.titulo,
        },
      },
      update: {
        descricao: pdi.descricao,
        objetivo: pdi.objetivo,
        prazo: pdi.prazo,
        progresso: pdi.progresso,
        status: pdi.status,
        responsavel: pdi.responsavel,
      },
      create: {
        titulo: pdi.titulo,
        descricao: pdi.descricao,
        objetivo: pdi.objetivo,
        prazo: pdi.prazo,
        progresso: pdi.progresso,
        status: pdi.status,
        responsavel: pdi.responsavel,
        colaboradorId: colaborador.id,
      },
    });
  }

  // =========================================================
  // FEEDBACKS
  // =========================================================

  console.log("💬 Cadastrando feedbacks...");

  const feedbacks = [
    {
      colaborador: "SYR0002",
      autor: "SYR0012",
      titulo: "Excelente apoio ao time",
      conteudo:
        "Demonstrou excelente disponibilidade e organização no suporte às demandas do time.",
      tipo: "POSITIVO" as const,
      data: new Date("2026-08-18"),
    },
    {
      colaborador: "SYR0003",
      autor: "SYR0007",
      titulo: "Comunicação nas entregas",
      conteudo:
        "As entregas técnicas são boas, mas é importante comunicar decisões e riscos com mais antecedência.",
      tipo: "DESENVOLVIMENTO" as const,
      data: new Date("2026-08-05"),
    },
    {
      colaborador: "SYR0004",
      autor: "SYR0012",
      titulo: "Liderança de produto",
      conteudo:
        "Excelente condução das prioridades e alinhamento entre produto e tecnologia.",
      tipo: "RECONHECIMENTO" as const,
      data: new Date("2026-08-01"),
    },
    {
      colaborador: "SYR0010",
      autor: "SYR0007",
      titulo: "Análises de alto impacto",
      conteudo:
        "Os dashboards e análises contribuíram diretamente para decisões importantes da área.",
      tipo: "RECONHECIMENTO" as const,
      data: new Date("2026-08-22"),
    },
    {
      colaborador: "SYR0009",
      autor: "SYR0021",
      titulo: "Acompanhamento de metas",
      conteudo:
        "É necessário aumentar a frequência do acompanhamento das oportunidades e metas comerciais.",
      tipo: "DESENVOLVIMENTO" as const,
      data: new Date("2026-08-25"),
    },
    {
      colaborador: "SYR0013",
      autor: "SYR0007",
      titulo: "Colaboração técnica",
      conteudo:
        "Tem contribuído bastante nas discussões técnicas e apoiado colegas nas entregas.",
      tipo: "POSITIVO" as const,
      data: new Date("2026-08-28"),
    },
    {
      colaborador: "SYR0015",
      autor: "SYR0007",
      titulo: "Qualidade das entregas",
      conteudo:
        "O trabalho de automação de testes trouxe ganho importante de qualidade para o produto.",
      tipo: "RECONHECIMENTO" as const,
      data: new Date("2026-08-30"),
    },
    {
      colaborador: "SYR0017",
      autor: "SYR0021",
      titulo: "Evolução comercial",
      conteudo:
        "Tem boa relação com clientes e pode evoluir ainda mais na condução das negociações.",
      tipo: "POSITIVO" as const,
      data: new Date("2026-09-01"),
    },
    {
      colaborador: "SYR0020",
      autor: "SYR0018",
      titulo: "Boa comunicação interna",
      conteudo:
        "As últimas comunicações tiveram boa clareza e organização.",
      tipo: "POSITIVO" as const,
      data: new Date("2026-09-02"),
    },
    {
      colaborador: "SYR0023",
      autor: "SYR0007",
      titulo: "Documentação dos atendimentos",
      conteudo:
        "É importante registrar soluções com mais detalhes para fortalecer a base de conhecimento.",
      tipo: "DESENVOLVIMENTO" as const,
      data: new Date("2026-09-03"),
    },
  ];

  for (const feedback of feedbacks) {
    const colaborador = obterColaborador(feedback.colaborador);
    const autor = obterColaborador(feedback.autor);

    await prisma.feedback.upsert({
      where: {
        colaboradorId_titulo_data: {
          colaboradorId: colaborador.id,
          titulo: feedback.titulo,
          data: feedback.data,
        },
      },
      update: {
        conteudo: feedback.conteudo,
        tipo: feedback.tipo,
        autorId: autor.id,
      },
      create: {
        titulo: feedback.titulo,
        conteudo: feedback.conteudo,
        tipo: feedback.tipo,
        data: feedback.data,
        colaboradorId: colaborador.id,
        autorId: autor.id,
      },
    });
  }

  // =========================================================
  // CONTADORES
  // =========================================================

  const totalColaboradores = await prisma.colaborador.count();

  const ativos = await prisma.colaborador.count({
    where: {
      status: "ATIVO",
    },
  });

  const ferias = await prisma.colaborador.count({
    where: {
      status: "FERIAS",
    },
  });

  const afastados = await prisma.colaborador.count({
    where: {
      status: "AFASTADO",
    },
  });

  const inativos = await prisma.colaborador.count({
    where: {
      status: "INATIVO",
    },
  });

  const totalCiclos = await prisma.cicloAvaliacao.count();
  const totalAvaliacoes = await prisma.avaliacao.count();
  const totalPdis = await prisma.pDI.count();
  const totalFeedbacks = await prisma.feedback.count();

  const avaliacoesPendentes = await prisma.avaliacao.count({
    where: {
      status: "PENDENTE",
    },
  });

  const avaliacoesEmAndamento = await prisma.avaliacao.count({
    where: {
      status: "EM_ANDAMENTO",
    },
  });

  const avaliacoesConcluidas = await prisma.avaliacao.count({
    where: {
      status: "CONCLUIDA",
    },
  });

  const pdisAtrasados = await prisma.pDI.count({
    where: {
      status: "ATRASADO",
    },
  });

  console.log("");
  console.log("==============================================");
  console.log("✅ SEED COMPLETA DO SYNERRH FINALIZADA");
  console.log("==============================================");
  console.log(`👥 Colaboradores: ${totalColaboradores}`);
  console.log(`🟢 Ativos: ${ativos}`);
  console.log(`🏖️ Férias: ${ferias}`);
  console.log(`🩺 Afastados: ${afastados}`);
  console.log(`⚪ Inativos: ${inativos}`);
  console.log("----------------------------------------------");
  console.log(`📅 Ciclos: ${totalCiclos}`);
  console.log(`📝 Avaliações: ${totalAvaliacoes}`);
  console.log(`   ⏳ Pendentes: ${avaliacoesPendentes}`);
  console.log(`   🔄 Em andamento: ${avaliacoesEmAndamento}`);
  console.log(`   ✅ Concluídas: ${avaliacoesConcluidas}`);
  console.log("----------------------------------------------");
  console.log(`🎯 PDIs: ${totalPdis}`);
  console.log(`   🚨 Atrasados: ${pdisAtrasados}`);
  console.log(`💬 Feedbacks: ${totalFeedbacks}`);
  console.log("==============================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Erro ao executar seed do SynerRH:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });