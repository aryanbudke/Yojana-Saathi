import { expect,it } from 'vitest';
import { queryFromSearch } from './types';
import { createMockApi } from '@/lib/api/mock';
it('uses canonical filters and excludes arbitrary URL parameters',()=>{expect(queryFromSearch('q=farm&state_code=MH&category=agriculture&cursor=next&secret=x').toString()).toBe('q=farm&category=agriculture&state_code=MH&cursor=next&limit=20');});
it('keeps national schemes for unknown or specific states and shows empty category results',async()=>{const api=createMockApi(0);expect((await api.schemes(queryFromSearch('state_code=KA'))).items).toHaveLength(1);expect((await api.schemes(queryFromSearch('category=education'))).items).toHaveLength(0);});
