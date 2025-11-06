import { respondToUserQuery } from "../taskpane/respond-to-query";

jest.mock("../taskpane/agents/agentic-rag", () => {
  return {
    agenticRAG: {
      initialised: false,
      init: jest.fn(),
      run: jest.fn().mockResolvedValue("mocked RAG response"),
    },
  };
});

const generateContentMock = jest
  .fn()
  .mockResolvedValueOnce({ text: "<code>console.log('Hello')</code>" }) // codeResponse
  .mockResolvedValueOnce({ text: "<code>console.log('Hello')</code>" }); // extractedCode

jest.mock("../taskpane/agents/google-gen-ai", () => ({
  getGoogleAi: jest.fn(() => ({
    models: {
      generateContent: generateContentMock,
    },
  })),
}));

jest.mock("../taskpane/agents/google-gen-web-search", () => ({
  googleWebSearch: jest.fn().mockResolvedValue("search result"),
}));

import { agenticRAG } from "../taskpane/agents/agentic-rag";
import { googleWebSearch } from "../taskpane/agents/google-gen-web-search";
import { getGoogleAi } from "../taskpane/agents/google-gen-ai";

describe("respondToUserQuery", () => {
  it("should yield expected messages for a valid user query", async () => {
    const messages = [{ role: "user", content: "color column A blue" }];
    const abortSignal = {} as AbortSignal;

    const generator = respondToUserQuery(messages, abortSignal);

    const results: string[] = [];
    for await (const output of generator) {
      results.push(output);
    }

    expect(results).toEqual([
      "Processing your input...\n",
      "Making web search ...\n",
      "Searching add in docs...\n",
      "Coding...\n",
      "Finalisign code ...\n",
      expect.stringContaining("Running code ...\nGenerated code- \nreturn console.log('Hello')"),
    ]);

    expect(googleWebSearch).toHaveBeenCalled();
    expect(agenticRAG.init).toHaveBeenCalled();
    expect(agenticRAG.run).toHaveBeenCalled();
    expect(getGoogleAi).toHaveBeenCalled(); // function call
    expect(generateContentMock).toHaveBeenCalledTimes(2); // actual model call
  });
});
