import { DetailPreview } from '@/features/discovery/DetailPreview';
export default async function Page({params}:{params:Promise<{schemeId:string}>}){const {schemeId}=await params;return <DetailPreview id={schemeId}/>;}
