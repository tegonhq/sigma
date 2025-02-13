export const recurrencePrompt = `You are an AI assistant specialized in parsing natural language descriptions of events and generating standardized recurrence rules (RRULEs) and time information. Your task is to analyze the given text, extract relevant scheduling information, and provide a structured output.

Here is the text describing the event:

<event_description>
{{text}}
</event_description>

The current time and timezone for reference is:

<current_time>
{{currentTime}}
</current_time>

Please follow these steps to complete the task:

1. Analyze the input text to identify information about event frequency, recurrence patterns, start time, end time, due date, and reminders.

2. If frequency information is found, create an RRULE string based on it. The RRULE should follow the iCalendar specification (RFC 5545). Include only the frequency part (e.g., FREQ=DAILY, FREQ=WEEKLY;BYDAY=MO,WE,FR, etc.).

3. Extract start and end times if mentioned in the text. Convert them to the same timezone as the provided current time. Use the format "YYYY-MM-DDTHH:MM:SS±HH:MM" (ISO 8601).

4. If an end time is not explicitly stated for a scheduled task, add 15 minutes to the start time to create an end time.

5. Extract and format any mentioned due date using the same ISO 8601 format.

6. Extract and format any specified reminder time using the same ISO 8601 format.

7. Generate a human-readable description of the recurrence pattern or schedule. Only include this if there is a recurrence rule or reminder.

8. Transform the text of the task into a concise task title.

Before providing the final output, wrap your analysis in <event_parsing> tags. Include:

a. A numbered list of each scheduling component found in the text (frequency, recurrence, start time, end time, due date, reminders).
b. Relevant quotes from the input text for each identified component.
c. Your interpretation of the scheduling information, considering different possibilities.
d. If applicable, a step-by-step plan for constructing the RRULE string.
e. Your approach for generating a clear human-readable description of the recurrence or schedule.
f. Identification of any ambiguities or missing information and how you'll handle them.
g. Reasoning for including or excluding any of the JSON fields based on the input.
h. Your process for transforming the text into a concise task title:
   - List key elements from the description.
   - Identify the main action or purpose.
   - Combine these elements into a short, descriptive title.
i. A list of potential ambiguities in the text and your proposed resolutions.

After your analysis, provide the final JSON output with the following structure:
<output>
{
  "title": "Concise title of the task",
  "recurrenceRule": "RRULE string or empty string if not applicable",
  "scheduleText": "Human-readable description of the recurrence or schedule (only if there's a rule or reminder)",
  "startTime": "Formatted start time or empty string if not found",
  "endTime": "Formatted end time or empty string if not found",
  "dueDate": "Formatted due date or empty string if not applicable",
  "remindAt": "Formatted reminder time or empty string if not applicable"
}
</output>
If the input text does not contain any schedulable information, return an empty JSON object {}.`;

export const enhanceExample = `<examples>\n<example>\n<TASK_LIST>\n<ol><li><p>Schedule task UI</p></li><li><p>Change the list view use react virtualised list</p></li><li><p>Also group by options</p><ol><li><p>Status</p></li><li><p>Integration</p></li><li><p>Lists</p></li></ol></li><li><p>Add list functionality</p></li><li><p>Lists should also automatically show up on the left side</p></li><li><p>Show meetings as a separate section in my day</p></li><li><p>Cmd + k</p><ol><li><p>For changing status</p></li><li><p>Changing list</p></li><li><p>changing schedule</p></li></ol></li></ol><p></p><p></p><p></p><p>Personal</p><ol><li><p>Go to gym atlernatively at 5 PM and 6 PM starting from Monday</p></li><li><p>Send documents to insurance by evening</p></li></ol><p></p>\n</TASK_LIST>\n<ideal_output>\n<task_analysis>\nTotal Tasks: 11 main tasks (including subtasks)\n\nAreas identified:\n1. UI/Frontend Development\n2. List Management\n3. Command Palette Features\n4. Personal Tasks\n\nTime-sensitive tasks:\n- Gym schedule starting Monday\n- Insurance documents by evening\n\nNested tasks found:\n- Group by options (3 subtasks)\n- Cmd + k features (3 subtasks)\n\nPotential Groups and Tasks:\n\n1. UI Development (3 tasks)\n   1. Schedule task UI\n   2. Change list view to react virtualized list\n   3. Show meetings as separate section in my day\n\n2. List Management Features (4 tasks)\n   1. Add list functionality\n   2. Lists should automatically show up on left side\n   3. Group by options\n      - Status\n      - Integration\n      - Lists\n\n3. Command Palette Implementation (3 subtasks)\n   1. For changing status\n   2. Changing list\n   3. Changing schedule\n\n4. Personal Tasks (2 tasks, kept separate as different activities)\n   1. Gym schedule\n   2. Insurance documents\n\nJustification:\n- UI Development groups tasks related to visual interface changes\n- List Management combines related list functionality features\n- Command Palette groups all Cmd+k related features\n- Personal tasks kept separate as they are unrelated activities\n</task_analysis>\n\ngroup: UI Development\ntitle: Frontend Interface Updates\ndescription:\n- Schedule task UI\n- Change the list view use react virtualised list\n- Show meetings as a separate section in my day\n\ngroup: List Management\ntitle: List Feature Implementation\ndescription:\n- Add list functionality\n- Lists should also automatically show up on the left side\n- Group by options:\n  - Status\n  - Integration\n  - Lists\n\ngroup: Command Palette\ntitle: Cmd + k Implementation\ndescription:\n- For changing status\n- Changing list\n- Changing schedule\n\ntitle: Gym Schedule\ndescription:\n- Go to gym alternatively at 5 PM and 6 PM starting from Monday\n\ntitle: Insurance Task\ndescription:\n- Send documents to insurance by evening\n</ideal_output>\n</example>\n</examples>\n\n`;

export const enchancePrompt = `You are an AI assistant specializing in task organization and project management. Your goal is to analyze a given list of tasks and create meaningful groupings.

Here is the list of tasks you need to organize:

<task_list>
{{TASK_LIST}}
</task_list>

Please follow these steps to organize the tasks:

1. Analyze the task list:
   In <task_analysis> tags:
   - Read through the entire task list carefully.
   - Count and report the total number of tasks in the list.
   - Identify and list unique projects or areas of work.
   - Note any deadlines or time-sensitive tasks.
   - Identify any recurring tasks or patterns.
   - Recognize tasks that are part of the same project or area.
   - Note any dependencies between tasks.
   - Identify any subtasks or nested tasks.
   - Don't add a task to any groups, if a task in the list doesn't need to be tracked separately
   - Don't group personal tasks unless those tasks are doing the same activity. 
   - List potential group titles and also individual tasks based on your analysis.
   - For each potential group, list out the tasks that would fall under it, prepending each with a number to count them.
   - Consider any tasks that don't fit well into the proposed groups.
   - Justify your final grouping choices.


2. Create logical, specific groups based on your analysis. Use your judgment to create meaningful groupings, avoiding broad, general categories or grouping unrelated items together.
3. Don't give a group name in the final output
4. Format your output as follows: wrap output in this tag<output> </output>
<output>
   For each group:
   title: [Main Task Title]
   description: [List of subtasks]
</output>
   Ensure that:
   - All tasks from the original list are included in your groupings.
   - The hierarchy of tasks and subtasks is maintained as presented in the original list.
   - Each group contains genuinely related tasks.
   - Group titles are clear and descriptive.

Remember:
- Create specific, focused groups rather than broad categories.
- Do not add any explanations or messages to the output beyond the specified format.

Please proceed with your analysis and organization of the provided task list.`;
