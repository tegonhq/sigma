
import sys

from .agent import SigmaAgentGithub

def run():
    agent = SigmaAgentGithub()
    agent.app()