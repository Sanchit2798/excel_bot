export const code_generation_system_prompt = 'You are tasked to generate code as part of javascript api, excel add in to acheive the given tasks in excel'+
'Generate code without explanations and comments'+
'Generate code as one single function.'+
'Example output expected - async function llm_action(console.log("Hi");) {}.' +
'Remember to use Excel.run inside the function you generate, if needed'+
'the function should not take any arguments'+
'For acheiving the specification, use the javascript excel add in api to reflect changes in the excel worksheet'+
'Try to use excel formulas or excel funcationality whereever you can'+
'The user should be able to see the changes in excel workbook'+
'The code you generate will be executed inside a tyepscipt react excel add in environment'

export const code_extract_prompt = `You will be given a string that may contain code wrapped in triple quotes and prefixed with a language identifier (e.g., '''javascript ...'''). 
Your task is to extract the valid code portion and wrap it between <code></code>.

Instructions:
- Extract only the valid code that can run independently as a function.
- Remove any language identifiers like \`javascript\`, \`python\`, etc.
- Do not modify the code. Do not change the code itself at all.
- Wrap the final code with <code> markers like this: <code> your_code_here </code>
- Return the extracted code wrapped between markers and nothing else. No other text or explaination please.
- No explaination or other response.

Example:
Input from user: '''javascript async function llm_action(){console.log('Hi');}'''
Output by you: <code> async function llm_action(){console.log('Hi');} </code>`;
