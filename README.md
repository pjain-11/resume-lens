# ResumeLens

AI-powered resume and job description match analyzer.

🔗 **Live Demo:** `https://resume-lens-liart.vercel.app/`
🎥 **Demo Video:** `https://youtu.be/dZ8-eWEKI6k`

ResumeLens compares a candidate's resume with a job description and provides actionable insights to help improve job matching and interview preparation.

## Features

* 📄 Resume PDF upload
* 📝 Resume text extraction
* 💼 Job description analysis
* 🤖 AI-powered resume/job matching
* 📊 Overall match score
* 🛠️ Skills match analysis
* ❌ Missing skills identification
* 💼 Experience analysis
* ✨ Resume improvement suggestions
* 🎯 Interview question generation
* 📚 Analysis history
* 💾 Browser-based local storage

## Tech Stack

* **Next.js** — App Router & API Routes
* **TypeScript**
* **React**
* **Tailwind CSS**
* **Lucide React**
* **Zod** — AI response validation
* **Google Gemini API** — AI analysis

## Architecture

```text
                    Browser
                       |
                       v
                  Next.js UI
                       |
                       v
                /api/analyze
                       |
              +--------+--------+
              |                 |
              v                 v
       PDF Text Extraction   Gemini API
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

A separate Express backend is not required for this lightweight portfolio project.

Next.js API Routes keep the architecture simple while ensuring that the Gemini API key remains server-side.

## Security

* Gemini API key is never exposed to the browser.
* Secrets are stored in environment variables.
* Sensitive variables do not use the `NEXT_PUBLIC_` prefix.
* `.env.local` is git-ignored.
* `.env.example` documents the required environment variables.

## Storage

The initial version uses browser `localStorage` for analysis history.

A production version could use:

* PostgreSQL
* Authentication
* Redis
* S3/object storage
* Background processing

## Getting Started

### Prerequisites

* Node.js 20+
* npm
* Google Gemini API key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000.

### Other Commands

```bash
# Run linter
npm run lint

# Create production build
npm run build

# Start production server
npm run start
```

## Project Structure

```text
resume-lens/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── lib/              # AI, validation and utilities
├── types/            # TypeScript types
├── public/            # Static assets
├── .env.example       # Environment variable template
└── ...
```

## Project Status

🚧 **In Development**

* [x] Initial project setup
* [ ] Resume PDF upload
* [ ] PDF text extraction
* [ ] Job description input
* [ ] Gemini API integration
* [ ] Structured AI response
* [ ] Zod validation
* [ ] Resume/job analysis
* [ ] Analysis dashboard
* [ ] Interview questions
* [ ] Analysis history

## Future Improvements

* Authentication
* PostgreSQL
* S3 resume storage
* Redis
* OCR
* Rate limiting
* Multiple LLM providers
* Advanced resume parsing

## License

This project is built for educational and portfolio purposes.
