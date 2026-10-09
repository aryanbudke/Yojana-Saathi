import type { SchemeMatch } from '@/lib/api/contracts';
export const verdictLabels:Record<SchemeMatch['status'],{text:string;tone:string}>={all_checked_conditions_met:{text:'All checked conditions met',tone:'success'},needs_information:{text:'Needs verification',tone:'warning'},not_eligible:{text:'Not eligible',tone:'danger'},manual_review:{text:'Manual review',tone:'info'}};
export const ruleLabels={pass:'Pass',fail:'Fail',unknown:'Unknown',manual_review:'Manual review'} as const;
