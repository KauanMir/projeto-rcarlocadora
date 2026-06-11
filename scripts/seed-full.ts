/**
 * Full demo seed — clears and repopulates Leads, Reservations, Rentals, Checklists.
 * Vehicles are preserved. Run: npx tsx --env-file=.env scripts/seed-full.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Date helpers ─────────────────────────────────────────────────────────────

function ago(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function fromNow(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Vehicle IDs (from DB) ────────────────────────────────────────────────────

const V = {
  kwid:      "cmpqzhf7s00042lelcgg0jlak",  // Renault Kwid       R$100
  mobi:      "cmpqzhf7s00052lellyd566gw",  // Fiat Mobi          R$100
  uno:       "cmpqzhf7s00062lelugadvj4m",  // Fiat Uno           R$100
  onix:      "cmpqzhf7s00072lelugx34wqb",  // Chevrolet Onix     R$130
  hb20:      "cmpqzhf7s00082lell2ax9a86",  // Hyundai HB20       R$130
  gol10:     "cmpqzhf7s00092leljd29edwy",  // VW Gol 1.0         R$130
  ka10:      "cmpqzhf7s000a2lel685zw1wr",  // Ford KA 1.0        R$130
  polo:      "cmpqzhf7s000b2lel2600idfm",  // VW Polo            R$130
  argo:      "cmpqzhf7s000c2lel7q1j9l9x",  // Fiat Argo          R$130
  logan10:   "cmpqzhf7s000d2lel4s8xfyim",  // Renault Logan 1.0  R$130
  siena:     "cmpqzhf7s000e2lelwo9sm1b2",  // Fiat Siena         R$130
  cronos:    "cmpqzhf7s000f2lelan7by98i",  // Fiat Cronos        R$135
  virtus:    "cmpqzhf7s000g2lelxq5bbf40",  // VW Virtus          R$135
  onixPlus:  "cmpqzhf7s000h2lell9id36me",  // Chevrolet Onix+    R$135
  hb20s:     "cmpqzhf7s000i2lel2y5ayfgy",  // Hyundai HB20S      R$135
  p208:      "cmpqzhf7s000j2lellbrsljlv",  // Peugeot 208        R$150
  logan16:   "cmpqzhf7s000k2lel14u67mr9",  // Renault Logan 1.6  R$150
  ka15:      "cmpqzhf7s000l2lelh0w2ebvq",  // Ford KA 1.5        R$150
  gol16:     "cmpqzhf7s000m2lelfde7iby7",  // VW Gol 1.6         R$150
  tracker:   "cmpqzhf7s000n2leltcao82mt",  // Chevrolet Tracker  R$300
  pulse:     "cmpqzhf7s000o2lel42yjz1na",  // Fiat Pulse         R$300
  creta:     "cmpqzhf7s000p2lelstaggf9b",  // Hyundai Creta      R$300
  spin:      "cmpqzhf7s000q2lelss0nvrey",  // Chevrolet Spin     R$300
  toro:      "cmpqzhf7s000r2lelig7u6fug",  // Fiat Toro          R$350
  amarok:    "cmpqzhf7s000s2lelmslioenr",  // VW Amarok          R$350
  montana:   "cmpqzhf7t000t2lelaz93m99f",  // Chevrolet Montana  R$350
  s10:       "cmpqzhf7t000u2lelrv9o9yqy",  // Chevrolet S10      R$480
  hilux:     "cmpqzhf7t000v2lelaiid0tx7",  // Toyota Hilux       R$480
};

// ─── Insurance multipliers ─────────────────────────────────────────────────────
const INS = { BASIC: 1.15, INTERMEDIATE: 1.25, PREMIUM: 1.40 };

function price(rate: number, days: number, ins: keyof typeof INS) {
  const sub = rate * days;
  return { subtotal: sub, total: Math.round(sub * INS[ins]) };
}

// ─── Reservation definitions ──────────────────────────────────────────────────
// pickupOffset: negative = days ago, positive = days from now

type ResInput = {
  vehicleId:    string;
  rate:         number;
  days:         number;
  ins:          keyof typeof INS;
  customer:     string;
  phone:        string;
  status:       "PENDING" | "CONFIRMED" | "FINISHED" | "CANCELLED";
  createdOffset: number; // days ago
  pickupOffset:  number; // negative = past, positive = future
  notes?:        string;
  isRented?:     boolean; // generate a Rental record
};

const RESERVATIONS: ResInput[] = [
  // ── FINISHED — 12 months of history ──────────────────────────────────────────
  {
    vehicleId: V.s10, rate: 480, days: 14, ins: "PREMIUM",
    customer: "Marcos Vinicius Lima", phone: "(61) 9 9233-8847",
    status: "FINISHED", createdOffset: 318, pickupOffset: -308,
    notes: "Locação corporativa para obra. Entregue com tanque cheio.",
    isRented: true,
  },
  {
    vehicleId: V.hilux, rate: 480, days: 10, ins: "INTERMEDIATE",
    customer: "Empresa TechSol Ltda", phone: "(61) 9 8801-5563",
    status: "FINISHED", createdOffset: 285, pickupOffset: -278,
    notes: "Nota fiscal emitida. Cliente empresarial recorrente.",
    isRented: true,
  },
  {
    vehicleId: V.tracker, rate: 300, days: 7, ins: "BASIC",
    customer: "Fernanda Rodrigues", phone: "(61) 9 9347-2290",
    status: "FINISHED", createdOffset: 252, pickupOffset: -244,
    notes: "Retirada no aeroporto. Sem avarias.",
    isRented: true,
  },
  {
    vehicleId: V.creta, rate: 300, days: 5, ins: "BASIC",
    customer: "Pedro Henrique Santos", phone: "(61) 9 7790-3315",
    status: "FINISHED", createdOffset: 222, pickupOffset: -215,
    notes: "Viagem a lazer. Devolvido no prazo.",
    isRented: true,
  },
  {
    vehicleId: V.toro, rate: 350, days: 10, ins: "INTERMEDIATE",
    customer: "Construtora Brasília SA", phone: "(61) 9 9502-6631",
    status: "FINISHED", createdOffset: 198, pickupOffset: -190,
    notes: "Uso em canteiro de obras. Cliente solicitou extensão de 2 dias.",
    isRented: true,
  },
  {
    vehicleId: V.pulse, rate: 300, days: 7, ins: "INTERMEDIATE",
    customer: "Juliana Costa Ferreira", phone: "(61) 9 8870-4489",
    status: "FINISHED", createdOffset: 175, pickupOffset: -168,
    notes: "Gostou muito do veículo. Prometeu retornar.",
    isRented: true,
  },
  {
    vehicleId: V.amarok, rate: 350, days: 12, ins: "INTERMEDIATE",
    customer: "Transportes Souza ME", phone: "(61) 9 9681-3327",
    status: "FINISHED", createdOffset: 152, pickupOffset: -145,
    notes: "Transporte de cargas. Segunda locação com a empresa.",
    isRented: true,
  },
  {
    vehicleId: V.montana, rate: 350, days: 8, ins: "BASIC",
    customer: "André Barbosa Neto", phone: "(61) 9 7723-9950",
    status: "FINISHED", createdOffset: 125, pickupOffset: -118,
    notes: "Locação para mudança. Sem incidentes.",
    isRented: true,
  },
  {
    vehicleId: V.gol16, rate: 150, days: 7, ins: "BASIC",
    customer: "Vanessa Nascimento", phone: "(61) 9 9014-8876",
    status: "FINISHED", createdOffset: 110, pickupOffset: -103,
    notes: "Primeira locação. Ficou satisfeita.",
    isRented: true,
  },
  {
    vehicleId: V.ka15, rate: 150, days: 5, ins: "BASIC",
    customer: "Simone Castro Pires", phone: "(61) 9 8845-2213",
    status: "FINISHED", createdOffset: 95, pickupOffset: -90,
    notes: "Viagem de negócios rápida.",
    isRented: true,
  },
  {
    vehicleId: V.s10, rate: 480, days: 10, ins: "PREMIUM",
    customer: "AgroPlantações SA", phone: "(61) 9 9378-5541",
    status: "FINISHED", createdOffset: 85, pickupOffset: -78,
    notes: "Contrato anual em negociação. Locou novamente.",
    isRented: false,
  },
  {
    vehicleId: V.hilux, rate: 480, days: 7, ins: "INTERMEDIATE",
    customer: "Ricardo Lopes Braga", phone: "(61) 9 8892-7763",
    status: "FINISHED", createdOffset: 70, pickupOffset: -63,
    notes: "Entrega em perfeitas condições.",
    isRented: false,
  },
  {
    vehicleId: V.creta, rate: 300, days: 7, ins: "INTERMEDIATE",
    customer: "Gabriel Figueiredo", phone: "(61) 9 9256-0034",
    status: "FINISHED", createdOffset: 55, pickupOffset: -48,
    notes: "Viagem com família. Pediu cadeirinha extra.",
    isRented: false,
  },
  {
    vehicleId: V.pulse, rate: 300, days: 7, ins: "BASIC",
    customer: "Carolina Mendes Silva", phone: "(61) 9 7801-6698",
    status: "FINISHED", createdOffset: 42, pickupOffset: -35,
    notes: "Retornou no horário. Ótima avaliação.",
    isRented: false,
  },

  // ── CANCELLED ──────────────────────────────────────────────────────────────
  {
    vehicleId: V.mobi, rate: 100, days: 3, ins: "BASIC",
    customer: "Lucas Ferreira Lima", phone: "(61) 9 9433-1125",
    status: "CANCELLED", createdOffset: 260, pickupOffset: -255,
    notes: "Cliente cancelou por imprevistos.",
  },
  {
    vehicleId: V.gol10, rate: 130, days: 4, ins: "BASIC",
    customer: "Priscila Lima Santos", phone: "(61) 9 9041-2275",
    status: "CANCELLED", createdOffset: 165, pickupOffset: -160,
    notes: "Cancelado 48h antes. Caução devolvida.",
  },
  {
    vehicleId: V.polo, rate: 130, days: 3, ins: "BASIC",
    customer: "Matheus Correia Dias", phone: "(61) 9 8867-5534",
    status: "CANCELLED", createdOffset: 90, pickupOffset: -86,
    notes: "Sem motivo informado.",
  },
  {
    vehicleId: V.spin, rate: 300, days: 5, ins: "BASIC",
    customer: "Renata Santos Alves", phone: "(61) 9 9328-0061",
    status: "CANCELLED", createdOffset: 38, pickupOffset: -34,
    notes: "Evento cancelado. Reagendamento solicitado.",
  },

  // ── CONFIRMED — ativos agora (pickup no passado, return no futuro) ────────
  {
    vehicleId: V.tracker, rate: 300, days: 7, ins: "INTERMEDIATE",
    customer: "Carlos Eduardo Silva", phone: "(61) 9 9170-4492",
    status: "CONFIRMED", createdOffset: 9, pickupOffset: -6,
    notes: "Retirada feita. Veículo em uso.",
    isRented: true,
  },
  {
    vehicleId: V.s10, rate: 480, days: 7, ins: "PREMIUM",
    customer: "Construção ABC Ltda", phone: "(61) 9 7834-7719",
    status: "CONFIRMED", createdOffset: 8, pickupOffset: -4,
    notes: "Contrato empresarial. NF solicitada.",
    isRented: true,
  },
  {
    vehicleId: V.creta, rate: 300, days: 7, ins: "BASIC",
    customer: "Roberta Maia Rocha", phone: "(61) 9 9605-3348",
    status: "CONFIRMED", createdOffset: 5, pickupOffset: -2,
    notes: "Viagem a lazer. Checklist feito na retirada.",
    isRented: true,
  },
  {
    vehicleId: V.hilux, rate: 480, days: 7, ins: "INTERMEDIATE",
    customer: "Transportes RS Ltda", phone: "(61) 9 8811-6670",
    status: "CONFIRMED", createdOffset: 4, pickupOffset: -1,
    notes: "Frota. Segunda unidade este mês.",
    isRented: true,
  },

  // ── CONFIRMED — futuros próximos 60 dias (calendário) ────────────────────
  {
    vehicleId: V.pulse, rate: 300, days: 3, ins: "BASIC",
    customer: "Ana Paula Sousa", phone: "(61) 9 9243-9983",
    status: "CONFIRMED", createdOffset: 3, pickupOffset: 3,
    notes: "Retirada confirmada. Pagamento feito.",
    isRented: true,
  },
  {
    vehicleId: V.toro, rate: 350, days: 5, ins: "INTERMEDIATE",
    customer: "Bruno Nakamura Costa", phone: "(61) 9 7712-5507",
    status: "CONFIRMED", createdOffset: 2, pickupOffset: 5,
    notes: "Viagem de negócios para Goiânia.",
    isRented: true,
  },
  {
    vehicleId: V.amarok, rate: 350, days: 7, ins: "BASIC",
    customer: "Luiz Henrique Carvalho", phone: "(61) 9 9387-2264",
    status: "CONFIRMED", createdOffset: 2, pickupOffset: 9,
    notes: "Obra no interior. Km rodado estimado: 1.500.",
    isRented: true,
  },
  {
    vehicleId: V.montana, rate: 350, days: 10, ins: "INTERMEDIATE",
    customer: "Clínica Saúde Total", phone: "(61) 9 8956-1140",
    status: "CONFIRMED", createdOffset: 1, pickupOffset: 14,
    notes: "Equipe médica. Contrato mensal em negociação.",
    isRented: true,
  },
  {
    vehicleId: V.hb20, rate: 130, days: 3, ins: "BASIC",
    customer: "Diego Fonseca Lima", phone: "(61) 9 9764-3380",
    status: "CONFIRMED", createdOffset: 1, pickupOffset: 21,
    notes: "Fim de semana prolongado.",
    isRented: true,
  },
  {
    vehicleId: V.spin, rate: 300, days: 3, ins: "BASIC",
    customer: "Conferência Nacional ABNT", phone: "(61) 9 8823-9917",
    status: "CONFIRMED", createdOffset: 1, pickupOffset: 28,
    notes: "7 passageiros. Evento corporativo.",
    isRented: true,
  },
  {
    vehicleId: V.tracker, rate: 300, days: 5, ins: "INTERMEDIATE",
    customer: "Patricia Vieira Lopes", phone: "(61) 9 9512-4456",
    status: "CONFIRMED", createdOffset: 1, pickupOffset: 35,
    notes: "Viagem em família para Caldas Novas.",
    isRented: true,
  },
  {
    vehicleId: V.creta, rate: 300, days: 7, ins: "INTERMEDIATE",
    customer: "Eduardo Henrique Lima", phone: "(61) 9 7756-8801",
    status: "CONFIRMED", createdOffset: 1, pickupOffset: 45,
    notes: "Reserva com antecedência. Cliente VIP.",
    isRented: false,
  },

  // ── PENDING — aguardando confirmação ──────────────────────────────────────
  {
    vehicleId: V.hilux, rate: 480, days: 10, ins: "PREMIUM",
    customer: "Marcos Tavares Junior", phone: "(61) 9 9512-0087",
    status: "PENDING", createdOffset: 1, pickupOffset: 29,
    notes: "Aguardando confirmação do pagamento.",
  },
  {
    vehicleId: V.s10, rate: 480, days: 5, ins: "INTERMEDIATE",
    customer: "Isabela Torres Melo", phone: "(61) 9 8856-4431",
    status: "PENDING", createdOffset: 1, pickupOffset: 34,
    notes: "Pediu para ligar antes da retirada.",
  },
  {
    vehicleId: V.pulse, rate: 300, days: 5, ins: "BASIC",
    customer: "Felipe Santana Braga", phone: "(61) 9 9612-0087",
    status: "PENDING", createdOffset: 0, pickupOffset: 39,
    notes: "Reserva via site. Aguarda contato.",
  },
  {
    vehicleId: V.polo, rate: 130, days: 3, ins: "BASIC",
    customer: "Natália Correia Dias", phone: "(61) 9 7745-2198",
    status: "PENDING", createdOffset: 0, pickupOffset: 51,
    notes: "Primeiro contato. Enviou documentação.",
  },
  {
    vehicleId: V.virtus, rate: 135, days: 4, ins: "BASIC",
    customer: "Renan Costa Almeida", phone: "(61) 9 9034-6612",
    status: "PENDING", createdOffset: 0, pickupOffset: 58,
    notes: "Viagem de lua de mel. Quer veículo limpo.",
  },
];

// ─── Leads ─────────────────────────────────────────────────────────────────────

const LEADS = [
  // NEW (6)
  { name: "Kaique Fernandes", phone: "(61) 9 8821-3374", v: "Fiat Mobi", s: "NEW", dAgo: 1, notes: "Entrou em contato pelo WhatsApp. Quer retirar ainda esta semana." },
  { name: "Bruna Tavares", phone: "(61) 9 9034-6612", v: "Renault Kwid", s: "NEW", dAgo: 2, notes: "Indicada por cliente antigo. Pediu tabela de preços." },
  { name: "Thiago Menezes", phone: "(61) 9 7745-2198", v: "HB20", s: "NEW", dAgo: 3, notes: "Ligou perguntando disponibilidade para o fim de semana." },
  { name: "Sara Lopes", phone: "(61) 9 9612-0087", v: "Peugeot 208", s: "NEW", dAgo: 4, notes: "Formulário do site. Não informou data de retirada." },
  { name: "Nilton Brito", phone: "(61) 9 8856-4431", v: "Ford KA", s: "NEW", dAgo: 5, notes: "Primeiro contato via Instagram." },
  { name: "Mirela Souza", phone: "(61) 9 9821-0034", v: "Fiat Argo", s: "NEW", dAgo: 1, notes: "Perguntou sobre disponibilidade para julho." },

  // CONTACTED (8)
  { name: "Carlos Henrique", phone: "(61) 9 9233-8847", v: "Tracker", s: "CONTACTED", dAgo: 7, notes: "Gostou da condição sem cartão. Vai confirmar com a esposa." },
  { name: "Juliana Souza", phone: "(61) 9 8801-5563", v: "Creta", s: "CONTACTED", dAgo: 10, notes: "Comparando com concorrentes. Prefere automático." },
  { name: "Marcos Vinicius", phone: "(61) 9 9347-2290", v: "Hilux", s: "CONTACTED", dAgo: 12, notes: "Empresa para uso corporativo. Pediu nota fiscal." },
  { name: "Fernanda Lima", phone: "(61) 9 7790-3315", v: "Pulse", s: "CONTACTED", dAgo: 14, notes: "Prefere retirada no aeroporto. Viagem de negócios." },
  { name: "Rodrigo Melo", phone: "(61) 9 9125-7764", v: "S10", s: "CONTACTED", dAgo: 18, notes: "Procurando picape para obra. Locação de 15 dias." },
  { name: "Viviane Monteiro", phone: "(61) 9 8934-1102", v: "HB20", s: "CONTACTED", dAgo: 20, notes: "Quer usar no fim de semana. Perguntou sobre CNH digital." },
  { name: "Luana Barbosa", phone: "(61) 9 9558-2231", v: "Chevrolet Onix", s: "CONTACTED", dAgo: 22, notes: "Abordagem via Instagram. Muito receptiva." },
  { name: "Tiago Nunes", phone: "(61) 9 7723-4410", v: "Renault Logan", s: "CONTACTED", dAgo: 25, notes: "Retorno agendado para sexta." },

  // NEGOTIATING (7)
  { name: "João Pedro", phone: "(61) 9 9502-6631", v: "Creta", s: "NEGOTIATING", dAgo: 27, notes: "Solicitou desconto para locação longa. Proposta de 20 dias enviada." },
  { name: "Camila Rocha", phone: "(61) 9 8870-4489", v: "Tracker", s: "NEGOTIATING", dAgo: 30, notes: "Pediu opções de seguro completo. Tem filhos pequenos." },
  { name: "Rafael Mendes", phone: "(61) 9 9681-3327", v: "Hilux", s: "NEGOTIATING", dAgo: 33, notes: "Pagamento à vista. Solicitou 10% de desconto." },
  { name: "Patrícia Alves", phone: "(61) 9 7723-9950", v: "Peugeot 208", s: "NEGOTIATING", dAgo: 36, notes: "Ligou duas vezes. Muito interessada, aguarda liberação no cartão." },
  { name: "Leonardo Castro", phone: "(61) 9 9014-8876", v: "S10", s: "NEGOTIATING", dAgo: 39, notes: "Uso para transportar equipamentos. Quer cobertura extra." },
  { name: "Aline Ramos", phone: "(61) 9 8845-2213", v: "Renault Kwid", s: "NEGOTIATING", dAgo: 42, notes: "Primeira locação. Entende o processo." },
  { name: "César Oliveira", phone: "(61) 9 9412-8873", v: "Amarok", s: "NEGOTIATING", dAgo: 44, notes: "Proposta para contrato mensal em análise." },

  // AWAITING (6)
  { name: "Gabriel Costa", phone: "(61) 9 9378-5541", v: "Fiat Mobi", s: "AWAITING", dAgo: 48, notes: "Retorno agendado para sexta. Cliente viajou." },
  { name: "Larissa Oliveira", phone: "(61) 9 8892-7763", v: "Pulse", s: "AWAITING", dAgo: 52, notes: "Aguardando confirmação do chefe. Evento corporativo." },
  { name: "Henrique Teixeira", phone: "(61) 9 9256-0034", v: "HB20", s: "AWAITING", dAgo: 55, notes: "Pediu prazo de 48h para decidir." },
  { name: "Daniela Pinto", phone: "(61) 9 7801-6698", v: "Tracker", s: "AWAITING", dAgo: 58, notes: "Vai retornar após viagem de trabalho." },
  { name: "Alexandre Moura", phone: "(61) 9 9433-1125", v: "Ford KA", s: "AWAITING", dAgo: 62, notes: "Quer quilometragem livre. Orçamento enviado." },
  { name: "Priya Fernandes", phone: "(61) 9 8801-9921", v: "Creta", s: "AWAITING", dAgo: 65, notes: "Esperando resposta do setor financeiro da empresa." },

  // WON (7)
  { name: "Pedro Augusto", phone: "(61) 9 9764-3380", v: "Creta", s: "WON", dAgo: 35, notes: "Reserva confirmada. Retirada marcada para segunda." },
  { name: "Amanda Ferreira", phone: "(61) 9 8823-9917", v: "Pulse", s: "WON", dAgo: 40, notes: "Já enviou documentação. Aguarda confirmação." },
  { name: "Bruno Carvalho", phone: "(61) 9 9512-4456", v: "Hilux", s: "WON", dAgo: 45, notes: "Empresa fechou contrato mensal. NF emitida." },
  { name: "Isabela Santos", phone: "(61) 9 7756-8801", v: "Renault Kwid", s: "WON", dAgo: 50, notes: "Documentação em ordem. Retirada amanhã cedo." },
  { name: "Ricardo Lopes", phone: "(61) 9 9041-2275", v: "S10", s: "WON", dAgo: 55, notes: "Locação de 10 dias. Pago integralmente." },
  { name: "Mônica Reis", phone: "(61) 9 8934-5512", v: "Tracker", s: "WON", dAgo: 60, notes: "Fechou com seguro premium. Ótima margem." },
  { name: "Jonathan Cruz", phone: "(61) 9 9378-1102", v: "Toro Ranch", s: "WON", dAgo: 65, notes: "Contrato assinado. NF a emitir amanhã." },

  // CAR_RENTED (6)
  { name: "Lucas Martins", phone: "(61) 9 8867-5534", v: "Tracker", s: "CAR_RENTED", dAgo: 6, notes: "Veículo entregue. Checklist feito. Devolução em 7 dias." },
  { name: "Thaís Rodrigues", phone: "(61) 9 9328-0061", v: "HB20", s: "CAR_RENTED", dAgo: 4, notes: "Carro em uso. Cliente satisfeita, pediu 3 dias extras." },
  { name: "Diego Pereira", phone: "(61) 9 9170-4492", v: "Fiat Mobi", s: "CAR_RENTED", dAgo: 2, notes: "Locação corporativa ativa. Motorista terceirizado." },
  { name: "Natália Gomes", phone: "(61) 9 7834-7719", v: "Peugeot 208", s: "CAR_RENTED", dAgo: 1, notes: "Em uso. Retorno no próximo sábado." },
  { name: "Eduardo Ribeiro", phone: "(61) 9 9605-3348", v: "Creta", s: "CAR_RENTED", dAgo: 2, notes: "Segundo mês consecutivo com a empresa." },
  { name: "Sílvia Monteiro", phone: "(61) 9 8823-4478", v: "Hilux", s: "CAR_RENTED", dAgo: 1, notes: "Frota ativa. Empresa renovando contrato mensal." },

  // LOST (5)
  { name: "Priscila Lima", phone: "(61) 9 8811-6670", v: "Ford KA", s: "LOST", dAgo: 55, notes: "Fechou com concorrente. Preço foi o fator decisivo." },
  { name: "Simone Cunha", phone: "(61) 9 9243-9983", v: "Renault Kwid", s: "LOST", dAgo: 60, notes: "Desistiu da viagem. Cancelou o interesse." },
  { name: "Matheus Correia", phone: "(61) 9 7712-5507", v: "Pulse", s: "LOST", dAgo: 68, notes: "Não retornou após 3 tentativas de contato." },
  { name: "Vanessa Nascimento", phone: "(61) 9 9387-2264", v: "HB20", s: "LOST", dAgo: 76, notes: "Optou por alugar o carro do cunhado." },
  { name: "André Barbosa", phone: "(61) 9 8956-1140", v: "Hilux", s: "LOST", dAgo: 88, notes: "Orçamento muito acima do esperado. Sem margem." },
];

// ─── Checklist helpers ─────────────────────────────────────────────────────────

const FUEL_LEVELS = ["Cheio", "3/4", "1/2", "1/4"];
const fuel = () => FUEL_LEVELS[Math.floor(Math.random() * FUEL_LEVELS.length)];
const mileage = (base: number, days: number) => base + Math.round(days * (80 + Math.random() * 100));

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🗑  Limpando dados operacionais...");
  await prisma.rentalChecklist.deleteMany({});
  await prisma.rental.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.reservation.deleteMany({});
  console.log("   ✓ Tabelas limpas.\n");

  // ─── Reservations ────────────────────────────────────────────────────────────

  console.log("📋 Criando reservas...");
  const createdReservations: { id: string; res: ResInput; pickupDate: Date; returnDate: Date }[] = [];

  for (const r of RESERVATIONS) {
    const { subtotal, total } = price(r.rate, r.days, r.ins);
    const pickupDate = r.pickupOffset < 0
      ? ago(-r.pickupOffset)
      : fromNow(r.pickupOffset);
    const returnDate = addDays(pickupDate, r.days);
    const createdAt  = ago(r.createdOffset);

    const reservation = await prisma.reservation.create({
      data: {
        vehicleId:    r.vehicleId,
        pickupDate,
        returnDate,
        rentalDays:   r.days,
        insuranceType: r.ins,
        addons:        [],
        subtotal,
        totalPrice:    total,
        status:        r.status,
        customerName:  r.customer,
        customerPhone: r.phone,
        notes:         r.notes,
        createdAt,
        updatedAt:     createdAt,
      },
    });
    createdReservations.push({ id: reservation.id, res: r, pickupDate, returnDate });
    process.stdout.write(`\r   ${createdReservations.length}/${RESERVATIONS.length}`);
  }
  console.log(`\n   ✓ ${createdReservations.length} reservas criadas.\n`);

  // ─── Rentals + Checklists ─────────────────────────────────────────────────

  console.log("🚗 Criando locações...");
  const rentable = createdReservations.filter((cr) => cr.res.isRented);
  const now = new Date();
  let rentalCount = 0;
  let checklistCount = 0;

  for (const cr of rentable) {
    const { id: reservationId, res, pickupDate, returnDate } = cr;

    // Determine rental status based on reservation status + dates
    let rentalStatus: "COMPLETED" | "ACTIVE" | "SCHEDULED";
    if (res.status === "FINISHED") {
      rentalStatus = "COMPLETED";
    } else if (res.status === "CONFIRMED" && pickupDate <= now && returnDate >= now) {
      rentalStatus = "ACTIVE";
    } else if (res.status === "CONFIRMED" && pickupDate > now) {
      rentalStatus = "SCHEDULED";
    } else {
      continue;
    }

    const baseMileage = 15000 + Math.floor(Math.random() * 40000);

    const rental = await prisma.rental.create({
      data: {
        reservationId,
        vehicleId:     res.vehicleId,
        customerName:  res.customer,
        customerPhone: res.phone,
        pickupDate,
        returnDate,
        status:        rentalStatus,
        pickupMileage: rentalStatus !== "SCHEDULED" ? baseMileage : null,
        returnMileage: rentalStatus === "COMPLETED"  ? mileage(baseMileage, res.days) : null,
        notes:         res.notes,
        createdAt:     pickupDate,
        updatedAt:     rentalStatus === "COMPLETED" ? returnDate : pickupDate,
      },
    });
    rentalCount++;

    // PICKUP checklist for COMPLETED and ACTIVE
    if (rentalStatus === "COMPLETED" || rentalStatus === "ACTIVE") {
      await prisma.rentalChecklist.create({
        data: {
          rentalId:  rental.id,
          type:      "PICKUP",
          fuelLevel: rentalStatus === "COMPLETED" ? "Cheio" : fuel(),
          mileage:   baseMileage,
          notes:     "Veículo inspecionado. Sem avarias.",
          createdAt: pickupDate,
        },
      });
      checklistCount++;
    }

    // RETURN checklist only for COMPLETED
    if (rentalStatus === "COMPLETED") {
      const returnMileageVal = mileage(baseMileage, res.days);
      await prisma.rentalChecklist.create({
        data: {
          rentalId:  rental.id,
          type:      "RETURN",
          fuelLevel: fuel(),
          mileage:   returnMileageVal,
          notes:     "Devolvido sem danos. Tanque parcial.",
          createdAt: returnDate,
        },
      });
      checklistCount++;
    }

    process.stdout.write(`\r   ${rentalCount} locações | ${checklistCount} checklists`);
  }
  console.log(`\n   ✓ ${rentalCount} locações e ${checklistCount} checklists criados.\n`);

  // ─── Leads ────────────────────────────────────────────────────────────────

  console.log("👥 Criando leads...");
  let leadCount = 0;
  for (const l of LEADS) {
    const d = ago(l.dAgo);
    await prisma.lead.create({
      data: {
        name:            l.name,
        phone:           l.phone,
        vehicleInterest: l.v,
        status:          l.s as "NEW" | "CONTACTED" | "NEGOTIATING" | "AWAITING" | "WON" | "CAR_RENTED" | "LOST",
        notes:           l.notes,
        createdAt:       d,
        updatedAt:       d,
      },
    });
    leadCount++;
    process.stdout.write(`\r   ${leadCount}/${LEADS.length}`);
  }
  console.log(`\n   ✓ ${leadCount} leads criados.\n`);

  // ─── Summary ──────────────────────────────────────────────────────────────

  const [resTotal, rentalTotal, leadTotal] = await Promise.all([
    prisma.reservation.count(),
    prisma.rental.count(),
    prisma.lead.count(),
  ]);

  const revenueResult = await prisma.reservation.aggregate({
    where: { status: { not: "CANCELLED" } },
    _sum: { totalPrice: true },
  });

  const activeCount    = await prisma.rental.count({ where: { status: "ACTIVE" } });
  const scheduledCount = await prisma.rental.count({ where: { status: "SCHEDULED" } });
  const completedCount = await prisma.rental.count({ where: { status: "COMPLETED" } });

  const statusBreakdown = await prisma.reservation.groupBy({ by: ["status"], _count: { id: true } });

  const revenue = Number(revenueResult._sum.totalPrice ?? 0);
  const vehicleCount = await prisma.vehicle.count();
  const occupancy = Math.round((activeCount / vehicleCount) * 100);

  console.log("═══════════════════════════════════════");
  console.log("  RELATÓRIO FINAL");
  console.log("═══════════════════════════════════════");
  console.log(`  Leads criados:      ${leadCount}`);
  console.log(`  Reservas criadas:   ${resTotal}`);
  for (const s of statusBreakdown) {
    const labels: Record<string, string> = { PENDING: "Pendente", CONFIRMED: "Confirmada", FINISHED: "Concluída", CANCELLED: "Cancelada" };
    console.log(`    · ${(labels[s.status] ?? s.status).padEnd(12)} ${s._count.id}`);
  }
  console.log(`  Locações criadas:   ${rentalTotal}`);
  console.log(`    · Ativas         ${activeCount}`);
  console.log(`    · Agendadas      ${scheduledCount}`);
  console.log(`    · Concluídas     ${completedCount}`);
  console.log(`  Receita simulada:   R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
  console.log(`  Ocupação (ativas):  ${occupancy}% (${activeCount}/${vehicleCount} veículos)`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
