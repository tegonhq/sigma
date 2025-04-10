from abc import ABC
from typing import Any
from .api_base import APIBase
import json
import os
from pathlib import Path

class BaseTools(ABC):
  def __init__(self, base_api_url: str, headers: dict[str, Any] | None = None):
      """Initialize BaseTools with base API URL.
      
      Args:
          base_api_url (str): Base URL for API endpoints
      """
      self.base_api_url = base_api_url
      self.api_client = self._get_api_client(headers) 

  def _get_api_client(self, headers: dict[str, Any] | None = None) -> APIBase:
    """Get or initialize the API client"""
    return APIBase(self.base_api_url, headers)

  def get_tools(self): 
    tools_path = Path(os.path.dirname(__file__)) / 'tools.json'
    try:
        with open(tools_path) as f:
            return json.load(f)
    except FileNotFoundError:
        return []
    
  def run(self, tool_name: str, **kwargs):
    # Check if the tool_name exists as a method on this class
    if hasattr(self, tool_name):
        # Get the method and call it with kwargs
        tool_method = getattr(self, tool_name)
        try:
            return tool_method(**kwargs)
        except Exception as e:
            return {"error": f"Error executing tool {tool_name}: {str(e)}"}
    else:
        return {"error": f"No function found for tool: {tool_name}"}