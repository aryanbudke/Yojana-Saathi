import { z } from 'zod';
export const profileSchema=z.object({
  age:z.number().int().min(0).max(120).nullable(),state_code:z.string().regex(/^[A-Z]{2}$/).nullable(),occupation:z.string().min(1).max(120).nullable(),
  family_income_inr:z.number().int().min(0).max(1_000_000_000).nullable(),land_area_acres:z.number().min(0).max(1_000_000).nullable(),land_registration:z.enum(['yes','no','not_sure']).nullable(),
  category:z.string().min(1).max(80).nullable(),social_category:z.string().min(1).max(80).nullable(),gender:z.string().min(1).max(40).nullable(),has_disability:z.boolean().nullable(),is_student:z.boolean().nullable(),
});
export type ProfileFacts=z.infer<typeof profileSchema>;
export type ProfileField=keyof ProfileFacts;
export type FactOrigin='user'|'model_extracted'|'imported';
export const blankFacts:ProfileFacts={age:null,state_code:null,occupation:null,family_income_inr:null,land_area_acres:null,land_registration:null,category:null,social_category:null,gender:null,has_disability:null,is_student:null};
const uuid=z.uuid();const date=z.iso.datetime({offset:true});const https=z.url().refine(s=>s.startsWith('https://'));
export const sourceSchema=z.object({id:uuid,title:z.string(),official_url:https,checked_at:date,document_date:z.string().nullable().optional(),excerpt_locator:z.string()});
export const schemeSchema=z.object({id:uuid,slug:z.string(),name:z.string(),government_level:z.enum(['central','state']),state_code:z.string().nullable(),category:z.string(),status:z.enum(['active','closed','unknown']),scheme_version_id:uuid,summary:z.string(),review_status:z.enum(['draft','verified','stale','rejected']),last_verified_at:date,official_sources:z.array(sourceSchema).min(1)});
export const schemeListSchema=z.object({items:z.array(schemeSchema),next_cursor:z.string().nullable()});
export const detailSchema=schemeSchema.extend({benefit_text:z.string(),eligibility_rules:z.array(z.object({rule_key:z.string(),explanation:z.string(),severity:z.enum(['required','exclusion','manual_review']),source:sourceSchema})),required_documents:z.array(z.object({name:z.string(),when_required:z.record(z.string(),z.unknown()).nullable(),source:sourceSchema})),application_steps:z.array(z.object({step_number:z.number().int().positive(),instruction:z.string(),official_url:https.nullable(),source:sourceSchema}))});
export const verdictSchema=z.enum(['all_checked_conditions_met','needs_information','not_eligible','manual_review']);
export const ruleSchema=z.object({rule_key:z.string(),result:z.enum(['pass','fail','unknown','manual_review']),source_id:uuid,reason:z.string(),required_field:z.string().nullable()});
export const matchSchema=z.object({scheme_id:uuid,scheme_name:z.string(),scheme_version_id:uuid,status:verdictSchema,relevance_score:z.number().min(0).max(1),matched_rules:z.array(ruleSchema),failed_rules:z.array(ruleSchema),unknown_rules:z.array(ruleSchema),manual_review_rules:z.array(ruleSchema).default([]),last_verified_at:date,official_source_urls:z.array(https).min(1)});
export const matchesSchema=z.object({run_id:uuid,results:z.array(matchSchema)});
export const questionSchema=z.object({field:z.string().nullable().default(null),question:z.string().nullable(),answer_type:z.enum(['single_choice','number','text']).nullable().default(null),options:z.array(z.string()).default([]),reason:z.string().nullable().default(null)}).refine(q=>q.question===null? q.field===null&&q.answer_type===null&&q.reason===null&&q.options.length===0 : Boolean(q.field&&q.answer_type&&q.reason&&(q.answer_type!=='single_choice'||q.options.length)),{message:'Incomplete question contract'});
export const extractSchema=z.object({facts:profileSchema,unknown_fields:z.array(z.string()),needs_review:z.boolean()});
export const answerSchema=z.object({session_id:uuid,facts:profileSchema,requires_rematch:z.boolean()});
export const sessionSchema=z.object({session_id:uuid,expires_at:date,facts:profileSchema});
export const guidanceSchema=z.object({scheme_id:uuid,scheme_version_id:uuid,scheme_name:z.string(),documents:z.array(z.object({name:z.string(),status:z.enum(['present','missing','unknown','may_be_required']),note:z.string().nullable().optional(),source_id:uuid})),steps:z.array(z.object({step_number:z.number().int().positive(),instruction:z.string(),official_url:https.nullable(),source_id:uuid})),official_application_url:https,unresolved_preconditions:z.array(z.string()),sources:z.array(sourceSchema).min(1),disclaimer:z.string()});
export type SourceReference=z.infer<typeof sourceSchema>;
export type SchemeSummary=z.infer<typeof schemeSchema>;
export type SchemeDetail=z.infer<typeof detailSchema>;
export type SchemeMatch=z.infer<typeof matchSchema>;
export type RuleOutcome=z.infer<typeof ruleSchema>;
export type MatchesResponse=z.infer<typeof matchesSchema>;
export type NextQuestion=z.infer<typeof questionSchema>;
export type Guidance=z.infer<typeof guidanceSchema>;
export type ProfileSession=z.infer<typeof sessionSchema>;
