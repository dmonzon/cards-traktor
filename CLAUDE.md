# Cards Traktor - Documentación del Proyecto

## Descripción General
Aplicación web fullstack para generar planes de pago inteligentes para tarjetas de crédito. Los usuarios pueden ingresar múltiples tarjetas y la aplicación genera un plan óptimo siguiendo estrategias como Avalancha o Bola de Nieve.

## Tech Stack
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL + Prisma ORM
- **Autenticación**: NextAuth.js + bcryptjs
- **Visualización**: Recharts

## Estructura del Proyecto
```
cards-traktor/
├── app/                    # Next.js App Router
│   ├── api/               # Endpoints REST
│   ├── layout.tsx         # Layout global
│   ├── page.tsx           # Home
│   └── globals.css
├── lib/
│   ├── db.ts              # Instancia de Prisma
│   ├── auth.ts            # Funciones de autenticación
│   └── payment-plan.ts    # Lógica de cálculo de planes
├── components/            # Componentes React reutilizables
├── prisma/
│   └── schema.prisma      # Schema de BD
└── public/                # Archivos estáticos
```

## Modelos de Datos

### User
- id, email (unique), name, password (hashed)
- Relaciones: creditCards[], paymentPlans[]

### CreditCard
- id, userId, name, balance, interestRate, minPayment, limit
- Relaciones: user, paymentItems[]

### PaymentPlan
- id, userId, name, strategy, totalDebt, totalInterest, monthlyPayment, estimatedMonths
- Relaciones: user, paymentItems[]

### PaymentItem
- Detalles mes a mes: month, principalPayment, interestPayment, remainingBalance

## Algoritmos de Pago

### Avalancha (Avalanche)
Pagar primero las tarjetas con mayor tasa de interés. Minimiza interés total.

### Bola de Nieve (Snowball)
Pagar primero las tarjetas con menor saldo. Genera motivación psicológica.

## Flujo de Usuario Principal

1. Registro/Login
2. Dashboard: ver tarjetas guardadas
3. Agregar/editar tarjetas de crédito
4. Generar plan (seleccionar estrategia)
5. Visualizar plan con gráficos
6. Comparar múltiples planes
7. Exportar o guardar plan

## Próximos Pasos (Order)

1. **Autenticación**: Rutas de registro/login con NextAuth.js
2. **Dashboard**: Página principal del usuario con listado de tarjetas
3. **Formulario de tarjetas**: CRUD de tarjetas de crédito
4. **API de planes**: Endpoints para generar planes con Avalancha/Snowball
5. **Visualización**: Componentes con Recharts para mostrar planes
6. **Comparación**: Vista comparativa de múltiples planes

## Configuración Local

```bash
# Instalar dependencias
npm install

# Configurar BD en .env
DATABASE_URL="postgresql://user:password@localhost:5432/cards_traktor"
NEXTAUTH_SECRET="generar-con-openssl-rand-base64-32"

# Ejecutar migraciones
npx prisma db push

# Desarrollo
npm run dev
```

## Variables de Entorno
- `DATABASE_URL`: Conexión a PostgreSQL
- `NEXTAUTH_SECRET`: Secreto para NextAuth.js
- `NEXTAUTH_URL`: URL base (http://localhost:3000 en dev)

## Notas Importantes
- NO guardar números de tarjeta (solo saldo e interés)
- Validar tasas de interés (0-100%)
- Los cálculos mensuales usan interés compuesto mensual
