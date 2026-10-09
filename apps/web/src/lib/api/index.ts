import { createLiveApi } from './client';
import { createMockApi } from './mock';
export const isMock=process.env.NEXT_PUBLIC_API_MODE==='mock';
export const api=isMock?createMockApi():createLiveApi(process.env.NEXT_PUBLIC_API_BASE_URL??'');
export { ApiError,errorMessage } from './client';
