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
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-09-11T18:29:58.328Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-11T18:29:58.339Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/arrow-left-BFOM5sI2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-Q2SJfnOoL2EnFvYjagSJeO4E3po\"",
		"mtime": "2026-09-13T20:24:31.261Z",
		"size": 165,
		"path": "../public/assets/arrow-left-BFOM5sI2.js"
	},
	"/assets/auth-CQS4N5X-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2577-KrIwa49VIvEPQs0rTrvJyATvN7I\"",
		"mtime": "2026-09-13T20:24:31.262Z",
		"size": 9591,
		"path": "../public/assets/auth-CQS4N5X-.js"
	},
	"/assets/alert-dialog-CejxvDBu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1247d-6PZWJ+zxNyqiVHzgLgHZeNM361o\"",
		"mtime": "2026-09-13T20:24:31.260Z",
		"size": 74877,
		"path": "../public/assets/alert-dialog-CejxvDBu.js"
	},
	"/assets/chart-column-lW0ounbP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-JW/mWc/TsQVFJinE4AU18GZBHf4\"",
		"mtime": "2026-09-13T20:24:31.265Z",
		"size": 251,
		"path": "../public/assets/chart-column-lW0ounbP.js"
	},
	"/assets/budgets-C5JRUykq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"221e-WoW+NhTlUUmvSX7iYkQf3mBVP6g\"",
		"mtime": "2026-09-13T20:24:31.263Z",
		"size": 8734,
		"path": "../public/assets/budgets-C5JRUykq.js"
	},
	"/assets/chevron-down-BFgttVDn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-JzBdIzOp5Snkc3IqUX65u3ibJh4\"",
		"mtime": "2026-09-13T20:24:31.266Z",
		"size": 128,
		"path": "../public/assets/chevron-down-BFgttVDn.js"
	},
	"/assets/button-rPUP75WD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7bcd-Xmkn5XA+4YIWTqxko8qL2eZ4qXE\"",
		"mtime": "2026-09-13T20:24:31.263Z",
		"size": 31693,
		"path": "../public/assets/button-rPUP75WD.js"
	},
	"/assets/clsx-CjueKrWZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-hIN6XMVOMUzluNGmYPaM/SbauwQ\"",
		"mtime": "2026-09-13T20:24:31.269Z",
		"size": 368,
		"path": "../public/assets/clsx-CjueKrWZ.js"
	},
	"/assets/chevron-right-BszWh1kZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cf-lWCDCKjsbgViccpUyA5xksFnNx8\"",
		"mtime": "2026-09-13T20:24:31.267Z",
		"size": 207,
		"path": "../public/assets/chevron-right-BszWh1kZ.js"
	},
	"/assets/dashboard-BFgANZK7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13a2-kZqrFoYxE4f/tovYIYiVaoygzPI\"",
		"mtime": "2026-09-13T20:24:31.271Z",
		"size": 5026,
		"path": "../public/assets/dashboard-BFgANZK7.js"
	},
	"/assets/admin-Dj-xMOhg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54f4-360jv2V15XGF5jTFN42U0OZIvq0\"",
		"mtime": "2026-09-13T20:24:31.260Z",
		"size": 21748,
		"path": "../public/assets/admin-Dj-xMOhg.js"
	},
	"/assets/html2canvas-CA7kyov8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b46-1bD3NUT0o78L/KUDivNJ6s7fDy4\"",
		"mtime": "2026-09-13T20:24:31.277Z",
		"size": 199494,
		"path": "../public/assets/html2canvas-CA7kyov8.js"
	},
	"/assets/dashboard-Bt8gfNAf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2dd8-ILVlSEXssv42CY7Bpf7v2ghJqi4\"",
		"mtime": "2026-09-13T20:24:31.272Z",
		"size": 11736,
		"path": "../public/assets/dashboard-Bt8gfNAf.js"
	},
	"/assets/lock-keyhole-CXmJMbpS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-/Dy1XVoMIXlFCQx8bLIwQNZUG5M\"",
		"mtime": "2026-09-13T20:24:31.283Z",
		"size": 255,
		"path": "../public/assets/lock-keyhole-CXmJMbpS.js"
	},
	"/assets/goals-CBx4bMDn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26d6-UcTgWv6Yr2F1sgH61S3J5yg7ryI\"",
		"mtime": "2026-09-13T20:24:31.275Z",
		"size": 9942,
		"path": "../public/assets/goals-CBx4bMDn.js"
	},
	"/assets/client-Cn2d0X2O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ec5-d0kl8wG3barDWTK1stReYI7f1Gk\"",
		"mtime": "2026-09-13T20:24:31.268Z",
		"size": 216773,
		"path": "../public/assets/client-Cn2d0X2O.js"
	},
	"/assets/generateCategoricalChart-DTiaU3Ts.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"59fd9-IwsToIJHwgA26FwS4CUVKMT2Qg8\"",
		"mtime": "2026-09-13T20:24:31.273Z",
		"size": 368601,
		"path": "../public/assets/generateCategoricalChart-DTiaU3Ts.js"
	},
	"/assets/purify.es-BlAnjfs_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"692e-c97QBl+UlPK2/uQ0pvERTepMtxE\"",
		"mtime": "2026-09-13T20:24:31.285Z",
		"size": 26926,
		"path": "../public/assets/purify.es-BlAnjfs_.js"
	},
	"/assets/index.es-CNHAvOs8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f83-uM3XoghEGgYVKaC3WGtIZse9Amc\"",
		"mtime": "2026-09-13T20:24:31.279Z",
		"size": 151427,
		"path": "../public/assets/index.es-CNHAvOs8.js"
	},
	"/assets/menu-wNOGUWAK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3da-7xI+haK68pjFllDsc7UMhfH4sqk\"",
		"mtime": "2026-09-13T20:24:31.284Z",
		"size": 986,
		"path": "../public/assets/menu-wNOGUWAK.js"
	},
	"/assets/createLucideIcon-DSA17mKZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249f-uVeqzGHRhvfyU4zOK9EIIZrleME\"",
		"mtime": "2026-09-13T20:24:31.270Z",
		"size": 9375,
		"path": "../public/assets/createLucideIcon-DSA17mKZ.js"
	},
	"/assets/index-BD54tMeI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5cd5b-G4hAM9d0Bv5BgN7PUK+YIC0agNY\"",
		"mtime": "2026-09-13T20:24:31.258Z",
		"size": 380251,
		"path": "../public/assets/index-BD54tMeI.js"
	},
	"/assets/insights-Cd6tiMLM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6eab4-o1f4V5bTALjYluf8KRT4ZpYH6XI\"",
		"mtime": "2026-09-13T20:24:31.281Z",
		"size": 453300,
		"path": "../public/assets/insights-Cd6tiMLM.js"
	},
	"/assets/react-dom-DdmiWNf8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f48-27S/evO2+em34bws2KyHVxEA3tI\"",
		"mtime": "2026-09-13T20:24:31.287Z",
		"size": 3912,
		"path": "../public/assets/react-dom-DdmiWNf8.js"
	},
	"/assets/recurring-B_8fHM2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3920-5OiMupesfkIdxi4hYg6/GvqnFCk\"",
		"mtime": "2026-09-13T20:24:31.288Z",
		"size": 14624,
		"path": "../public/assets/recurring-B_8fHM2N.js"
	},
	"/assets/repeat-CgbrzWRF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"110-FruSlN098OduAS7bgwqdK3jbggI\"",
		"mtime": "2026-09-13T20:24:31.289Z",
		"size": 272,
		"path": "../public/assets/repeat-CgbrzWRF.js"
	},
	"/assets/reset-password-EOWYVNEp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ad6-yXpt2utcDW/GM5IU/eYyyNu8rjA\"",
		"mtime": "2026-09-13T20:24:31.290Z",
		"size": 2774,
		"path": "../public/assets/reset-password-EOWYVNEp.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-13T20:24:31.291Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-AsCdkPpw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35b8-cqAl2lsbjWzZZ9qjyd43kPt0hKs\"",
		"mtime": "2026-09-13T20:24:31.293Z",
		"size": 13752,
		"path": "../public/assets/routes-AsCdkPpw.js"
	},
	"/assets/search-CyZTtgK_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-kwgY6km5M2W2ff3/RS6Dm6ZovRw\"",
		"mtime": "2026-09-13T20:24:31.294Z",
		"size": 174,
		"path": "../public/assets/search-CyZTtgK_.js"
	},
	"/assets/select-xL5tRvfI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d93e-QQDlTA0ZRvldU4Fxdp3xiWeoC68\"",
		"mtime": "2026-09-13T20:24:31.296Z",
		"size": 55614,
		"path": "../public/assets/select-xL5tRvfI.js"
	},
	"/assets/shield-check-Cxp9B6XY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"203-c9nOFqNWLqTT++Nx7FQiXlXF+7c\"",
		"mtime": "2026-09-13T20:24:31.297Z",
		"size": 515,
		"path": "../public/assets/shield-check-Cxp9B6XY.js"
	},
	"/assets/sparkles-BtC5Htpn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee-5J99bldFhb3dosiZnes00xaZH/s\"",
		"mtime": "2026-09-13T20:24:31.298Z",
		"size": 494,
		"path": "../public/assets/sparkles-BtC5Htpn.js"
	},
	"/assets/styles-P032zxih.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"16771-vHoMzBC5xDH5zjFgyngKgbRtQCY\"",
		"mtime": "2026-09-13T20:24:31.311Z",
		"size": 92017,
		"path": "../public/assets/styles-P032zxih.css"
	},
	"/assets/trending-up-D7A0TZ3c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18b-OmmnuPlcDE/8ag9ZfvpuVwRG/WQ\"",
		"mtime": "2026-09-13T20:24:31.301Z",
		"size": 395,
		"path": "../public/assets/trending-up-D7A0TZ3c.js"
	},
	"/assets/typeof-B5XbjTb1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-yPXEOGyFHb1Ws7OoWyWNEEBz4mQ\"",
		"mtime": "2026-09-13T20:24:31.302Z",
		"size": 271,
		"path": "../public/assets/typeof-B5XbjTb1.js"
	},
	"/assets/transactions-B88isDpv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9d10-Eu/nFWAxPhvpVRmHSwog4g2ght0\"",
		"mtime": "2026-09-13T20:24:31.300Z",
		"size": 40208,
		"path": "../public/assets/transactions-B88isDpv.js"
	},
	"/assets/use-budgets-BzJF6CUc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58e-lF8O2cBuKjXVeVc2teID6XW79+8\"",
		"mtime": "2026-09-13T20:24:31.303Z",
		"size": 1422,
		"path": "../public/assets/use-budgets-BzJF6CUc.js"
	},
	"/assets/use-categories-pJ0zneB_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14a-dJbFO/3u5uihe9Eng1qpdlOLtWs\"",
		"mtime": "2026-09-13T20:24:31.303Z",
		"size": 330,
		"path": "../public/assets/use-categories-pJ0zneB_.js"
	},
	"/assets/use-recurring-transactions-Dto7ymMJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2688-MgVORGj3XsJXu5AM4ODVOTIUD0c\"",
		"mtime": "2026-09-13T20:24:31.304Z",
		"size": 9864,
		"path": "../public/assets/use-recurring-transactions-Dto7ymMJ.js"
	},
	"/assets/use-savings-goals-XlHpGI62.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"572-laPSLvzlPlYEntAcPNTqa1iq7rQ\"",
		"mtime": "2026-09-13T20:24:31.304Z",
		"size": 1394,
		"path": "../public/assets/use-savings-goals-XlHpGI62.js"
	},
	"/assets/use-transactions-oXHlqsR0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71b-FlKADge7Mfss/RTTstUJvy1X5tk\"",
		"mtime": "2026-09-13T20:24:31.306Z",
		"size": 1819,
		"path": "../public/assets/use-transactions-oXHlqsR0.js"
	},
	"/assets/useQuery-Bn6X1oXp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58fa-n6LWR6j8u8FMFS1/5wcDCwMIYm8\"",
		"mtime": "2026-09-13T20:24:31.306Z",
		"size": 22778,
		"path": "../public/assets/useQuery-Bn6X1oXp.js"
	},
	"/assets/wallet-cards-Bzwpj51W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-wc4ZAZoG8yBB/n5hvOq2TOGRXLw\"",
		"mtime": "2026-09-13T20:24:31.307Z",
		"size": 328,
		"path": "../public/assets/wallet-cards-Bzwpj51W.js"
	},
	"/assets/x-6JkppAxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-HS1U6e9Ee2sfSeSm4co3xAfecE0\"",
		"mtime": "2026-09-13T20:24:31.310Z",
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
