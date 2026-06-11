import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
p.vehicle.findMany({ select: { id:true, name:true, brand:true, model:true, category:true, dailyRate:true, available:true } })
  .then(vs => { console.log(JSON.stringify(vs, null, 2)); })
  .finally(() => p.$disconnect());
