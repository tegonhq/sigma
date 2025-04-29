export const beautifyPrompt = `You are an AI assistant specialized in parsing natural language descriptions of tasks and generating concise titles and appropriate list assignments. Your task is to analyze the given text and provide a structured output.

Here is the text describing the task:

<event_description>
{{text}}
</event_description>

<available_lists>
{{lists}}
</available_lists>

Please follow these steps to complete the task:

1. Analyze the input text to understand the core purpose of the task.

2. Transform the text of the task into a concise, clear task title.

3. Determine if the task should be assigned to a specific list based on the available lists and the task description.

Before providing the final output, wrap your analysis in <task_parsing> tags. Include:

a. Your process for transforming the text into a concise task title:
   - List key elements from the description.
   - Identify the main action or purpose.
   - Combine these elements into a short, descriptive title.
b. Your analysis of which list the task should be assigned to, if any, based on the available lists and the task description.

After your analysis, provide the final JSON output with the following structure:
<output>
{
  "title": "Concise title of the task",
  "listId": "ID of the selected list or empty string if none"
}
</output>
If the input text does not contain any actionable task information, return an empty JSON object {}.`;

export const recurrencePrompt = `You are an AI assistant specialized in parsing natural language descriptions of events and generating standardized recurrence rules (RRULEs) and time information. Your task is to analyze the given text and extract recurrence patterns and timing details.

Here is the text describing the event:

<event_description>
{{text}}
</event_description>

The current time and timezone for reference is:

<current_time>
{{currentTime}}
</current_time>

Please follow these steps to complete the task:

1. Analyze the input text to identify information about event frequency, recurrence patterns, start time, end time, and due date.

2. If frequency information is found, create RRULE strings based on it. The RRULE should follow the iCalendar specification (RFC 5545). Include the frequency part (e.g., FREQ=DAILY, FREQ=WEEKLY;BYDAY=MO,WE,FR, etc.) and any time-specific information (BYHOUR, BYMINUTE) if a specific time is associated with the recurrence pattern. If multiple recurrence patterns are detected, create separate RRULE strings for each.

3. Extract start and end times if mentioned in the text. Convert them to the same timezone as the provided current time. Use the format "YYYY-MM-DDTHH:MM:SS±HH:MM" (ISO 8601).

4. If an end time is not explicitly stated for a scheduled task, add 15 minutes to the start time to create an end time.

5. Extract and format any mentioned due date using the same ISO 8601 format. A due date represents when a task needs to be completed by, as opposed to when it occurs (which would be the start/end time).

6. Generate a concise, human-readable description of the recurrence pattern and/or schedule. This should be brief (maximum 10-15 words) and easily scannable.

Before providing the final output, wrap your analysis in <recurrence_parsing> tags. Include:

a. A list of recurrence and time components found in the text (frequency, days, intervals, start time, end time, due date).
b. Relevant quotes from the input text for each identified component.
c. Your interpretation of the recurrence and time information, considering different possibilities.
d. A step-by-step plan for constructing each RRULE string (if applicable), including how you're incorporating time-specific information.
e. Your approach for generating a clear human-readable description of the recurrence pattern and/or schedule.
f. Identification of any ambiguities or missing information and how you'll handle them.
g. If a specific time is mentioned without a recurrence pattern, explain how you're interpreting it (as a one-time event).
h. If multiple recurrence patterns are detected, explain how you're separating them into distinct rules.
i. Explain your reasoning for identifying a date as a due date versus a start time, if applicable.

After your analysis, provide the final JSON output with the following structure:
<output>
{
  "recurrenceRule": ["RRULE string 1", "RRULE string 2", ...] or [] if not applicable,
  "scheduleText": "Brief description (10-15 words max)",
  "startTime": "Formatted start time or empty string if not found",
  "endTime": "Formatted end time or empty string if not found",
  "dueDate": "Formatted due date or empty string if not applicable"
}
</output>
If the input text does not contain any recurrence or scheduling information, return an empty JSON object {}.`;

export const enhanceExample = `<examples>\n<example>\n<TASK_LIST>\n<ol><li><p>Schedule task UI</p></li><li><p>Change the list view use react virtualised list</p></li><li><p>Also group by options</p><ol><li><p>Status</p></li><li><p>Integration</p></li><li><p>Lists</p></li></ol></li><li><p>Add list functionality</p></li><li><p>Lists should also automatically show up on the left side</p></li><li><p>Show meetings as a separate section in my day</p></li><li><p>Cmd + k</p><ol><li><p>For changing status</p></li><li><p>Changing list</p></li><li><p>changing schedule</p></li></ol></li></ol><p></p><p></p><p></p><p>Personal</p><ol><li><p>Go to gym atlernatively at 5 PM and 6 PM starting from Monday</p></li><li><p>Send documents to insurance by evening</p></li></ol><p></p>\n</TASK_LIST>\n<ideal_output>\n<content_analysis>\nThe content contains both technical/UI development tasks and personal tasks. Key themes:\n- UI development tasks around scheduling, list views, and command palette\n- Feature implementation tasks for lists and meetings\n- Personal tasks with specific timing requirements\n- Grouped functionality requirements that can be combined\n</content_analysis>\n\n<output>\n[\n  {\n    "title": "Implement schedule task UI interface",\n    "description": "Create user interface for task scheduling functionality"\n  },\n  {\n    "title": "Implement virtualized list view",\n    "description": "Convert existing list view to use react-virtualized list for better performance"\n  },\n  {\n    "title": "Add group by filtering options",\n    "description": "Implement grouping functionality for:\\n- Status\\n- Integration\\n- Lists"\n  },\n  {\n    "title": "Implement list management functionality",\n    "description": "Add list creation/management features with automatic display in left sidebar"\n  },\n  {\n    "title": "Create separate meetings section in My Day view",\n    "description": "Add dedicated section to display meetings separately from other tasks in My Day"\n  },\n  {\n    "title": "Implement Command + K menu functionality",\n    "description": "Add command palette features for:\\n- Changing task status\\n- Changing task list\\n- Changing task schedule"\n  },\n  {\n    "title": "Gym",\n    "description": "Gym routine alternating between 5 PM and 6 PM starting Monday"\n  },\n  {\n    "title": "Submit insurance documents",\n    "description": "Send required documentation to insurance company by evening"\n  }\n]\n</output>\n</ideal_output>\n</example>\n</examples>\n\n`;

export const enchancePrompt = `You are an AI assistant specializing in identifying actionable tasks from content. Your goal is to analyze the given text and extract meaningful, actionable items that can be converted into tasks, including both work-related and personal tasks.

Here is the content to analyze:

<content>
{{TASK_LIST}}
</content>

Please follow these steps:

1. Analyze the content:
   In <content_analysis> tags:
   - Read through the content carefully
   - Identify explicit and implicit action items
   - Look for:
     * Direct requests or assignments
     * Implied tasks or next steps
     * Deadlines or time-sensitive items
     * Dependencies between actions
   - Group related actions that could form a single task
   - Consider which items should be separate tasks vs subtasks in a description

2. Transform identified actions into structured tasks:
   - Create clear, actionable task titles
   - Group related actions into a single task where appropriate
   - Format descriptions in HTML using:
     * <ul> or <ol> for lists of subtasks
     * <p> for paragraphs of context
     * <strong> for emphasis on important points
   - Maintain any specified deadlines or priorities
   - Preserve relationships between related items
   - Include time context in description when provided


3. Return ONLY the following output format, with no additional text or analysis:
<output>
[
  {
    "title": "Clear, actionable task title",
    "description": "<p>Main context</p><ul><li>Subtask 1</li><li>Subtask 2</li></ul>"
  }
]
</output>


Important:
- Only include the JSON array within <output> tags
- Do not include any analysis, explanations, or other text
- Extract both work and personal actionable items
- Create tasks for appointments and scheduled events
- Include time-sensitive information in descriptions
- Keep task titles concise and action-oriented
- Use HTML formatting in descriptions
- Don't create tasks for general information or context
- Don't skip personal tasks or appointments`;

export const summaryExamples = `<examples>\n<example>\n<TASK_DATA>\n {\n  type: 'issue',\n  action: 'create',\n  content: {\n    title: 'Enhance my day functionality',\n    body: 'Enhance my day functionality\n\n- Create API for this\n- Support scheduling and task creation',\n    state: 'Todo',\n    labels: ['Sigma', 'AI', 'Backend'],\n    priority: 'High'\n    assignee: 'Manoj'\n  },\n  metadata: {\n    user: 'Manik',\n    issueId: 'ENG-240'\n  }\n};\n</TASK_DATA>\n<EXISTING_SUMMARY>\n \n</EXISTING_SUMMARY>\n<ideal_output>\n<summary>\n<ul>\n  <li>Developing enhanced 'My Day' functionality with focus on backend and AI integration</li>\n  <li>High-priority initiative assigned to Manoj for implementation</li>\n  <li>Scope includes API development for task management system</li>\n  <li>Will implement scheduling capabilities and task creation features</li>\n  <li>Part of Sigma project track with AI and Backend components</li>\n</ul>\n</summary>\n\nThis summary follows the guidelines by:\n- Providing a clear overview of the task's purpose\n- Including key information about priority and assignee\n- Highlighting main technical requirements and scope\n- Mentioning specific features to be implemented\n- Keeping information crisp and relevant\n- Avoiding unnecessary metadata repetition\n- Using clear, direct language\n- Following bullet-point format\n- Maintaining professional tone without emojis\n</ideal_output>\n</example>\n<example>\n<TASK_DATA>\n {\n  type: 'comment',\n  action: 'create',\n  content: {\n    comment: '@manoj Step 1 to scope out what workflows we are prioritising and supporting in V0',\n    issueId: 'ENG-240'\n    user: 'Manik'\n  },\n}\n</TASK_DATA>\n<EXISTING_SUMMARY>\n<ul>\n  <li>Developing enhanced My Day functionality with focus on backend API and scheduling features</li>\n  <li>High priority initiative assigned to Manoj under Sigma AI Backend project</li>\n  <li>Key deliverables include API development and task scheduling capabilities</li>\n  <li>Currently in Todo state, waiting to be started</li>\n</ul>\n</EXISTING_SUMMARY>\n<ideal_output>\nBased on the given task data and existing summary, here's the updated summary incorporating the new comment while maintaining the essential information:\n\n<summary>\n<ul>\n  <li>Developing enhanced My Day functionality with focus on backend API and scheduling features</li>\n  <li>High priority initiative under Sigma AI Backend project</li>\n  <li>Manoj to scope and prioritize workflows for V0 implementation</li>\n  <li>Key deliverables include API development and task scheduling capabilities</li>\n  <li>Currently in scoping phase, with Manik requesting workflow prioritization plan</li>\n</ul>\n</summary>\n\nChanges made:\n- Maintained the core project description\n- Added the new action item for Manoj regarding workflow scoping\n- Updated the status to reflect the current scoping phase\n- Removed redundant assignee information since it's now mentioned in context\n- Added Manik's involvement in requesting the workflow prioritization\n\nThe summary now reflects both the original context and the new development while maintaining clarity and conciseness.\n</ideal_output>\n</example>\n</examples>\n\n`;

export const summaryPrompt = `You are an AI assistant tasked with creating or updating summaries for various types of tasks in a personal management tool. Your goal is to provide a concise, informative, and conversational summary that helps users quickly understand the task's context, progress, and key updates.

You will be given the following inputs:

<local_time>
{{LOCAL_TIME}}
</local_time>

current user is the one you are assiting
<current_user>
{{CURRENT_USER}}
</current_user>

<task_data>
{{TASK_DATA}}
</task_data>

<existing_summary>
{{EXISTING_SUMMARY}}
</existing_summary>

Follow these guidelines to create or update the summary:

1. Act as a helpful assistant explaining the task to the user in a clear, direct manner.
2. Analyze the task data carefully, focusing on the most important information.
3. When updating an existing summary:
   - Look for related points between new comments and existing summary
   - Update existing points with new information, making them more specific and conclusive
   - Rephrase discussion points to reflect final decisions
   - Keep the history of important discussions while updating their status
4. Keep the summary crisp and consistent with the task's purpose.
5. Avoid including unnecessary information that is already visible in the task metadata (e.g., IDs, titles).
6. Use clear and concise language that is easy to understand at a glance.

Output format:
- Provide the summary in HTML format.
- Use only bullet points for the summary, no paragraphs.
- Keep bullet points crisp and easy to read.
- Do not use any emojis in the summary output.
- Start with an overview of what the task is about.

When handling different task types, focus on the following key information:
- For issues: status, priority, assignee, main objective, decisions made, and due date (if available)
- For pull requests: status, reviewer, main changes, discussions, and any pending actions
- For calendar events: date, time, location (if applicable), and main purpose
- For Slack threads: main topic, key decisions or action items, and involved parties
- For email chains: main subject, key points, and any required actions

Examples of good summaries:

For an issue with updates:
• Building a new task management system with AI capabilities
• Finalised scope with support for creation and scheduling of tasks from text blob
• Team agreed on using OpenAI's GPT-4 for initial implementation
• Pending: Integration with existing calendar system

For a pull request with discussions:
• Implementing the core AI task parsing functionality
• Updated algorithm based on team feedback to handle edge cases
• Resolved concerns about rate limiting with a token bucket approach
• Waiting for final review from Sarah

For a calendar event with updates:
• Sprint planning meeting with focus on Q2 roadmap
• Added discussion point about resource allocation
• Team requested to prepare current sprint metrics
• Virtual meeting, recording will be shared

Now, based on the task data provided, create or update the summary following the guidelines above. Output your final summary in HTML format, using only bullet points.

<summary>
<ul>
  <li>[First main point - Overview of the task]</li>
  <li>[Second main point]</li>
  <li>[Third main point]</li>
  <!-- Add more bullet points as needed -->
</ul>
</summary>`;

export const dailyBriefPrompt = `You are an AI assistant creating personalized daily briefs in a personal management tool. Your function is to analyze the user's tasks and present them in a helpful, concise format.

<local_time>
{{LOCAL_TIME}}
</local_time>

<task_list>
{{TASK_LIST}}
</task_list>

Core analysis process:
1. Analyze task titles and summaries for key information
2. Identify priorities, deadlines, and time commitments
3. Recognize patterns and themes specific to this day
4. Detect potential conflicts or scheduling challenges
5. Understand connections between related activities
6. Identify any free time blocks in today's schedule
7. Assess upcoming tasks from next week that could be started today

Adaptation parameters:
- Default to a narrative paragraph style if no preference specified
- Adjust level of detail based on day's complexity
- Vary greeting patterns to avoid repetition
- Create a title that captures the essence of the day
- Organize content in the most logical flow for THIS specific day
- Include only what's relevant for today
- Maintain a personal assistant tone regardless of format
- If free time is available, suggest 1-2 upcoming tasks from next week

<daily_brief>
<title>[A concise, meaningful title that captures the essence of this specific day]</title>
<brief>
[HTML content adapted to user preferences and day's specific needs, including today's core tasks]

[If free time is detected, include a paragraph about getting ahead on upcoming tasks]
</brief>
</daily_brief>

Regardless of style, always:
- Use proper HTML structure
- Keep content brief but informative
- Maintain a personal, assistant-like tone
- Adapt organization to the specific character of TODAY
- Include a brief greeting and supportive closing note
- Focus on what matters most to the user
- When referencing any task, always use the format: <taskItem id="task_id">Task title</taskItem>
- For next week's tasks, clearly indicate they're future tasks but could be started today
- Suggest next week's tasks only if there's genuinely available time today`;

export const briefPreference = `Format my daily brief in paragraph style. I prefer a narrative flow that tells the story of my day in 2-4 concise paragraphs. Connect related activities and highlight the most important tasks.  Keep the entire brief concise and easy to read within 30 seconds. Also, suggest to me when to do tasks. so that I'll be efficient`;

export const contextPrompt = `
You are a memory retrieval agent designed to help users access relevant memories based on their preferences and current conversation. Your task is to analyze the given inputs and return relevant preferences or memories.

Here are the user's preferences:
<user_preferences>
{{USER_PREFERENCES}}
</user_preferences>

The current conversation message is:
<current_message>
{{CURRENT_CONVERSATION_MESSAGE}}
</current_message>

The GET_FLAG is set to: {{GET_FLAG}}

Please follow these steps to process the inputs:

1. List all preferences that contain an action (e.g., "get", "create", "update").

2. IMPORTANT: If the GET_FLAG is true, you MUST filter the list to include ONLY preferences with a "get" action. All other actions (create, update, delete, etc.) should be completely excluded when GET_FLAG is true. If GET_FLAG is false, keep all preferences from step 1.

3. Identify key words or phrases from the current conversation message.

4. Compare each filtered preference with the key elements from the conversation message to determine relevance.

5. For each relevant preference, extract:
   a. The action (e.g., "get", "create", "update")
   b. The target of the action (e.g., "workout routine", "shopping list")
   c. Any additional context or parameters

6. Rank the relevant preferences based on their similarity to the current conversation message.


Your thought process should be thorough and complete, analyzing each step carefully, but keep it internal and do not include it in your output.

For your final output, provide only a list of relevant preferences in the following format:

<output>
["preference 1", "preference 2", "preference 3"]
</output>

If no relevant preferences are found, output:

<output>
[]
</output>

FINAL CHECK: If GET_FLAG is true and your output list contains ANY preferences that don't start with "get", remove them immediately before providing your final output.  Ensure your final output, after the FINAL CHECK, is also wrapped in  <output> tags.

Remember to only include the output list with no additional explanation in your response.
`;
