'use client';
import { useEffect,useState } from 'react';
import { errorMessage } from './client';
export function useResource<T>(load:()=>Promise<T>){
  const [state,setState]=useState<{data:T|null;error:string;loading:boolean}>({data:null,error:'',loading:true});
  const [retryKey,setRetryKey]=useState(0);
  useEffect(()=>{let active=true;void Promise.resolve().then(async()=>{if(!active)return;setState({data:null,error:'',loading:true});try{const data=await load();if(active)setState({data,error:'',loading:false});}catch(e){if(active)setState({data:null,error:errorMessage(e),loading:false});}});return()=>{active=false;};},[load,retryKey]);
  return {...state,retry:()=>setRetryKey(k=>k+1)};
}
