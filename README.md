# Cards Traktor

Aplicación web para generar planes de pago inteligentes para tarjetas de crédito.

## Stack Tecnológico

- **Frontend**: Next.js 15+ con React 19
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js + bcryptjs
- **Visualización**: Recharts
- **Estilos**: Tailwind CSS

## Características Principales

1. **Gestión de tarjetas de crédito**: Almacena saldo, tasa de interés y límite
2. **Generador de planes de pago**:
   - Estrategia Avalancha (pagar primero el mayor interés)
   - Estrategia Bola de Nieve (pagar primero el menor saldo)
3. **Visualización de planes**: Gráficos y timeline de pagos
4. **Tracking**: Guarda y compara múltiples planes

## Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env con la BD
cp .env.example .env

# Generar cliente de Prisma
npx prisma generate

# Crear migraciones y BD
npx prisma db push

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Layout global
│   ├── page.tsx          # Home
│   └── api/              # API routes
├── lib/
│   ├── db.ts             # Conexión Prisma
│   ├── auth.ts           # Funciones de autenticación
│   └── payment-plan.ts   # Cálculo de planes de pago
├── prisma/
│   └── schema.prisma     # Schema de BD
├── components/           # Componentes React
└── public/               # Archivos estáticos
```

## Modelos de Datos

- **User**: Usuario con email y contraseña
- **CreditCard**: Tarjeta de crédito con saldo e interés
- **PaymentPlan**: Plan de pago generado
- **PaymentItem**: Cada mes del plan con detalles de pago

## Base de Datos

PostgreSQL está requerido. Para desarrollo local puedes usar:
- Railway.app (hosting gratuito)
- Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

## Próximos Pasos

- [ ] Autenticación (registro/login)
- [ ] Dashboard de usuario
- [ ] Formulario de ingreso de tarjetas
- [ ] Generador interactivo de planes
- [ ] Gráficos de comparación
- [ ] Export de planes (PDF)

## Licencia

MIT
