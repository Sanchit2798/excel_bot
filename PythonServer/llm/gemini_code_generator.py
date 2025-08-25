import datetime
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
        chat_json: str, 
    ) -> str:
        """Generate code using Gemini API with retry logic for resilience."""
        chat_history = chat_json.get("chat_history", [])
        last_user_input = chat_history[-1]["response"]

        # Define the grounding tool
        # chat_history = self.do_web_search(chat_history)

        # Construct the prompt
        retreived_content = query_bm25_retriever(loaded_bm25_retriever, last_user_input)
        self.create_chat_entry(chat_history, "documentation_retriever", retreived_content)
        prompt = self._construct_prompt(chat_history)
        
        # Call the API
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
            system_instruction=["You are tasked to generate code as part of javascript excel add in api to acheive the given tasks in excel",
            "Generate code without explanations unless specifically requested." ,
            "Generate code as a single synchronous function called llm_action and do not export it",
            "use this function signature - function llm_action(context). No need to do Excel.run() but use passed context"
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
        self.create_chat_entry(chat_history, "code_generation_by_you", code)
        chat_json["chat_history"] = chat_history
        return chat_json, code

    def do_web_search(self, chat_history):
        grounding_tool = types.Tool(
            google_search=types.GoogleSearch()
        )
        
        # Perform web search to find relevant information
        response_from_web_search = self.client.models.generate_content(
            model=self.model,
            contents= "consider the following chat history for context:\n" +
                      "\n".join([f"{entry['role']}: {entry['response']}" for entry in chat_history]) +
                      "You are tasked to Generate code using javascript excel add-in api" +
                      "Use web search to find relevant information and code snippets" ,
            config=types.GenerateContentConfig(
            tools=[grounding_tool]),            
        )
        self.create_chat_entry(chat_history, "web_search", response_from_web_search.text)
        return chat_history

    def _construct_prompt(
        self, 
        chat_history: List[Dict[str, str]]
    ) -> str:
        """Construct an effective prompt for code generation."""
        
        prompt = f"Consider the following chat history for context:\n"
        for entry in chat_history:
            prompt += f"{entry['role']}: {entry['response']}\n"
        prompt += f"\n\n Generate code using javascript excel add-in api"        
        prompt += f"\n\n Now, generate only the code that meets the requirement."
        return prompt

    def create_chat_entry(self, chat_history, role, message):
        return chat_history.append({
        "id": len(chat_history) + 1,  # simple id based on the current history size
        "timestamp": datetime.datetime.now().isoformat(),
        "role": role,
        "response": message})