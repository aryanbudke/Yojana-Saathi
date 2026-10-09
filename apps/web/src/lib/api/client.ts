import { z } from 'zod';
import { answerSchema, detailSchema, extractSchema, guidanceSchema, matchesSchema, profileSchema, questionSchema, schemeListSchema, sessionSchema, type ProfileFacts, type ProfileField } from './contracts';

export class ApiError extends Error {
  constructor(public code:string,message:string,public status=0,public requestId?:string){super(message);this.name='ApiError';}
}
export function errorMessage(error:unknown):string {
  if(error instanceof ApiError){
    if(error.status===429)return 'Too many requests. Please wait a moment, then try again. Your details are still here.';
    if(error.status===404&&error.code==='SESSION_EXPIRED')return 'Your session has expired. Review your details to start a new session.';
    return error.message;
  }
  return 'We couldn’t complete that request. Your details are still here; please try again.';
}
export function createLiveApi(baseUrl:string,fetcher:typeof fetch=fetch){
  async function request<T>(path:string,schema:z.ZodType<T>,body?:unknown,method?:string):Promise<T>{
    if(!baseUrl)throw new ApiError('CONFIGURATION','The API URL is not configured.');
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20_000);
    try {
      const response=await fetcher(`${baseUrl.replace(/\/$/,'')}/api/v1${path}`,{method:method??(body===undefined?'GET':'POST'),headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:controller.signal,cache:'no-store'});
      if(response.status===204)return schema.parse(undefined);
      const data:unknown=await response.json().catch(()=>null);
      if(!response.ok){const e=z.object({error:z.object({code:z.string(),message:z.string(),request_id:z.string().optional()})}).safeParse(data);throw new ApiError(e.success?e.data.error.code:'HTTP_ERROR',response.status>=500?'The service is temporarily unavailable. Try again or enter your details manually.':e.success?e.data.error.message:'The request could not be completed. Check your details and try again.',response.status,e.success?e.data.error.request_id:undefined);}
      const parsed=schema.safeParse(data);if(!parsed.success)throw new ApiError('INVALID_RESPONSE','The service returned an incomplete response. Please try again.');return parsed.data;
    }catch(e){if(e instanceof ApiError)throw e;throw new ApiError('NETWORK_ERROR','We couldn’t reach the service. Check your connection and try again.');}finally{clearTimeout(timer);}
  }
  return {
    extract:(text:string)=>request('/profiles/extract',extractSchema,{text,locale:'en-IN'}),
    createSession:()=>request('/profiles/sessions',sessionSchema,{}),
    deleteSession:(id:string)=>request(`/profiles/sessions/${encodeURIComponent(id)}`,z.undefined(),undefined,'DELETE'),
    answer:(session_id:string,field:ProfileField,value:ProfileFacts[ProfileField])=>request('/profiles/answers',answerSchema,{session_id,field,value}),
    matches:(session_id:string,facts:ProfileFacts)=>request('/matches',matchesSchema,{session_id,facts:profileSchema.parse(facts),limit:5}),
    nextQuestion:(session_id:string,run_id:string)=>request('/questions/next',questionSchema,{session_id,run_id}),
    schemes:(query:URLSearchParams)=>request(`/schemes${query.size?'?'+query.toString():''}`,schemeListSchema),
    detail:(id:string)=>request(`/schemes/${encodeURIComponent(id)}`,detailSchema),
    guidance:(id:string,session_id?:string)=>request(`/guidance/${encodeURIComponent(id)}${session_id?'?session_id='+encodeURIComponent(session_id):''}`,guidanceSchema),
  };
}
export type Api=ReturnType<typeof createLiveApi>;
