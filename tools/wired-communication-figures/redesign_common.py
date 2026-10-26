"""Editable scene primitives for the Figma-only wired figure revision."""
import math
from html import escape

INK, MUTED, GRID = '#263238', '#52616B', '#DCE3E7'
BLUE, ORANGE = '#0072B2', '#D55E00'
BLUE_TINT, ORANGE_TINT = '#EDF6FA', '#FFF3EA'


class Scene:
    def __init__(self, width=840, height=440):
        self.w, self.h, self.geometry, self.labels = width, height, [], []

    def path(self, d, color=INK, stroke=2.2, fill='none', dash=None):
        extra = f' stroke-dasharray="{dash}"' if dash else ''
        self.geometry.append(f'<path d="{d}" stroke="{color}" stroke-width="{stroke}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"{extra}/>')

    def line(self, x1, y1, x2, y2, color=INK, stroke=2.2, dash=None):
        self.path(f'M{x1},{y1} L{x2},{y2}', color, stroke, dash=dash)

    def rect(self, x, y, w, h, fill='white', color=INK, stroke=1.6):
        self.geometry.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{color}" stroke-width="{stroke}"/>')

    def circle(self, x, y, r=3.5, color=INK, fill=None):
        self.geometry.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill or color}" stroke="{color}" stroke-width="1.5"/>')

    def text(self, x, y, text, size=20, color=INK, bold=False, width=None):
        # Orange is reserved for marks; use a darker orange for readable small labels.
        if color == ORANGE:
            color = '#9C4200'
        self.labels.append(dict(x=x, y=y, text=str(text), size=size, color=color,
                                bold=bold, width=width or self.w-x-20))

    def arrow(self, x1, y1, x2, y2, color=BLUE, stroke=2.6):
        self.line(x1, y1, x2, y2, color, stroke)
        a=math.atan2(y2-y1,x2-x1)
        pts=[(x2-9*math.cos(a)+4*math.sin(a),y2-9*math.sin(a)-4*math.cos(a)),
             (x2-9*math.cos(a)-4*math.sin(a),y2-9*math.sin(a)+4*math.cos(a))]
        self.path(f'M{x2},{y2} L{pts[0][0]},{pts[0][1]} L{pts[1][0]},{pts[1][1]} Z',color,1,color)

    def ground(self,x,y):
        self.line(x,y,x,y+10)
        for i,r in enumerate((14,9,4)):
            self.line(x-r,y+10+i*6,x+r,y+10+i*6)

    def resistor(self,x,y,height=48):
        self.line(x,y,x,y+8)
        self.rect(x-9,y+8,18,height-16)
        self.line(x,y+height-8,x,y+height)

    def box(self,x,y,w,h,title,sub=None,color=INK,fill='white',size=20):
        self.rect(x,y,w,h,fill,color)
        self.text(x+14,y+12,title,size,bold=True,width=w-28)
        if sub:
            self.text(x+14,y+48,sub,17,MUTED,width=w-28)

    def trace(self, coords, color=BLUE, dash=None, stroke=2.6):
        self.path(' '.join(('M' if i==0 else 'L')+f'{x:.3f},{y:.3f}' for i,(x,y) in enumerate(coords)),color,stroke,dash=dash)

    def svg(self, labels=False):
        body=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">',f'<rect width="{self.w}" height="{self.h}" fill="white"/>',*self.geometry]
        if labels:
            for t in self.labels:
                for i,line in enumerate(t['text'].split('\n')):
                    body.append(f'<text x="{t["x"]}" y="{t["y"]+t["size"]*1.08+i*t["size"]*1.45}" font-family="Noto Sans JP,sans-serif" font-size="{t["size"]}" font-weight="{700 if t["bold"] else 400}" fill="{t["color"]}">{escape(line)}</text>')
        return ''.join(body)+'</svg>'

    def data(self,name):
        return dict(name=name,width=self.w,height=self.h,svg=self.svg(),labels=self.labels)
