import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

const leads = [
  // ── NEW (5) ──────────────────────────────────────────────────
  {
    name: "Kaique Fernandes",
    phone: "(61) 9 8821-3374",
    vehicleInterest: "Fiat Mobi",
    status: "NEW" as const,
    notes: "Entrou em contato pelo WhatsApp. Quer retirar ainda esta semana.",
    daysAgo: 1,
  },
  {
    name: "Bruna Tavares",
    phone: "(61) 9 9034-6612",
    vehicleInterest: "Renault Kwid",
    status: "NEW" as const,
    notes: "Indicada por cliente antigo. Pediu tabela de preços por mensagem.",
    daysAgo: 2,
  },
  {
    name: "Thiago Menezes",
    phone: "(61) 9 7745-2198",
    vehicleInterest: "HB20",
    status: "NEW" as const,
    notes: "Ligou perguntando disponibilidade para o fim de semana.",
    daysAgo: 3,
  },
  {
    name: "Sara Lopes",
    phone: "(61) 9 9612-0087",
    vehicleInterest: "Peugeot 208",
    status: "NEW" as const,
    notes: "Formulário do site. Não informou data de retirada.",
    daysAgo: 4,
  },
  {
    name: "Nilton Brito",
    phone: "(61) 9 8856-4431",
    vehicleInterest: "Ford Ka",
    status: "NEW" as const,
    notes: "Primeiro contato via Instagram. Aguardando retorno no WhatsApp.",
    daysAgo: 5,
  },

  // ── CONTACTED (6) ────────────────────────────────────────────
  {
    name: "Carlos Henrique",
    phone: "(61) 9 9233-8847",
    vehicleInterest: "Tracker",
    status: "CONTACTED" as const,
    notes: "Gostou da condição sem cartão. Vai confirmar com a esposa.",
    daysAgo: 7,
  },
  {
    name: "Juliana Souza",
    phone: "(61) 9 8801-5563",
    vehicleInterest: "Creta",
    status: "CONTACTED" as const,
    notes: "Comparando com concorrentes. Tem preferência por automático.",
    daysAgo: 10,
  },
  {
    name: "Marcos Vinicius",
    phone: "(61) 9 9347-2290",
    vehicleInterest: "Hilux",
    status: "CONTACTED" as const,
    notes: "Empresa para uso corporativo. Pediu nota fiscal e contrato.",
    daysAgo: 12,
  },
  {
    name: "Fernanda Lima",
    phone: "(61) 9 7790-3315",
    vehicleInterest: "Pulse",
    status: "CONTACTED" as const,
    notes: "Prefere retirada no aeroporto. Viagem de negócios.",
    daysAgo: 14,
  },
  {
    name: "Rodrigo Melo",
    phone: "(61) 9 9125-7764",
    vehicleInterest: "S10",
    status: "CONTACTED" as const,
    notes: "Procurando picape para obra. Locação de 15 dias.",
    daysAgo: 18,
  },
  {
    name: "Viviane Monteiro",
    phone: "(61) 9 8934-1102",
    vehicleInterest: "HB20",
    status: "CONTACTED" as const,
    notes: "Quer usar no fim de semana. Perguntou se aceita CNH digital.",
    daysAgo: 20,
  },

  // ── NEGOTIATING (6) ──────────────────────────────────────────
  {
    name: "João Pedro",
    phone: "(61) 9 9502-6631",
    vehicleInterest: "Creta",
    status: "NEGOTIATING" as const,
    notes: "Solicitou desconto para locação longa. Proposta de 20 dias enviada.",
    daysAgo: 22,
  },
  {
    name: "Camila Rocha",
    phone: "(61) 9 8870-4489",
    vehicleInterest: "Tracker",
    status: "NEGOTIATING" as const,
    notes: "Pediu opções de seguro completo. Tem filhos pequenos.",
    daysAgo: 24,
  },
  {
    name: "Rafael Mendes",
    phone: "(61) 9 9681-3327",
    vehicleInterest: "Hilux",
    status: "NEGOTIATING" as const,
    notes: "Pagamento à vista. Solicitou desconto de 10% e está aguardando aprovação.",
    daysAgo: 27,
  },
  {
    name: "Patrícia Alves",
    phone: "(61) 9 7723-9950",
    vehicleInterest: "Peugeot 208",
    status: "NEGOTIATING" as const,
    notes: "Ligou duas vezes. Muito interessada, só aguarda liberação no cartão.",
    daysAgo: 30,
  },
  {
    name: "Leonardo Castro",
    phone: "(61) 9 9014-8876",
    vehicleInterest: "S10",
    status: "NEGOTIATING" as const,
    notes: "Uso para transportar equipamentos. Necessita de cobertura para danos à carga.",
    daysAgo: 33,
  },
  {
    name: "Aline Ramos",
    phone: "(61) 9 8845-2213",
    vehicleInterest: "Renault Kwid",
    status: "NEGOTIATING" as const,
    notes: "Primeira locação. Tirou dúvidas sobre caução e entende o processo.",
    daysAgo: 36,
  },

  // ── AWAITING (5) ─────────────────────────────────────────────
  {
    name: "Gabriel Costa",
    phone: "(61) 9 9378-5541",
    vehicleInterest: "Fiat Mobi",
    status: "AWAITING" as const,
    notes: "Retorno agendado para sexta. Cliente viajou e pediu para ligar depois.",
    daysAgo: 38,
  },
  {
    name: "Larissa Oliveira",
    phone: "(61) 9 8892-7763",
    vehicleInterest: "Pulse",
    status: "AWAITING" as const,
    notes: "Aguardando confirmação com o chefe. Locação para evento corporativo.",
    daysAgo: 42,
  },
  {
    name: "Henrique Teixeira",
    phone: "(61) 9 9256-0034",
    vehicleInterest: "HB20",
    status: "AWAITING" as const,
    notes: "Pediu prazo de 48h para decidir entre dois modelos.",
    daysAgo: 45,
  },
  {
    name: "Daniela Pinto",
    phone: "(61) 9 7801-6698",
    vehicleInterest: "Tracker",
    status: "AWAITING" as const,
    notes: "Contato feito por indicação. Vai retornar após viagem de trabalho.",
    daysAgo: 48,
  },
  {
    name: "Alexandre Moura",
    phone: "(61) 9 9433-1125",
    vehicleInterest: "Ford Ka",
    status: "AWAITING" as const,
    notes: "Quer veículo para viagem longa. Solicitou orçamento com quilometragem livre.",
    daysAgo: 52,
  },

  // ── WON (5) ──────────────────────────────────────────────────
  {
    name: "Pedro Augusto",
    phone: "(61) 9 9764-3380",
    vehicleInterest: "Creta",
    status: "WON" as const,
    notes: "Reserva confirmada. Retirada marcada para segunda-feira às 9h.",
    daysAgo: 55,
  },
  {
    name: "Amanda Ferreira",
    phone: "(61) 9 8823-9917",
    vehicleInterest: "Pulse",
    status: "WON" as const,
    notes: "Já enviou documentação completa. Aguarda confirmação por e-mail.",
    daysAgo: 58,
  },
  {
    name: "Bruno Carvalho",
    phone: "(61) 9 9512-4456",
    vehicleInterest: "Hilux",
    status: "WON" as const,
    notes: "Empresa fechou contrato para uso mensal. Nota fiscal emitida.",
    daysAgo: 62,
  },
  {
    name: "Isabela Santos",
    phone: "(61) 9 7756-8801",
    vehicleInterest: "Renault Kwid",
    status: "WON" as const,
    notes: "Cliente solicitou retirada amanhã cedo. Documentação em ordem.",
    daysAgo: 66,
  },
  {
    name: "Ricardo Lopes",
    phone: "(61) 9 9041-2275",
    vehicleInterest: "S10",
    status: "WON" as const,
    notes: "Locação de 10 dias para transporte de equipamentos. Pago integralmente.",
    daysAgo: 70,
  },

  // ── CAR_RENTED (5) ───────────────────────────────────────────
  {
    name: "Lucas Martins",
    phone: "(61) 9 8867-5534",
    vehicleInterest: "Tracker",
    status: "CAR_RENTED" as const,
    notes: "Veículo entregue. Devolução prevista para 10 dias. Checklist feito.",
    daysAgo: 72,
  },
  {
    name: "Thaís Rodrigues",
    phone: "(61) 9 9328-0061",
    vehicleInterest: "HB20",
    status: "CAR_RENTED" as const,
    notes: "Carro em uso. Cliente satisfeita, pediu para estender por mais 3 dias.",
    daysAgo: 75,
  },
  {
    name: "Diego Pereira",
    phone: "(61) 9 9170-4492",
    vehicleInterest: "Fiat Mobi",
    status: "CAR_RENTED" as const,
    notes: "Locação corporativa ativa. Motorista terceirizado.",
    daysAgo: 78,
  },
  {
    name: "Natália Gomes",
    phone: "(61) 9 7834-7719",
    vehicleInterest: "Peugeot 208",
    status: "CAR_RENTED" as const,
    notes: "Está utilizando o veículo. Retorno no próximo sábado.",
    daysAgo: 82,
  },
  {
    name: "Eduardo Ribeiro",
    phone: "(61) 9 9605-3348",
    vehicleInterest: "Creta",
    status: "CAR_RENTED" as const,
    notes: "Locação de longa duração. Segundo mês consecutivo com a empresa.",
    daysAgo: 86,
  },

  // ── LOST (5) ─────────────────────────────────────────────────
  {
    name: "Priscila Lima",
    phone: "(61) 9 8811-6670",
    vehicleInterest: "Ford Ka",
    status: "LOST" as const,
    notes: "Fechou com concorrente. Preço foi o fator decisivo.",
    daysAgo: 55,
  },
  {
    name: "Simone Cunha",
    phone: "(61) 9 9243-9983",
    vehicleInterest: "Renault Kwid",
    status: "LOST" as const,
    notes: "Desistiu da viagem. Cancelou o interesse.",
    daysAgo: 60,
  },
  {
    name: "Matheus Correia",
    phone: "(61) 9 7712-5507",
    vehicleInterest: "Pulse",
    status: "LOST" as const,
    notes: "Não retornou após 3 tentativas de contato.",
    daysAgo: 68,
  },
  {
    name: "Vanessa Nascimento",
    phone: "(61) 9 9387-2264",
    vehicleInterest: "HB20",
    status: "LOST" as const,
    notes: "Optou por alugar o carro do cunhado. Perdemos por relacionamento.",
    daysAgo: 76,
  },
  {
    name: "André Barbosa",
    phone: "(61) 9 8956-1140",
    vehicleInterest: "Hilux",
    status: "LOST" as const,
    notes: "Orçamento muito acima do esperado pelo cliente. Sem margem para negociar.",
    daysAgo: 88,
  },
];

async function main() {
  console.log("🗑  Apagando leads existentes...");
  const deleted = await prisma.lead.deleteMany({});
  console.log(`   ${deleted.count} lead(s) removido(s).`);

  console.log("\n🌱 Inserindo leads fictícios...");
  let count = 0;
  for (const l of leads) {
    const date = daysAgo(l.daysAgo);
    await prisma.lead.create({
      data: {
        name:            l.name,
        phone:           l.phone,
        vehicleInterest: l.vehicleInterest,
        status:          l.status,
        notes:           l.notes,
        createdAt:       date,
        updatedAt:       date,
      },
    });
    count++;
    process.stdout.write(`\r   ${count}/${leads.length} inseridos...`);
  }

  console.log(`\n\n✅ Concluído! ${count} leads criados.\n`);

  const summary = await prisma.lead.groupBy({
    by: ["status"],
    _count: { id: true },
    orderBy: { status: "asc" },
  });

  const labels: Record<string, string> = {
    NEW: "Novo", CONTACTED: "Em contato", NEGOTIATING: "Negociando",
    AWAITING: "Ag. retorno", WON: "Convertido", CAR_RENTED: "Carro alugado", LOST: "Perdido",
  };
  console.log("Distribuição:");
  for (const row of summary) {
    console.log(`  ${labels[row.status] ?? row.status}: ${row._count.id}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
