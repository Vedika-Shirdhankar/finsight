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
	"/assets/admin-BH996Co9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5522-hOE/u8z8EH71gVthpk2kF4KUX2Y\"",
		"mtime": "2026-09-13T20:34:51.583Z",
		"size": 21794,
		"path": "../public/assets/admin-BH996Co9.js"
	},
	"/assets/alert-dialog-DB2kBM_y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e40-5nx2O5hARCJP0uTvdXlVpX12iPI\"",
		"mtime": "2026-09-13T20:34:51.583Z",
		"size": 3648,
		"path": "../public/assets/alert-dialog-DB2kBM_y.js"
	},
	"/assets/auth-CJZ8Rh-l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"250a-XCFyOLi7o0/U/96bqboXDcg7yAY\"",
		"mtime": "2026-09-13T20:34:51.584Z",
		"size": 9482,
		"path": "../public/assets/auth-CJZ8Rh-l.js"
	},
	"/assets/arrow-left-BFOM5sI2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5-Q2SJfnOoL2EnFvYjagSJeO4E3po\"",
		"mtime": "2026-09-13T20:34:51.584Z",
		"size": 165,
		"path": "../public/assets/arrow-left-BFOM5sI2.js"
	},
	"/assets/budgets-D42PrMnF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"229c-gAjOXQWA/OYbHPQM306XJ2GOHBw\"",
		"mtime": "2026-09-13T20:34:51.584Z",
		"size": 8860,
		"path": "../public/assets/budgets-D42PrMnF.js"
	},
	"/assets/chart-column-lW0ounbP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fb-JW/mWc/TsQVFJinE4AU18GZBHf4\"",
		"mtime": "2026-09-13T20:34:51.586Z",
		"size": 251,
		"path": "../public/assets/chart-column-lW0ounbP.js"
	},
	"/assets/circle-dollar-sign-ADEqiiLU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f8-dIF4ZiA/osVjb9L1q3WRJc5qz8I\"",
		"mtime": "2026-09-13T20:34:51.586Z",
		"size": 248,
		"path": "../public/assets/circle-dollar-sign-ADEqiiLU.js"
	},
	"/assets/clsx-CjueKrWZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"170-hIN6XMVOMUzluNGmYPaM/SbauwQ\"",
		"mtime": "2026-09-13T20:34:51.588Z",
		"size": 368,
		"path": "../public/assets/clsx-CjueKrWZ.js"
	},
	"/assets/chevron-down-BFgttVDn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"80-JzBdIzOp5Snkc3IqUX65u3ibJh4\"",
		"mtime": "2026-09-13T20:34:51.586Z",
		"size": 128,
		"path": "../public/assets/chevron-down-BFgttVDn.js"
	},
	"/assets/createLucideIcon-DSA17mKZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249f-uVeqzGHRhvfyU4zOK9EIIZrleME\"",
		"mtime": "2026-09-13T20:34:51.589Z",
		"size": 9375,
		"path": "../public/assets/createLucideIcon-DSA17mKZ.js"
	},
	"/assets/dashboard-B0nUgJUl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13d0-OryumZ5BnHV3H01Gr5NW0Xv95O0\"",
		"mtime": "2026-09-13T20:34:51.589Z",
		"size": 5072,
		"path": "../public/assets/dashboard-B0nUgJUl.js"
	},
	"/assets/dashboard-DwX4e5DL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2dd3-Q1by3nTlPBj/ydX8VM8rO4N5OfQ\"",
		"mtime": "2026-09-13T20:34:51.589Z",
		"size": 11731,
		"path": "../public/assets/dashboard-DwX4e5DL.js"
	},
	"/assets/dialog-DUx7RyE_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1173f-7AWxWCeYEo62DPHcewYNXGKmDhY\"",
		"mtime": "2026-09-13T20:34:51.590Z",
		"size": 71487,
		"path": "../public/assets/dialog-DUx7RyE_.js"
	},
	"/assets/goals-N8zu-sBW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2702-Oqa7CxnkxMjc3mwYYejIrrP0a5g\"",
		"mtime": "2026-09-13T20:34:51.592Z",
		"size": 9986,
		"path": "../public/assets/goals-N8zu-sBW.js"
	},
	"/assets/client-Cn2d0X2O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ec5-d0kl8wG3barDWTK1stReYI7f1Gk\"",
		"mtime": "2026-09-13T20:34:51.587Z",
		"size": 216773,
		"path": "../public/assets/client-Cn2d0X2O.js"
	},
	"/assets/button-rPUP75WD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7bcd-Xmkn5XA+4YIWTqxko8qL2eZ4qXE\"",
		"mtime": "2026-09-13T20:34:51.585Z",
		"size": 31693,
		"path": "../public/assets/button-rPUP75WD.js"
	},
	"/assets/html2canvas-CA7kyov8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b46-1bD3NUT0o78L/KUDivNJ6s7fDy4\"",
		"mtime": "2026-09-13T20:34:51.592Z",
		"size": 199494,
		"path": "../public/assets/html2canvas-CA7kyov8.js"
	},
	"/assets/generateCategoricalChart-C_4CVVuE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"59f5d-IUPLyIWraUXmeslG35e+Yx2H4YA\"",
		"mtime": "2026-09-13T20:34:51.591Z",
		"size": 368477,
		"path": "../public/assets/generateCategoricalChart-C_4CVVuE.js"
	},
	"/assets/index.es-CNHAvOs8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f83-uM3XoghEGgYVKaC3WGtIZse9Amc\"",
		"mtime": "2026-09-13T20:34:51.593Z",
		"size": 151427,
		"path": "../public/assets/index.es-CNHAvOs8.js"
	},
	"/assets/lock-keyhole-CXmJMbpS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-/Dy1XVoMIXlFCQx8bLIwQNZUG5M\"",
		"mtime": "2026-09-13T20:34:51.594Z",
		"size": 255,
		"path": "../public/assets/lock-keyhole-CXmJMbpS.js"
	},
	"/assets/index-D1laHhse.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5e327-N6vcXlcXASg61VzCftmBmlw+JFE\"",
		"mtime": "2026-09-13T20:34:51.582Z",
		"size": 385831,
		"path": "../public/assets/index-D1laHhse.js"
	},
	"/assets/mail-K2Gs-86p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d5-sKj0vKFTujR9P7Qom1SUXi28xSQ\"",
		"mtime": "2026-09-13T20:34:51.594Z",
		"size": 213,
		"path": "../public/assets/mail-K2Gs-86p.js"
	},
	"/assets/insights-njJVXPxv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6eaad-eKXWTq8/6Oht6qwyu3W3dkdaSsw\"",
		"mtime": "2026-09-13T20:34:51.594Z",
		"size": 453293,
		"path": "../public/assets/insights-njJVXPxv.js"
	},
	"/assets/menu-wNOGUWAK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3da-7xI+haK68pjFllDsc7UMhfH4sqk\"",
		"mtime": "2026-09-13T20:34:51.595Z",
		"size": 986,
		"path": "../public/assets/menu-wNOGUWAK.js"
	},
	"/assets/refresh-cw-Cp-uTgmT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"141-2qpQ/gLlrDKdzHoAsve/Qycx6Ts\"",
		"mtime": "2026-09-13T20:34:51.598Z",
		"size": 321,
		"path": "../public/assets/refresh-cw-Cp-uTgmT.js"
	},
	"/assets/react-dom-DdmiWNf8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f48-27S/evO2+em34bws2KyHVxEA3tI\"",
		"mtime": "2026-09-13T20:34:51.596Z",
		"size": 3912,
		"path": "../public/assets/react-dom-DdmiWNf8.js"
	},
	"/assets/recurring-B5CXE0mT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"423c-hrGFBN3Ybukpa43wPiQS6wwPY1k\"",
		"mtime": "2026-09-13T20:34:51.598Z",
		"size": 16956,
		"path": "../public/assets/recurring-B5CXE0mT.js"
	},
	"/assets/purify.es-BlAnjfs_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"692e-c97QBl+UlPK2/uQ0pvERTepMtxE\"",
		"mtime": "2026-09-13T20:34:51.596Z",
		"size": 26926,
		"path": "../public/assets/purify.es-BlAnjfs_.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-13T20:34:51.599Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/repeat-Cz4mjVdN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fd-LVpPCbbISP4cHFbgAp5+wqJyl6Y\"",
		"mtime": "2026-09-13T20:34:51.598Z",
		"size": 509,
		"path": "../public/assets/repeat-Cz4mjVdN.js"
	},
	"/assets/routes-Baq4Vbaf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35b8-LG/AjukZZyRALn0MkQwjVlg20fA\"",
		"mtime": "2026-09-13T20:34:51.599Z",
		"size": 13752,
		"path": "../public/assets/routes-Baq4Vbaf.js"
	},
	"/assets/sparkles-BtC5Htpn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee-5J99bldFhb3dosiZnes00xaZH/s\"",
		"mtime": "2026-09-13T20:34:51.601Z",
		"size": 494,
		"path": "../public/assets/sparkles-BtC5Htpn.js"
	},
	"/assets/shield-check-C-7mT3Pl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-j1rPtKkjOqusa8eC/7uzge0mDzA\"",
		"mtime": "2026-09-13T20:34:51.601Z",
		"size": 320,
		"path": "../public/assets/shield-check-C-7mT3Pl.js"
	},
	"/assets/reset-password-C7VT-WUt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ad6-SSaKFHx9QN4dES8xfqC2NOglTCY\"",
		"mtime": "2026-09-13T20:34:51.598Z",
		"size": 2774,
		"path": "../public/assets/reset-password-C7VT-WUt.js"
	},
	"/assets/search-CyZTtgK_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-kwgY6km5M2W2ff3/RS6Dm6ZovRw\"",
		"mtime": "2026-09-13T20:34:51.599Z",
		"size": 174,
		"path": "../public/assets/search-CyZTtgK_.js"
	},
	"/assets/styles-CIpk22b_.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1691c-Ha2UZ7BTiubXUhMPLqp5uMsfSww\"",
		"mtime": "2026-09-13T20:34:51.607Z",
		"size": 92444,
		"path": "../public/assets/styles-CIpk22b_.css"
	},
	"/assets/transactions-BBBCl95e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9356-dYdKSP0pgtIBbE9IlMzr79EeZqE\"",
		"mtime": "2026-09-13T20:34:51.602Z",
		"size": 37718,
		"path": "../public/assets/transactions-BBBCl95e.js"
	},
	"/assets/trending-up-D7A0TZ3c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18b-OmmnuPlcDE/8ag9ZfvpuVwRG/WQ\"",
		"mtime": "2026-09-13T20:34:51.602Z",
		"size": 395,
		"path": "../public/assets/trending-up-D7A0TZ3c.js"
	},
	"/assets/select-DKk-eX1r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d937-CbL6hxAYYx6qOhfyKvIVq3uRhoc\"",
		"mtime": "2026-09-13T20:34:51.600Z",
		"size": 55607,
		"path": "../public/assets/select-DKk-eX1r.js"
	},
	"/assets/typeof-B5XbjTb1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-yPXEOGyFHb1Ws7OoWyWNEEBz4mQ\"",
		"mtime": "2026-09-13T20:34:51.602Z",
		"size": 271,
		"path": "../public/assets/typeof-B5XbjTb1.js"
	},
	"/assets/use-categories-BS34FwZK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14a-kniZle6PKyEE+gnrLG7RH0W1EnM\"",
		"mtime": "2026-09-13T20:34:51.603Z",
		"size": 330,
		"path": "../public/assets/use-categories-BS34FwZK.js"
	},
	"/assets/use-recurring-transactions-BaOBBDJm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2683-5oxRgJORogiRQ9W5u0Zomhd1IMc\"",
		"mtime": "2026-09-13T20:34:51.603Z",
		"size": 9859,
		"path": "../public/assets/use-recurring-transactions-BaOBBDJm.js"
	},
	"/assets/use-budgets-B3BQ3975.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58e-fxCRmsOygFDh7vLiS99KhyQlPug\"",
		"mtime": "2026-09-13T20:34:51.603Z",
		"size": 1422,
		"path": "../public/assets/use-budgets-B3BQ3975.js"
	},
	"/assets/use-savings-goals-0ZjB6ODQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"572-fDla8Ap0c0V5KR+O52zA6TlGeuQ\"",
		"mtime": "2026-09-13T20:34:51.603Z",
		"size": 1394,
		"path": "../public/assets/use-savings-goals-0ZjB6ODQ.js"
	},
	"/assets/useQuery-Bn6X1oXp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58fa-n6LWR6j8u8FMFS1/5wcDCwMIYm8\"",
		"mtime": "2026-09-13T20:34:51.606Z",
		"size": 22778,
		"path": "../public/assets/useQuery-Bn6X1oXp.js"
	},
	"/assets/use-transactions-AhcDUF__.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71b-9a2ul3jqdGq74PeW3qu5Cy16ruk\"",
		"mtime": "2026-09-13T20:34:51.606Z",
		"size": 1819,
		"path": "../public/assets/use-transactions-AhcDUF__.js"
	},
	"/assets/wallet-cards-Bzwpj51W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-wc4ZAZoG8yBB/n5hvOq2TOGRXLw\"",
		"mtime": "2026-09-13T20:34:51.606Z",
		"size": 328,
		"path": "../public/assets/wallet-cards-Bzwpj51W.js"
	},
	"/assets/x-6JkppAxE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a-HS1U6e9Ee2sfSeSm4co3xAfecE0\"",
		"mtime": "2026-09-13T20:34:51.607Z",
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
