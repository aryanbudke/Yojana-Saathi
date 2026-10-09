'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useResource } from '@/lib/api/use-resource';
import { Badge,Button,InlineAlert,Skeleton,SourceLink } from '@/components/ui';
import { ModeNotice } from '@/features/profile/ProfileComposer';
import { displayDate } from '@/lib/format';
export function DetailPreview({id}:{id:string}){const load=useCallback(()=>api.detail(id),[id]);const r=useResource(load);return <><ModeNotice/><div className="page-heading"><Link className="back-link" href="/discover#browse">← Back to discovery</Link></div>{r.loading?<Skeleton/>:r.error?<><InlineAlert error>{r.error}</InlineAlert><Button onClick={r.retry}>Try again</Button></>:r.data&&<article className="panel stack"><Badge>{r.data.category}</Badge><h1>{r.data.name}</h1><p>{r.data.summary}</p><h2>Benefits</h2><p>{r.data.benefit_text}</p><p className="small muted">Last verified on {displayDate(r.data.last_verified_at)}</p>{r.data.official_sources.map(s=><SourceLink key={s.id} url={s.official_url}>{s.title}</SourceLink>)}</article>}</>;}
