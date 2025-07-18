<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# CivicPulse Project Instructions

This is a React TypeScript project for CivicPulse, a mobile-first civic engagement platform.

## Project Overview
- Frontend: React 18 with TypeScript
- Styling: TailwindCSS with custom components
- Build Tool: Vite
- Icons: Lucide React
- Architecture: Component-based with Context API for state management

## Key Features
- Instagram-inspired civic feed
- Issue reporting and tracking
- Representative announcements
- Community engagement (upvotes, comments, saves)
- Analytics and insights dashboard
- Mobile-first responsive design

## Code Style Guidelines
- Use functional components with hooks
- Implement proper TypeScript typing
- Follow TailwindCSS utility-first approach
- Use semantic HTML elements
- Maintain consistent naming conventions
- Implement proper error handling

## Component Structure
- Pages: Main route components in src/pages/
- Components: Reusable UI components in src/components/
- Contexts: State management in src/contexts/
- Types: TypeScript definitions in src/types/

## State Management
- UserContext for authentication and user data
- PostContext for civic posts and interactions
- Local state for component-specific data

## Styling
- Mobile-first responsive design
- Custom CSS classes in index.css
- TailwindCSS utility classes
- Consistent color palette (primary blue, success green, warning yellow, danger red)
