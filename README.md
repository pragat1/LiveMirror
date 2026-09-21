# Practice Mirror

Build a production-quality AI interview coaching web application called "Live Mirror".

IMPORTANT:

This is a real working application, NOT a static UI mockup.

Do NOT use:

- Demo data

- Fake users

- Fake interview history

- Placeholder names

- Placeholder testimonials

- Fake analytics

- Hardcoded interview questions pretending to come from AI

- Fake AI responses

- "Lorem ipsum"

- Dummy charts

- Mock API responses

- Simulated loading results

- Hardcoded dashboard statistics

Every piece of user-specific content must come from the authenticated user's actual data or from a real AI/API response.

If a section has no data yet, show a proper empty state such as:

"No interview sessions yet. Start your first practice session."

Do not populate it with artificial records.

==================================================

1. PRODUCT VISION

==================================================

Live Mirror is an AI-powered interview coach that helps students, fresh graduates, job seekers, and career switchers practice interviews using their webcam and microphone.

The core experience is:

1. User chooses an interview goal.

2. User selects a job role/interview type.

3. AI generates relevant interview questions.

4. User enters a live interview session.

5. The application uses the webcam and microphone.

6. AI analyzes the user's spoken answers and communication.

7. The application provides useful real-time or near-real-time coaching feedback.

8. After the session, the user receives a detailed performance report.

9. The application stores the session and tracks improvement over time.

The product should feel like a combination of:

- AI interview simulator

- Personal communication coach

- Interview analytics dashboard

- Practice environment

The key differentiator is the "mirror" concept:

The user can see themselves while practicing and understand not only WHAT they said, but HOW they communicated.

==================================================

2. DESIGN DIRECTION

==================================================

Create a premium, modern SaaS interface.

Visual style:

- Clean

- Minimal

- Professional

- Slightly feminine but NOT childish

- Soft pastel pink / blush / lavender accents

- White and very light neutral backgrounds

- Dark navy text

- Subtle gradients

- Rounded cards

- Soft shadows

- Excellent whitespace

- Elegant typography

- Smooth micro-interactions

Avoid:

- Excessive gradients

- Neon colors

- Excessive glassmorphism

- Cartoonish illustrations

- Overly colorful dashboards

- Generic AI robot graphics

- Cluttered layouts

Use a consistent design system throughout the entire application.

Primary accent:

Pink / magenta.

Secondary accents:

Lavender, soft purple, muted blue, soft green.

Use accessible contrast for all important text.

Use responsive design:

- Desktop

- Laptop

- Tablet

- Mobile

The interview room itself should prioritize the webcam experience and minimize distractions.

==================================================

3. BRANDING

==================================================

Application name:

Live Mirror

Tagline:

"Practice. Reflect. Improve."

Alternative supporting message:

"Your AI-powered interview practice space."

Logo:

Create a simple abstract mirror/spark/speech-inspired icon.

The brand should communicate:

- Confidence

- Growth

- Reflection

- Professional development

- Intelligence

==================================================

4. TECHNICAL ARCHITECTURE

==================================================

Use a modern React + TypeScript architecture.

Use:

- React

- TypeScript

- Vite

- Tailwind CSS or the existing Lovable styling system

- Supabase for authentication and database

- Supabase Edge Functions where server-side API calls are required

- Gemini API for AI functionality

- Browser MediaDevices/WebRTC APIs for webcam and microphone

- Browser Speech APIs where appropriate for speech capture/transcription

- Recharts or an equivalent charting library for analytics

Do NOT expose Gemini API keys in frontend code.

All sensitive API keys must be stored in environment variables / Supabase secrets.

AI calls that require secret credentials should be routed through a secure backend/Edge Function.

Structure the application cleanly into reusable components.

==================================================

5. AUTHENTICATION

==================================================

Implement real authentication with Supabase.

Support:

- Email/password signup

- Email/password login

- Logout

- Password reset

- Session persistence

Create a user profile after signup.

Profile fields:

- Full name

- Email

- Target role

- Experience level

- Preferred interview type

- Optional target company

- Optional resume upload

Do not automatically create fake profile information.

If the user has not completed onboarding, show onboarding.

==================================================

6. ONBOARDING

==================================================

After signup, guide the user through a short onboarding process.

Ask:

1. What are you preparing for?

   - Internship

   - Campus placement

   - Full-time job

   - Career switch

   - General interview practice

2. What role are you targeting?

   Examples can be selectable categories, but the list must be real UI options rather than fake generated records.

Include:

- Software Engineer

- Frontend Developer

- Backend Developer

- Full Stack Developer

- Data Analyst

- Data Scientist

- UI/UX Designer

- Product Manager

- Marketing

- Finance

- HR

- Custom role

3. Experience level:

- Student

- Fresher

- 1–2 years

- 3–5 years

- 5+ years

4. Interview type:

- HR / Behavioral

- Technical

- Coding

- System Design

- Managerial

- Mixed

5. Optional target company.

6. Optional resume upload.

Save these preferences to Supabase.

Do not create fake onboarding data.

==================================================

7. LANDING PAGE

==================================================

Create a polished public landing page.

Header:

Left:

Live Mirror logo

Navigation:

- Home

- Features

- How It Works

- Pricing

- FAQ

Right:

- Log In

- Start Practicing

Hero section:

Eyebrow:

"AI-POWERED INTERVIEW COACH"

Main headline:

"Practice smarter.

Interview with confidence."

Highlight "confidence" using the pink accent.

Supporting text:

"Live Mirror helps you practice realistic interviews, improve your answers, and understand how you communicate — not just what you say."

Primary CTA:

"Start Practicing Free"

Secondary CTA:

"See How It Works"

Hero visual:

Show a realistic interview interface containing:

- Webcam panel

- AI interviewer

- Question card

- Live feedback indicators

- Confidence metric

- Speech clarity

- Eye-contact indicator

- Session timer

IMPORTANT:

This hero visual is a UI illustration/mockup only.

Do not imply that the displayed metrics belong to a real user.

Features section:

"Everything you need to become interview-ready"

Cards:

1. AI Interviewer

2. Real-Time Coaching

3. Answer Analysis

4. Communication Analysis

5. Interview Reports

6. Progress Tracking

How It Works:

1. Choose your interview

2. Practice with AI

3. Review your performance

4. Improve with every session

Use Cases:

- Students

- Fresh Graduates

- Job Seekers

- Career Switchers

- Professionals

Final CTA:

"Your next interview should not be your first practice."

Button:

"Start Practicing Free"

==================================================

8. DASHBOARD

==================================================

After login, redirect to /dashboard.

Dashboard layout:

Sidebar:

- Dashboard

- Practice

- Interview History

- Progress

- Profile

- Settings

Top bar:

- Greeting using the actual authenticated user's name

- Notifications

- Profile menu

Main dashboard:

Welcome section:

"Ready for your next interview?"

Primary button:

"Start New Interview"

Statistics should ONLY appear if actual user data exists.

Possible metrics:

- Interviews completed

- Practice time

- Average score

- Current streak

If there is no history:

Display:

"No interviews yet."

"Complete your first practice session to see your performance here."

CTA:

"Start Your First Interview"

Do not display invented numbers such as:

"12 interviews"

"85% confidence"

"7 day streak"

unless those values are actually stored in the database.

==================================================

9. START INTERVIEW FLOW

==================================================

Create a dedicated interview setup screen.

Step 1:

Choose interview type.

Options:

- Behavioral

- Technical

- HR

- Coding

- System Design

- Mixed

Step 2:

Choose role.

Step 3:

Choose difficulty:

- Beginner

- Intermediate

- Advanced

Step 4:

Choose session length:

- 5 minutes

- 10 minutes

- 20 minutes

- Custom

Step 5:

Optional:

Upload/select resume.

Step 6:

Interview focus:

Checkboxes:

- Answer quality

- Communication

- Confidence

- Conciseness

- Technical depth

- Body language

Then show a concise session summary.

Button:

"Enter Interview Room"

==================================================

10. AI QUESTION GENERATION

==================================================

Do not hardcode the interview questions.

Generate questions using Gemini based on:

- Target role

- Experience level

- Interview type

- Difficulty

- Resume content if provided

- Previous performance if relevant

Questions should be contextually appropriate.

For example, a frontend developer should receive relevant questions involving:

- HTML

- CSS

- JavaScript

- React

- Web performance

- Accessibility

- APIs

- Frontend architecture

But the questions must be generated dynamically according to the user's selected role.

For behavioral interviews, generate questions involving:

- Leadership

- Conflict

- Failure

- Teamwork

- Problem solving

- Adaptability

- Communication

The AI interviewer should ask one question at a time.

==================================================

11. LIVE INTERVIEW ROOM

==================================================

This is the most important page.

Create a distraction-free interview environment.

Layout:

LEFT / MAIN:

Large webcam preview.

RIGHT:

AI interviewer panel.

Top:

- Interview type

- Role

- Session timer

- Connection status

Webcam:

Request camera permission.

Microphone:

Request microphone permission.

Controls:

- Camera on/off

- Microphone mute/unmute

- End interview

- Optional fullscreen

AI interviewer panel:

Show:

"AI Interviewer"

Current question.

Example:

"Tell me about a project you are particularly proud of and the challenges you faced."

But this must come from Gemini during an actual session.

Under the question:

- Listening indicator

- Recording indicator

- Response timer

The user answers verbally.

Capture:

- Audio

- Transcript

- Timing

==================================================

12. LIVE MIRROR FEEDBACK

==================================================

The signature feature of Live Mirror.

During the interview, analyze communication signals where technically feasible and privacy-safe.

Possible signals:

- Speaking pace

- Pauses

- Filler words

- Answer length

- Speech clarity

- Eye contact estimation

- Posture

- Facial engagement

- Excessive movement

Do NOT make medical or psychological claims.

Never label a user:

- anxious

- depressed

- mentally unstable

- insecure

- psychologically unfit

Instead use observable communication language.

For example:

"Your speaking pace increased during this answer."

"Consider pausing briefly before your next point."

"You maintained consistent eye contact."

"Your answer contained several filler words."

"Your answer could be more concise."

Feedback should be actionable rather than judgmental.

==================================================

13. REAL-TIME FEEDBACK UI

==================================================

Do not overwhelm the user with feedback while answering.

Use small unobtrusive indicators.

Examples:

"Speaking quickly"

"Good eye contact"

"Try pausing"

"Strong structure"

"Answer is getting long"

Use subtle animations.

The feedback panel can collapse/minimize.

The user should still feel like they are in an interview.

==================================================

14. ANSWER ANALYSIS

==================================================

After each answer, Gemini should analyze:

1. Relevance

2. Structure

3. Specificity

4. Conciseness

5. Technical correctness where applicable

6. Communication quality

7. Use of examples

8. Strengths

9. Improvement opportunities

For behavioral answers, optionally analyze using the STAR framework:

Situation

Task

Action

Result

Tell the user if important STAR elements are missing.

Example:

"Your answer clearly explained the situation and action, but the result was not quantified."

Do not fabricate achievements or metrics.

==================================================

15. POST-INTERVIEW REPORT

==================================================

After the interview ends, generate a detailed report.

Page title:

"Your Interview Report"

Show:

Overall performance summary.

Performance categories:

- Answer Quality

- Communication

- Structure

- Conciseness

- Confidence/Delivery

- Technical Knowledge where applicable

Use scores ONLY if they are calculated from actual AI analysis.

Do not pretend the score is scientifically validated.

Label them clearly as:

"AI-estimated practice score"

Include:

### What You Did Well

Real observations generated from the session.

### What To Improve

Specific actionable recommendations.

### Strongest Answer

Show the user's actual answer.

### Answer Improvement

Generate an improved example based ONLY on the user's original content.

Do not invent experience.

### Filler Words

Show actual detected filler words and counts.

Examples:

- um

- uh

- like

- basically

Only display words that were actually detected.

### Speaking Pace

Display actual calculated speaking rate where available.

### Question-by-question review

For every question:

Question

User answer

AI analysis

Strengths

Improvement

Suggested answer structure

==================================================

16. INTERVIEW TRANSCRIPT

==================================================

Provide a transcript tab.

Display:

AI:

question

User:

actual transcript

Allow the user to:

- Copy transcript

- Download transcript

- Review individual answers

Do not modify the original transcript.

==================================================

17. PROGRESS DASHBOARD

==================================================

Create a progress page based exclusively on actual completed interviews.

Charts:

- Performance over time

- Answer quality

- Communication

- Speaking pace

- Filler words

- Interview completion

If there are fewer than enough sessions to show meaningful trends:

Show:

"Complete more interviews to unlock your progress trends."

Do not create fake chart points.

==================================================

18. INTERVIEW HISTORY

==================================================

Show actual sessions from Supabase.

Each session card should contain:

- Date

- Role

- Interview type

- Duration

- AI-estimated score

- Status

Clicking a session opens its full report.

Include:

- Search

- Filter by interview type

- Sort by newest/oldest

Empty state:

"No completed interviews yet."

==================================================

19. RESUME ANALYSIS

==================================================

Allow users to upload a resume.

Supported format:

- PDF

Extract relevant information securely.

Use Gemini to understand:

- Skills

- Projects

- Experience

- Education

- Achievements

Use the resume to personalize interview questions.

Do not permanently store resume content unless the user explicitly chooses to save it.

Provide an option to delete uploaded resume data.

Do not invent missing information.

==================================================

20. AI INTERVIEW PERSONALIZATION

==================================================

The AI should remember the context of the current interview.

For example:

If the user says:

"I built a React dashboard..."

The next question can appropriately ask:

"What was the most difficult part of implementing that dashboard?"

Do not generate unrelated random questions.

The interviewer should behave like a coherent interviewer.

Maintain interview state:

- Current question

- Previous questions

- User answers

- Interview type

- Role

- Difficulty

- Session duration

==================================================

21. DATABASE

==================================================

Create appropriate Supabase tables.

Suggested structure:

profiles

- id

- full_name

- email

- target_role

- experience_level

- preferred_interview_type

- target_company

- created_at

- updated_at

interview_sessions

- id

- user_id

- role

- interview_type

- difficulty

- duration

- started_at

- ended_at

- overall_score

- status

interview_questions

- id

- session_id

- question_text

- question_order

- category

interview_answers

- id

- session_id

- question_id

- transcript

- duration

- speaking_rate

- filler_word_count

- answer_score

- analysis

- created_at

progress_metrics

- id

- user_id

- session_id

- metric_name

- metric_value

- created_at

resumes

- id

- user_id

- file_path

- extracted_text

- created_at

Use proper foreign keys.

Enable Row Level Security.

A user must NEVER be able to access another user's interviews, transcripts, resumes, or analytics.

==================================================

22. PRIVACY AND SECURITY

==================================================

This application handles sensitive personal information.

Implement:

- Supabase authentication

- Row Level Security

- Secure API calls

- No API keys in frontend

- HTTPS-compatible browser APIs

- Clear microphone/camera permission states

- Ability to delete interview history

- Ability to delete account

- Ability to delete uploaded resume

- No sharing of recordings without explicit user action

Do not record webcam video permanently by default.

If video recording is implemented, clearly inform the user and obtain appropriate consent.

Prefer analyzing live media/transcripts without permanently storing raw video.

==================================================

23. ERROR STATES

==================================================

Implement real error handling.

Examples:

Camera permission denied:

"Camera access is required for Live Mirror's visual coaching. You can continue without visual analysis."

Microphone denied:

"Microphone access is required for spoken interview practice."

Gemini API unavailable:

"We couldn't connect to the AI interviewer. Please try again."

Network failure:

"Your connection was interrupted."

Transcript unavailable:

"We couldn't capture your response. Please try again."

No resume:

"Continue without a resume."

Never silently fail.

==================================================

24. LOADING STATES

==================================================

Use elegant skeletons and loading indicators.

Examples:

"Preparing your interview..."

"Generating your questions..."

"Analyzing your response..."

"Building your interview report..."

Do not display fake results while loading.

==================================================

25. ACCESSIBILITY

==================================================

Implement:

- Keyboard navigation

- Proper button labels

- Accessible form labels

- Visible focus states

- Good color contrast

- Screen-reader-friendly controls

- Responsive typography

- Reduced-motion consideration

==================================================

26. RESPONSIVE DESIGN

==================================================

Desktop:

Full dashboard with sidebar.

Tablet:

Collapsible sidebar.

Mobile:

Bottom navigation or compact navigation.

Interview room mobile layout:

Prioritize:

1. Camera

2. Current question

3. Microphone

4. End interview

Feedback can become a collapsible bottom sheet.

==================================================

27. SETTINGS

==================================================

Settings page:

Account:

- Name

- Email

Interview preferences:

- Default role

- Default interview type

- Difficulty

Privacy:

- Delete interview history

- Delete resume

- Delete account

Appearance:

- Light mode

- Dark mode

- System preference

Audio/video:

- Camera selection

- Microphone selection

- Speaker selection

==================================================

28. PRICING PAGE

==================================================

Do NOT implement fake payment transactions.

Create a clean pricing structure that can later connect to Stripe.

Possible plans:

Free:

- Limited practice sessions

- Basic AI feedback

- Basic reports

Pro:

- More sessions

- Detailed analytics

- Resume-based interviews

- Advanced feedback

- Progress tracking

If payment infrastructure is not configured, clearly show:

"Coming soon"

Do not pretend that payment has been processed.

==================================================

29. FAQ

==================================================

Create useful FAQ content explaining:

- What is Live Mirror?

- How does AI interview practice work?

- Does Live Mirror record video?

- Is my data private?

- Can I practice technical interviews?

- Can I upload my resume?

- Can I practice for different roles?

- How accurate is the AI feedback?

- Can I delete my interview data?

Do not make unsupported claims such as:

"98% accurate."

==================================================

30. IMPORTANT AI BEHAVIOR

==================================================

Gemini should act as an experienced but constructive interviewer.

It should:

- Ask realistic questions

- Adapt to the user's role

- Ask follow-up questions

- Avoid repetitive questions

- Evaluate answers fairly

- Give actionable feedback

- Never fabricate user achievements

- Never make medical/psychological diagnoses

- Avoid insulting or discouraging language

- Distinguish factual technical errors from subjective communication advice

For technical interviews:

Evaluate technical correctness.

For behavioral interviews:

Evaluate structure, relevance, specificity, and evidence.

For HR interviews:

Evaluate clarity, professionalism, and relevance.

==================================================

31. CORE USER JOURNEY

==================================================

The complete working flow must be:

Landing Page

↓

Sign Up / Login

↓

Onboarding

↓

Dashboard

↓

Start New Interview

↓

Interview Configuration

↓

Camera + Microphone Permission

↓

Interview Room

↓

AI Question

↓

User Answers

↓

AI Analysis

↓

Next Question

↓

Interview Ends

↓

AI Report Generation

↓

Performance Report

↓

Save Session

↓

Progress Dashboard

↓

Interview History

Make every step functional.

==================================================

32. EMPTY STATES

==================================================

Because this is a real application, every initially empty section needs a useful empty state.

Dashboard:

"No interview sessions yet."

History:

"Your completed interviews will appear here."

Progress:

"Complete a few sessions to start seeing your improvement."

Resume:

"No resume uploaded."

Notifications:

"You're all caught up."

Do NOT fill empty states with fake records.

==================================================

33. DEMO / PRESENTATION MODE

==================================================

Do NOT create fake user data just to make the dashboard look populated.

Instead, create a clearly separated optional "Product Tour" on the public landing page that visually demonstrates the interface.

The actual authenticated dashboard must always represent the real user's data.

==================================================

34. UI DETAILS

==================================================

Use:

- 16–24px card radius

- Soft shadows

- Clear visual hierarchy

- Consistent iconography

- Smooth hover states

- Button press states

- Subtle page transitions

- Progress indicators

- Toast notifications

- Confirmation dialogs for destructive actions

Avoid excessive animations.

The interview room should have minimal animation so the user can concentrate.

==================================================

35. ROUTES

==================================================

Create:

/

 /login

 /signup

 /onboarding

 /dashboard

 /practice

 /practice/setup

 /practice/session/:id

 /practice/report/:id

 /history

 /history/:id

 /progress

 /profile

 /settings

 /pricing

 /faq

Protect authenticated routes.

Redirect unauthenticated users to login.

==================================================

36. CODE QUALITY

==================================================

Use:

- Reusable components

- Strong TypeScript typing

- Clear folder structure

- Environment variables

- Service abstraction for Gemini

- Proper error handling

- Loading states

- Database types

- Secure Supabase queries

Avoid putting the entire application into one component.

Create reusable components such as:

Navbar

Sidebar

InterviewCard

QuestionPanel

WebcamPanel

FeedbackPanel

ScoreCard

ProgressChart

InterviewHistoryCard

EmptyState

LoadingState

ErrorState

Modal

Toast

==================================================

37. FINAL QUALITY REQUIREMENT

==================================================

Before considering the project complete, verify:

1. User can create an account.

2. User can log in.

3. User can complete onboarding.

4. User can start an interview.

5. Camera permission works.

6. Microphone permission works.

7. Gemini generates interview questions.

8. User can answer questions.

9. Answers are transcribed.

10. AI analyzes the answers.

11. Interview report is generated.

12. Session is saved to Supabase.

13. History displays actual sessions.

14. Progress displays actual metrics.

15. User can delete their data.

16. API keys are not exposed.

17. RLS prevents cross-user access.

18. No fake/demo data exists.

19. Empty states work correctly.

20. Application works responsively.

Do not mark features as complete merely because the UI exists.

If an external API or capability cannot be implemented without credentials/configuration, create the correct integration architecture and clearly surface the required environment variable/configuration instead of replacing it with fake data.

==================================================

38. PRODUCT POSITIONING

==================================================

The final product should feel like:

"An AI mirror for your interview performance."

Not simply:

"Another chatbot that asks interview questions."

The experience should make the user think:

"I can practice here before facing a real interviewer."

The most important product loop is:

PRACTICE → REFLECT → IMPROVE → PRACTICE AGAIN

Prioritize this loop above secondary features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dd7047bf-4c4e-47bd-b592-8d42dff79d6c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
