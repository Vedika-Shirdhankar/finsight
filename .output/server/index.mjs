globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-11T18:29:58.339Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-11T18:29:58.328Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/admin-CZuS7ECn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54f4-f7dmEkhMsz3o/dSDxty5GQeeFvM\"",
		"mtime": "2026-09-13T20:31:19.101Z",
		"size": 21748,
		"path": "../public/assets/admin-CZuS7ECn.js"
	},
	"/assets/arrow-left-BFOM5sI2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-Q2SJfnOoL2EnFvYjagSJeO4E3po\"",
		"mtime": "2026-09-13T20:31:19.103Z",
		"size": 165,
		"path": "../public/assets/arrow-left-BFOM5sI2.js"
	},
	"/assets/budgets-WIGMOMDg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"221e-bb1lJHfZFhqtGRZGL3jSwMOzrpU\"",
		"mtime": "2026-09-13T20:31:19.104Z",
		"size": 8734,
		"path": "../public/assets/budgets-WIGMOMDg.js"
	},
	"/assets/alert-dialog-CejxvDBu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1247d-6PZWJ+zxNyqiVHzgLgHZeNM361o\"",
		"mtime": "2026-09-13T20:31:19.103Z",
		"size": 74877,
		"path": "../public/assets/alert-dialog-CejxvDBu.js"
	},
	"/assets/auth-J2Sv92uo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"250a-LNS/TEXIeYC8/G69cVA8D6TDZM0\"",
		"mtime": "2026-09-13T20:31:19.104Z",
		"size": 9482,
		"path": "../public/assets/auth-J2Sv92uo.js"
	},
	"/assets/chevron-right-BszWh1kZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-lWCDCKjsbgViccpUyA5xksFnNx8\"",
		"mtime": "2026-09-13T20:31:19.106Z",
		"size": 207,
		"path": "../public/assets/chevron-right-BszWh1kZ.js"
	},
	"/assets/button-rPUP75WD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7bcd-Xmkn5XA+4YIWTqxko8qL2eZ4qXE\"",
		"mtime": "2026-09-13T20:31:19.104Z",
		"size": 31693,
		"path": "../public/assets/button-rPUP75WD.js"
	},
	"/assets/chart-column-lW0ounbP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-JW/mWc/TsQVFJinE4AU18GZBHf4\"",
		"mtime": "2026-09-13T20:31:19.105Z",
		"size": 251,
		"path": "../public/assets/chart-column-lW0ounbP.js"
	},
	"/assets/dashboard-CUF8aPPf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13a2-VVrKRegEdLwYGulWLB3ngUxHq5g\"",
		"mtime": "2026-09-13T20:31:19.108Z",
		"size": 5026,
		"path": "../public/assets/dashboard-CUF8aPPf.js"
	},
	"/assets/dashboard-uJptlVv_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2dd8-OkW4k8kbT276MS14OLLh9MumQfQ\"",
		"mtime": "2026-09-13T20:31:19.108Z",
		"size": 11736,
		"path": "../public/assets/dashboard-uJptlVv_.js"
	},
	"/assets/clsx-CjueKrWZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-hIN6XMVOMUzluNGmYPaM/SbauwQ\"",
		"mtime": "2026-09-13T20:31:19.106Z",
		"size": 368,
		"path": "../public/assets/clsx-CjueKrWZ.js"
	},
	"/assets/createLucideIcon-DSA17mKZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249f-uVeqzGHRhvfyU4zOK9EIIZrleME\"",
		"mtime": "2026-09-13T20:31:19.108Z",
		"size": 9375,
		"path": "../public/assets/createLucideIcon-DSA17mKZ.js"
	},
	"/assets/index.es-CNHAvOs8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f83-uM3XoghEGgYVKaC3WGtIZse9Amc\"",
		"mtime": "2026-09-13T20:31:19.111Z",
		"size": 151427,
		"path": "../public/assets/index.es-CNHAvOs8.js"
	},
	"/assets/client-Cn2d0X2O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ec5-d0kl8wG3barDWTK1stReYI7f1Gk\"",
		"mtime": "2026-09-13T20:31:19.106Z",
		"size": 216773,
		"path": "../public/assets/client-Cn2d0X2O.js"
	},
	"/assets/index-D9_LPnht.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cd7b-sdL4ZUxGyOkzW3q5spVwi+B8Ps4\"",
		"mtime": "2026-09-13T20:31:19.101Z",
		"size": 380283,
		"path": "../public/assets/index-D9_LPnht.js"
	},
	"/assets/chevron-down-BFgttVDn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-JzBdIzOp5Snkc3IqUX65u3ibJh4\"",
		"mtime": "2026-09-13T20:31:19.105Z",
		"size": 128,
		"path": "../public/assets/chevron-down-BFgttVDn.js"
	},
	"/assets/lock-keyhole-CXmJMbpS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-/Dy1XVoMIXlFCQx8bLIwQNZUG5M\"",
		"mtime": "2026-09-13T20:31:19.113Z",
		"size": 255,
		"path": "../public/assets/lock-keyhole-CXmJMbpS.js"
	},
	"/assets/mail-K2Gs-86p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-sKj0vKFTujR9P7Qom1SUXi28xSQ\"",
		"mtime": "2026-09-13T20:31:19.114Z",
		"size": 213,
		"path": "../public/assets/mail-K2Gs-86p.js"
	},
	"/assets/generateCategoricalChart-DTiaU3Ts.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"59fd9-IwsToIJHwgA26FwS4CUVKMT2Qg8\"",
		"mtime": "2026-09-13T20:31:19.108Z",
		"size": 368601,
		"path": "../public/assets/generateCategoricalChart-DTiaU3Ts.js"
	},
	"/assets/goals-Cmrn4UFd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d6-ZNOqwEXs4jEZ24Uu9aqKE/awJ+o\"",
		"mtime": "2026-09-13T20:31:19.110Z",
		"size": 9942,
		"path": "../public/assets/goals-Cmrn4UFd.js"
	},
	"/assets/menu-wNOGUWAK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3da-7xI+haK68pjFllDsc7UMhfH4sqk\"",
		"mtime": "2026-09-13T20:31:19.114Z",
		"size": 986,
		"path": "../public/assets/menu-wNOGUWAK.js"
	},
	"/assets/insights-BRYGcKgY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6eab4-Si9PtepK+JgRUAIYQ5g8F5Kk3uk\"",
		"mtime": "2026-09-13T20:31:19.112Z",
		"size": 453300,
		"path": "../public/assets/insights-BRYGcKgY.js"
	},
	"/assets/html2canvas-CA7kyov8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b46-1bD3NUT0o78L/KUDivNJ6s7fDy4\"",
		"mtime": "2026-09-13T20:31:19.111Z",
		"size": 199494,
		"path": "../public/assets/html2canvas-CA7kyov8.js"
	},
	"/assets/purify.es-BlAnjfs_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"692e-c97QBl+UlPK2/uQ0pvERTepMtxE\"",
		"mtime": "2026-09-13T20:31:19.115Z",
		"size": 26926,
		"path": "../public/assets/purify.es-BlAnjfs_.js"
	},
	"/assets/react-dom-DdmiWNf8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f48-27S/evO2+em34bws2KyHVxEA3tI\"",
		"mtime": "2026-09-13T20:31:19.115Z",
		"size": 3912,
		"path": "../public/assets/react-dom-DdmiWNf8.js"
	},
	"/assets/recurring-DuobsTo7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42ed-n4WDhTwXgFhnJJDvXwOzqZrRA9I\"",
		"mtime": "2026-09-13T20:31:19.115Z",
		"size": 17133,
		"path": "../public/assets/recurring-DuobsTo7.js"
	},
	"/assets/reset-password-_XUpZ9DR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ad6-uyDeKVpfNDGCZcpJSa7hZ7mgetA\"",
		"mtime": "2026-09-13T20:31:19.116Z",
		"size": 2774,
		"path": "../public/assets/reset-password-_XUpZ9DR.js"
	},
	"/assets/repeat-CgbrzWRF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110-FruSlN098OduAS7bgwqdK3jbggI\"",
		"mtime": "2026-09-13T20:31:19.116Z",
		"size": 272,
		"path": "../public/assets/repeat-CgbrzWRF.js"
	},
	"/assets/routes-Dqlt0eQ0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35b8-176T8uVzYINN1/7EAGqj34IYHxI\"",
		"mtime": "2026-09-13T20:31:19.117Z",
		"size": 13752,
		"path": "../public/assets/routes-Dqlt0eQ0.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-13T20:31:19.116Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/select-xL5tRvfI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d93e-QQDlTA0ZRvldU4Fxdp3xiWeoC68\"",
		"mtime": "2026-09-13T20:31:19.117Z",
		"size": 55614,
		"path": "../public/assets/select-xL5tRvfI.js"
	},
	"/assets/shield-check-Cxp9B6XY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"203-c9nOFqNWLqTT++Nx7FQiXlXF+7c\"",
		"mtime": "2026-09-13T20:31:19.117Z",
		"size": 515,
		"path": "../public/assets/shield-check-Cxp9B6XY.js"
	},
	"/assets/sparkles-BtC5Htpn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee-5J99bldFhb3dosiZnes00xaZH/s\"",
		"mtime": "2026-09-13T20:31:19.119Z",
		"size": 494,
		"path": "../public/assets/sparkles-BtC5Htpn.js"
	},
	"/assets/search-CyZTtgK_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-kwgY6km5M2W2ff3/RS6Dm6ZovRw\"",
		"mtime": "2026-09-13T20:31:19.117Z",
		"size": 174,
		"path": "../public/assets/search-CyZTtgK_.js"
	},
	"/assets/transactions-Cz9uvXBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d10-WMAbXLN5jUnDPATgpld9sZTfuAg\"",
		"mtime": "2026-09-13T20:31:19.119Z",
		"size": 40208,
		"path": "../public/assets/transactions-Cz9uvXBM.js"
	},
	"/assets/trending-up-D7A0TZ3c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18b-OmmnuPlcDE/8ag9ZfvpuVwRG/WQ\"",
		"mtime": "2026-09-13T20:31:19.120Z",
		"size": 395,
		"path": "../public/assets/trending-up-D7A0TZ3c.js"
	},
	"/assets/styles-BqgZvCGP.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"168d2-aRvqFWV1k7vWhz/WbB8P+NgLWoM\"",
		"mtime": "2026-09-13T20:31:19.125Z",
		"size": 92370,
		"path": "../public/assets/styles-BqgZvCGP.css"
	},
	"/assets/typeof-B5XbjTb1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-yPXEOGyFHb1Ws7OoWyWNEEBz4mQ\"",
		"mtime": "2026-09-13T20:31:19.120Z",
		"size": 271,
		"path": "../public/assets/typeof-B5XbjTb1.js"
	},
	"/assets/use-budgets-XazAi__D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58e-ZwfsXOSHatoUtXSO71aZnz3At18\"",
		"mtime": "2026-09-13T20:31:19.120Z",
		"size": 1422,
		"path": "../public/assets/use-budgets-XazAi__D.js"
	},
	"/assets/use-categories-1bOYZTEw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14a-ocpUq+q2hhs1N5eesu9XNHnHhQA\"",
		"mtime": "2026-09-13T20:31:19.121Z",
		"size": 330,
		"path": "../public/assets/use-categories-1bOYZTEw.js"
	},
	"/assets/use-recurring-transactions-NAFracUM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2688-rhWEtqkQQ/AC9E5I+QYzgsRzGWM\"",
		"mtime": "2026-09-13T20:31:19.121Z",
		"size": 9864,
		"path": "../public/assets/use-recurring-transactions-NAFracUM.js"
	},
	"/assets/use-savings-goals-Lo1Jyo30.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"572-4gK6TQWiDyNarnBZyxUKbVebUmg\"",
		"mtime": "2026-09-13T20:31:19.121Z",
		"size": 1394,
		"path": "../public/assets/use-savings-goals-Lo1Jyo30.js"
	},
	"/assets/use-transactions-E9Aa6HJA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71b-kvQv0LQ6DvgNsLhyI6MIlOlX1tg\"",
		"mtime": "2026-09-13T20:31:19.121Z",
		"size": 1819,
		"path": "../public/assets/use-transactions-E9Aa6HJA.js"
	},
	"/assets/useQuery-Bn6X1oXp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58fa-n6LWR6j8u8FMFS1/5wcDCwMIYm8\"",
		"mtime": "2026-09-13T20:31:19.122Z",
		"size": 22778,
		"path": "../public/assets/useQuery-Bn6X1oXp.js"
	},
	"/assets/wallet-cards-Bzwpj51W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-wc4ZAZoG8yBB/n5hvOq2TOGRXLw\"",
		"mtime": "2026-09-13T20:31:19.124Z",
		"size": 328,
		"path": "../public/assets/wallet-cards-Bzwpj51W.js"
	},
	"/assets/x-6JkppAxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-HS1U6e9Ee2sfSeSm4co3xAfecE0\"",
		"mtime": "2026-09-13T20:31:19.124Z",
		"size": 154,
		"path": "../public/assets/x-6JkppAxE.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_RgzZNK = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_RgzZNK
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
