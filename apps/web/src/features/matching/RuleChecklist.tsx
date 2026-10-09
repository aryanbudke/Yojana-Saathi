import { Check,Minus,HelpCircle,FileQuestion } from 'lucide-react';
import { SourceLink } from '@/components/ui';
import type { RuleOutcome,SourceReference } from '@/lib/api/contracts';
import { ruleLabels } from './types';
const icons={pass:Check,fail:Minus,unknown:HelpCircle,manual_review:FileQuestion};
export function RuleChecklist({rules,sources=[]}:{rules:RuleOutcome[];sources?:SourceReference[]}){return <ul className="rule-list">{rules.map(rule=>{const Icon=icons[rule.result];const source=sources.find(s=>s.id===rule.source_id);return <li key={rule.rule_key} className={`rule-row ${rule.result}`}><span className="rule-icon"><Icon size={15} aria-hidden="true"/></span><div><strong>{ruleLabels[rule.result]}</strong><p>{rule.reason}</p>{source?<><SourceLink url={source.official_url}>{source.title}</SourceLink><span className="citation-locator">{source.excerpt_locator}</span></>:<span className="source-unavailable">Source reference unavailable · {rule.source_id}</span>}</div></li>;})}</ul>;}
