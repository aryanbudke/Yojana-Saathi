import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./e2e',fullyParallel:false,workers:1,timeout:45_000,use:{baseURL:'http://127.0.0.1:3000',trace:'retain-on-failure'},webServer:{command:'NEXT_PUBLIC_API_MODE=mock npm run dev',url:'http://127.0.0.1:3000',reuseExistingServer:!process.env.CI,timeout:120_000}});
