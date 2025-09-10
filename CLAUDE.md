# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Check Mate AI is a React + TypeScript web application built with Vite that processes CSV bank statements and analyzes check images using GPT-4o. The app extracts check numbers and payee names from images and automatically assigns transaction reasons based on predefined rules.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server at http://localhost:5173

# Build & Production
npm run build        # TypeScript check + Vite build to dist/
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Material-UI (MUI)
- **CSV Processing**: PapaParse
- **Image Upload**: react-dropzone
- **AI Integration**: OpenAI GPT-4o API

### Application Flow
1. **CSV Upload** (`CSVUpload.tsx`): Users upload bank statement CSV files
2. **Check Image Analysis** (`CheckImageUpload.tsx`): Upload check images for GPT-4o analysis
3. **Final Processing** (`FinalProcessing.tsx`): Review, confirm, and download modified CSV with check names and reasons

### Key Services
- **gptService.ts**: Handles OpenAI API calls for check image analysis using GPT-4o vision capabilities
- **csvService.ts**: CSV parsing, processing, and reason assignment logic
- **storageService.ts**: LocalStorage persistence for file history and matching rules

### Data Structure
- **BankStatementRow**: Core data model with date, description, debit, checkNumber, checkName, and reason fields
- **ReasonMapping**: Search term to reason mappings stored in `src/data/reasonMappings.ts`
- **ImageAnalysisResult**: GPT-4o analysis results containing checkNumber and checkName

## Environment Setup

Required environment variable:
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

Copy `.env.example` to `.env` and add your OpenAI API key for GPT-4o functionality.

## Development Notes

### State Management
- Application state managed through React hooks in `App.tsx`
- Three main views: process, files (history), and rules (matching configuration)
- Step-based workflow (1: CSV upload, 2: Image upload, 3: Final processing)

### LocalStorage Keys
- `checkmate_files`: Processed file history
- `checkmate_rules`: Custom matching rules

### Error Handling
- All async operations wrapped in try-catch blocks
- User-friendly error messages displayed via Material-UI alerts
- Fallback to simulation mode if OpenAI API key is missing