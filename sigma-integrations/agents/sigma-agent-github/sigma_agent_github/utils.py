import json
import queue
from collections.abc import AsyncGenerator
from dataclasses import dataclass
from queue import Queue
from typing import Any, ClassVar, Generic, TypeVar

from haystack.dataclasses import ChatMessage, StreamingChunk
from haystack.utils import Secret
from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator

T = TypeVar('T')

class ComponentMixin:
    """Mixin class for common component functionality"""

    name: ClassVar[str] = ''
    description: ClassVar[str] = ''
    keywords: ClassVar[str] = ''
    input_schema: ClassVar[dict[str, Any]] = {
        'type': 'object',
        'properties': {},
        'required': [],
    }
    output_schema: ClassVar[dict[str, Any]] = {
        'type': 'object',
        'properties': {},
    }

    def get_completion(
        self,
        messages: list[ChatMessage],
        tools: list[dict[str, Any]] | None = None,
    ) -> dict[str, list[ChatMessage]]:
        """
        Get completion from the LLM
        """
        try:
            generation_kwargs: Any = {'max_tokens': 5000}
            if tools:
                generation_kwargs['tools'] = tools
                generation_kwargs['tool_choice'] = {'type': 'any'}

            response = self.generator.run(
                messages=messages, generation_kwargs=generation_kwargs
            )
            return response

        except Exception as e:
            return {'response': []}

    def process_response_with_tools(
        self, response: dict[str, list[ChatMessage]]
    ) -> dict[str, Any]:
        """Process LLM response and handle tool calls"""
        if isinstance(response, dict) and 'replies' in response:
            for reply in response['replies']:
                if hasattr(reply, 'content'):
                    try:
                        tool_call = json.loads(reply.content)
                        tool_name = tool_call.get('name')
                        if hasattr(self, tool_name):
                            tool_method = getattr(self, tool_name)
                            return tool_method(**tool_call['input'])
                    except json.JSONDecodeError:
                        continue
        return response

    def setup_generator(self, api_key: Secret, model: str) -> None:
        """Setup the AnthropicChatGenerator"""
        self.generator = AnthropicChatGenerator(api_key=api_key, model=model)
