import json
import os
import sys
from abc import ABC, abstractmethod
from importlib import metadata
from pathlib import Path
from typing import Any, Dict, Iterable, Iterator, List, Optional
from collections.abc import AsyncGenerator

from pydantic import Secret
from .utils import ComponentMixin
from haystack_integrations.components.generators.anthropic import AnthropicChatGenerator
from src.config import settings
from .message import Message

import typer

class BaseAgent(ComponentMixin, ABC):
    """Abstract base class for Sigma agents that can be inherited to create custom agents.
    Provides CLI interface and core agent functionality that can be overridden."""

    def __init__(self):
        self.app = typer.Typer()
        self._register_commands()
        self.tools_handler = None

    def setup_generator(self, model: str) -> None:
        """Setup the AnthropicChatGenerator"""
        self.generator = AnthropicChatGenerator(model=model)

    def _register_commands(self):
        """Register the CLI commands"""
        
        @self.app.command("help")
        def help(ctx: typer.Context):
            """Show help information about the agent"""
            typer.echo(ctx.parent.get_help())

        @self.app.command() 
        def version():
            """Show agent version"""
            self.version()

        @self.app.command()
        def get_tools():
            """Get available tools/capabilities from tools.json"""
            typer.echo(self.get_tools())

        @self.app.command()
        def get_jargon():
            """Get domain-specific terminology from jargon.py"""
            typer.echo(self.get_jargon())

        @self.app.command(help="Run the agent with a message and optional auth dictionary")
        def run(
            message: str = typer.Argument(..., help="Message to send to the agent"),
            context: str = typer.Argument(..., help="Context to send to the agent"),
            auth: str = typer.Argument(..., help="Authentication dictionary"),
            auto_mode: bool = typer.Option(False, help="Enable automatic mode")
        ):
            """Run the agent with a message and stream JSON responses"""
            typer.echo("Starting agent...")
            try:
                # Iterate through yielded responses and output as JSON
                """Run the agent with a message and stream JSON responses"""
                for response in self.run(message, context, auth, auto_mode):
                    # Ensure response is serializable and output it
                    json_response = json.dumps(response.content)
                    typer.echo(json_response)
                    sys.stdout.flush()
                    
            except Exception as e:
                # Handle errors by outputting as JSON
                error_response = json.dumps({"error": str(e)})
                typer.echo(error_response)



    def help(self) -> None:
        """Show additional help information about using the agent"""
        help_text = """
        Available commands:
        - help: Show this help message
        - version: Show agent version
        - get_tools: List available tools/capabilities
        - get_jargon: Get domain-specific terminology
        - run: Execute agent with a message and optional auth
        """
        typer.echo(help_text)


    def version(self) -> None:
        """Show additional version information"""
        # Get package name from the agent implementation
        package_name = self.__class__.__module__.split('.')[0]
        try:
            version = metadata.version(package_name)
            typer.echo(version)
        except metadata.PackageNotFoundError:
            typer.echo("Version information not available")


    def get_tools(self) -> None:
        """Show additional tools information"""
        try:
            tools_handler = self.get_tools_handler()
            tools = tools_handler.get_tools()
            return tools
        except FileNotFoundError:
           return "[]"


    def get_jargon(self) -> None:
        """Show additional jargon information"""
        try:
            jargon_path = Path(os.path.dirname(__file__)) / 'jargon.md'
            with open(jargon_path) as f:
                jargon_content = f.read()
            return json.dumps(jargon_content)
        except (ImportError, AttributeError):
           return "None"

    @abstractmethod
    def run(self, message: str, context: str, auth: str, auto_mode: bool = False) -> Iterable[Message]:
        """Run the agent with the given message and optional auth.
        Should yield JSON responses to be streamed to stdout."""
        pass
    
    @abstractmethod
    def get_tools_handler(headers: dict[str, Any] | None = None):
      """
      This method must be implemented by child classes to set up the appropriate tools handler.
      The tools handler provides the available tools/functions that the agent can use.
      """
      pass
