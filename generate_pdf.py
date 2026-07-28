import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Suppress headers/footers on cover page
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#4b5563"))
            self.drawString(54, 11 * inch - 36, "FarmFreshDirect — Comprehensive System Documentation & Technical Blueprint")
            self.setStrokeColor(colors.HexColor("#d1d5db"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

            # Footer
            self.line(54, 48, 8.5 * inch - 54, 48)
            self.drawString(54, 34, "CONFIDENTIAL & PROPRIETARY — FARMFRESHDIRECT SYSTEM ARCHITECTURE")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(8.5 * inch - 54, 34, page_text)

        self.restoreState()

def build_pdf(filename="FarmFreshDirect_Technical_Documentation.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1b4332")
    secondary_color = colors.HexColor("#2d6a4f")
    dark_neutral = colors.HexColor("#1f2937")
    accent_gold = colors.HexColor("#b45309")
    light_bg = colors.HexColor("#f0fdf4")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=primary_color,
        alignment=TA_LEFT,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=secondary_color,
        alignment=TA_LEFT,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        spaceAfter=6,
        alignment=TA_LEFT
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#065f46"),
        backColor=colors.HexColor("#f0fdf4"),
        borderColor=colors.HexColor("#a7f3d0"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white,
        alignment=TA_LEFT
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_neutral,
        alignment=TA_LEFT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=primary_color,
        alignment=TA_LEFT
    )

    story = []

    # --- COVER / TITLE BANNER ---
    story.append(Spacer(1, 15))
    story.append(Paragraph("FARMFRESHDIRECT", ParagraphStyle('SubHeader', fontName='Helvetica-Bold', fontSize=10, textColor=accent_gold, spaceAfter=5)))
    story.append(Paragraph("Complete Technical Architecture & System Specification Walkthrough", title_style))
    story.append(Paragraph("An end-to-end direct farm-to-consumer digital marketplace linking organic growers with local consumers through best-seller algorithms, real-time stock tracking, dual-mode hybrid storage, and transactional OTP verification.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=0, spaceAfter=15))

    # Meta Info Table
    meta_data = [
        [Paragraph("<b>Project Name:</b> FarmFreshDirect", table_cell_style), Paragraph("<b>Tech Stack:</b> React 19, Vite, Express, Node, MongoDB, JWT", table_cell_style)],
        [Paragraph("<b>Architecture:</b> RESTful SPA + Best-Seller Sorting Engine", table_cell_style), Paragraph("<b>Security:</b> Bcrypt, JWT Auth, Resend 6-Digit OTP", table_cell_style)],
        [Paragraph("<b>Author/Team:</b> Engineering Team", table_cell_style), Paragraph("<b>Date:</b> July 2026", table_cell_style)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # --- SECTION 1: EXECUTIVE OVERVIEW ---
    story.append(Paragraph("1. Executive Overview & System Architecture", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=secondary_color, spaceBefore=0, spaceAfter=8))
    
    story.append(Paragraph(
        "<b>FarmFreshDirect</b> is designed to connect agricultural growers directly to buyers. Produce listed on the platform is sorted automatically so that <b>Best-Selling (highest sales volume) vegetables and fruits appear first</b> to consumers.",
        body_style
    ))

    arch_box = (
        "┌────────────────────────────────────────────────────────────────────────────────────────┐<br/>"
        "│                          <b>FRONTEND TIER (Vite + React 19 SPA)</b>                           │<br/>"
        "│  Landing Page (GSAP/Canvas) │ Farmer Hub Dashboard │ Marketplace │ Cart Drawer │ Auth Modal  │<br/>"
        "└───────────────────────────────────────────┬────────────────────────────────────────────┘<br/>"
        "                                            │ JSON HTTP REST API (CORS, JWT Headers)<br/>"
        "┌───────────────────────────────────────────▼────────────────────────────────────────────┐<br/>"
        "│                           <b>BACKEND TIER (Node.js + Express API)</b>                          │<br/>"
        "│  Auth Routes (/api/auth) │ Product Routes (/api/products) │ Order Routes (/api/orders)     │<br/>"
        "│  Best-Seller Engine: { soldCount: -1 } sorting & atomic stock decrementing              │<br/>"
        "└───────────────────────────────────────────┬────────────────────────────────────────────┘<br/>"
        "                                            │ dbAdapter.js (Auto Connection Detector)<br/>"
        "                    ┌───────────────────────┴───────────────────────┐<br/>"
        "                    │                                               │<br/>"
        "        ┌───────────▼───────────┐                       ┌───────────▼───────────┐<br/>"
        "        │  PRIMARY DATABASE     │                       │  OFFLINE FALLBACK     │<br/>"
        "        │ MongoDB Atlas / Local │                       │ JSON File Storage     │<br/>"
        "        │ Mongoose Schema Engine│                       │ (JSONModel Engine)    │<br/>"
        "        └───────────────────────┘                       └───────────────────────┘"
    )
    story.append(Paragraph(arch_box, code_style))
    story.append(Spacer(1, 10))

    # --- SECTION 2: COMPREHENSIVE TECH STACK ---
    story.append(Paragraph("2. Comprehensive Technology Stack Breakdown", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=secondary_color, spaceBefore=0, spaceAfter=8))

    stack_headers = [Paragraph("Tier", table_header_style), Paragraph("Technologies & Libraries", table_header_style), Paragraph("Primary Responsibility", table_header_style)]
    stack_rows = [
        stack_headers,
        [Paragraph("<b>Frontend Core</b>", table_cell_bold), Paragraph("React 19, React-DOM, Vite 8", table_cell_style), Paragraph("Component rendering, state management, near-instant HMR dev bundling.", table_cell_style)],
        [Paragraph("<b>Routing & UI</b>", table_cell_bold), Paragraph("React Router DOM v6, Lucide React", table_cell_style), Paragraph("Client-side SPA navigation (/farmer, /consumer) & scalable vector icons.", table_cell_style)],
        [Paragraph("<b>Best Seller Engine</b>", table_cell_bold), Paragraph("soldCount Index & Sorting", table_cell_style), Paragraph("Prioritizes high-demand produce so highest selling items render at top.", table_cell_style)],
        [Paragraph("<b>Animations</b>", table_cell_bold), Paragraph("GSAP 3.15, HTML5 Canvas API", table_cell_style), Paragraph("Staggered timeline reveals, 3D perspective mouse tilt, particle physics canvas.", table_cell_style)],
        [Paragraph("<b>Backend API</b>", table_cell_bold), Paragraph("Node.js, Express.js 4.19, CORS", table_cell_style), Paragraph("REST API routing, middleware execution, HTTP request lifecycle control.", table_cell_style)],
        [Paragraph("<b>Database</b>", table_cell_bold), Paragraph("MongoDB, Mongoose 8.4, Custom JSONModel", table_cell_style), Paragraph("NoSQL BSON document persistence with automatic offline JSON fallback adapter.", table_cell_style)],
        [Paragraph("<b>Authentication</b>", table_cell_bold), Paragraph("JSONWebToken (JWT) 9.0, BcryptJS 3.0", table_cell_style), Paragraph("Stateless signed authorization headers & 10-round password salt hashing.", table_cell_style)],
        [Paragraph("<b>Email Services</b>", table_cell_bold), Paragraph("Resend API 6.12", table_cell_style), Paragraph("Transactional HTML OTP delivery for signups and password recovery.", table_cell_style)]
    ]
    stack_table = Table(stack_rows, colWidths=[100, 170, 234])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 15))

    # --- SECTION 3: BEST SELLER ALGORITHM & PAGE WALKTHROUGH ---
    story.append(Paragraph("3. Best-Seller Ranking Engine & Page Walkthrough", h1_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=secondary_color, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("<b>A. How Best-Seller Priority Ranking Operates:</b>", h2_style))
    story.append(Paragraph("1. <b>Data Tracking (soldCount):</b> Every product schema tracks a <code>soldCount</code> attribute representing total cumulative units ordered.", bullet_style))
    story.append(Paragraph("2. <b>Atomic Sales Increments:</b> When a customer checks out, the backend executes an atomic database operation: <code>$inc: { quantity: -N, soldCount: N }</code>.", bullet_style))
    story.append(Paragraph("3. <b>Default Primary Sort:</b> Backend queries and frontend state sort produce by <code>soldCount: -1</code> (descending), ensuring top-selling items render FIRST in the grid.", bullet_style))
    story.append(Paragraph("4. <b>Best Seller Badges:</b> Highlights top sellers with a <b>🔥 BEST SELLER</b> gradient badge and displays individual sales counts (e.g. <code>🔥 45 kg sold</code>).", bullet_style))

    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>B. Consumer Marketplace Page Walkthrough:</b>", h2_style))
    story.append(Paragraph("• <b>Default Priority Grid:</b> Products selling the most appear at the very top of the catalog.", bullet_style))
    story.append(Paragraph("• <b>Sort Selector:</b> Includes a sort control allowing switching between <code>🔥 Best Sellers (Most Sold)</code>, <code>🌱 Newest Harvest</code>, <code>₹ Price: Low to High</code>, and <code>₹ Price: High to Low</code>.", bullet_style))
    story.append(Paragraph("• <b>Details Modal:</b> Shows total units sold alongside available stock so buyers see real-time community demand.", bullet_style))

    story.append(Spacer(1, 20))
    story.append(Paragraph("<i>Documentation updated automatically for FarmFreshDirect application workspace.</i>", ParagraphStyle('FooterNote', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor("#6b7280"), alignment=TA_CENTER)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Updated PDF successfully generated at: {pdf_path}")

if __name__ == "__main__":
    build_pdf()
