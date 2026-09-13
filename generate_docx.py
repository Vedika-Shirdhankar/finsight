import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def create_interview_doc():
    doc = docx.Document()

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Styles & Colors
    PRIMARY_COLOR = RGBColor(16, 185, 129)    # Emerald / Signal Green
    HEADER_COLOR = RGBColor(15, 23, 42)       # Slate 900
    TEXT_COLOR = RGBColor(51, 65, 85)        # Slate 700
    ACCENT_BLUE = RGBColor(37, 99, 235)      # Royal Blue

    # Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Arial'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = TEXT_COLOR

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("FinSight Analytics\nFull-Stack & FinTech Engineering Interview Guide")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = HEADER_COLOR

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("Comprehensive Technical Mastery, System Architecture & Q&A Playbook")
    run_sub.font.size = Pt(12)
    run_sub.font.italic = True
    run_sub.font.color.rgb = PRIMARY_COLOR

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    def add_heading_1(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        run = h.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(15)
        run.font.bold = True
        run.font.color.rgb = HEADER_COLOR
        return h

    def add_heading_2(text):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        run = h.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12.5)
        run.font.bold = True
        run.font.color.rgb = ACCENT_BLUE
        return h

    def add_bullet(p_text, bold_prefix=""):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            run_b = p.add_run(bold_prefix + " ")
            run_b.bold = True
            run_b.font.color.rgb = HEADER_COLOR
        p.add_run(p_text)

    # SECTION 1
    add_heading_1("1. Project Executive Summary & Architecture Overview")
    p1 = doc.add_paragraph()
    p1.add_run(
        "FinSight Analytics is a production-grade full-stack FinTech application that transforms raw digital transaction telemetry "
        "into meaningful, actionable financial intelligence. Unlike basic expense trackers, FinSight incorporates advanced mathematical "
        "forecasting, statistical anomaly detection (Z-Score & IQR), category drift momentum, and 90-day cash flow liquidity modeling."
    )

    add_heading_2("Architecture & Deployment Topology")
    table = doc.add_table(rows=5, cols=3)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Component Layer"
    hdr_cells[1].text = "Technology Stack"
    hdr_cells[2].text = "Production Hosting & Purpose"

    for cell in hdr_cells:
        set_cell_background(cell, "0F172A")
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)

    data = [
        ("Frontend Web App", "React 19, Vite, TanStack Router/Start, Tailwind CSS, Recharts", "Deployed on Vercel (Edge SPA Routing)"),
        ("Backend REST API", "Node.js, Express.js, Multer, Cors, Morgan", "Deployed on Render (Stateless Web Service)"),
        ("Database & Auth", "PostgreSQL, Supabase Auth, Row-Level Security (RLS)", "Cloud Supabase (Managed Postgres Cluster)"),
        ("Media & Receipt Engine", "Cloudinary Node SDK, Multipart Stream Buffer", "Cloudinary CDN (Receipts & Avatars)")
    ]

    for i, row in enumerate(data):
        row_cells = table.rows[i+1].cells
        row_cells[0].text = row[0]
        row_cells[1].text = row[1]
        row_cells[2].text = row[2]
        bg_hex = "F8FAFC" if i % 2 == 0 else "FFFFFF"
        for cell in row_cells:
            set_cell_background(cell, bg_hex)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # SECTION 2
    add_heading_1("2. Full Feature Matrix — What Has Been Implemented")
    add_bullet("Full-stack authentication with protected routes, password resets, and session persistence.", "1. User Authentication & Security:")
    add_bullet("Multi-account aggregation (Checking, Credit, Savings, Shared), real-time balance calculations.", "2. Financial Account Management:")
    add_bullet("Comprehensive ledger supporting search, multi-filter by category/date/type, CSV bulk import (PapaParse), and PDF summary downloads (jsPDF).", "3. Transaction Engine:")
    add_bullet("Subcriptions, salary, and utility automation with active/inactive frequency schedules.", "4. Recurring Transactions:")
    add_bullet("Shared expense groups, percentage & equal split calculation logic, member permissions.", "5. Split Expenses & Shared Balances:")
    add_bullet("Month-over-month category spending drift & momentum analysis with velocity indicators (+15% MoM thresholds).", "6. Category Drift Engine:")
    add_bullet("Combines live balances, recurring salary, fixed subscription bills, and active goal targets over +30D, +60D, and +90D intervals.", "7. 90-Day Cash-Flow Projection:")
    add_bullet("Statistical outlier detection using Z-Score variance against category historical means (Z > 2.2σ) with severity badges.", "8. Anomaly Radar:")
    add_bullet("Multipart form data uploads via Express memory storage proxy to Cloudinary SDK.", "9. Cloudinary Media Pipelines:")

    # SECTION 3
    add_heading_1("3. Core Technical Concepts & System Design Deep Dives")

    add_heading_2("A. Z-Score Statistical Anomaly Detection Algorithm")
    p_alg = doc.add_paragraph()
    p_alg.add_run(
        "To flag unusual transactions without hardcoding arbitrary rupee thresholds, FinSight calculates standard deviation variance per category:\n"
    )
    doc.add_paragraph("Formula: Z = (x - μ) / σ", style='Quote')
    add_bullet("Calculated as the total category spend divided by the number of transactions in that category.", "Mean (μ):")
    add_bullet("Square root of the average squared differences from the Mean.", "Standard Deviation (σ):")
    add_bullet("If Z >= 2.2σ, the transaction is flagged. If Z >= 3.5σ or amount >= 3x mean, it is marked as High Severity.", "Outlier Condition:")
    add_bullet("Requires at least 3 historical transactions per group before computing Z-scores, preventing false positives on new categories.", "Small-Sample Guardrail:")

    add_heading_2("B. Secure Cloudinary Media Upload Architecture")
    p_med = doc.add_paragraph()
    p_med.add_run(
        "Instead of exposing Cloudinary API Secrets on the client-side Vercel frontend, FinSight implements a secure backend buffer pipeline:\n"
        "1. Client sends multipart form data file (receipt/avatar) to Render Backend (/api/upload/receipt).\n"
        "2. Express uses Multer in memoryStorage() mode to receive the buffer in RAM (no disk writing).\n"
        "3. Backend converts file buffer to base64 Data URI and streams it directly to Cloudinary SDK.\n"
        "4. Cloudinary returns secure HTTPS CDN URL which is returned to the client and stored in Postgres."
    )

    add_heading_2("C. Row-Level Security (RLS) & PostgreSQL Isolation")
    p_rls = doc.add_paragraph()
    p_rls.add_run(
        "Database security is enforced directly at the PostgreSQL layer using Supabase Row Level Security policies:\n"
        "• CREATE POLICY 'Users can only view their own transactions' ON transactions FOR SELECT USING (auth.uid() = user_id);\n"
        "This guarantees that even if an attacker bypasses application-level filters, PostgreSQL blocks unauthorized database access at the database kernel level."
    )

    # SECTION 4
    add_heading_1("4. High-Impact Interview Q&A Playbook (Top Questions)")

    qa_list = [
        ("Q1: How would you describe the architecture of FinSight to a technical interviewer?",
         "FinSight is built as a decoupled, multi-tier cloud application. The frontend is a React 19 SPA built with Vite and TanStack Router, deployed on Vercel. The backend is a stateless Node.js / Express REST API deployed on Render. Data persistence and authentication are handled by Supabase (PostgreSQL with Row Level Security), and media assets are managed via Cloudinary using Express memory storage proxies. This separation ensures independent scaling, high security, and zero vendor lock-in."),

        ("Q2: How did you implement anomaly detection in financial transactions?",
         "Instead of using fixed rupee thresholds which don't scale across different spending habits, I implemented a per-category statistical Z-score algorithm. The engine computes the mean and standard deviation for each category group. Transactions exceeding 2.2 standard deviations above the category mean are flagged. I also implemented a sample size guardrail requiring at least 3 transactions per category to eliminate small-sample variance noise."),

        ("Q3: Why did you route Cloudinary file uploads through the Express backend instead of direct client uploads?",
         "Routing uploads through the backend protects sensitive Cloudinary API Secrets from exposure in client-side JavaScript bundles. The Express server uses Multer memory storage to capture the file in RAM and streams it directly to Cloudinary via the official SDK. For public unsigned scenarios, I also built a fallback client service in src/lib/cloudinary.ts."),

        ("Q4: How do you handle CORS and security across Vercel and Render?",
         "CORS is configured on the Express backend using regex-matched origins. The server checks incoming request headers against allowed frontend origins (e.g., Vercel production domain and localhost). Additionally, standard security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection) are enforced at the Vercel edge level via vercel.json."),

        ("Q5: How does the 90-day cash flow projection algorithm work?",
         "The projection model aggregates four key financial vectors: current liquid balance across all accounts, active recurring income (salaries/dividends), active recurring expenses (rent/subscriptions), and target monthly allocations for savings goals. It calculates a net monthly cash delta and computes projected balances at +30D, +60D, and +90D intervals, which are rendered on an interactive area curve.")
    ]

    for q, a in qa_list:
        add_heading_2(q)
        p_ans = doc.add_paragraph()
        p_ans.add_run(a)

    # Save document
    doc_path = "c:\\Users\\Vedika\\Downloads\\insightful-fin-flows-with-notifications (3)\\insightful-fin-flows-main\\FinSight_Interview_Mastery_Guide.docx"
    doc.save(doc_path)
    print(f"Document saved successfully to {doc_path}")

if __name__ == "__main__":
    create_interview_doc()
