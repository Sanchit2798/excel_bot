// import { GoogleGenAI } from "@google/genai";
// import { OPENAI_API_KEY } from "./key.js";
// import fs from "fs";
// // import { dotenv } from "@dotenv";
// // dotenv.config();
// const ai = new GoogleGenAI({ apiKey: OPENAI_API_KEY});

export async function doAction(request) {
    const instruction = {question : request};
    const response = await fetch("http://127.0.0.1:5000/api", {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Specify JSON content
      },
      body: JSON.stringify(instruction), // Convert JavaScript object to JSON string
    });

    // Now dynamically import the generated code
    // try {
    //     const module = await import("./output.js");
    //     if (module.llm_action) {
    //         module.llm_action(); // Run the generated function
    //     } else {
    //         console.error("llm_action not found in output.js");
    //     }
    // } catch (err) {
    //     console.error("Error importing output.js:", err);
    // }
      // requireAjax("./output.js", function() {llm_action();});
    // loadScript('output.js')
    // Load a module dynamically
    // import('.output.js').then((module) => {
    // module.default(); // or call any exported function
    // });
    // secureEval('const module = await import("./output.js");
    //            module.llm_action();');
    // const data = fs.readFileSync('./output.js', 'utf8');
    // console.log(data);
    // secureEval()
    // const module = await import(`./output.js?cachebust=${Date.now()}`);
    // module.llm_action();

    loadScript('./output.js', function() {
    if (typeof llm_action === "function") {
        llm_action();
    } else {
        console.error("llm_action is not defined!");
    }
    });

} 


function loadScript(file, callback) {
  const script = document.createElement('script');
  script.src = file + '?cachebust=' + Date.now();
  script.onload = callback;
  script.onerror = () => console.error('Failed to load script:', file);
  document.head.appendChild(script);
}



// const sandbox = {
//     context: {},
// };

// vm.createContext(sandbox); // Create a new context for isolation

// function secureEval(code) {
//     try {
//         vm.runInContext(code, sandbox);
//     } catch (e) {
//         console.error('Execution error:', e);
//     }
// }

// function loadScript(file) {
//   const newScript = document.createElement('script');
//   newScript.setAttribute('src', file);
//   newScript.setAttribute('async', 'true');

//   newScript.onload = () => {
//     console.log("successfully loaded script:", file);
//     if (typeof llm_action === "function") {
//       llm_action();
//     } else {
//       console.error("llm_action is not defined!");
//     }
//   };

//   newScript.onerror = () => {
//     console.log('error loading script:', file);
//   };

//   document.head.appendChild(newScript);
// }
  // console.log("Request to AI model:", request);
  // const response = await ai.models.generateContent({
  //   model: "gemini-2.0-flash",
  //   contents: request,
  //   responseFormat: "json",
  // });
  // console.log(response.text);
  // eval(response.text); // Evaluate the response text as JavaScript code
// }

// const instruction = `Write code as part of the excel javascript
//  add in to compute the sum of first five rows of column A and 
// place the sum in first row of column B. 
// and highlight the cell with pink color. 
// Try placing formulas rather computed sum. 
// In response just give me javascript code only. 
// Name the function as llm_action and remeber not to export it.  
// Do not give me any other text or explanation`;

// doAction(instruction)