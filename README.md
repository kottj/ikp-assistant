# IKP Asystent Kardiologiczny

AI-powered cardiology pre-screening assistant for the Polish healthcare system. Conducts structured medical interviews and generates comprehensive triage reports for cardiologists.

**[Live Demo](https://ikp-assistant.vercel.app)** | **[GitHub](https://github.com/kottj/ikp-assistant)**

## Features

- **Two-phase interview flow**: Predefined cardiology questions followed by AI-generated follow-ups
- **Multi-provider LLM support**: OpenAI (including ChatGPT-5), Anthropic Claude, Azure OpenAI
- **Professional reports**: On-screen display with PDF export
- **Polish language**: All content in Polish, following gov.pl design system
- **Configurable prompts**: Edit AI prompts in `prompts.json` without code changes
- **Patient demographics**: Collects sex and age for risk-adjusted analysis

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### LLM Setup (Required)

Click the settings icon in the header to configure:
1. Select provider (OpenAI, Anthropic, or Azure)
2. Enter your API key
3. Choose model (ChatGPT-5, GPT-4o, Claude Sonnet 4, etc.)
4. Test connection and save

No environment variables required - settings are stored in browser localStorage.

### Environment Variables (Optional)

```bash
# .env.local

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Default LLM fallback
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o
```

## Usage Flow

1. **Enter patient data**: ID, sex, age
2. **Phase 1**: Answer 30+ predefined cardiology questions
3. **AI Analysis**: System generates personalized follow-up questions
4. **Phase 2**: Answer 3-8 follow-up questions
5. **Report**: View and download PDF report for cardiologist

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── interview/page.tsx    # Interview flow
│   ├── report/page.tsx       # Report display
│   └── api/                  # API routes
├── components/ui/            # UI components
├── lib/
│   ├── prompts.json          # All AI prompts (editable)
│   ├── questions/            # Predefined questions
│   ├── llm/                  # LLM provider abstraction
│   └── store.ts              # Zustand state
└── types/                    # TypeScript types
```

## Customizing Prompts

Edit `src/lib/prompts.json` to modify AI behavior:

```json
{
  "analysis": {
    "system": "...",  // Cardiologist analysis prompt
    "userTemplate": "..."
  },
  "report": {
    "system": "...",  // Report generation prompt
    "userTemplate": "..."
  }
}
```

## Medical Grounding

Based on:
- ESC Guidelines (European Society of Cardiology)
- ASCVD/EZ-CVD Risk Calculators
- Polish medical interview standards (wywiad lekarski)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS (gov.pl design system)
- **State**: Zustand
- **PDF**: jsPDF
- **LLM**: OpenAI / Anthropic / Azure APIs

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production
npm run lint     # ESLint
```

## License

MIT
