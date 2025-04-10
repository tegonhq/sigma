
from dataclasses import dataclass
from typing import Generic, TypeVar


T = TypeVar('T')

@dataclass
class Message(Generic[T]):
    """Wrapper class to differentiate between streaming updates and final result"""

    is_final: bool
    content: T
    error: bool = False
