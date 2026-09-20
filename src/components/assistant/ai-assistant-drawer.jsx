import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Target,
  Repeat,
  FileText,
  Shield,
  Info,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { processAssistantMessage } from "@/lib/assistant/assistant-service";
import { useCreateTransaction } from "@/hooks/queries/use-transactions";

const SUGGESTED_QUESTIONS = [
  "How much did I spend on food this month?",
  "Show transactions above ₹5,000",
  "Am I close to exceeding my budgets?",
  "What is my financial health score?",
  "Show my active savings goals",
  "Find unusual transactions",
];

export function AiAssistantDrawer({
  isOpen,
  onClose,
  userId,
  transactions = [],
  budget = null,
  goals = [],
  recurringTxns = [],
  categories = [],
  accounts = [],
}) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      result: {
        type: "WELCOME",
        title: "FinSight AI Assistant",
        message: "Hello! I am your privacy-first financial assistant. Ask me anything about your spending, budgets, goals, or anomalies.",
      },
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const createTxn = useCreateTransaction(userId);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    const userMsg = {
      id: String(Date.now()),
      role: "user",
      text: prompt,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = {
        userId,
        transactions,
        budget,
        goals,
        recurringTxns,
        categories,
        accounts,
      };

      const response = await processAssistantMessage(prompt, context);
      setMessages((prev) => [...prev, response]);

      // Handle automatic navigation if requested
      if (response.result?.type === "NAVIGATION_ACTION" && response.result.targetRoute) {
        setTimeout(() => {
          navigate({ to: response.result.targetRoute });
        }, 1200);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          role: "assistant",
          result: {
            type: "ERROR",
            title: "Error Processing Query",
            message: "An unexpected error occurred while analyzing your data. Please try again.",
          },
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransaction = async (msgId, payload) => {
    try {
      await createTxn.mutateAsync(payload);
      toast.success("Transaction recorded successfully!");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? {
                ...m,
                result: {
                  ...m.result,
                  confirmed: true,
                  message: `✅ Confirmed: ₹${Number(payload.amount).toLocaleString("en-IN")} ${payload.type} for ${payload.merchant || "Transaction"} has been added to your ledger.`,
                },
              }
            : m
        )
      );
    } catch (err) {
      toast.error(err.message || "Failed to create transaction.");
    }
  };

  const handleDiscardTransaction = (msgId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              result: {
                ...m.result,
                discarded: true,
                message: "Transaction creation was cancelled.",
              },
            }
          : m
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-panel shadow-2xl">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-signal/15 text-signal border border-signal/30">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display font-bold text-sm text-ink">FinSight Assistant</h3>
                <span className="rounded bg-signal/10 px-1.5 py-0.2 text-[9px] font-mono text-signal">AI</span>
              </div>
              <p className="text-[11px] text-mute flex items-center gap-1">
                <Shield className="size-3 text-signal" /> Privacy-first & Zero raw data leakage
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-signal px-3.5 py-2.5 text-xs text-signal-foreground font-medium shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[95%] space-y-2 text-xs">
                  {/* Assistant Message Bubble */}
                  <div className="rounded-2xl rounded-tl-none border border-line bg-raise/50 p-3.5 shadow-sm space-y-3">
                    <p className="text-ink leading-relaxed">{msg.result?.message}</p>

                    {/* 1. SPENDING SUMMARY CARD */}
                    {msg.result?.type === "SPENDING_SUMMARY" && (
                      <div className="rounded-xl border border-line bg-panel p-3 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-mute uppercase font-mono">{msg.result.categoryName}</span>
                          <span className="text-[11px] font-mono text-mute">{msg.result.periodLabel}</span>
                        </div>
                        <div className="font-display text-2xl font-bold text-ink">
                          ₹{msg.result.totalAmount.toLocaleString("en-IN")}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-mute font-mono">
                          <span>{msg.result.transactionCount} transactions</span>
                          <span>Avg: ₹{msg.result.averageAmount.toLocaleString("en-IN")}/txn</span>
                        </div>
                        {msg.result.topCategories?.length > 0 && (
                          <div className="pt-2 border-t border-line space-y-1">
                            {msg.result.topCategories.map((c, i) => (
                              <div key={i} className="flex justify-between text-[11px]">
                                <span className="text-mute">{c.name}</span>
                                <span className="font-mono text-ink font-medium">₹{c.amount.toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.result.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-[11px] gap-1"
                            onClick={() => {
                              onClose();
                              navigate({ to: msg.result.actionUrl });
                            }}
                          >
                            {msg.result.actionLabel} <ArrowRight className="size-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 2. TRANSACTION LIST CARD */}
                    {msg.result?.type === "TRANSACTION_LIST" && msg.result.items?.length > 0 && (
                      <div className="rounded-xl border border-line bg-panel divide-y divide-line overflow-hidden">
                        {msg.result.items.map((t) => (
                          <div key={t.id} className="p-2.5 flex items-center justify-between text-[11px]">
                            <div>
                              <div className="font-medium text-ink">{t.merchant}</div>
                              <div className="text-[10px] text-mute">{t.date} • {t.category}</div>
                            </div>
                            <div className={`font-mono font-semibold ${t.type === "income" ? "text-signal" : "text-ink"}`}>
                              {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                        {msg.result.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-7 text-[11px] gap-1 rounded-none border-t border-line text-signal"
                            onClick={() => {
                              onClose();
                              navigate({ to: msg.result.actionUrl });
                            }}
                          >
                            {msg.result.actionLabel} <ArrowRight className="size-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 3. BUDGET STATUS CARD */}
                    {msg.result?.type === "BUDGET_STATUS" && msg.result.categories?.length > 0 && (
                      <div className="rounded-xl border border-line bg-panel p-3 space-y-2.5">
                        {msg.result.categories.map((b, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-medium text-ink">{b.categoryName}</span>
                              <span className="font-mono text-mute">{b.percentage}% (₹{b.spent.toLocaleString("en-IN")}/₹{b.limit.toLocaleString("en-IN")})</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  b.isExceeded ? "bg-red-500" : b.isNearLimit ? "bg-amber-500" : "bg-signal"
                                }`}
                                style={{ width: `${Math.min(100, b.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {msg.result.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-[11px] gap-1"
                            onClick={() => {
                              onClose();
                              navigate({ to: msg.result.actionUrl });
                            }}
                          >
                            {msg.result.actionLabel} <ArrowRight className="size-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 4. SAVINGS GOALS CARD */}
                    {msg.result?.type === "SAVINGS_GOALS" && msg.result.items?.length > 0 && (
                      <div className="rounded-xl border border-line bg-panel p-3 space-y-2.5">
                        {msg.result.items.map((g) => (
                          <div key={g.id} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-medium text-ink">{g.name}</span>
                              <span className="font-mono text-mute">{g.progress}% (₹{g.currentAmount.toLocaleString("en-IN")}/₹{g.targetAmount.toLocaleString("en-IN")})</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                              <div
                                className="h-full rounded-full bg-signal"
                                style={{ width: `${g.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {msg.result.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-[11px] gap-1"
                            onClick={() => {
                              onClose();
                              navigate({ to: msg.result.actionUrl });
                            }}
                          >
                            {msg.result.actionLabel} <ArrowRight className="size-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 5. ANOMALY RADAR CARD */}
                    {msg.result?.type === "ANOMALY_RADAR" && msg.result.items?.length > 0 && (
                      <div className="rounded-xl border border-line bg-panel divide-y divide-line overflow-hidden">
                        {msg.result.items.map((a, i) => (
                          <div key={i} className="p-2.5 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-ink">{a.merchant}</span>
                              <span className="font-mono font-semibold text-amber-500">₹{a.amount.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="text-[10px] text-mute">{a.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 6. HEALTH SCORE CARD */}
                    {msg.result?.type === "HEALTH_SCORE_SUMMARY" && (
                      <div className="rounded-xl border border-line bg-panel p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-mute uppercase font-mono">Health Score</span>
                          <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-mono text-signal font-semibold">
                            {msg.result.grade}
                          </span>
                        </div>
                        <div className="font-display text-3xl font-bold text-ink">{msg.result.score}/100</div>
                        {msg.result.explanations?.length > 0 && (
                          <div className="pt-2 border-t border-line space-y-1">
                            {msg.result.explanations.map((exp, i) => (
                              <div key={i} className="text-[11px] text-mute flex items-start gap-1.5">
                                <span className="text-signal">•</span>
                                <span>{exp}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.result.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-[11px] gap-1"
                            onClick={() => {
                              onClose();
                              navigate({ to: msg.result.actionUrl });
                            }}
                          >
                            {msg.result.actionLabel} <ArrowRight className="size-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* 7. TRANSACTION STAGING (WRITE CONFIRMATION) */}
                    {msg.result?.type === "TRANSACTION_STAGING" && !msg.result.confirmed && !msg.result.discarded && (
                      <div className="rounded-xl border border-line bg-panel p-3.5 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                          <CreditCard className="size-3.5 text-signal" /> Confirm Financial Record
                        </div>
                        <div className="space-y-1.5 text-[11px] bg-raise/50 p-2.5 rounded-lg border border-line">
                          <div className="flex justify-between">
                            <span className="text-mute">Amount:</span>
                            <span className="font-mono font-bold text-ink">₹{msg.result.pendingAction.payload.amount.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-mute">Type:</span>
                            <span className="font-mono capitalize text-ink">{msg.result.pendingAction.payload.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-mute">Merchant:</span>
                            <span className="font-medium text-ink">{msg.result.pendingAction.payload.merchant}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-mute">Category:</span>
                            <span className="text-ink">{msg.result.pendingAction.payload.categoryName || "General"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-mute">Date:</span>
                            <span className="font-mono text-mute">{msg.result.pendingAction.payload.transaction_date}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-1/2 h-8 text-xs"
                            onClick={() => handleDiscardTransaction(msg.id)}
                          >
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            className="w-1/2 h-8 text-xs bg-signal text-signal-foreground hover:bg-signal/90"
                            onClick={() => handleConfirmTransaction(msg.id, msg.result.pendingAction.payload)}
                            disabled={createTxn.isPending}
                          >
                            {createTxn.isPending ? <Loader2 className="size-3 animate-spin" /> : "Confirm & Save"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 8. NAVIGATION ACTION CARD */}
                    {msg.result?.type === "NAVIGATION_ACTION" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs gap-1 border-signal/30 text-signal bg-signal/10"
                        onClick={() => {
                          onClose();
                          navigate({ to: msg.result.targetRoute });
                        }}
                      >
                        {msg.result.actionLabel} <ArrowRight className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-mute font-mono p-2">
              <Loader2 className="size-3.5 animate-spin text-signal" />
              <span>Analyzing financial telemetry…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Section */}
        {messages.length <= 2 && (
          <div className="border-t border-line bg-raise/30 p-3 space-y-2">
            <div className="text-[10px] font-mono text-mute uppercase">Suggested Prompts</div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="rounded-lg border border-line bg-panel px-2 py-1 text-[11px] text-mute hover:text-ink hover:border-signal/40 transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-line bg-panel p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about spending, budgets, goals, or anomalies..."
              className="text-xs h-9"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
              className="size-9 shrink-0 bg-signal text-signal-foreground hover:bg-signal/90"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
