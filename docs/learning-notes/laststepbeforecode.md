🤖 AI Agent Development Rules

We will not ask AI to build everything at once.

Instead:

Small Task
   ↓
AI Agent Changes Code
   ↓
Review Changes
   ↓
Run Application
   ↓
Test
   ↓
Git Commit
   ↓
Next Task

Every AI agent should first follow:

Read PROJECT_RULES.md. Follow the existing project architecture. Do not change unrelated files or folder structure.

🔍 After Every AI Agent Change

You should check:

git status
git diff

Then:

Run Project
↓
Check TypeScript Errors
↓
Test API in Postman
↓
Commit Changes
🎯 Our Workflow Together
ME
↓
Give you the next exact step

YOU
↓
Give instructions to AI Agent

AI AGENT
↓
Makes code changes

YOU
↓
Test and review

ME
↓
Help verify and move to next step