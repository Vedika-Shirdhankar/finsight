import { a as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as supabase } from "./client-PdxCd9pa.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { E as Mail, F as Eye, I as EyeOff, O as LockKeyhole, o as UserRound, rt as ArrowLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Bhhpl3M7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("login");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [needsConfirm, setNeedsConfirm] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) navigate({ to: "/dashboard" });
		});
	}, [navigate]);
	async function submit(event) {
		event.preventDefault();
		setError("");
		setMessage("");
		setNeedsConfirm(false);
		if (mode === "signup" && password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (password.length < 8) {
			setError("Use at least 8 characters for your password.");
			return;
		}
		setBusy(true);
		try {
			const result = mode === "login" ? await supabase.auth.signInWithPassword({
				email: email.trim(),
				password
			}) : await supabase.auth.signUp({
				email: email.trim(),
				password,
				options: {
					data: { full_name: fullName.trim() },
					emailRedirectTo: window.location.origin + "/dashboard"
				}
			});
			if (result.error) {
				setError(result.error.message);
				if (/confirm/i.test(result.error.message)) setNeedsConfirm(true);
				return;
			}
			if (mode === "signup" && !result.data.session) {
				setNeedsConfirm(true);
				setMessage("Check your email to confirm your account, then return here to sign in.");
				return;
			}
			navigate({ to: "/dashboard" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
		} finally {
			setBusy(false);
		}
	}
	async function resendConfirmation() {
		if (!email) {
			setError("Enter your email first.");
			return;
		}
		setBusy(true);
		setError("");
		setMessage("");
		const { error: err } = await supabase.auth.resend({
			type: "signup",
			email,
			options: { emailRedirectTo: window.location.origin + "/dashboard" }
		});
		setBusy(false);
		if (err) setError(err.message);
		else setMessage("Confirmation email sent again — check your inbox and spam folder.");
	}
	async function googleSignIn() {
		setError("");
		setBusy(true);
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: window.location.origin + "/dashboard" }
			});
			if (error) setError(error.message);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to start Google sign-in. Please try again.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen bg-page text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden border-r border-line p-10 lg:flex lg:flex-col lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-3 font-display text-lg font-bold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "fs-clip grid size-8 place-items-center bg-signal text-sm text-signal-foreground",
						children: "F"
					}), "FinSight"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-28 max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
							children: "Financial intelligence platform"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-5 font-display text-6xl font-bold leading-[0.95]",
							children: [
								"Your money,",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-signal",
									children: "decoded."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 max-w-md text-lg leading-relaxed text-mute",
							children: "Turn payment activity into a clearer view of your spending, savings, and financial momentum."
						})
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-mute",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "size-4 text-signal" }),
						" Protected workspace",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-line",
							children: "/"
						}),
						" Simulated data only"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center px-6 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "mb-12 inline-flex items-center gap-2 text-sm text-mute transition hover:text-ink lg:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back to FinSight"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
									children: "Welcome to FinSight"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-4xl font-bold",
									children: mode === "login" ? "Sign in to your workspace" : "Create your workspace"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-mute",
									children: mode === "login" ? "Pick up where your financial signal left off." : "Start making sense of your financial activity."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 grid grid-cols-2 border-b border-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `border-b-2 py-3 text-sm font-medium ${mode === "login" ? "border-signal text-ink" : "border-transparent text-mute"}`,
								type: "button",
								onClick: () => {
									setMode("login");
									setError("");
									setMessage("");
								},
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: `border-b-2 py-3 text-sm font-medium ${mode === "signup" ? "border-signal text-ink" : "border-transparent text-mute"}`,
								type: "button",
								onClick: () => {
									setMode("signup");
									setError("");
									setMessage("");
								},
								children: "Create account"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: googleSignIn,
							disabled: busy,
							className: "flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-panel py-3 text-sm font-medium transition hover:border-signal/50 disabled:opacity-50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-5 place-items-center rounded bg-ink text-xs font-bold text-page",
									children: "G"
								}),
								" ",
								"Continue with Google"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.16em] text-mute",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" }),
								" or email",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "space-y-4",
							children: [
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-2 block text-xs font-medium text-mute",
										children: "Full name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "absolute left-3 top-3 size-4 text-mute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											value: fullName,
											onChange: (e) => setFullName(e.target.value),
											className: "w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-signal",
											placeholder: "Aarav Mehta"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-2 block text-xs font-medium text-mute",
										children: "Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "absolute left-3 top-3 size-4 text-mute" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											type: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											className: "w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-signal",
											placeholder: "you@example.com"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-2 block text-xs font-medium text-mute",
										children: "Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "absolute left-3 top-3 size-4 text-mute" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												required: true,
												type: showPassword ? "text" : "password",
												value: password,
												onChange: (e) => setPassword(e.target.value),
												className: "w-full rounded-lg border border-line bg-panel py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-signal",
												placeholder: "••••••••"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setShowPassword(!showPassword),
												className: "absolute right-3 top-3 text-mute",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "sr-only",
													children: "Toggle password visibility"
												}), showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })]
											})
										]
									})]
								}),
								mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-2 block text-xs font-medium text-mute",
										children: "Confirm password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										type: "password",
										value: confirmPassword,
										onChange: (e) => setConfirmPassword(e.target.value),
										className: "w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm outline-none transition focus:border-signal",
										placeholder: "••••••••"
									})]
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "alert",
									className: "rounded-lg border border-danger-signal/30 bg-danger-signal/10 px-3 py-2 text-sm text-danger-signal",
									children: error
								}),
								needsConfirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: resendConfirmation,
									disabled: busy,
									className: "w-full rounded-lg border border-line bg-panel py-2.5 text-xs font-medium text-mute transition hover:border-signal/50 hover:text-ink disabled:opacity-50",
									children: "Resend confirmation email"
								}),
								message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "status",
									className: "rounded-lg border border-signal/30 bg-signal/10 px-3 py-2 text-sm text-signal",
									children: message
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: busy,
									className: "fs-clip w-full bg-signal py-3 font-medium text-signal-foreground transition hover:brightness-110 disabled:opacity-50",
									children: busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"
								})
							]
						}),
						mode === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/reset-password",
							className: "mt-5 block text-center text-xs text-mute transition hover:text-signal",
							children: "Forgot password?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-8 text-center text-[10px] font-mono uppercase tracking-[0.12em] text-mute",
							children: "By continuing, you agree to use simulated financial data only."
						})
					]
				})
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
