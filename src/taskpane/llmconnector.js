export function makeLlmCall(chat_json) {
  let endReached = false;

  // Await the API call and handle its response if needed
  //api_call();

  // Load the script and wait for it to finish loading
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = './output.js';

    script.onload = () => {
      llm_action(); // Call your function after script loads
      resolve();
    };

    script.onerror = () => {
      console.error(`Failed to load script: ${script.src}`);
      reject(new Error(`Script load error: ${script.src}`));
    };

    document.head.appendChild(script);
  });
  return chat_json;

  
}