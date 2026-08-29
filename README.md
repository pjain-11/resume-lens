# ResumeLens

AI-powered resume and job match analyzer.

## Overview

ResumeLens is a small AI-powered application that compares a candidate's resume
against a job description and provides:

- Overall match score
- Skills match
- Missing skills
- Experience analysis
- Resume improvement suggestions
- Interview questions

The application is intentionally designed as a lightweight portfolio project.

## Planned Features

- Resume PDF upload
- Resume text extraction
- Job description analysis
- AI-powered resume/job matching
- Structured AI response
- Resume improvement suggestions
- Interview question generation
- Analysis history
- Local browser storage

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Lucide React
- Zod
- LLM API

## Architecture

Planned architecture:

```
                    ResumeLens

                      Browser
                         |
                         v
                    Next.js UI
                         |
                         v
                  /api/analyze
                         |
             +-----------+-----------+
             |                       |
             v                       v
       PDF Text Extraction       LLM API
                                     |
                                     v
                              Structured JSON
                                     |
                                     v
                              Zod Validation
                                     |
                                     v
                              Analysis Result
                                     |
                                     v
                                Next.js UI
                                     |
                                     v
                                localStorage
```

### Why Next.js API Routes?

The application will use Next.js server-side API routes instead of a separate
Express backend. This keeps the project simple while allowing the LLM API key to
remain server-side.

### Why No Database?

This initial portfolio version will use browser `localStorage` for analysis
history. A production version could use PostgreSQL and authentication.

## Security

- The LLM API key will never be exposed to the browser.
- Secrets are stored in environment variables and will not use `NEXT_PUBLIC_`
  variables.
- `.env.example` documents the required variables; real values belong in
  `.env.local`, which is git-ignored.

## Future Improvements

Potential future improvements, intentionally **not** part of the initial version:

- Authentication
- PostgreSQL
- Redis
- Background processing
- S3 resume storage
- OCR
- Rate limiting
- Multiple LLM providers
- Analytics

## Local Development

Requires Node.js 20+ and npm.

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start the development server (http://localhost:3000)
npm run dev

# Run the linter
npm run lint

# Create a production build
npm run build

# Serve the production build
npm run start
```

## Project Structure

```
resume-lens/
├── app/          # Next.js App Router routes and layouts
├── components/   # React components
├── lib/          # Shared utilities and validation schemas
├── types/        # Shared TypeScript types
├── public/       # Static assets
├── .env.example  # Environment variable template
└── ...
```

## Project Status

Initial setup completed. Application features will be implemented incrementally.
