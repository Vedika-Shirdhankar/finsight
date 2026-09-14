/**
 * Notifications & Automation Client Helper
 */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
/**
 * Triggers automated processing of due recurring transactions on the backend
 */
export async function triggerRecurringAutomation() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/automation/process-recurring`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok)
            throw new Error(`Automation endpoint failed with status ${res.status}`);
        return await res.json();
    }
    catch (error) {
        console.error('Error triggering recurring automation:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Triggers automated budget threshold checks on the backend
 */
export async function triggerBudgetThresholdCheck() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/automation/check-budget-alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok)
            throw new Error(`Budget alert endpoint failed with status ${res.status}`);
        return await res.json();
    }
    catch (error) {
        console.error('Error triggering budget alert checks:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Dispatches an email notification via the backend email channel
 */
export async function sendEmailNotification(toEmail, subject, body) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/notifications/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toEmail, subject, body }),
        });
        if (!res.ok)
            throw new Error(`Email dispatch failed with status ${res.status}`);
        return await res.json();
    }
    catch (error) {
        console.error('Error dispatching email notification:', error);
        return { success: false, error: error.message };
    }
}
