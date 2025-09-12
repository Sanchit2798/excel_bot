export function addChatHistoryEntry(chat_json, role, response) {
  chat_json.chatHistory.push({
    id: chat_json.chatHistory.length + 1,
    timestamp: new Date().toISOString(),
    role: role,
    response: response
  });
  return chat_json;
}
