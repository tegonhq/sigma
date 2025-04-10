import json
import os
import sys
from abc import ABC, abstractmethod
from importlib import metadata
from pathlib import Path
from typing import Dict, Iterator, List, Optional

import typer

class BaseAgent(ABC):
    """Abstract base class for Sigma agents that can be inherited to create custom agents.
    Provides CLI interface and core agent functionality that can be overridden."""

    def __init__(self):
        self.app = typer.Typer()
        self._register_commands()

    def _register_commands(self):
        """Register the CLI commands"""
        
        @self.app.command()
        def help():
            """Show help information about the agent"""
            help_text = """
            Available commands:
            - help: Show this help message
            - version: Show agent version
            - get_tools: List available tools/capabilities
            - get_jargon: Get domain-specific terminology
            - run: Execute agent with a message and optional auth
            """
            typer.echo(help_text)
            self.help()

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
            typer.echo(json.dumps(self.get_jargon()))

        @self.app.command(help="Run the agent with a message and optional auth dictionary")
        def run(
            message: str = typer.Argument(..., help="Message to send to the agent"),
            auth: Dict = typer.Option(..., help="Authentication dictionary"),
            auto_mode: bool = typer.Option(False, help="Enable automatic mode")
        ):
            """Run the agent with a message and stream JSON responses"""
            try:
                # Iterate through yielded responses and output as JSON
                for response in self.run(message, auth, auto_mode):
                    # Ensure response is serializable
                    json_response = json.dumps(response)
                    # Write to stdout and flush immediately to ensure streaming
                    typer.echo(json_response, nl=False)
                    typer.echo("\n", nl=False)
                    sys.stdout.flush()
            except Exception as e:
                # Handle errors by outputting as JSON
                error_response = json.dumps({"error": str(e)})
                typer.echo(error_response)
                sys.stdout.flush()

    @abstractmethod
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

    @abstractmethod
    def version(self) -> None:
        """Show additional version information"""
        # Get package name from the agent implementation
        package_name = self.__class__.__module__.split('.')[0]
        try:
            version = metadata.version(package_name)
            typer.echo(version)
        except metadata.PackageNotFoundError:
            typer.echo("Version information not available")

    @abstractmethod
    def get_tools(self) -> None:
        """Show additional tools information"""
        try:
            tools_path = Path(os.path.dirname(__file__)) / 'tools.json'
            with open(tools_path) as f:
                tools = json.load(f)
            return json.dumps(tools)
        except FileNotFoundError:
            return "[]"

    @abstractmethod
    def get_jargon(self) -> None:
        """Show additional jargon information"""
        try:
            from . import jargon
            return jargon.JARGON
        except (ImportError, AttributeError):
            return {}


    @abstractmethod
    def run(self, message: str, auth: Dict, auto_mode: bool = False) -> Iterator[Dict]:
        """Run the agent with the given message and optional auth.
        Should yield JSON responses to be streamed to stdout."""
        pass
