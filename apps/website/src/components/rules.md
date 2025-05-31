## Goals

Design Sigma's landing page. Don't try to be overachiever.

## Constraints

1. Use the content and components from @tegonhq/ui
2. Do not make any changes in the files other than website folder
3. Plan you work and create tasks below in this file.
4. Tasks to be done in sequential order

## Tasks to do:

- [x] Edit hero section basic content
- [x] Task 1: Reorder hero section layout to match image sequence
- [x] Task 2: Create main content box with proper grid structure
- [x] Task 3: Implement 3-column layout for features (Daily Brief, Memory, Rules)
- [x] Task 4: Add hero image in second row of the main box
- [x] Task 5: Style the main box with proper spacing and borders
- [x] Task 6: Ensure responsive design and proper text sizing

- [x] Task 7: Reduce excessive vertical spacing between features and image
- [x] Task 8: Optimize card padding for better content density
- [x] Task 9: Add visual separator between features and image sections
- [x] Task 10: Improve feature section layout with better visual hierarchy
- [x] Task 11: Optimize image sizing and positioning for better balance
- [x] Task 12: Fine-tune responsive spacing and proportions
- [x] Task 13: Add visual separator between 3 features - Daily Brief, memory, rules
- [x] Task 14: Put icons beside Daily Brief, Memory, Rules on left vs on top
- [x] Task 15: Optimize size of row 1, currently it looks too big. (attached image in chat)

## Content for reference

Title:
Sigma — Your AI Assistant That Starts Before You Do
Sub-heading:
Connects to Slack, GitHub, Linear & Gmail — summarises PRs, drafts emails, creates issues, and clears the busywork so you stay in flow.

There are 3 sections in the image - Fast, Intelligent, Collaborative.
Replace them with Daily Brief, Memory and Rules.

Daily Brief: 2-minute summary on today's priorities, who needs you, and what's slipping through.
Memory: Stores your tone, style, role & contacts—adapts as it learns from you.
Rules: Tell sigma in natural language what to automate—like alerts, tasks, or any manual work.

## Image Analysis:

The layout should follow this order from top to bottom:

1. Title: "Sigma — Your AI Assistant That Starts Before You Do"
2. Subheading: About connecting to Slack, GitHub, Linear & Gmail
3. Download button and GitHub star button
4. Availability text: "Available for macOS, Linux, and soon for Windows"
5. Main content box with:
   - Row 1: Three feature columns (Daily Brief, Memory, Rules)
   - Row 2: Hero image spanning full width

## Open Source Section ✅ COMPLETED:

### Image Analysis:

The open source section should include:

1. Title: "Open source"
2. Subtitle: "Sigma is built by a global community of thousands of developers."
3. Call-to-action button: "Start contributing"
4. Statistics grid with 4 metrics:
   - Forks: 4,347
   - Contributors: 491
   - Stars: 60,411
   - PRs merged last month: 895
5. Visual grid of contributor avatars (decorative)

### Tasks for Open Source Section:

- [x] Task 16: Create new open-source.tsx component file
- [x] Task 17: Design the basic layout structure with title and subtitle
- [x] Task 18: Add "Start contributing" button with proper styling
- [x] Task 19: Create statistics grid with 4 metrics (Forks, Contributors, Stars, PRs)
- [x] Task 20: Add contributor avatars grid for visual appeal
- [x] Task 21: Integrate open source section into main page layout
- [x] Task 22: Ensure responsive design and proper spacing
- [x] Task 23: Fine-tune styling to match the reference image

## Letter from the Team Section ✅ COMPLETED:

### Image Analysis:

The letter section should include:

1. Header text: "A LETTER" (small, uppercase)
2. Title: "From the team" (large, blue text)
3. Main content: Two paragraphs about programming tools and software development
4. Signature section with:
   - Team member avatars (3 circular images)
   - Company name: "Sigma Team"
   - Team member names: "Harshith Mohan, Manoj Vivek, Rohan Relan"
5. Decorative circular icon/logo on the right side
6. Card-based layout with proper spacing and typography

### Content for Letter:

Paragraph 1: "Programming and the tools we use to do so are changing. As the culmination of 15 years of work developing industry-leading tools for developers like Atom, Electron, and Tree-sitter, Sigma strives to be at the forefront of this transformation."

Paragraph 2: "We're confident that the future of software development lies in fluent collaboration between humans and AI. Crafted from the ground up, Sigma is here to make this vision a reality."

### Tasks for Letter Section:

- [x] Task 24: Create new letter.tsx component file
- [x] Task 25: Design the basic card layout structure
- [x] Task 26: Add header text "A LETTER" and title "From the team"
- [x] Task 27: Add main content paragraphs with proper typography
- [x] Task 28: Create signature section with team avatars and names
- [x] Task 29: Add decorative circular icon on the right side
- [x] Task 30: Integrate letter section into main page layout
- [x] Task 31: Ensure responsive design and proper spacing
- [x] Task 32: Fine-tune styling to match the reference image

## Integrations Section ✅ COMPLETED:

### Image Analysis:

The integrations section should include:

1. Title: "Growing integrations ecosystem" (large, blue text)
2. Subtitle: "Boost your Sigma experience by connecting to your favorite tools that enhance productivity, streamline workflows, and keep everything in sync."
3. Call-to-action button: "Request integration"
4. Grid layout of integration cards showing:
   - Integration names: GitHub, Slack, Gmail, Linear, Jira
   - Usage statistics (connections/users)
   - Brief descriptions of what each integration does
   - Integration status/availability
5. Footer text: "And many more integrations coming soon. View all integrations →"

### Content for Integrations:

- GitHub: "Connect your repositories for seamless code management and PR tracking"
- Slack: "Stay updated with team communications and automate responses"
- Gmail: "Manage emails efficiently with AI-powered drafting and organization"
- Linear: "Sync issues and track project progress automatically"
- Jira: "Streamline ticket management and project workflows"

### Tasks for Integrations Section:

- [x] Task 33: Create new integrations.tsx component file
- [x] Task 34: Design the basic layout structure with title and subtitle
- [x] Task 35: Add "Request integration" button with proper styling
- [x] Task 36: Create integration card component with proper styling
- [x] Task 37: Add integration cards for GitHub, Slack, Gmail, Linear, Jira
- [x] Task 38: Add footer text with "View all integrations" link
- [x] Task 39: Integrate integrations section into main page layout
- [x] Task 40: Ensure responsive grid layout and proper spacing
- [x] Task 41: Fine-tune styling to match the reference image
- [x] Task 42: Use the logo of actual github, slack, gmail, linear, jira, notion in the integrations section

## Open Source Box Structure Redesign ✅ COMPLETED:

### Image Analysis for Box Structure:

The new open source section should have a box/card structure with:

1. Main container: Large card with rounded corners and border
2. Statistics positioning:
   - Forks (top-left corner)
   - Stars (top-right corner)
   - Contributors (bottom-left corner)
   - PRs merged last month (bottom-right corner)
3. Central content area:
   - Title: "Open source" (centered)
   - Subtitle: "Zed is built by a global community of thousands of developers." (centered)
   - Button: "Start contributing" (centered)
4. Background elements: Contributor avatars scattered throughout the card
5. Layout: Single large card container instead of separate sections

### Tasks for Open Source Box Structure:

- [x] Task 43: Create new box-style container structure for open source section
- [x] Task 44: Position statistics in four corners of the box (top-left, top-right, bottom-left, bottom-right)
- [x] Task 45: Center the main content (title, subtitle, button) in the middle of the box
- [x] Task 46: Add contributor avatars as background decorative elements scattered throughout
- [x] Task 47: Style the main card container with proper borders, shadows, and rounded corners
- [x] Task 48: Ensure responsive design works well with the new box structure
- [x] Task 49: Fine-tune spacing and positioning to match the reference image exactly

## Use Cases Feature Showcase 🔄 IN PROGRESS:

### Image Analysis for Use Cases Section:

The use cases section should showcase Sigma's features with:

1. Header section:

   - Small header text: "FOREVER SHIPPING" or similar
   - Main title: "Sigma ensures you focus on things that matters" (blue text)
   - Subtitle describing the value proposition
   - Optional "View all features →" link

2. Hero feature display:

   - Large screenshot/demo of main feature at the top
   - Professional presentation with proper styling

3. Feature grid layout:

   - 2x2 or 2x3 grid of feature cards
   - Each card contains:
     - Feature screenshot/mockup image
     - Icon representing the feature
     - Feature title
     - Description text

4. Feature content:

   - Daily Brief: 2-minute summary feature
   - All Tasks, One Place: Task aggregation from multiple sources
   - Automate the Busywork: Automation capabilities
   - Lists: Swiss-army doc functionality

5. Visual design:
   - Clean, modern card-based layout
   - Consistent spacing and typography
   - Professional screenshots/mockups
   - Responsive grid system

### Content for Use Cases:

**Main Title:** "Sigma ensures you focus on things that matters"

**Features:**

- **Daily Brief:** 2-minute summary on today's priorities, who needs you, and what's slipping through.
- **All Tasks, One Place:** Sigma pulls tasks from Slack, GitHub, Gmail, Linear, and more—based on simple rules you set.
- **Automate the Busywork:** From urgent emails to PR summaries, Sigma turns your rules into actions—no clicks needed.
- **Lists:** Your Swiss-army doc for everything—code snippets, side-projects, grocery runs.

### Tasks for Use Cases Feature Showcase:

- [x] Task 50: Create new use-cases.tsx component file in features folder
- [x] Task 51: Design the header section with title and subtitle
- [x] Task 52: Create hero feature display area for main showcase
- [x] Task 53: Implement responsive grid layout for feature cards
- [x] Task 54: Create FeatureCard component with image, icon, title, and description
- [x] Task 55: Add Daily Brief feature card with appropriate styling
- [x] Task 56: Add All Tasks, One Place feature card
- [x] Task 57: Add Automate the Busywork feature card
- [x] Task 58: Add Lists feature card
- [x] Task 59: Create placeholder images/mockups for each feature
- [x] Task 60: Integrate use cases section into main page layout
- [x] Task 61: Ensure responsive design works across all screen sizes
- [x] Task 62: Fine-tune styling and spacing to match reference image
- [x] Task 63: Add proper icons for each feature using available icon libraries
- [x] Task 64: Optimize typography and visual hierarchy
