from typing import Any
from .tools import BaseTools

class GithubTools(BaseTools):
  def __init__(self, headers: dict[str, Any] | None = None):
      """Initialize BaseTools with base API URL.
      
      Args:
          base_api_url (str): Base URL for API endpoints
      """
      super().__init__('https://api.hevyapp.com', headers)