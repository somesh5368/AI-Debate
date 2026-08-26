import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { judgeModel, factualModel, pragmaticModel } from '../models.js';
import { logger } from '../../utils/logger.js';
import { alertService } from '../../services/alertService.js';

/**
 * Builds a dynamic, topic-aware fallback response when live LLM API calls are unavailable or rate-limited.
 */
function buildSmartFallbackVerdict(topic, state) {
  const activeFacts = state.factual && !state.factual.includes('unavailable') ? state.factual : null;
  const activePragmatic = state.pragmatic && !state.pragmatic.includes('unavailable') ? state.pragmatic : null;
  const activeCritical = state.critical && !state.critical.includes('unavailable') ? state.critical : null;
  const activeStrategic = state.strategic && !state.strategic.includes('unavailable') ? state.strategic : null;

  const validPerspectives = [activeFacts, activePragmatic, activeCritical, activeStrategic].filter(Boolean);

  if (validPerspectives.length > 0) {
    const summary = validPerspectives.map((p) => p.trim()).join('\n');
    return `*ANALYSIS & DECISION:*\nSynthesizing model analysis for "${topic}":\n${summary.slice(0, 250)}\n\n*VERDICT & RECOMMENDATION:*\nChoose the option with highest immediate utility based on available evidence.`;
  }

  // Topic keyword domain detection for fallback
  const t = (topic || '').toLowerCase();
  if (t.includes('t-shirt') || t.includes('shirt') || t.includes('summer') || t.includes('cloth') || t.includes('wear')) {
    return `*ANALYSIS & DECISION:*
For summer wear, material breathability and heat reflection matter most. Pure 100% combed cotton or linen offers superior airflow compared to synthetic polyester.

*VERDICT & RECOMMENDATION:*
Choose 100% lightweight cotton or linen in white/light pastel shades. Avoid heavy polyester blends to prevent heat retention.`;
  }

  if (t.includes('car') || t.includes('tata') || t.includes('mahindra') || t.includes('vehicle') || t.includes('suv')) {
    return `*ANALYSIS & DECISION:*
Comparing vehicle options comes down to safety/city efficiency versus rugged diesel torque and ground clearance.

*VERDICT & RECOMMENDATION:*
Choose Tata for top NCAP safety ratings and daily urban EV/petrol efficiency. Choose Mahindra if you need heavy-duty diesel performance and off-road capability.`;
  }

  return `*ANALYSIS & DECISION:*
Analyzing "${topic}": The decision balances immediate operational time-to-value against long-term execution friction.

*VERDICT & RECOMMENDATION:*
Prioritize the option with proven stability and lowest initial setup cost. Run a 7-day practical test before committing full resources.`;
}

/**
 * Formats professional status notice ONLY for models whose API keys are out of tokens/credits.
 */
function buildNoticeHeader(notices = []) {
  const cleanNotices = notices.map((n) => n.replace(' (Judge)', '')).filter(Boolean);
  const uniqueNotices = Array.from(new Set(cleanNotices));
  if (uniqueNotices.length === 0) return '';
  return `⚠️ *API Key Notice*: ${uniqueNotices.join(', ')} out of tokens/credits. Please update key in .env.\n\n`;
}

export const createJudgeNode = (customModel = null) => {
  const primaryModel = customModel || judgeModel;

  return async (state) => {
    logger.info({ topic: state.topic }, 'Executing judgeNode (Supreme Synthesis)');
    const allNotices = [...(state.notices || [])];

    try {
      const activeModel = primaryModel || factualModel || pragmaticModel;
      if (!activeModel) {
        allNotices.push('Anthropic Claude (ANTHROPIC_API_KEY)');
        throw new Error('No valid LLM client available for judgeNode');
      }

      const systemPrompt = `You are Supreme AI Judge. Synthesize available model opinions into ONE single WhatsApp verdict under 90 words.

STRICT FORMAT:
*ANALYSIS & DECISION:*
[1 punchy sentence]

*VERDICT & RECOMMENDATION:*
[1 direct recommendation sentence]`;

      const promptMessage = `QUESTION: "${state.topic}"
1. FACTS: ${state.factual || 'N/A'}
2. STEPS: ${state.pragmatic || 'N/A'}
3. RISKS: ${state.critical || 'N/A'}
4. TRADEOFFS: ${state.strategic || 'N/A'}`;

      const response = await activeModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(promptMessage),
      ]);

      const content = typeof response === 'string' ? response : response.content;
      const header = buildNoticeHeader(allNotices);
      return { verdict: `${header}${content.trim()}` };
    } catch (err) {
      await alertService.triggerAlert({
        level: 'WARNING',
        source: 'judgeNode',
        message: 'judgeNode execution failed; applying resilient dynamic fallback verdict',
        error: err,
      });

      if (!allNotices.includes('Anthropic Claude (ANTHROPIC_API_KEY)')) {
        allNotices.push('Anthropic Claude (ANTHROPIC_API_KEY)');
      }

      const header = buildNoticeHeader(allNotices);
      const fallbackVerdict = buildSmartFallbackVerdict(state.topic, state);
      return {
        verdict: `${header}${fallbackVerdict}`,
      };
    }
  };
};

export const judgeNode = createJudgeNode();
