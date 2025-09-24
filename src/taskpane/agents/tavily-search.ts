import { TavilySearch } from "@langchain/tavily";
import { ToolNode } from "@langchain/langgraph/prebuilt";
const groqModule = require('@langchain/groq');
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph/web";

export class TavilySearchAgent {
    tools = [new TavilySearch({ maxResults: 3,
        tavilyApiKey:'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'
     })]
    toolNode = new ToolNode(this.tools);
    model: any;
    app: any;
    currentState: any;

    constructor(model: any = null) {
        this.model = model;
        if (this.model == null) {
            this.model = new groqModule.ChatGroq({
                                model: "llama-3.1-8b-instant", // or any other supported model
                                temperature: 0.2,
                                apiKey:'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' // or pass directly as a string
                                });
        }
        this.model = this.model.bindTools(this.tools);

        // Bind callModel to this instance
        this.callModel = this.callModel.bind(this);
        const workflow = new StateGraph(MessagesAnnotation)
                                .addNode("agent", this.callModel)
                                .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
                                .addNode("tools", this.toolNode)
                                .addEdge("tools", "agent")
                                .addConditionalEdges("agent", this.shouldContinue);
        this.app = workflow.compile();
    }

    private shouldContinue({ messages }: typeof MessagesAnnotation.State) {
        const lastMessage = messages[messages.length - 1] as AIMessage;
        // If the LLM makes a tool call, then we route to the "tools" node
        if (lastMessage.tool_calls?.length) {
            return "tools";
        }
        // Otherwise, we stop (reply to the user) using the special "__end__" node
        return "__end__";
    }

    private async callModel(state: typeof MessagesAnnotation.State) {
        const response = await this.model.invoke(state.messages);
        // We return a list, because this will get added to the existing list
        return { messages: [response] };
    }

    public async run(humanInput: string,
                     systemInput: string = "You are a helpful AI assistant that helps people find information."
    ) {
        this.currentState = await this.app.invoke({ messages: [new SystemMessage(systemInput), new HumanMessage(humanInput)] });
        return this.currentState.messages[this.currentState.messages.length - 1].content;
    }
}
// Example usage:
// const searchAgent = new TavilySearchAgent();
// (async () => {
//     console.log(await searchAgent.run("How to change of column using excel add in?"))
// })();