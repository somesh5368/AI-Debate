import dotenv from 'dotenv';
import { debateGraph } from './debateGraph.js';

dotenv.config();

async function main() {
  const topic =
    process.argv.slice(2).join(' ') || 'Should I learn Java or Python first?';
  console.log('⚡ TOPIC:', topic);
  console.log('Running 4-LLM Multi-Model Debate Graph...\n');

  const result = await debateGraph.invoke({ topic });

  console.log('========================================');
  console.log('🤖 1. GEMINI (Factual):');
  console.log(result.geminiOpinion);
  console.log('\n========================================');
  console.log('💡 2. CHATGPT (Pragmatic):');
  console.log(result.chatgptOpinion);
  console.log('\n========================================');
  console.log('🔥 3. GROQ (Critical):');
  console.log(result.groqOpinion);
  console.log('\n========================================');
  console.log('🧠 4. CLAUDE (Strategic):');
  console.log(result.claudeOpinion);
  console.log('\n========================================');
  console.log('🏛️ SUPREME VERDICT & RECOMMENDATION:');
  console.log(result.finalVerdict);
}

main().catch((err) => {
  console.error('Graph run failed:', err);
  process.exit(1);
});