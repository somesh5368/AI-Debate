import { StateGraph, START, END } from '@langchain/langgraph';
import { DebateState } from './state.js';
import { geminiNode } from './nodes/geminiNode.js';
import { chatgptNode } from './nodes/chatgptNode.js';
import { groqNode } from './nodes/groqNode.js';
import { claudeNode } from './nodes/claudeNode.js';
import { judgeNode } from './nodes/judgeNode.js';

/**
 * 4-LLM Multi-Model Ensemble StateGraph.
 *
 * Topology:
 *                        START
 *             /        /       \        \
 *     geminiNode chatgptNode groqNode claudeNode (4-way parallel fan-out)
 *             \        \       /        /
 *                     judgeNode                 (fan-in synthesizer)
 *                         |
 *                        END
 */
export const createDebateGraph = (customNodes = {}) => {
  const gNode = customNodes.geminiNode || geminiNode;
  const gptNode = customNodes.chatgptNode || chatgptNode;
  const grqNode = customNodes.groqNode || groqNode;
  const cNode = customNodes.claudeNode || claudeNode;
  const jNode = customNodes.judgeNode || judgeNode;

  const graph = new StateGraph(DebateState)
    .addNode('geminiNode', gNode)
    .addNode('chatgptNode', gptNode)
    .addNode('groqNode', grqNode)
    .addNode('claudeNode', cNode)
    .addNode('judgeNode', jNode)
    .addEdge(START, 'geminiNode')
    .addEdge(START, 'chatgptNode')
    .addEdge(START, 'groqNode')
    .addEdge(START, 'claudeNode')
    .addEdge('geminiNode', 'judgeNode')
    .addEdge('chatgptNode', 'judgeNode')
    .addEdge('groqNode', 'judgeNode')
    .addEdge('claudeNode', 'judgeNode')
    .addEdge('judgeNode', END);

  return graph.compile();
};

export const debateGraph = createDebateGraph();
