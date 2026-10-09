import Link from 'next/link';
import { ExternalLink, Info, LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export function Button({children, className='', variant='primary', busy=false, disabled, ...props}: ButtonHTMLAttributes<HTMLButtonElement> & {variant?:'primary'|'secondary'|'quiet';busy?:boolean}) {
  return <button className={`button ${variant} ${className}`} disabled={disabled || busy} aria-busy={busy} {...props}>{busy && <LoaderCircle size={18} className="spin" aria-hidden="true"/>}{children}</button>;
}
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {return <input {...props} className={`input ${props.className ?? ''}`}/>;}
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {return <textarea {...props} className={`input textarea ${props.className ?? ''}`}/>;}
export function GlassPanel({children,className=''}:{children:ReactNode;className?:string}) {return <section className={`glass ${className}`}>{children}</section>;}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}) {return <span className={`badge ${tone}`}>{children}</span>;}
export function InlineAlert({children,error=false}:{children:ReactNode;error?:boolean}) {return <div className={`alert ${error?'error':''}`} role={error?'alert':'status'}><Info size={18} aria-hidden="true"/><div>{children}</div></div>;}
export function Skeleton() {return <div className="skeleton" role="status" aria-label="Loading"><span className="sr-only">Loading…</span></div>;}
export function safeOfficialUrl(raw:string) {
  try {const u=new URL(raw);return u.protocol==='https:' && !u.username && !u.password && /(^|\.)(gov\.in|nic\.in)$/.test(u.hostname)?u.href:null;} catch {return null;}
}
export function SourceLink({url,children='Official source'}:{url:string;children?:ReactNode}) {const safe=safeOfficialUrl(url);return safe?<a className="source-link" href={safe} target="_blank" rel="noopener noreferrer">{children}<ExternalLink size={14} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>:<span className="source-unavailable">Source link unavailable{url.includes('.invalid')?' · synthetic fixture':''}</span>;}
export function AppHeader() {return <header className="header"><div className="header-inner"><Link className="brand" href="/" aria-label="yojana saathi home"><span className="brand-mark" aria-hidden="true">y</span>yojana saathi<span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><Link href="/discover">Discover</Link><Link href="/help">How it works</Link></nav><span className="header-note">Independent. Here to help.</span></div></header>;}
export function Disclaimer() {return <p className="disclaimer">An independent project. This is preliminary guidance; the government portal makes final decisions. We do not submit or approve applications.</p>;}
