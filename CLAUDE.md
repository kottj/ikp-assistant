# IKP Asystent Kardiologiczny

## Project Overview

**Purpose:** AI-powered pre-screening assistant for cardiology patients, designed to integrate with the Polish IKP (Internetowe Konto Pacjenta) ecosystem. The assistant conducts structured medical interviews in Polish, preparing comprehensive triage documentation before specialist consultations.

**Language:** Polish (all user-facing content)
**Design:** Based on gov.pl / pacjent.gov.pl design system

## Live Demo & Repository

- **Live App:** https://ikp-assistant.vercel.app
- **GitHub:** https://github.com/kottj/ikp-assistant
- **Database:** Supabase (PostgreSQL)

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Build
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  LANDING PAGE (/)                                                   │
│  - Patient demographics (ID, sex, age)                              │
│  - LLM configuration (settings modal)                               │
│  - Process explanation                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INTERVIEW (/interview)                                             │
│  Phase 1: Predefined cardiology questions (30+)                     │
│  ─────────────────────────────────────────                          │
│  Phase 2: AI-generated follow-up questions (3-8)                    │
│           Focused on clinical info, NOT lifestyle advice            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  REPORT (/report)                                                   │
│  - On-screen report display                                         │
│  - PDF export (Polish characters converted to ASCII)                │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Files and Responsibilities

### Core Application

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with patient demographics form |
| `src/app/interview/page.tsx` | Interview flow (phases 1 & 2) |
| `src/app/report/page.tsx` | Report display and PDF export |
| `src/lib/store.ts` | Zustand state management |

### Questions & Prompts

| File | Purpose |
|------|---------|
| `src/lib/prompts.json` | **All AI prompts in one editable file** |
| `src/lib/questions/cardiology.ts` | 30+ predefined triage questions (Polish) |
| `src/lib/llm/prompts/analysis.ts` | Loads analysis prompt from prompts.json |
| `src/lib/llm/prompts/report.ts` | Loads report prompt from prompts.json |

### LLM Integration

| File | Purpose |
|------|---------|
| `src/lib/llm/provider.ts` | Provider abstraction (OpenAI/Anthropic/Azure) |
| `src/lib/llm-config.ts` | Client-side LLM settings (localStorage) |
| `src/app/api/analyze/route.ts` | Analysis endpoint |
| `src/app/api/generate-report/route.ts` | Report generation endpoint |
| `src/app/api/test-llm/route.ts` | Connection test endpoint |

### UI Components

| File | Purpose |
|------|---------|
| `src/components/ui/Header.tsx` | gov.pl styled header with settings button |
| `src/components/ui/SettingsModal.tsx` | LLM configuration modal |
| `src/components/ui/QuestionCard.tsx` | Question rendering (6 input types + "Other" option) |
| `src/components/ui/ProgressBar.tsx` | Interview progress indicator |
| `src/components/ui/Button.tsx` | Styled buttons |

## Important Types

```typescript
// Question types supported
type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'scale';

// Question with "Other" option support
interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  required: boolean;
  allowOther?: boolean;        // Enable "Inne" free-text option
  otherPlaceholder?: string;   // Placeholder for "Other" input
}

// Question categories
type QuestionCategory =
  | 'chief_complaint'    // Main symptoms
  | 'risk_factors'       // CV risk assessment
  | 'medical_history'    // Past conditions
  | 'medications'        // Current meds
  | 'lifestyle'          // Diet, exercise, etc.
  | 'functional_status'; // Exercise tolerance

// Patient demographics (collected before interview)
interface PatientDemographics {
  sex: 'male' | 'female';
  age: number;
}

// Report risk levels
type RiskLevel = 'low' | 'moderate' | 'high';
type UrgencyLevel = 'routine' | 'urgent' | 'immediate';
```

## Prompts Configuration

All AI prompts are stored in `src/lib/prompts.json` for easy editing:

```json
{
  "analysis": {
    "system": "...",           // Cardiologist analysis prompt
    "userTemplate": "...",     // User message template
    "demographicsTemplate": "..." // Patient info template
  },
  "report": {
    "system": "...",           // Report generation prompt
    "userTemplate": "..."      // User message template
  },
  "labels": {
    "urgency": {...},          // UI labels
    "risk": {...},
    "sex": {...}
  },
  "pdf": {...}                 // PDF template labels
}
```

## LLM Configuration

Users configure LLM via the settings modal (no .env required):

**Supported Providers:**
- OpenAI (ChatGPT-5, GPT-4o, GPT-4 Turbo, GPT-4o Mini)
- Anthropic (Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3 Opus)
- Azure OpenAI

Settings are stored in browser localStorage.

## Environment Variables (Optional)

```bash
# Supabase (optional - works without for demo)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Default LLM (fallback if no client config)
LLM_PROVIDER=openai|anthropic|azure
LLM_API_KEY=...
LLM_MODEL=gpt-4o
```

## Medical Grounding

Questions and prompts are based on:
- **ESC Guidelines** (European Society of Cardiology)
- **ASCVD/EZ-CVD Risk Calculators**
- **Polish wywiad lekarski** (medical interview) standards
- **NCBI Cardiovascular Interview Questions**

## Design System

Colors (gov.pl palette):
- Primary: `#0052A5` (navy blue)
- Secondary: `#DC143C` (Polish red)
- Background: `#F5F5F5`
- Success: `#00875A`
- Warning: `#F57F17`
- Error: `#D32F2F`

## Data Flow

1. **Configure LLM** → Settings modal, API key stored in localStorage
2. **Enter Demographics** → Patient ID, sex, age
3. **Phase 1** → Answer predefined questions (30+)
4. **Analysis** → POST to `/api/analyze` with demographics → LLM generates follow-ups
5. **Phase 2** → Answer AI-generated questions (3-8, clinical focus)
6. **Report** → POST to `/api/generate-report` → LLM creates report
7. **Export** → PDF download via jsPDF (Polish chars → ASCII)

## State Management (Zustand)

```typescript
// Key store properties
{
  status: 'idle' | 'phase1' | 'analyzing' | 'phase2' | 'generating_report' | 'completed',
  patientDemographics: { sex: 'male' | 'female', age: number } | null,
  responses: Record<string, string | string[]>,
  phase1Questions: Question[],
  phase2Questions: Question[],
  report: ReportContent | null,
}
```

## Notes for Development

- All text content is in Polish
- Questions in `cardiology.ts` follow ESC guidelines
- Multi-select questions support "Inne" (Other) free-text option
- Prompts are in `prompts.json` - edit there, no code changes needed
- PDF generation converts Polish characters to ASCII (ą→a, ę→e, etc.)
- Patient demographics (sex, age) are passed to analysis for context
- Phase 2 questions focus on clinical info gathering, NOT lifestyle advice
