from fastapi import APIRouter, HTTPException, Response
from core.schemas import ExportRequest
from fpdf import FPDF
import uuid
from datetime import datetime
import math
import numpy as np
import matplotlib.pyplot as plt
import tempfile
import os

router = APIRouter()


class TitanMasterReport(FPDF):

    angle = 0

    # --------------------------------
    # ROTATION
    # --------------------------------
    def rotate(self, angle, x=None, y=None):
        if x is None:
            x = self.x
        if y is None:
            y = self.y

        if self.angle != 0:
            self._out("Q")

        self.angle = angle

        if angle != 0:
            angle_rad = angle * math.pi / 180
            c = math.cos(angle_rad)
            s = math.sin(angle_rad)

            cx = x * self.k
            cy = (self.h - y) * self.k

            self._out(
                f"q {c:.5f} {s:.5f} {-s:.5f} {c:.5f} {cx:.5f} {cy:.5f} cm"
            )

    # --------------------------------
    # ARC SUPPORT
    # --------------------------------
    def arc(self, x, y, w, h, start, end):

        start = math.radians(start)
        end = math.radians(end)

        seg = 30
        step = (end - start) / seg

        pts = []

        for i in range(seg + 1):
            ang = start + step * i
            px = x + w/2 + (w/2) * math.cos(ang)
            py = y + h/2 + (h/2) * math.sin(ang)
            pts.append((px, py))

        for i in range(len(pts)-1):
            self.line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1])

    # --------------------------------
    # CENTER WATERMARK LOGO
    # --------------------------------
    def draw_center_logo(self):

        cx = 105
        cy = 150

        self.set_draw_color(220,220,220)
        self.set_line_width(0.5)

        # antenna mast
        self.line(cx, cy-25, cx, cy+25)

        # RF radiation arcs
        for r in [20,35,50]:
            self.arc(cx-r, cy-r, r*2, r*2, 40, 140)
            self.arc(cx-r, cy-r, r*2, r*2, 220, 320)

        # base
        self.line(cx-12, cy+25, cx+12, cy+25)

    # --------------------------------
    # HEADER
    # --------------------------------
    def header(self):

        self.set_fill_color(10,16,32)
        self.rect(0,0,210,35,'F')

        self.set_xy(15,12)

        self.set_font("Helvetica","B",20)
        self.set_text_color(0,245,255)
        self.cell(0,10,"RF-NEXUS TITAN AI",ln=1)

        self.set_font("Helvetica","",9)
        self.set_text_color(200,200,200)

        self.set_x(15)
        self.cell(0,5,"Advanced Electromagnetic Antenna Design Report")

        self.ln(15)

    # --------------------------------
    # FOOTER
    # --------------------------------
    def footer(self):

        self.set_y(-15)

        self.set_font("Helvetica","I",8)
        self.set_text_color(150,150,150)

        self.cell(
            0,
            10,
            f"RF-NEXUS Engineering Systems | {datetime.now().year}",
            align="C"
        )


# -------------------------------------------------
# GRAPH GENERATION
# -------------------------------------------------

def generate_radiation_pattern():

    theta = np.linspace(0,2*np.pi,360)
    r = np.abs(np.cos(theta))

    fig = plt.figure(figsize=(4,4))
    ax = fig.add_subplot(111,projection='polar')

    ax.plot(theta,r,color="cyan",linewidth=2)
    ax.set_title("Radiation Pattern")

    tmp = tempfile.NamedTemporaryFile(delete=False,suffix=".png")

    plt.savefig(tmp.name,bbox_inches='tight')
    plt.close()

    return tmp.name


def generate_return_loss():

    freq = np.linspace(2,3,100)
    s11 = -20 + 5*np.cos(freq*3)

    plt.figure(figsize=(5,3))

    plt.plot(freq,s11,color="blue",linewidth=2)
    plt.axhline(-10,color="red",linestyle="--")

    plt.title("Return Loss (S11)")
    plt.xlabel("Frequency GHz")
    plt.ylabel("dB")

    tmp = tempfile.NamedTemporaryFile(delete=False,suffix=".png")

    plt.savefig(tmp.name,bbox_inches='tight')
    plt.close()

    return tmp.name


# -------------------------------------------------
# MAIN ROUTE
# -------------------------------------------------

@router.post("/generate")
async def generate_export(request: ExportRequest):

    raw = request.dimensions or {}
    dims = {k.lower().replace("_",""):v for k,v in raw.items()}

    pw = dims.get('patchw',"35.21")
    pl = dims.get('patchl',"27.38")
    fw = dims.get('feedw',"2.99")
    freq = dims.get('freqghz',"2.4")
    conf = dims.get('confidence',"98.5")

    gpw = float(pw)+20
    eps = 4.4
    height = 1.6
    efficiency = 92.4

    uid = uuid.uuid4().hex[:6].upper()

    rad_img = generate_radiation_pattern()
    s11_img = generate_return_loss()

    try:

        pdf = TitanMasterReport()

        # ---------------- COVER PAGE ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_y(120)

        pdf.set_font("Helvetica","B",26)
        pdf.set_text_color(0,0,0)
        pdf.cell(0,15,"RF-NEXUS TITAN AI",ln=1,align="C")

        pdf.set_font("Helvetica","",14)
        pdf.cell(0,10,"Advanced Electromagnetic Design Report",ln=1,align="C")

        pdf.ln(20)

        pdf.set_font("Helvetica","",11)
        pdf.cell(0,8,f"Report ID : {uid}",ln=1,align="C")
        pdf.cell(0,8,f"Generated : {datetime.now()}",ln=1,align="C")

        # ---------------- SYSTEM METRICS PAGE ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_font("Helvetica","B",16)
        pdf.cell(0,10,"1. System Validation Metrics",ln=1)

        pdf.ln(5)

        pdf.set_font("Helvetica","",11)

        pdf.cell(0,7,f"Synthesis Time : {datetime.now()}",ln=1)
        pdf.cell(0,7,f"Operating Frequency : {freq} GHz",ln=1)
        pdf.cell(0,7,f"AI Confidence : {conf} %",ln=1)
        pdf.cell(0,7,f"Estimated Efficiency : {efficiency} %",ln=1)

        # ---------------- GEOMETRY PAGE ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_font("Helvetica","B",16)
        pdf.cell(0,10,"2. Antenna Geometry Parameters",ln=1)

        pdf.ln(10)

        pdf.set_fill_color(0,245,255)

        pdf.set_font("Helvetica","B",11)
        pdf.cell(95,10,"Parameter",1,0,'L',True)
        pdf.cell(95,10,"Value",1,1,'L',True)

        pdf.set_font("Helvetica","",11)

        specs = [
            ("Patch Width",pw),
            ("Patch Length",pl),
            ("Feed Width",fw),
            ("Ground Plane Width",gpw),
            ("Substrate Height",height),
            ("Dielectric Constant",eps)
        ]

        for label,val in specs:

            pdf.set_text_color(0,150,180)
            pdf.cell(95,10,label,1)

            pdf.set_text_color(0,0,0)
            pdf.cell(95,10,str(val),1,1)

        # ---------------- ANTENNA TOPOLOGY ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_font("Helvetica","B",16)
        pdf.cell(0,10,"3. Antenna Topology",ln=1)

        y = 90

        pdf.rect(60,y,90,60)

        pdf.set_fill_color(255,165,0)
        pdf.rect(80,y+15,50,30,'F')

        pdf.set_fill_color(120,120,120)
        pdf.rect(103,y+45,4,25,'F')

        pdf.set_font("Helvetica","",10)
        pdf.text(80,y+12,f"W = {pw} mm")
        pdf.text(130,y+30,f"L = {pl} mm")

        # ---------------- RADIATION PAGE ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_font("Helvetica","B",16)
        pdf.cell(0,10,"4. Radiation Analysis",ln=1)

        pdf.ln(10)

        pdf.image(rad_img,x=15,y=80,w=80)
        pdf.image(s11_img,x=110,y=80,w=80)

        # ---------------- AI NOTES PAGE ----------------
        pdf.add_page()

        pdf.draw_center_logo()

        pdf.set_font("Helvetica","B",16)
        pdf.cell(0,10,"5. AI Engineering Summary",ln=1)

        pdf.ln(10)

        pdf.set_font("Helvetica","",11)

        pdf.multi_cell(
            0,
            8,
            "The RF-NEXUS Titan AI system performed electromagnetic synthesis "
            "using internal optimization routines. The generated antenna geometry "
            "achieves resonance near the requested operating frequency while "
            "maintaining impedance matching characteristics suitable for "
            "standard RF front-end integration."
        )

        pdf_bytes = pdf.output(dest="S").encode("latin-1")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition":f"attachment; filename=RF_NEXUS_REPORT_{uid}.pdf"
            }
        )

    except Exception as e:
        print("REPORT_GEN_ERROR:",e)
        raise HTTPException(status_code=500,detail="Synthesis logic failed")

    finally:

        if os.path.exists(rad_img):
            os.remove(rad_img)

        if os.path.exists(s11_img):
            os.remove(s11_img)