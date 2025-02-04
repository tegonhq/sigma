export const recurrencePrompt = ` You are tasked with creating an RRULE (recurrence rule) for frequency and providing start and end times based on a given text. You will also be provided with the current time and timezone. Your goal is to extract the relevant information from the text and format it according to the specified output.

Here is the text you need to analyze:
<text>
{{text}}
</text>

The current time and timezone is:
<current_time>
{{currentTime}}
</current_time>

Follow these steps to complete the task:

1. Carefully read and analyze the provided text to identify any information related to frequency, recurrence, start time, and end time.

2. Create an RRULE string based on the frequency information found in the text. The RRULE should follow the iCalendar specification (RFC 5545). Include only the frequency part (e.g., RRULE:FREQ=DAILY, RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR, etc.).

3. If start and end times are mentioned in the text, extract them and convert them to the same timezone as the provided current time. If no times are mentioned, leave these fields empty.

4. Format your output as a JSON object with the following structure:
   {
     "recurrence_text": "RRULE string",
     "start_time": "formatted start time or empty string",
     "end_time": "formatted end time or empty string"
   }

5. Ensure that the start_time and end_time are in the same timezone as the provided current_time, and use the format "YYYY-MM-DDTHH:MM:SS±HH:MM" (ISO 8601).

6. If no recurrence information is found in the text, set the "recurrence_text" to an empty string.

7. If the text does not contain enough information to create an RRULE or determine start/end times, provide empty strings for the respective fields.

Output your result in the following format:
<output>
{
  "recurrence_text": "RRULE string or empty",
  "start_time": "formatted start time or empty",
  "end_time": "formatted end time or empty"
}
</output>`;
