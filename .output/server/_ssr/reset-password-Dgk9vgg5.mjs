import { a as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { O as LockKeyhole } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-Dgk9vgg5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPassword() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [recovery, setRecovery] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		setError("");
		const result = recovery ? await supabase.auth.updateUser({ password }) : await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
		setBusy(false);
		if (result.error) setError(result.error.message);
		else {
			setMessage(recovery ? "Password updated. You can now sign in." : "Check your email for a secure reset link.");
			if (recovery) navigate({ to: "/auth" });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-page px-6 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "mb-12 inline-flex items-center gap-3 font-display text-lg font-bold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground",
					children: "F"
				}), "FinSight"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-panel p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-11 place-items-center rounded-lg bg-signal/10 text-signal",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 font-display text-3xl font-bold",
						children: recovery ? "Choose a new password" : "Reset your password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-mute",
						children: recovery ? "Use a strong password to keep your financial workspace protected." : "We’ll send a secure recovery link to your email."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-8 space-y-4",
						onSubmit: submit,
						children: [
							!recovery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "w-full rounded-lg border border-line bg-raise px-3 py-3 text-sm outline-none focus:border-signal",
								placeholder: "you@example.com"
							}),
							recovery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								minLength: 8,
								type: "password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "w-full rounded-lg border border-line bg-raise px-3 py-3 text-sm outline-none focus:border-signal",
								placeholder: "New password"
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "alert",
								className: "text-sm text-danger-signal",
								children: error
							}),
							message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "status",
								className: "text-sm text-signal",
								children: message
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: busy,
								className: "fs-clip w-full bg-signal py-3 font-medium text-signal-foreground disabled:opacity-50",
								children: busy ? "Working..." : recovery ? "Update password" : "Send reset link"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						className: "mt-6 block text-center text-sm text-mute hover:text-signal",
						children: "Back to sign in"
					})
				]
			})]
		})
	});
}
//#endregion
export { ResetPassword as component };
