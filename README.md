# OfferMind — Think Like Candidates Who Get Offers

> Most job tools track where you applied. OfferMind tells you **who you're becoming** as a professional.

## The Problem

Interviews are full of signal — but most candidates lose it all after each round. Messy notes, mixed languages, no structure, no follow-through. Every interview feels like starting from zero.

## What OfferMind Does

OfferMind treats every interview as a **long-term career data asset**, not a one-time event.

It extracts structured intelligence from raw, bilingual (CN/EN) interview transcripts using a **3-layer AI architecture**:

| Layer | What It Does |
|-------|-------------|
| **Transcript Analysis** | Extracts questions, classifies difficulty, evaluates response quality, generates reflections |
| **Role Debrief** | Aggregates multi-round signals → competency heatmaps, hiring likelihood, next best actions |
| **Career Growth** | Tracks competency evolution over time → turning points, stability assessment, growth priorities |
| **Signal Timeline** | AI-filtered narrative of trajectory-changing career moments |

## How It Uses Google Gemini 3

All six AI agents run on **Gemini 3 Flash Preview**, chosen for:

- **Long-context reasoning** — processes entire multi-round interview histories in one pass
- **Structured output reliability** — strict JSON schema compliance for 10-dimensional competency scoring
- **Multimodal input** — parses PDFs, images, and documents alongside text
- **Evidence-based scoring** — every score (1–10) must cite specific transcript evidence to reduce hallucination

## Key Differentiators

- ✅ Handles real-world chaos — incomplete notes, mixed languages, no formatting
- ✅ Multi-pipeline branching for hiring freezes & internal transfers
- ✅ True bilingual support — AI generates analysis in CN or EN
- ✅ Pattern-over-event logic — prevents overreacting to single interviews
- ✅ Transparent AI — shows reasoning, not just conclusions

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, dnd-kit, react-i18next
**Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
**AI**: Google Gemini 3 Flash Preview
**Deployment**: Lovable Cloud

## Vision

**Help people make career decisions they will not regret — not just pass their next interview.**
