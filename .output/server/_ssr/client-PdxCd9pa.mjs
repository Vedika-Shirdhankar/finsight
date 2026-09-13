import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/client-PdxCd9pa.js
function createSupabaseClient() {
	const SUPABASE_URL = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXFxb216ZXFpb2t4YmtrZWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTkwMjksImV4cCI6MjEwNDY3NTAyOX0.HAUv221ZT-IPC7Q3Q3imU2HTuH3fDebuEtqQlfxZpjY",
		"VITE_SUPABASE_URL": "https://fouqqomzeqiokxbkkeac.supabase.co"
	}["VITE_SUPABASE_URL"] || processModule.env["SUPABASE_URL"];
	const SUPABASE_ANON_KEY = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXFxb216ZXFpb2t4YmtrZWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTkwMjksImV4cCI6MjEwNDY3NTAyOX0.HAUv221ZT-IPC7Q3Q3imU2HTuH3fDebuEtqQlfxZpjY",
		"VITE_SUPABASE_URL": "https://fouqqomzeqiokxbkkeac.supabase.co"
	}["VITE_SUPABASE_ANON_KEY"] || processModule.env["SUPABASE_ANON_KEY"];
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_ANON_KEY ? ["SUPABASE_ANON_KEY"] : []].join(", ")}. Please set them in your .env file.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: {
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
