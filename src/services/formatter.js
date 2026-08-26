import twilio from 'twilio';

const MessagingResponse = twilio.twiml.MessagingResponse;

/**
 * Formats multi-model debate state into an impressive, premium WhatsApp template.
 *
 * @param {Object} state
 * @param {string} state.topic
 * @param {string} state.geminiOpinion
 * @param {string} state.chatgptOpinion
 * @param {string} state.groqOpinion
 * @param {string} state.claudeOpinion
 * @param {string} state.finalVerdict
 * @returns {string} Formatted WhatsApp message text
 */
export const formatDebateResponse = (state) => {
  const {
    topic,
    geminiOpinion,
    chatgptOpinion,
    groqOpinion,
    claudeOpinion,
    finalVerdict,
  } = state;

  const rawFormatted = `⚡ *MULTI-MODEL AI DEBATE ARENA* ⚡

❓ *QUESTION / DILEMMA:*
"${topic || 'Your Decision'}"

========================================
🤖 *1. GOOGLE GEMINI (Factual & Precise):*
${geminiOpinion ? geminiOpinion.trim() : 'No response.'}

========================================
💡 *2. CHATGPT (Pragmatic & Structured):*
${chatgptOpinion ? chatgptOpinion.trim() : 'No response.'}

========================================
🔥 *3. GROQ / LLAMA (Critical & Risk):*
${groqOpinion ? groqOpinion.trim() : 'No response.'}

========================================
🧠 *4. ANTHROPIC CLAUDE (Strategic & Nuanced):*
${claudeOpinion ? claudeOpinion.trim() : 'No response.'}

========================================
🏛️ *SUPREME VERDICT & FINAL RECOMMENDATION:*
${finalVerdict ? finalVerdict.trim() : 'No verdict.'}`;

  // Truncate safely if exceeding WhatsApp limits (~1500 chars)
  if (rawFormatted.length > 1500) {
    return rawFormatted.slice(0, 1490) + '\n\n...[Full verdict truncated]';
  }

  return rawFormatted;
};

/**
 * Wraps text response in Twilio TwiML MessagingResponse XML.
 * @param {string} messageText
 * @returns {string} XML string
 */
export const createTwimlResponse = (messageText) => {
  const response = new MessagingResponse();
  response.message(messageText);
  return response.toString();
};
