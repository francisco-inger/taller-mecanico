const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const mecanicos = await prisma.mecanico.count();
  const ordenes = await prisma.orden.count();
  const facturas = await prisma.factura.count();
  console.log(`Mecánicos: ${mecanicos}, Órdenes: ${ordenes}, Facturas: ${facturas}`);
  process.exit(0);
}
check();
