/** Synthetic response playback only. No extraction or eligibility engine is implemented here. */
import extraction from './fixtures/profile-extract.response.json';
import matches from './fixtures/matches.response.json';
import question from './fixtures/question-next.response.json';
import listing from './fixtures/schemes-list.response.json';
import detail from './fixtures/scheme-detail.response.json';
import guidance from './fixtures/guidance.response.json';
import { answerSchema, blankFacts, detailSchema, extractSchema, guidanceSchema, matchesSchema, questionSchema, schemeListSchema, sessionSchema, type ProfileFacts } from './contracts';
import { ApiError, type Api } from './client';

export function createMockApi(delay=350):Api {
  const sessions=new Map<string,{facts:ProfileFacts;expires_at:string;answered:boolean}>();
  const wait=()=>new Promise(resolve=>setTimeout(resolve,delay));
  function session(id:string){const s=sessions.get(id);if(!s||Date.parse(s.expires_at)<=Date.now())throw new ApiError('SESSION_EXPIRED','Your session has expired.',404);return s;}
  function knownScheme(id:string){if(id!==detail.id)throw new ApiError('NOT_FOUND','Scheme not found.',404);}
  return {
    async extract(){await wait();return extractSchema.parse(structuredClone(extraction));},
    async createSession(){await wait();const session_id=crypto.randomUUID();const expires_at=new Date(Date.now()+86_400_000).toISOString();sessions.set(session_id,{facts:{...blankFacts},expires_at,answered:false});return sessionSchema.parse({session_id,expires_at,facts:blankFacts});},
    async deleteSession(id){await wait();sessions.delete(id);},
    async answer(session_id,field,value){await wait();const s=session(session_id);s.facts={...s.facts,[field]:value};if(field==='land_registration')s.answered=true;return answerSchema.parse({session_id,facts:s.facts,requires_rematch:true});},
    async matches(id){await wait();const s=session(id);const data=matchesSchema.parse(structuredClone(matches));
      // Play predefined yes/no/unknown contract scenarios. Never evaluate citizen eligibility.
      if(s.answered&&s.facts.land_registration==='yes'){const rule={...data.results[0].unknown_rules[0],result:'pass' as const,reason:'Synthetic yes-answer scenario: registration confirmed.'};data.results[0].matched_rules.push(rule);data.results[0].unknown_rules=[];data.results[0].status='all_checked_conditions_met';}
      if(s.answered&&s.facts.land_registration==='no'){data.results[0].failed_rules=[{...data.results[0].unknown_rules[0],result:'fail',reason:'Synthetic no-answer scenario: registration not confirmed.'}];data.results[0].unknown_rules=[];data.results[0].status='not_eligible';}
      data.run_id=crypto.randomUUID();return matchesSchema.parse(data);},
    async nextQuestion(id){await wait();return questionSchema.parse(session(id).answered?{question:null}:question);},
    async schemes(query){await wait();const data=structuredClone(listing);const q=query.get('q')?.toLowerCase();const category=query.get('category');const state=query.get('state_code');if((q&&!`${detail.name} ${detail.summary} ${detail.category}`.toLowerCase().includes(q))||(category&&category!==detail.category)||(state&&detail.state_code!==null&&state!==detail.state_code))data.items=[];return schemeListSchema.parse(data);},
    async detail(id){await wait();knownScheme(id);return detailSchema.parse(detail);},
    async guidance(id,sessionId){await wait();knownScheme(id);if(sessionId)session(sessionId);return guidanceSchema.parse(guidance);},
  };
}
