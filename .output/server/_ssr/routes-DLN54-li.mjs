import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { A as LockKeyhole, et as ChartColumn, i as WalletCards, p as Sparkles, st as ArrowRight } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DLN54-li.js
var import_jsx_runtime = require_jsx_runtime();
var bars = [
	70,
	54,
	82,
	62,
	76,
	48,
	88,
	60,
	74,
	92
];
function LandingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-page text-ink antialiased",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-line bg-panel/70 px-6 py-2 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fs-ticker flex w-max whitespace-nowrap text-[10px] font-mono uppercase tracking-[0.18em] text-mute",
					children: [
						"UPI 12.4M txn/day",
						"Savings rate 34.8%",
						"Avg txn ₹1,872",
						"Food +23% MoM",
						"98.2% success",
						"UPI 12.4M txn/day",
						"Savings rate 34.8%",
						"Avg txn ₹1,872",
						"Food +23% MoM",
						"98.2% success"
					].map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "px-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: index % 4 === 3 ? "text-warning-signal" : "text-signal",
								children: index % 4 === 3 ? "▼" : "▲"
							}),
							" ",
							item
						]
					}, `${item}-${index}`))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-line bg-page/85 backdrop-blur",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "fs-clip grid size-8 place-items-center bg-signal font-display text-sm font-bold text-signal-foreground",
									children: "F"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-lg font-bold tracking-tight",
									children: "FinSight"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden rounded border border-line px-2 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-mute sm:inline",
									children: "v1"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden items-center gap-8 text-sm text-mute lg:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#why",
									className: "transition hover:text-ink",
									children: "Why FinSight"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#analytics",
									className: "transition hover:text-ink",
									children: "Analytics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "#security",
									className: "transition hover:text-ink",
									children: "Security"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								className: "hidden text-sm text-mute transition hover:text-ink sm:block",
								children: "Sign in"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								className: "fs-clip bg-signal px-4 py-2 text-sm font-medium text-signal-foreground transition hover:brightness-110",
								children: "Get started"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden border-b border-line",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 fs-grid opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-16 lg:grid-cols-12 lg:px-10 lg:py-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "fs-rise inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-signal",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-signal" }), " Financial intelligence platform"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "fs-rise-1 mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight lg:text-7xl",
								children: [
									"Turn transactions",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"into financial",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-signal",
										children: "intelligence."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "fs-rise-2 mt-6 max-w-md text-lg leading-relaxed text-mute",
								children: "FinSight transforms raw payment data into actionable insights — spending patterns, savings behavior, and category-level intelligence. No noise. Just signal."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "fs-rise-3 mt-8 flex flex-wrap gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/auth",
									className: "fs-clip bg-signal px-6 py-3.5 font-medium text-signal-foreground transition hover:brightness-110",
									children: ["Get started ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 inline size-4" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/dashboard",
									className: "fs-clip border border-line px-6 py-3.5 font-medium transition hover:border-signal/50",
									children: "View demo"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 flex flex-wrap gap-5 text-[10px] font-mono uppercase tracking-[0.15em] text-mute",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "JWT secured" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-line",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Role based" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-line",
										children: "/"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Simulated data" })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalPreview, {})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "why",
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-[1440px] gap-10 px-6 py-16 lg:grid-cols-12 lg:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono uppercase tracking-[0.22em] text-signal",
								children: "01 — Why FinSight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 font-display text-3xl font-bold leading-tight",
								children: "From raw ledgers to decisions you can trust."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 leading-relaxed text-mute",
								children: "Most banking apps stop at a transaction list. FinSight builds the intelligence layer on top — answering real financial questions, not just recording them."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2 lg:col-span-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCards, {}),
								index: "02",
								title: "Transaction management",
								copy: "Unified ledger with search, filters, sorting, and a full detail timeline across UPI, cards, and bank transfers."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {}),
								index: "03",
								title: "Financial analytics",
								copy: "Income vs expense, category distribution, and savings trends — every chart answers a financial question."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {}),
								index: "04",
								title: "Smart insights",
								copy: "Calculated, severity-rated, and actionable signals instead of random charts or generic advice."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, {}),
								index: "05",
								title: "Secure by design",
								copy: "Protected accounts, role-aware access, validation, and simulated data with no real banking credentials."
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "analytics",
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-[1440px] px-6 py-16 lg:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-8 max-w-xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono uppercase tracking-[0.22em] text-signal",
								children: "06 — Analytics core"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 font-display text-4xl font-bold",
								children: "See the shape of your money."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-mute",
								children: "Spending concentration, savings momentum, and category movement come together in a workspace that is easy to scan and hard to misread."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightBand, {
								title: "Savings rate",
								value: "34.8%",
								note: "Above your 3-month average",
								tone: "text-signal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightBand, {
								title: "Food spending",
								value: "+23%",
								note: "Compared with last month",
								tone: "text-warning-signal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightBand, {
								title: "Avg. transaction",
								value: "₹1,872",
								note: "Across 228 simulated transactions",
								tone: "text-info-signal"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "security",
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 lg:grid-cols-12 lg:px-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:col-span-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono uppercase tracking-[0.22em] text-signal",
								children: "07 — Security"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "mt-4 font-display text-4xl font-bold",
								children: [
									"Built like a bank.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Felt like a SaaS."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 max-w-lg leading-relaxed text-mute",
								children: "Protected authentication, password hygiene, role-aware permissions, input validation, and a relational data model ready for real services. No real bank credentials are collected."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "lg:col-span-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-signal/30 bg-signal/5 p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-display text-2xl font-bold",
									children: "Ready to see your money clearly?"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-mute",
									children: "Open the demo workspace with simulated INR data and real product interactions."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/dashboard",
									className: "fs-clip mt-6 block bg-signal py-3.5 text-center font-medium text-signal-foreground transition hover:brightness-110",
									children: ["Launch FinSight ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 inline size-4" })]
								})
							]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mx-auto flex max-w-[1440px] flex-col justify-between gap-3 px-6 py-8 text-center text-[10px] font-mono uppercase tracking-[0.15em] text-mute sm:flex-row sm:text-left lg:px-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 FinSight — simulated financial data" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "React · TanStack Start · Lovable Cloud" })]
			})
		]
	});
}
function Feature({ icon, index, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-panel p-6 transition hover:border-signal/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between text-mute",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] font-mono tracking-[0.16em]",
					children: index
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-signal [&>svg]:size-5",
					children: icon
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 font-display text-xl font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-mute",
				children: copy
			})
		]
	});
}
function InsightBand({ title, value, note, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-panel p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-mono uppercase tracking-[0.16em] text-mute",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-4 font-mono text-3xl font-bold ${tone}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-sm text-mute",
				children: note
			})
		]
	});
}
function TerminalPreview() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fs-rise-2 overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-line bg-raise/60 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-danger-signal/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-warning-signal/80" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2.5 rounded-full bg-signal/80" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-mono uppercase tracking-[0.18em] text-mute",
					children: "FinSight Terminal — Overview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-mono text-signal",
					children: "● LIVE"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						[
							"Total balance",
							"₹85,420",
							"▲ 4.2%",
							"text-signal"
						],
						[
							"Savings rate",
							"34.8%",
							"▲ 11%",
							"text-signal"
						],
						[
							"Monthly income",
							"₹65.0k",
							"₹65,000",
							"text-info-signal"
						],
						[
							"Expenses",
							"₹42,350",
							"▼ 8.1%",
							"text-warning-signal"
						]
					].map(([label, value, delta, tone]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-line bg-raise p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-mute",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-mono ${tone}`,
								children: delta
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 font-mono text-2xl font-bold",
							children: value
						})]
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-lg border border-line bg-raise p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] uppercase tracking-[0.16em] text-mute",
							children: "Income vs expenses — 30D"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] font-mono text-signal",
							children: ["income ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-warning-signal",
								children: "expense"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "fs-tick flex h-28 items-end gap-2",
						children: bars.map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 items-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 rounded-t bg-signal/70",
								style: { height: `${height}%` }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-1/3 rounded-t bg-warning-signal/80",
								style: { height: `${Math.max(32, height - 24)}%` }
							})]
						}, index))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-lg border border-line bg-raise p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-mute",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recent transactions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View all →" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: "Swiggy · Zomato"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono text-mute",
								children: "UPI · Food & Dining"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-sm font-semibold text-danger-signal",
									children: "−₹428"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-mono text-mute",
									children: "Completed"
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: "Salary — Acme Corp"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-mono text-mute",
								children: "Bank transfer · Income"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-sm font-semibold text-signal",
									children: "+₹65,000"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] font-mono text-mute",
									children: "Completed"
								})]
							})]
						})]
					})]
				})
			]
		})]
	});
}
//#endregion
export { LandingPage as component };
