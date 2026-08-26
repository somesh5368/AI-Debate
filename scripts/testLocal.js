import { debateGraph } from '../src/graph/debateGraph.js';
import { formatDebugDebateResponse } from '../src/services/formatter.js';

const sampleTopics = [
  'Which car is better, Tata car or Mahindra car?',
  'Should I accept a job offer at an early-stage startup vs a large tech enterprise?',
  'Should I learn Rust vs Go in 2026?',
];

async function runLocalTest() {
  const customTopic = process.argv[2];
  const topicToTest = customTopic || sampleTopics[0];

  console.log(`\n🚀 Running Multi-Model Graph Local Test for: "${topicToTest}"...\n`);

  try {
    const startTime = Date.now();
    const finalState = await debateGraph.invoke({ topic: topicToTest });
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(formatDebugDebateResponse(finalState));
    console.log(`\n✅ Graph execution completed cleanly in ${duration}s.\n`);
  } catch (error) {
    console.error('❌ Error executing debate graph:', error);
  }
}

runLocalTest();
