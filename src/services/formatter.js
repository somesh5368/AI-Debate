import twilio from 'twilio';

const MessagingResponse = twilio.twiml.MessagingResponse;

/**
 * Formats state verdict for WhatsApp production delivery.
 * Only the judge's verdict is sent to the user.
 *
 * @param {Object} state
 * @param {string} state.verdict
 * @returns {string} Formatted WhatsApp message text
 */
export const formatDebateResponse = (state) => {
  const verdictText = state?.verdict ? state.verdict.trim() : 'No verdict generated.';

  // Truncate safely if exceeding WhatsApp limits (~1500 chars)
  if (verdictText.length > 1500) {
    return verdictText.slice(0, 1490) + '\n\n...[Truncated]';
  }

  return verdictText;
};

/**
 * Debug Formatter for CLI testing & server logging.
 * Displays all 4 raw node outputs alongside the final verdict.
 *
 * @param {Object} state
 * @returns {string} Formatted multi-perspective debug view
 */
export const formatDebugDebateResponse = (state) => {
  const { topic, factual, pragmatic, critical, strategic, verdict } = state;

  return `================================================
⚡ MULTI-MODEL DEBATE DEBUG TRACE
================================================
❓ TOPIC / QUESTION:
"${topic}"

------------------------------------------------
🤖 1. GEMINI (Factual Facts & Specs):
${factual ? factual.trim() : 'N/A'}

------------------------------------------------
💡 2. OPENAI (Pragmatic Execution):
${pragmatic ? pragmatic.trim() : 'N/A'}

------------------------------------------------
🔥 3. GROQ (Critical Risk & Downsides):
${critical ? critical.trim() : 'N/A'}

------------------------------------------------
🧠 4. CLAUDE (Strategic Tradeoffs & Positioning):
${strategic ? strategic.trim() : 'N/A'}

================================================
🏛️ FINAL WHATSAPP VERDICT (SENT TO USER):
${verdict ? verdict.trim() : 'N/A'}
================================================`;
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
