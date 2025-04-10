

from abc import abstractmethod
import json
import re
from typing import Any, Dict, Iterable, Iterator
from collections.abc import AsyncGenerator
from .base import BaseAgent
from .message import Message
from haystack.components.builders import PromptBuilder
from haystack.dataclasses import ChatMessage

from .react_prompt import REACT_PROMPT

class ReactBaseAgent(BaseAgent):
  def __init__(self):
    """Initialize the ReactBaseAgent with a tools handler.
        
    Args:
      tools_handler (BaseTool): An instance of BaseTool that will handle tool operations
      """
    super().__init__()
    self.agent_messages = []


  def _format_tools_for_prompt(self) -> str:
    """Format tools information for inclusion in the prompt.

    Returns a string representation of available tools with their descriptions
    and parameters for use in LLM prompts.
    """
    tools = self.get_tools()

    if not tools:
        return []

    tool_descriptions = []
    for name, tool in tools.items():
        # Start with the tool name and description
        tool_str = f"- {name}: {tool.get('description', 'No description')}"

        # Process parameters if they exist
        if 'params' in tool and isinstance(tool['params'], dict):
            params_list = []

            for param_name, param_info in tool['params'].items():
                if not isinstance(param_info, dict):
                    continue

                required = param_info.get('required', False)
                params_list.append(
                    self._format_parameter(param_name, param_info, required)
                )

            if params_list:
                tool_str += f". Parameters: {', '.join(params_list)}"

        tool_descriptions.append(tool_str)

    return '\n'.join(tool_descriptions)

  def _format_parameter(self, param_name, param_info, required, depth=0):
    """Recursively format a parameter and its nested structure.

    Args:
        param_name: Name of the parameter
        param_info: Dictionary containing parameter information
        required: Whether the parameter is required
        depth: Current nesting depth (for formatting)

    Returns:
        Formatted parameter string with nested structures
    """
    # Limit recursion depth to avoid overly complex descriptions
    if depth > 3:
        return f"{param_name}{'*' if required else ''}: [complex nested structure]"

    # Handle array items
    if 'items' in param_info:
        # If items is a dictionary with properties (complex object array)
        if (
            isinstance(param_info['items'], dict)
            and 'properties' in param_info['items']
        ):
            nested_params = []
            for prop_name, prop_info in param_info['items']['properties'].items():
                prop_required = prop_info.get('required', False)
                nested_params.append(
                    self._format_parameter(
                        prop_name, prop_info, prop_required, depth + 1
                    )
                )

            if nested_params:
                return f"{param_name}{'*' if required else ''}: [{', '.join(nested_params)}]"

        # If items is a dictionary with type definitions (simple object array)
        elif isinstance(param_info['items'], dict):
            item_type = param_info['items'].get('type', 'any')
            return f"{param_name}{'*' if required else ''}: [array of {item_type}]"

    # Handle objects with properties
    elif 'properties' in param_info:
        nested_params = []
        for prop_name, prop_info in param_info['properties'].items():
            if not isinstance(prop_info, dict):
                continue

            prop_required = prop_info.get('required', False)
            nested_params.append(
                self._format_parameter(
                    prop_name, prop_info, prop_required, depth + 1
                )
            )

        if nested_params:
            return f"{param_name}{'*' if required else ''}: {{{', '.join(nested_params)}}}"

    # Handle regular parameters
    return self.format_param(param_name, param_info, required)

  def format_param(self, name: str, info: dict, required: bool = False) -> str:
    """Helper function to format a parameter with its description."""
    req_marker = '*' if required else ''
    desc = info.get('description', 'No description')
    return f'{name}{req_marker}: {desc}'

  def determine_next_action(
        self, execution_state: dict[str, Any]
    ) -> dict[str, Any]:
        """Determine the next action to take based on the current execution state.

        This is the core of the ReAct loop - it analyzes the history of observations
        and determines what to do next: either take another action or complete the task.
        """
        context = execution_state['context']
        history = execution_state['history']
        previous_history = execution_state['previous_history']
        auto_mode = execution_state['auto_mode']


        # Format the history for the prompt
        history_text = ''
        if history:
            for i, step in enumerate(history):
                history_text += f'Step {i+1}:\n'
                history_text += f"Thought: {step.get('thought', 'N/A')}\n"
                history_text += f"Action: {step.get('action', 'N/A')}\n"
                history_text += f"Action Input: {step.get('action_input', 'N/A')}\n"
                history_text += f"Observation: {step.get('observation', 'N/A')}\n\n"



        # Format context information
        context_text = ''
        if context:
            context_text = '\n'.join([f'- {k}: {v}' for k, v in context.items()])

        builder = PromptBuilder(template=REACT_PROMPT)


        prompt = builder.run(
            SERVICE_NAME=self.name,
            TOOLS=self._format_tools_for_prompt(),
            QUERY=execution_state['query'],
            SERVICE_JARGON=self.get_jargon(),
            CONTEXT=context_text,
            EXECUTION_HISTORY=history_text,
            AUTO_MODE=str(auto_mode).lower(),
            PREVIOUS_EXECUTION_HISTORY=previous_history,
        )

        # Get the next action from the LLM
        response = self.get_completion([ChatMessage.from_user(prompt['prompt'])])


        # Extract the response
        response_text = (
            response.get('replies', [])[0].content
            if response.get('replies')
            else 'No response generated'
        )

        # Parse the response to extract thought, action, and action input
        result = {}

        # Check if this is a final answer - handle both formats
        # First check for the new format with tags
        final_answer_tag_match = re.search(
            r'<final_answer>(.+?)</final_answer>', response_text, re.DOTALL
        )

        # Handle new format with tags
        if final_answer_tag_match:
            # Extract thought from within the final_answer tag if present
            inner_thought_match = re.search(
                r'Thought:(.+?)(?=\nFinal Answer:|$)',
                final_answer_tag_match.group(1),
                re.DOTALL,
            )
            thought = (
                inner_thought_match.group(1).strip() if inner_thought_match else ''
            )

            final_answer_match = re.search(
                r'Final Answer:(.+?)(?=\n</final_answer>|$)',
                final_answer_tag_match.group(1),
                re.DOTALL,
            )
            final_answer = (
                final_answer_match.group(1).strip() if final_answer_match else ''
            )

            return {
                'action': 'end_execution',
                'completed': True,
                'thought': thought,
                'final_answer': final_answer,
            }

        # Check if this is a question response
        question_response_match = re.search(
            r'<question_response>(.+?)</question_response>', response_text, re.DOTALL
        )

        # Handle question response format
        if question_response_match:
            # Extract thought from within the question_response tag if present
            inner_thought_match = re.search(
                r'Thought:(.+?)(?=\nQuestion:|$)',
                question_response_match.group(1),
                re.DOTALL,
            )
            thought = (
                inner_thought_match.group(1).strip() if inner_thought_match else ''
            )

            question_match = re.search(
                r'Question:(.+?)(?=\n\n|$)',
                question_response_match.group(1),
                re.DOTALL,
            )
            question = question_match.group(1).strip() if question_match else ''

            return {
                'action': 'ask_user',
                'completed': True,
                'thought': thought,
                'question': question,
            }

        # Otherwise, extract the next ReAct step
        thought_match = re.search(
            r'Thought:(.+?)(?=\nUserMessage:|$)', response_text, re.DOTALL
        )

        user_message_match = re.search(
            r'UserMessage:(.+?)(?=\nAction:|$)', response_text, re.DOTALL
        )
        action_match = re.search(
            r'Action:(.+?)(?=\nAction Input:|$)', response_text, re.DOTALL
        )
        action_input_match = re.search(
            r'Action Input:(.+?)(?=\n\n|</react_continuation>|$)',
            response_text,
            re.DOTALL,
        )

        result['thought'] = thought_match.group(1).strip() if thought_match else ''
        result['action'] = action_match.group(1).strip() if action_match else None
        result['action_input'] = (
            action_input_match.group(1).strip() if action_input_match else ''
        )
        result['user_message'] = (
            user_message_match.group(1).strip() if user_message_match else ''
        )
        result['completed'] = False

        return result

  def run(self, message: str, context: str, auth: str, auto_mode: bool = False) -> Iterable[Message]:     
    auth_dict = {}
    try:
        auth_dict = json.loads(auth)
    except (json.JSONDecodeError, TypeError):
        auth_dict = {}
        
    tools_handler = self.get_tools_handler(auth_dict)

    yield Message(
        is_final=False,
        content={'message': f'Starting {self.name} process', 'phase': 'start'},
    )

    context_dict = {}

    try:
        context_dict = json.loads(context)
    except (json.JSONDecodeError, TypeError):
        context_dict = {}

    self.setup_generator(context_dict.get("model"))


    guard_loop = 0

    execution_state = {
        'query': message,
        'context': context_dict.get("context"),
        'previous_history': context_dict.get("previous_history"),
        'history': context_dict.get("history", []),  # Track the full ReAct history
        'completed': False,
        'auto_mode': auto_mode,
    }


    while not execution_state['completed'] and guard_loop < 10:
          next_action = self.determine_next_action(execution_state)
          if next_action['action'] == 'end_execution':
              execution_state['completed'] = True
              execution_state['final_answer'] = next_action['final_answer']
              execution_state['history'].append(
                  {
                      'thought': next_action['thought'],
                      'final_answer': next_action['final_answer'],
                  }
              )
              self.agent_messages.append(next_action['final_answer'])
              yield Message(
                  is_final=True,
                  content={
                      'message': execution_state['final_answer'],
                      'phase': 'final',
                      'execution_state': execution_state,
                      'agent_messages': self.agent_messages,
                  },
              )
              break

          if next_action['action'] == 'ask_user':
              execution_state['completed'] = True
              execution_state['history'].append(
                  {
                      'thought': next_action['thought'],
                      'question': next_action['question'],
                  }
              )
              self.agent_messages.append(next_action['question'])
              yield Message(
                  is_final=True,
                  content={
                      'message': next_action['question'],
                      'phase': 'ask user',
                      'execution_state': execution_state,
                      'agent_messages': self.agent_messages,
                  },
              )
              break

          # Extract action details
          action_name = next_action.get('action')
          action_input = next_action.get('action_input', '{}')
          thought = next_action.get('thought', '')
          user_message = next_action.get('user_message', '')

          # Record this step in history
          step_record = {
              'thought': thought,
              'action': action_name,
              'action_input': action_input,
              'user_message': user_message,
          }

          # Extract action ID from user message if present
          action_id_match = re.search(r'<action id="([^"]+)"', user_message)
          if action_id_match:
              action_id = action_id_match.group(1)
              self.conversation_thoughts[action_id] = {
                  'action': action_name,
                  'action_input': action_input,
              }

          self.agent_messages.append(user_message)

          # Yield thought and action
          yield Message(
              content={
                  'message': user_message,
                  'phase': 'action',
              },
              is_final=False,
          )


          parsed_input = json.loads(action_input)
          result = tools_handler.run(action_name, **parsed_input)

          # Record the observation
          step_record['observation'] = result
          step_record['success'] = True

          execution_state['history'].append(step_record)

          guard_loop += 1
   
   
