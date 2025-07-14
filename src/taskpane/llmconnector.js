export async function makeLlmCall(chat_json) {
  let endReached = false;
  while (!endReached) {
    try {
      const response = await fetch("http://127.0.0.1:5000/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chat_json),
      });

      chat_json = await response.json(); // Be sure to parse the response

      await loadScriptAsync('./output.js');

      if (typeof llm_action === "function") {
        try {
          await llm_action(); // Assuming llm_action returns a Promise or you control when it's done
          endReached = true;
        } catch (error) {
          console.error("Error executing llm_action:", error);
          chat_json = addChatHistoryEntry(chat_json, "code_execution_error", error.message);
        }
      } else {
        console.error("llm_action is not defined!");
      }

    } catch (error) {
      console.error("Error in makeLlmCall:", error);
      chat_json = addChatHistoryEntry(chat_json, "api_error", error.message);
      endReached = true;
    }
  }

  return chat_json;
}

function loadScriptAsync(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// export async function makeLlmCall(chat_json) {

//   while (!endReached) {
//     chat_json = await fetch("http://127.0.0.1:5000/api", {
//       method: "POST", // HTTP method
//       headers: {
//         "Content-Type": "application/json", // Specify JSON content
//       },
//       body: JSON.stringify(chat_json), // Convert JavaScript object to JSON string
//     });

//     try {
//       await loadScript('./output.js', function() {
//       if (typeof llm_action === "function") {
//         try {
//           llm_action();
//           endReached = true; // Set endReached to true to exit the loop
//         }
//         catch (error) {
//           console.error("Error executing llm_action:", error);
//           chat_json = addChatHistoryEntry(chat_json, "code_execution_error", error.message);
//         }
//       }else {
//           console.error("llm_action is not defined!");
//       }});
//     }
//     catch (error) {
//       console.error("Error in makeLlmCall:", error);
//       chat_json = addChatHistoryEntry(chat_json, "api_error", error.message);
//       endReached = true; // Exit the loop on error
//     }
    
//   }
//   return chat_json;
// } 

export function addChatHistoryEntry(chat_json, role, response) {
  chat_json.chat_history.push({
    id: chat_json.chat_history.length + 1,
    timestamp: new Date().toISOString(),
    role: role,
    response: response
  });
  return chat_json;
}

// function loadScript(file, callback) {
//   const script = document.createElement('script');
//   script.src = file + '?cachebust=' + Date.now();
//   script.onload = callback;
//   script.onerror = () => console.error('Failed to load script:', file);
//   document.head.appendChild(script);
// }