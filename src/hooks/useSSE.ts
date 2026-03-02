import type { ThoughtItem, ApiMessage } from '@/types/deep-research';

const API_URL = 'https://apiv2.wahezu.cn/ai/deep_search/chat';
const USE_MOCK = true;

function generateKey(): string {
  return `${crypto.randomUUID()}-1`;
}

export interface SSECallbacks {
  onThought: (thought: ThoughtItem) => void;
  onContent: (chunk: string) => void;
  onComplete: (messageId?: string) => void;
  onError: (error: string) => void;
}

export interface SendParams {
  chat_id: number;
  model: string;
  is_deep_search: boolean;
  is_edit_plan: boolean;
  deep_search_step?: number;
  report_style?: number;
  language?: string;
}

// ---- Mock Data ----

const MOCK_PLAN_EVENTS = [
  { event: 'thinking', data: { status: 'analyzing' }, delay: 400 },
  { event: 'thinking', data: { status: '正在分析您的研究主题...' }, delay: 800 },
  { event: 'searching', data: { query: '深度研究主题分析', step: 1 }, delay: 600 },
  { event: 'searching', data: { query: '相关领域文献综述', step: 2 }, delay: 700 },
  { event: 'search_result', data: { result: '找到 12 篇相关文献和 5 个权威数据源' }, delay: 500 },
  { event: 'planning', data: { status: '正在生成研究计划...' }, delay: 600 },
  { event: 'content', data: { text: '## 研究调研计划\n\n' }, delay: 100 },
  { event: 'content', data: { text: '### 1. 背景与现状分析\n' }, delay: 80 },
  { event: 'content', data: { text: '深入调研该领域的发展历程、当前市场规模和主要参与者，' }, delay: 60 },
  { event: 'content', data: { text: '分析行业的核心驱动因素和关键趋势。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 2. 核心技术与方法论\n' }, delay: 80 },
  { event: 'content', data: { text: '系统梳理相关技术栈的演进路线，对比主流技术方案的' }, delay: 60 },
  { event: 'content', data: { text: '优劣势，评估技术成熟度和应用前景。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 3. 竞品与案例研究\n' }, delay: 80 },
  { event: 'content', data: { text: '选取 3-5 个代表性案例进行深度分析，' }, delay: 60 },
  { event: 'content', data: { text: '提炼成功要素和可借鉴的经验模式。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 4. 挑战与风险评估\n' }, delay: 80 },
  { event: 'content', data: { text: '识别当前面临的主要挑战，包括技术瓶颈、' }, delay: 60 },
  { event: 'content', data: { text: '政策法规约束和市场竞争风险，并提出应对策略。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 5. 趋势预测与建议\n' }, delay: 80 },
  { event: 'content', data: { text: '基于数据分析和专家观点，对未来 3-5 年的' }, delay: 60 },
  { event: 'content', data: { text: '发展趋势进行预测，并给出可执行的战略建议。\n' }, delay: 60 },
  { event: 'user_message', data: { message_id: 'mock-plan-001', file_size_bytes: 2048 }, delay: 200 },
];

const MOCK_RESEARCH_EVENTS = [
  { event: 'thinking', data: { status: '开始执行深度研究...' }, delay: 500 },
  { event: 'searching', data: { query: '背景与现状分析', step: 1 }, delay: 800 },
  { event: 'search_result', data: { result: '已检索到 8 篇核心文献' }, delay: 400 },
  { event: 'searching', data: { query: '技术方案对比分析', step: 2 }, delay: 700 },
  { event: 'search_result', data: { result: '已获取 15 个技术评测报告' }, delay: 400 },
  { event: 'writing', data: { status: '正在撰写研究报告...' }, delay: 600 },
  { event: 'searching', data: { query: '行业案例数据', step: 3 }, delay: 600 },
  { event: 'search_result', data: { result: '找到 5 个深度案例' }, delay: 300 },
  { event: 'writing', data: { status: '整合分析结果...' }, delay: 400 },
  { event: 'content', data: { text: '# 深度研究报告\n\n' }, delay: 120 },
  { event: 'content', data: { text: '## 摘要\n\n' }, delay: 80 },
  { event: 'content', data: { text: '本报告基于对多个权威数据源的系统分析，' }, delay: 50 },
  { event: 'content', data: { text: '深入探讨了该领域的现状、技术发展和未来趋势。' }, delay: 50 },
  { event: 'content', data: { text: '研究覆盖了 **12 篇核心文献**、**5 个行业案例** 和 **15 份技术评测报告**。\n\n' }, delay: 50 },
  { event: 'content', data: { text: '---\n\n## 1. 背景与现状分析\n\n' }, delay: 80 },
  { event: 'content', data: { text: '### 1.1 发展历程\n\n' }, delay: 60 },
  { event: 'content', data: { text: '该领域的发展可以追溯到 20 世纪末期，经历了以下几个关键阶段：\n\n' }, delay: 50 },
  { event: 'content', data: { text: '1. **萌芽期（1990-2005）**：基础理论框架的建立和初步技术验证\n' }, delay: 50 },
  { event: 'content', data: { text: '2. **成长期（2005-2015）**：核心技术突破，商业化应用开始出现\n' }, delay: 50 },
  { event: 'content', data: { text: '3. **爆发期（2015-至今）**：AI 和大数据技术驱动行业快速迭代\n\n' }, delay: 50 },
  { event: 'content', data: { text: '### 1.2 市场规模\n\n' }, delay: 60 },
  { event: 'content', data: { text: '根据最新市场研究数据，2024 年全球市场规模已达到 **$450 亿美元**，' }, delay: 50 },
  { event: 'content', data: { text: '预计到 2028 年将突破 **$1,200 亿美元**，年复合增长率约 **27.8%**。\n\n' }, delay: 50 },
  { event: 'content', data: { text: '| 年份 | 市场规模 (亿美元) | 增长率 |\n' }, delay: 40 },
  { event: 'content', data: { text: '|------|------------------|--------|\n' }, delay: 30 },
  { event: 'content', data: { text: '| 2022 | 280 | 22.3% |\n' }, delay: 30 },
  { event: 'content', data: { text: '| 2023 | 350 | 25.0% |\n' }, delay: 30 },
  { event: 'content', data: { text: '| 2024 | 450 | 28.6% |\n' }, delay: 30 },
  { event: 'content', data: { text: '| 2025E | 580 | 28.9% |\n\n' }, delay: 30 },
  { event: 'content', data: { text: '---\n\n## 2. 核心技术与方法论\n\n' }, delay: 80 },
  { event: 'content', data: { text: '### 2.1 技术架构对比\n\n' }, delay: 60 },
  { event: 'content', data: { text: '当前主流技术方案可分为三大类：\n\n' }, delay: 50 },
  { event: 'content', data: { text: '- **方案 A — 端到端模型**：优势在于部署简单、推理速度快，但可解释性较差\n' }, delay: 50 },
  { event: 'content', data: { text: '- **方案 B — 混合架构**：结合了规则引擎与深度学习，在精度和可控性间取得平衡\n' }, delay: 50 },
  { event: 'content', data: { text: '- **方案 C — 多智能体系统**：适用于复杂场景，但资源消耗大、调优成本高\n\n' }, delay: 50 },
  { event: 'content', data: { text: '> 💡 **关键发现**：方案 B 在企业级应用中采用率最高（约 **58%**），' }, delay: 50 },
  { event: 'content', data: { text: '主要得益于其在安全性和性能之间的优秀平衡。\n\n' }, delay: 50 },
  { event: 'content', data: { text: '---\n\n## 3. 竞品与案例研究\n\n' }, delay: 80 },
  { event: 'content', data: { text: '### 案例一：TechCorp 智能平台\n\n' }, delay: 60 },
  { event: 'content', data: { text: '通过引入多模态融合技术，TechCorp 在 6 个月内将用户留存率提升了 **34%**，' }, delay: 50 },
  { event: 'content', data: { text: '日活跃用户增长 **120%**。其成功关键在于：\n\n' }, delay: 50 },
  { event: 'content', data: { text: '- 精准的用户画像构建\n- 实时个性化推荐引擎\n- 无缝的跨端体验设计\n\n' }, delay: 50 },
  { event: 'content', data: { text: '---\n\n## 4. 挑战与风险\n\n' }, delay: 80 },
  { event: 'content', data: { text: '- ⚠️ **数据隐私合规**：GDPR 和各国数据保护法规趋严\n' }, delay: 50 },
  { event: 'content', data: { text: '- ⚠️ **算力成本**：大规模模型训练和推理的基础设施投入持续增长\n' }, delay: 50 },
  { event: 'content', data: { text: '- ⚠️ **人才缺口**：高端复合型人才供给不足\n\n' }, delay: 50 },
  { event: 'content', data: { text: '---\n\n## 5. 趋势预测与建议\n\n' }, delay: 80 },
  { event: 'content', data: { text: '1. **短期（1-2年）**：聚焦场景化落地，优先在高 ROI 业务中验证价值\n' }, delay: 50 },
  { event: 'content', data: { text: '2. **中期（2-3年）**：构建平台化能力，实现技术资产的复用和沉淀\n' }, delay: 50 },
  { event: 'content', data: { text: '3. **长期（3-5年）**：探索生态协同，建立行业标准和开放合作机制\n\n' }, delay: 50 },
  { event: 'content', data: { text: '---\n\n*本报告由 DeepFlowChat 深度研究引擎自动生成，数据截止日期：2026年3月。*\n' }, delay: 80 },
  { event: 'user_message', data: { message_id: 'mock-report-001', file_size_bytes: 10240 }, delay: 300 },
];

const MOCK_EDIT_PLAN_EVENTS = [
  { event: 'thinking', data: { status: '正在根据您的修改重新规划...' }, delay: 500 },
  { event: 'planning', data: { status: '调整研究计划中...' }, delay: 600 },
  { event: 'content', data: { text: '## 修订后的研究计划\n\n' }, delay: 100 },
  { event: 'content', data: { text: '### 1. 核心问题重新定义\n' }, delay: 80 },
  { event: 'content', data: { text: '根据您的反馈，我们已调整研究重心，聚焦于更具针对性的方向。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 2. 数据收集策略优化\n' }, delay: 80 },
  { event: 'content', data: { text: '增加一手调研数据的比重，结合问卷调查和专家访谈。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 3. 深度案例分析\n' }, delay: 80 },
  { event: 'content', data: { text: '选取用户指定的重点案例进行全方位剖析。\n\n' }, delay: 60 },
  { event: 'content', data: { text: '### 4. 可行性方案设计\n' }, delay: 80 },
  { event: 'content', data: { text: '基于分析结论，输出可直接落地的执行方案和路线图。\n' }, delay: 60 },
  { event: 'user_message', data: { message_id: 'mock-edit-001', file_size_bytes: 1024 }, delay: 200 },
];

// ---- Core stream runner ----

function parseThought(event: string, data: any): ThoughtItem | null {
  const thoughtTypes = ['thinking', 'searching', 'search_result', 'planning', 'writing'];
  if (!thoughtTypes.includes(event)) return null;
  return {
    id: `${event}-${Date.now()}-${Math.random()}`,
    type: event as ThoughtItem['type'],
    content: data.text || data.content || data.query || data.result || data.status || JSON.stringify(data),
    timestamp: Date.now(),
  };
}

async function runMockSSE(
  events: typeof MOCK_PLAN_EVENTS,
  cb: SSECallbacks,
  signal: AbortSignal,
) {
  for (const evt of events) {
    if (signal.aborted) return;
    await new Promise(r => setTimeout(r, evt.delay));
    if (signal.aborted) return;

    const thought = parseThought(evt.event, evt.data);
    if (thought) {
      cb.onThought(thought);
    } else if (evt.event === 'content') {
      cb.onContent((evt.data as any).text || '');
    } else if (evt.event === 'user_message') {
      cb.onComplete((evt.data as any).message_id);
    }
  }
}

async function runRealSSE(
  messages: ApiMessage[],
  params: SendParams,
  cb: SSECallbacks,
  signal: AbortSignal,
) {
  const body = { ...params, messages, key: generateKey() };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': 'e9QyzZfgMk43Re2tsgwGzFWFHGv3P94g',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json') && !contentType.includes('stream')) {
    const json = await res.json();
    if (json.code && json.code !== 200 && json.code !== 0) {
      throw new Error(json.message || json.error || `API Error ${json.code}`);
    }
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No readable stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim();
        if (!dataStr) continue;
        try {
          const data = JSON.parse(dataStr);
          if (currentEvent === 'error') {
            cb.onError(data.message || data.error || 'Unknown error');
            return;
          }
          const thought = parseThought(currentEvent, data);
          if (thought) {
            cb.onThought(thought);
          } else if (currentEvent === 'content') {
            cb.onContent(data.text || data.content || '');
          } else if (currentEvent === 'user_message') {
            cb.onComplete(data.message_id);
          }
        } catch { /* skip */ }
        currentEvent = '';
      }
    }
  }
  cb.onComplete();
}

// ---- Public API: startStream ----
// Each call is independent. Returns an abort function.

export function startStream(
  messages: ApiMessage[],
  params: SendParams,
  callbacks: SSECallbacks,
): () => void {
  const controller = new AbortController();

  const run = async () => {
    try {
      if (USE_MOCK) {
        let events = MOCK_PLAN_EVENTS;
        if (params.is_deep_search) events = MOCK_RESEARCH_EVENTS;
        else if (params.is_edit_plan) events = MOCK_EDIT_PLAN_EVENTS;
        await runMockSSE(events, callbacks, controller.signal);
      } else {
        await runRealSSE(messages, params, callbacks, controller.signal);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        callbacks.onError(err.message || 'Stream failed');
      }
    }
  };

  run();

  return () => controller.abort();
}
