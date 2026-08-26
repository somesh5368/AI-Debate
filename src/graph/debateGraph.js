import { StateGraph, START, END } from '@langchain/langgraph';
import { DebateState } from './state.js';
import { factualNode } from './nodes/factualNode.js';
import { pragmaticNode } from './nodes/pragmaticNode.js';
import { criticalNode } from './nodes/criticalNode.js';
import { strategicNode } from './nodes/strategicNode.js';
import { judgeNode } from './nodes/judgeNode.js';

/**
 * 4-LLM Multi-Model Debate Architecture.
 *
 * Topology:
 *                              START
 *               /          /          \          \
 *      factualNode pragmaticNode criticalNode strategicNode (4-way parallel fan-out)
 *               \          \          /          /
 *                           judgeNode                       (fan-in synthesizer)
 *                               |
 *                              END
 */
export const createDebateGraph = (customNodes = {}) => {
  const fNode = customNodes.factualNode || factualNode;
  const pNode = customNodes.pragmaticNode || pragmaticNode;
  const cNode = customNodes.criticalNode || criticalNode;
  const sNode = customNodes.strategicNode || strategicNode;
  const jNode = customNodes.judgeNode || judgeNode;

  const graph = new StateGraph(DebateState)
    .addNode('factualNode', fNode)
    .addNode('pragmaticNode', pNode)
    .addNode('criticalNode', cNode)
    .addNode('strategicNode', sNode)
    .addNode('judgeNode', jNode)
    .addEdge(START, 'factualNode')
    .addEdge(START, 'pragmaticNode')
    .addEdge(START, 'criticalNode')
    .addEdge(START, 'strategicNode')
    .addEdge('factualNode', 'judgeNode')
    .addEdge('pragmaticNode', 'judgeNode')
    .addEdge('criticalNode', 'judgeNode')
    .addEdge('strategicNode', 'judgeNode')
    .addEdge('judgeNode', END);

  return graph.compile();
};

export const debateGraph = createDebateGraph();
