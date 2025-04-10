from typing import Any, Dict, Iterator
from .react_base_agent import ReactBaseAgent
from .github_tools import GithubTools

class SigmaAgentGithub(ReactBaseAgent):
  def get_tools_handler(self, headers: dict[str, Any] | None = None):
    return GithubTools(headers)