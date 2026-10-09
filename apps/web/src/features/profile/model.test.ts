import { expect,it } from 'vitest';
import { blankFacts,profileSchema } from '@/lib/api/contracts';
import { fieldValue,mergeExtraction } from './model';
it('keeps citizen corrections, including explicit unknown, over repeat extraction',()=>{const draft={facts:{...blankFacts,age:40,family_income_inr:null},origins:{age:'user' as const,family_income_inr:'user' as const}};const next=mergeExtraction(draft,{...blankFacts,age:24,family_income_inr:90000,state_code:'MH'});expect(next.facts.age).toBe(40);expect(next.facts.family_income_inr).toBe(null);expect(next.facts.state_code).toBe('MH');});
it('does not coerce blank and zero to the same fact',()=>{expect(fieldValue('number','')).toBe(null);expect(fieldValue('number','0')).toBe(0);expect(fieldValue('boolean','no')).toBe(false);expect(fieldValue('choice','not_sure')).toBe('not_sure');});
it('rejects out of range manual entries',()=>{expect(profileSchema.safeParse({...blankFacts,age:121}).success).toBe(false);expect(profileSchema.safeParse({...blankFacts,age:24,family_income_inr:0}).success).toBe(true);});
