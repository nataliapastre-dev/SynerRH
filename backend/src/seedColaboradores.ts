import prisma from "./prisma";

const colaboradores = [
  {
    matricula: "SYR0002",
    nome: "Amanda Ribeiro",
    email: "amanda.ribeiro@synerhcorp.com.br",
    cargo: "Analista de Recursos Humanos",
    departamento: "Recursos Humanos",
    dataAdmissao: new Date("2023-02-06"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0003",
    nome: "Bruno Martins",
    email: "bruno.martins@synerhcorp.com.br",
    cargo: "Desenvolvedor Back-end",
    departamento: "Tecnologia",
    dataAdmissao: new Date("2022-08-15"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0004",
    nome: "Camila Souza",
    email: "camila.souza@synerhcorp.com.br",
    cargo: "Analista Financeiro",
    departamento: "Financeiro",
    dataAdmissao: new Date("2024-01-08"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0005",
    nome: "Daniel Oliveira",
    email: "daniel.oliveira@synerhcorp.com.br",
    cargo: "Coordenador de Tecnologia",
    departamento: "Tecnologia",
    dataAdmissao: new Date("2020-03-16"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0006",
    nome: "Eduarda Lima",
    email: "eduarda.lima@synerhcorp.com.br",
    cargo: "Assistente Administrativo",
    departamento: "Administrativo",
    dataAdmissao: new Date("2025-04-07"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0007",
    nome: "Felipe Costa",
    email: "felipe.costa@synerhcorp.com.br",
    cargo: "Desenvolvedor Front-end",
    departamento: "Tecnologia",
    dataAdmissao: new Date("2023-06-12"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0008",
    nome: "Gabriela Alves",
    email: "gabriela.alves@synerhcorp.com.br",
    cargo: "Business Partner",
    departamento: "Recursos Humanos",
    dataAdmissao: new Date("2021-09-20"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0009",
    nome: "Gustavo Ferreira",
    email: "gustavo.ferreira@synerhcorp.com.br",
    cargo: "Analista de Dados",
    departamento: "Tecnologia",
    dataAdmissao: new Date("2024-05-13"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0010",
    nome: "Helena Rocha",
    email: "helena.rocha@synerhcorp.com.br",
    cargo: "Gerente de Pessoas",
    departamento: "Recursos Humanos",
    dataAdmissao: new Date("2019-11-04"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0011",
    nome: "Igor Santos",
    email: "igor.santos@synerhcorp.com.br",
    cargo: "Analista Comercial",
    departamento: "Comercial",
    dataAdmissao: new Date("2023-10-02"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0012",
    nome: "Isabela Moreira",
    email: "isabela.moreira@synerhcorp.com.br",
    cargo: "UX/UI Designer",
    departamento: "Produto",
    dataAdmissao: new Date("2024-02-19"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0013",
    nome: "João Carvalho",
    email: "joao.carvalho@synerhcorp.com.br",
    cargo: "Product Owner",
    departamento: "Produto",
    dataAdmissao: new Date("2022-04-11"),
    status: "ATIVO" as const,
  },
  {
    matricula: "SYR0014",
    nome: "Juliana Mendes",
    email: "juliana.mendes@synerhcorp.com.br",
    cargo: "Analista de Marketing",
    departamento: "Marketing",
    dataAdmissao: new Date("2024-07-01"),
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
    cargo: "Coordenadora Financeira",
    departamento: "Financeiro",
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
    nome: "Thiago Correia",
    email: "thiago.correia@synerhcorp.com.br",
    cargo: "Desenvolvedor Full Stack",
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

async function main() {
  console.log("🚀 Iniciando atualização dos colaboradores do SynerRH...");

  // Natália já existia no banco antes dos outros colaboradores.
  // Como ela é a única sem matrícula, recebe SYR0001.
  const natalia = await prisma.colaborador.updateMany({
    where: {
      matricula: null,
    },
    data: {
      matricula: "SYR0001",
    },
  });

  if (natalia.count === 1) {
    console.log("✅ SYR0001 - Natália");
  } else if (natalia.count === 0) {
    console.log("ℹ️ Natália já possui matrícula.");
  } else {
    throw new Error(
      `Foram encontrados ${natalia.count} colaboradores sem matrícula. Operação interrompida.`,
    );
  }

  for (const colaborador of colaboradores) {
    await prisma.colaborador.upsert({
      where: {
        email: colaborador.email,
      },
      update: {
        matricula: colaborador.matricula,
        nome: colaborador.nome,
        cargo: colaborador.cargo,
        departamento: colaborador.departamento,
        dataAdmissao: colaborador.dataAdmissao,
        status: colaborador.status,
      },
      create: colaborador,
    });

    console.log(`✅ ${colaborador.matricula} - ${colaborador.nome}`);
  }

  const total = await prisma.colaborador.count();
  const semMatricula = await prisma.colaborador.count({
    where: {
      matricula: null,
    },
  });

  console.log("---------------------------------------");
  console.log("✅ Cadastro finalizado!");
  console.log(`👥 Total de colaboradores no SynerRH: ${total}`);
  console.log(`🪪 Colaboradores sem matrícula: ${semMatricula}`);
}

main()
  .catch((error) => {
    console.error("❌ Erro ao atualizar colaboradores:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });