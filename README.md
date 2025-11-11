# FuelEU Maritime Compliance Platform

A full-stack web application for managing maritime fuel compliance under the FuelEU Maritime Regulation (EU) 2023/1805. This platform enables tracking of vessel routes, GHG intensity calculations, compliance balance management, banking of surplus emissions credits, and pooling arrangements between vessels.

## Overview

This application implements a compliance management system for maritime vessels following the FuelEU regulations, specifically:
- **Article 20 - Banking**: Allows vessels to bank positive compliance balances for future use
- **Article 21 - Pooling**: Enables multiple vessels to pool their compliance balances

### Key Features

1. **Routes Management** - Track and manage vessel routes with fuel consumption and emissions data
2. **Compliance Comparison** - Compare routes against baseline with 2% improvement target
3. **Banking System** - Bank surplus compliance credits and apply them to deficit years
4. **Pooling Mechanism** - Create pools with multiple vessels to share compliance balances

## Architecture Summary

This project follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture) principles:

```
src/
├── core/                          # Core business logic (framework-independent)
│   ├── domain/                    # Domain entities and value objects
│   │   ├── Route.ts
│   │   ├── ComplianceBalance.ts
│   │   ├── BankEntry.ts
│   │   └── Pool.ts
│   ├── application/               # Use cases (business rules)
│   │   ├── CompareRoutes.ts
│   │   ├── ComputeComplianceBalance.ts
│   │   ├── BankSurplus.ts
│   │   ├── ApplyBanked.ts
│   │   └── CreatePool.ts
│   └── ports/                     # Interfaces (repository contracts)
│       ├── RouteRepository.ts
│       ├── ComplianceRepository.ts
│       ├── BankRepository.ts
│       └── PoolRepository.ts
├── adapters/                      # Implementations of ports
│   ├── SupabaseRouteRepository.ts
│   ├── SupabaseComplianceRepository.ts
│   ├── SupabaseBankRepository.ts
│   └── SupabasePoolRepository.ts
├── services/                      # Service layer (orchestration)
│   ├── routeService.ts
│   ├── complianceService.ts
│   ├── bankingService.ts
│   └── poolService.ts
├── components/                    # React UI components
│   ├── RoutesTab.tsx
│   ├── CompareTab.tsx
│   ├── BankingTab.tsx
│   └── PoolingTab.tsx
├── lib/                          # Shared utilities
│   └── supabase.ts
└── App.tsx                       # Main application shell
```

### Architecture Benefits

- **Testability**: Core business logic can be tested without UI or database
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap infrastructure (e.g., different database)
- **Domain Focus**: Business rules are isolated and prominent

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **TypeScript** - Type-safe business logic

### Database Schema

```sql
routes              - Maritime route data
ship_compliance     - Computed compliance balances
bank_entries        - Banked surplus credits
pools               - Pool registrations
pool_members        - Pool member allocations
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (database is pre-configured)

### Environment Variables

The Supabase connection details are already configured. No additional setup required.

### Install Dependencies

```bash
npm install
```

### Database Setup

The database schema is already created and seeded with sample data:
- 5 route records (R001-R005)
- Various vessel types and fuel types
- Years 2024-2025

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Application Usage

### 1. Routes Tab

**Purpose**: View and manage vessel routes, set baseline for comparisons

**Features**:
- Display all routes in a filterable table
- Filter by vessel type, fuel type, and year
- Set any route as the baseline for comparison
- View GHG intensity, fuel consumption, distance, and emissions

**Actions**:
- Click "Set Baseline" button on any route to use it as the comparison baseline

### 2. Compare Tab

**Purpose**: Compare routes against the baseline with compliance checking

**Features**:
- View baseline route details
- See percentage difference from baseline for each route
- Compliance indicators (✅ compliant / ❌ non-compliant)
- Visual bar chart comparing GHG intensities
- Target intensity: 89.3368 gCO₂e/MJ (2% below baseline 91.16)

**Key Metrics**:
- GHG Intensity comparison
- Percentage difference from baseline
- Compliance status against target

### 3. Banking Tab

**Purpose**: Bank surplus compliance balance and apply to deficit years

**Features**:
- Compute compliance balance for a ship and year
- View current CB, target/actual intensity, and energy in scope
- Bank positive CB for future use
- Apply banked surplus to deficit years
- View available banked balance

**Business Rules**:
- Can only bank positive CB
- Can only apply amount ≤ available balance
- Applied amount improves target year's CB

**Workflow**:
1. Enter Ship ID and Year
2. Click "Compute CB" to calculate compliance balance
3. If CB is positive, click "Bank Current Surplus"
4. To apply banked surplus, enter amount and target year, then click "Apply Banked Surplus"

### 4. Pooling Tab

**Purpose**: Create pools where multiple vessels share compliance balances

**Features**:
- Add multiple vessels to a pool
- Fetch CB for each vessel automatically
- Real-time pool sum calculation
- Validation against pooling rules
- View allocation results (CB before/after)

**Business Rules (Article 21)**:
- Pool sum must be non-negative (∑ CB ≥ 0)
- Deficit ships cannot exit worse than they entered
- Surplus ships cannot exit with negative CB
- Greedy allocation: surplus distributed to deficits

**Workflow**:
1. Set the year for the pool
2. Add pool members (minimum 2)
3. For each member, enter Ship ID and click "Fetch CB" (or enter manually)
4. Verify pool sum is green (≥ 0)
5. Click "Create Pool" to execute allocation
6. View results showing CB before/after for each member

## Key Formulas & Constants

### Compliance Balance Calculation

```typescript
const TARGET_INTENSITY_2025 = 89.3368; // gCO₂e/MJ (2% below 91.16)
const ENERGY_CONVERSION_FACTOR = 41000; // MJ per tonne of fuel

energyInScope = fuelConsumption × 41000
complianceBalance = (TARGET_INTENSITY - actualIntensity) × energyInScope
```

**Positive CB** = Surplus (better than target)
**Negative CB** = Deficit (worse than target)

### Comparison Percentage Difference

```typescript
percentDiff = ((comparisonIntensity / baselineIntensity) - 1) × 100
compliant = comparisonIntensity ≤ TARGET_INTENSITY
```

### Pooling Allocation

Greedy algorithm:
1. Sort members by CB descending (surplus first)
2. Transfer surplus to deficits iteratively
3. Validate constraints after allocation

## Sample Data

The database is pre-seeded with 5 routes:

| Route ID | Vessel Type | Fuel Type | Year | GHG Intensity | Fuel Consumption | Distance |
|----------|-------------|-----------|------|---------------|------------------|----------|
| R001     | Container   | HFO       | 2024 | 91.0          | 5000 t           | 12000 km |
| R002     | BulkCarrier | LNG       | 2024 | 88.0          | 4800 t           | 11500 km |
| R003     | Tanker      | MGO       | 2024 | 93.5          | 5100 t           | 12500 km |
| R004     | RoRo        | HFO       | 2025 | 89.2          | 4900 t           | 11800 km |
| R005     | Container   | LNG       | 2025 | 90.5          | 4950 t           | 11900 km |

R001 is set as the baseline by default.

## Testing

To test the application:

1. **Routes Tab**: Verify all 5 routes are displayed and filterable
2. **Compare Tab**: Check baseline comparison and compliance indicators
3. **Banking Tab**:
   - Enter Ship ID: SHIP001, Year: 2024
   - Compute CB
   - Bank if positive
   - Apply to another year
4. **Pooling Tab**:
   - Create pool with 2-3 members
   - Use different ships with varying CBs
   - Verify allocation respects constraints

## Type Checking

Run TypeScript type checker:

```bash
npm run typecheck
```

## Linting

Run ESLint:

```bash
npm run lint
```

## Project Structure Highlights

### Core Layer (Framework-Independent)

**Domain Entities** (`src/core/domain/`):
- Pure TypeScript interfaces
- No framework dependencies
- Rich business meaning

**Use Cases** (`src/core/application/`):
- Business rule implementations
- Framework-independent logic
- Orchestrate domain operations

**Ports** (`src/core/ports/`):
- Repository interfaces
- Define contracts, not implementations

### Adapter Layer (Framework-Dependent)

**Repository Implementations** (`src/adapters/`):
- Supabase-specific implementations
- Database mapping logic
- Error handling

### Service Layer

**Services** (`src/services/`):
- Wire together repositories and use cases
- Provide clean API for frontend
- Handle cross-cutting concerns

### UI Layer

**Components** (`src/components/`):
- React functional components
- Hooks for state management
- Tailwind CSS styling

## Design Decisions

### Why Hexagonal Architecture?

1. **Business Logic Protection**: Core rules are isolated from infrastructure changes
2. **Testing**: Can test business logic without database or UI
3. **Technology Flexibility**: Easy to migrate from Supabase to another database
4. **Team Scalability**: Clear boundaries allow parallel development
5. **Long-term Maintenance**: Changes in one layer don't cascade

### Why Supabase?

1. **Rapid Development**: Instant REST API and real-time subscriptions
2. **PostgreSQL**: Industry-standard relational database
3. **Row Level Security**: Built-in security at database level
4. **Type Generation**: Can generate TypeScript types from schema

### Why TypeScript?

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Autocomplete and refactoring
3. **Domain Modeling**: Types reflect business concepts
4. **Maintainability**: Self-documenting code

## Future Enhancements

- [ ] Unit tests for use cases
- [ ] Integration tests for repositories
- [ ] E2E tests for UI flows
- [ ] Real-time updates using Supabase subscriptions
- [ ] CSV import/export for routes
- [ ] Historical compliance tracking
- [ ] Reporting and analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Role-based access control
- [ ] Audit logging for compliance actions

## Reference

All formulas, banking, and pooling rules follow:

**FuelEU Maritime Regulation (EU) 2023/1805**
- Annex IV: Compliance Balance calculation
- Article 20: Banking mechanism
- Article 21: Pooling arrangements

Target GHG intensity reduction: 2% from 2025, scaling to 80% by 2050.

## License

This project was created as an assignment for demonstrating full-stack development capabilities with AI agent assistance.

## Support

For questions or issues, please refer to:
- `AGENT_WORKFLOW.md` - Detailed AI agent usage log
- `REFLECTION.md` - Insights on AI-assisted development
#   A s s i g n m e n t _ V a r u n a _ M a r i n e s  
 