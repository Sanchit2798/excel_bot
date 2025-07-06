import abc
from typing import Dict, List, Optional

class ICodeGenerator(abc.ABC):
    """Abstract interface for LLM interactions."""
    
    @abc.abstractmethod
    async def generate_code(
        self, 
        specification: str, 
        # examples: Optional[List[Dict[str, str]]] = None,
        # max_tokens: int = 2000,
        # temperature: float = 0.2,
    ) -> str:
        """Generate code from a specification.
        
        Args:
            specification: The detailed requirements for the code
            
        Returns:
            Generated code as string
        """
        pass