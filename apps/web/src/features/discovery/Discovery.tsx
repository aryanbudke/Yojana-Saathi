'use client';
import { useCallback } from 'react';
import { usePathname,useSearchParams } from 'next/navigation';
import { Search,ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useResource } from '@/lib/api/use-resource';
import { Button,InlineAlert,Input,Skeleton } from '@/components/ui';
import { states } from '@/features/profile/types';
import { categories,queryFromSearch } from './types';
import { SchemeCard } from './SchemeCard';
export function Discovery(){
  const search=useSearchParams();const pathname=usePathname();const query=search.toString();const load=useCallback(()=>api.schemes(queryFromSearch(query)),[query]);const r=useResource(load);
  function update(next:URLSearchParams){next.delete('cursor');window.history.pushState(null,'',`${pathname}${next.size?'?'+next.toString():''}#browse`);}
  return <section id="browse" className="browse-section" aria-labelledby="browse-title"><div className="section-heading"><div><p className="eyebrow">Explore the possibilities</p><h2 id="browse-title">A starting point for every story</h2></div><span className="small muted">Browse without sharing a profile</span></div>
  <div className="category-chips" aria-label="Support categories">{categories.map(c=><Button key={c.value} variant="secondary" aria-pressed={search.get('category')===c.value} onClick={()=>{const next=new URLSearchParams(query);if(next.get('category')===c.value)next.delete('category');else next.set('category',c.value);update(next);}}><c.icon size={16} aria-hidden="true"/>{c.label}</Button>)}</div>
  <form key={query} className="search-form" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);const next=new URLSearchParams(query);for(const key of ['q','state_code']){const value=String(data.get(key)??'').trim();if(value)next.set(key,value);else next.delete(key);}update(next);}}><div className="search-input"><Search size={18} aria-hidden="true"/><label className="sr-only" htmlFor="scheme-search">Search schemes</label><Input id="scheme-search" name="q" maxLength={200} defaultValue={search.get('q')??''} placeholder="Search by scheme or support…"/></div><label className="sr-only" htmlFor="scheme-state">Filter by state</label><select id="scheme-state" name="state_code" className="input" defaultValue={search.get('state_code')??''}><option value="">All states & national schemes</option>{states.map(([code,label])=><option value={code} key={code}>{label}</option>)}</select><Button type="submit" variant="secondary">Search<ArrowRight size={16}/></Button>{query&&<Button type="button" variant="quiet" onClick={()=>update(new URLSearchParams())}>Clear filters</Button>}</form>
  <div aria-live="polite" className="result-count">{r.loading?'Finding schemes…':r.data?`${r.data.items.length} ${r.data.items.length===1?'scheme':'schemes'} in this page`:''}</div>
  {r.error&&<><InlineAlert error>{r.error}</InlineAlert><Button variant="secondary" onClick={r.retry}>Try again</Button></>}
  {r.loading?<div className="scheme-grid"><Skeleton/><Skeleton/></div>:r.data?.items.length?<><div className="scheme-grid">{r.data.items.map(s=><SchemeCard key={s.id} scheme={s}/>)}</div>{r.data.next_cursor&&<Button variant="secondary" onClick={()=>{const next=new URLSearchParams(query);next.set('cursor',r.data!.next_cursor!);window.history.pushState(null,'',`${pathname}?${next.toString()}#browse`);}}>Next page<ArrowRight size={16}/></Button>}</>:!r.error&&<div className="empty"><h3>No schemes found for these filters</h3><p>Try another category or broaden your search. National schemes are included when relevant.</p><Button variant="quiet" onClick={()=>update(new URLSearchParams())}>Clear filters</Button></div>}
  </section>;
}
