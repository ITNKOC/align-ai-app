# Align AI App

An intelligent web application for CV analysis and test generation powered by AI.

## Description

Align AI is a platform that leverages artificial intelligence (Google Gemini) to assist recruiters and candidates in the hiring process. The application enables automatic CV analysis, personalized test generation, and interaction through an intelligent chat interface.

## Features

- **CV Analysis** - Upload and automatic analysis of CVs with skills and experience extraction
- **Test Generation** - Creation of personalized tests and assessments based on profiles
- **AI Chat** - Conversational interface with the AI assistant
- **Dashboard** - Dashboard to manage and track activities
- **Authentication** - Secure login and registration system
- **User Profile** - Personal information management

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Next.js 16, React 19 |
| Language | TypeScript |
| AI | Google Generative AI (Gemini) |
| Database | Prisma ORM |
| Styling | Tailwind CSS |
| UI Components | Radix UI, Lucide React |
| Forms | React Hook Form, Zod |
| Animations | Framer Motion |
| Testing | Jest, React Testing Library |
| Authentication | bcryptjs |

## Prerequisites

- Node.js 18+
- npm or yarn
- A Google Generative AI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ITNKOC/align-ai-app.git
   cd align-ai-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file at the root of the project:
   ```env
   DATABASE_URL="your_database_url"
   GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Check code with ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
align-ai-app/
├── prisma/              # Database schema and migrations
├── public/              # Static files
├── src/
│   ├── actions/         # Server actions
│   ├── app/
│   │   ├── (auth)/      # Authentication pages
│   │   ├── analyze/     # Analysis feature
│   │   ├── api/         # API routes
│   │   ├── chat/        # Chat interface
│   │   ├── dashboard/   # Dashboard
│   │   ├── generate/    # Content generation
│   │   ├── profile/     # User profile
│   │   └── upload/      # File upload
│   ├── components/      # Reusable components
│   └── lib/             # Utilities and helpers
├── jest.config.js       # Jest configuration
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Deployment

The application is optimized for deployment on [Vercel](https://vercel.com).

```bash
npm run build
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## Author

**Koceila Djaballah**

- GitHub: [@ITNKOC](https://github.com/ITNKOC)

## License

This project is licensed under the MIT License.
