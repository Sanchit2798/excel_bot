from typing import Dict, List, Optional
from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential
from llm.interfaces.icode_generator import ICodeGenerator
from llama_index.retrievers.bm25 import BM25Retriever

loaded_bm25_retriever = BM25Retriever.from_persist_dir("./bm25_retriever")
def query_bm25_retriever(retriever, query_text="document"):
    """
    Queries the BM25 retriever and prints the results.

    Args:
        retriever (BM25Retriever): The loaded BM25 retriever.
        query_text (str): The query string.
    """
    results = retriever.retrieve(query_text)
    print(f"Query: {query_text}")
    content = "".join([node.get_content() for node in results])
    return content


class GeminiCodeGenerator(ICodeGenerator):
    """OpenAI implementation of the LLM interface."""
    
    def __init__(self, api_key: str, model: str = "gemini-2.5-flash"):
        """Initialize with API key and model.
        
        Args:
            api_key: Gemini API key
            model: Model identifier to use
        """
        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.language = "javascript" 
    
    # @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
    def generate_code(
        self, 
        specification: str, 
        # language: str, 
        # examples: Optional[List[Dict[str, str]]] = None,
        # max_tokens: int = 2000,
        # temperature: float = 0.2,
    ) -> str:
        """Generate code using Gemini API with retry logic for resilience."""
        # Construct the prompt
        retreived_content =  query_bm25_retriever(loaded_bm25_retriever, specification)
        prompt = self._construct_prompt(specification, retrieved_content=retreived_content)
        
        # Call the API
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
            system_instruction=["You are tasked to generate code as part of javascript excel add in api to acheive the given tasks in excel",
            "Generate code without explanations unless specifically requested." ,
            "Generate code as a single function called llm_action and do not export it",
            "Use the latest version of the javascript excel add in api and do not use any deprecated methods.",
            "For acheiving the specification, use the javascript excel add in api to reflect changes in the excel worksheet ",
            "Try to use excel formulas or excel funcationality whereever you can,"
            "The user should be able to see the changes in excel workbook",
            "The code you generate is essentially executed as part of the excel add in whose aim is to automate tasks in excel",]),
        )
        # Extract and return the code
        code = response.text.split(self.language, 1)[1].strip() if self.language in response.text else response.text.strip() 
        #also remove the trailing backticks if present
        if code.endswith("```"):
            code = code[:-3].strip()
        return code

    def _construct_prompt(
        self, 
        specification: str, 
        retrieved_content: Optional[str] = None,
        examples: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """Construct an effective prompt for code generation."""
        prompt = f"Generate code using javascript excel add in api for the following requirement:\n\n{specification}\n\n"
        prompt += f"You can use following relevant infromation from documentation:\n\n{retrieved_content}\n\n"
        # if examples:
        #     prompt += "Here are some examples of similar code:\n\n"
        #     for i, example in enumerate(examples):
        #         prompt += f"Example {i+1}:\nSpecification: {example['specification']}\nCode:\n{example['code']}\n\n"
        
        prompt += f"Now, generate only the code that meets the requirement."
        return prompt