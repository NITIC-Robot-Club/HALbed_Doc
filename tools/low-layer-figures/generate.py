"""Compute the Low_Layer figures with Python; emit editable Figma scenes and SVGs.

Only the Python standard library is needed. Coordinates are in CSS pixels.
Run from any directory: python tools/low-layer-figures/generate.py
"""
from __future__ import annotations

import json
import math
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / '.vitepress/cache/low-layer-figures'
INK, MUTED, GRID = '#263238', '#52616B', '#DCE3E7'
BLUE, ORANGE = '#0072B2', '#D55E00'
PALE_BLUE, PALE_ORANGE = '#EDF6FA', '#FFF3EA'
FONT = 'Noto Sans JP'


class Scene:
    def __init__(self, width, height):
        self.w, self.h, self.geometry, self.labels = width, height, [], []

    def path(self, d, color=INK, stroke=2.4, fill='none', dash=None):
        extra = f' stroke-dasharray="{dash}"' if dash else ''
        self.geometry.append(f'<path d="{d}" stroke="{color}" stroke-width="{stroke}" fill="{fill}" stroke-linecap="round" stroke-linejoin="round"{extra}/>')

    def line(self, x1, y1, x2, y2, color=INK, stroke=2.4, dash=None):
        self.path(f'M{x1},{y1} L{x2},{y2}', color, stroke, dash=dash)

    def rect(self, x, y, w, h, fill='white', color=INK, stroke=2):
        self.geometry.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{color}" stroke-width="{stroke}"/>')

    def circle(self, x, y, r=4, fill=INK, color=INK):
        self.geometry.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{color}" stroke-width="2"/>')

    def text(self, x, y, text, size=20, color=INK, bold=False, width=None):
        # y is the top of a fixed line-height text box, matching native Figma text.
        self.labels.append(dict(x=x, y=y, text=text, size=size, color=color,
                                bold=bold, width=width or self.w-x-12))

    def arrow(self, x1, y1, x2, y2, color=BLUE, stroke=3):
        self.line(x1, y1, x2, y2, color, stroke)
        a = math.atan2(y2-y1, x2-x1)
        p = [(x2-10*math.cos(a)+5*math.sin(a), y2-10*math.sin(a)-5*math.cos(a)),
             (x2-10*math.cos(a)-5*math.sin(a), y2-10*math.sin(a)+5*math.cos(a))]
        self.path(f'M{x2},{y2} L{p[0][0]},{p[0][1]} L{p[1][0]},{p[1][1]} Z', color, 1, color)

    def ground(self, x, y):
        self.line(x, y, x, y+12)
        for i, half in enumerate((16, 10, 4)):
            self.line(x-half, y+12+7*i, x+half, y+12+7*i)

    def resistor(self, x, y, height=58):
        self.line(x, y, x, y+10)
        self.rect(x-11, y+10, 22, height-20)
        self.line(x, y+height-10, x, y+height)

    def switch(self, x, y, closed=False, height=60):
        self.circle(x, y, 3, 'white')
        self.circle(x, y+height, 3, 'white')
        self.line(x, y+height-4, x if closed else x+27, y+4)

    def join(self, child, x, y):
        self.geometry.append(f'<g transform="translate({x},{y})">'+''.join(child.geometry)+'</g>')
        for label in child.labels:
            self.labels.append({**label, 'x': label['x']+x, 'y': label['y']+y})

    def svg(self, labels=True):
        bits = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">',
                f'<rect width="{self.w}" height="{self.h}" fill="white"/>', *self.geometry]
        if labels:
            for t in self.labels:
                for i, line in enumerate(t['text'].split('\n')):
                    bits.append(f'<text x="{t["x"]}" y="{t["y"]+t["size"]+i*t["size"]*1.5}" font-family="{FONT}" font-size="{t["size"]}" font-weight="{700 if t["bold"] else 400}" fill="{t["color"]}">{escape(line)}</text>')
        return ''.join(bits)+'</svg>'


def compose(panels, mobile, note=None):
    cols = 1 if mobile else 2
    pw = 400
    ph = max(p.h for p in panels)
    rows = math.ceil(len(panels)/cols)
    note_h = (132 if mobile else 76) if note else 0
    s = Scene(pw*cols+24*(cols+1), rows*ph+24*(rows+1)+note_h)
    for i, p in enumerate(panels):
        x = 24+(i % cols)*(pw+24)
        if len(panels) % cols and i == len(panels)-1:
            x = (s.w-pw)/2
        s.join(p, x, 24+(i//cols)*(ph+24))
    if note:
        if mobile:
            note = '理想部品・定常状態・連続導通モード\nVOUT = VIN × D\nD：スイッチON時間の割合\n矢印：主な負荷電流の向き'
        s.text(24, s.h-note_h+8, note, 18)
    return s


def pull_panel(up=True):
    s = Scene(400, 410)
    s.text(0, 0, 'プルアップ' if up else 'プルダウン', 23, bold=True)
    s.text(0, 37, '開放時はHigh' if up else '開放時はLow', 20, BLUE)
    x, node = 110, 205
    s.text(x-25, 76, 'VCC', 18)
    s.line(x, 107, x, 126)
    if up:
        s.resistor(x, 126)
        s.line(x, 184, x, node)
        s.line(x, node, x, 230)
        s.switch(x, 230)
        s.line(x, 290, x, 310)
        s.text(140, 140, 'R', 18)
        s.text(148, 248, 'SW OFF', 18)
    else:
        s.switch(x, 126)
        s.line(x, 186, x, node)
        s.line(x, node, x, 230)
        s.resistor(x, 230)
        s.line(x, 288, x, 310)
        s.text(148, 140, 'SW OFF', 18)
        s.text(140, 247, 'R', 18)
    s.ground(x, 310)
    s.circle(x, node)
    s.line(x, node, 264, node)
    s.rect(264, node-30, 112, 60, PALE_BLUE, BLUE)
    s.text(277, node-17, 'GPIO入力', 19)
    s.text(0, 358, 'SW OFF : High    SW ON : Low' if up else 'SW OFF : Low     SW ON : High', 19)
    return s


def wrong_panel(kind):
    s = Scene(400, 425)
    titles = ['入力が浮く', '電源が短絡する', '抵抗で電流を制限する']
    s.text(0, 0, titles[kind], 22, ORANGE if kind < 2 else BLUE, True)
    s.text(0, 38, ['SW OFF', 'SW ON', 'SW ON'][kind], 19)
    x, node = 100, 205
    s.text(74, 76, 'VCC', 18)
    s.line(x, 106, x, 122)
    if kind == 0:
        s.switch(x, 122)
        s.line(x, 182, x, node)
    elif kind == 1:
        s.line(x, 122, x, node)
        s.line(x, node, x, 232)
        s.switch(x, 232, True)
        s.line(x, 292, x, 310)
        s.ground(x, 310)
        s.arrow(67, 123, 67, 300, ORANGE)
    else:
        s.resistor(x, 122)
        s.text(134, 136, '10 kΩ', 19)
        s.line(x, 180, x, node)
        s.line(x, node, x, 232)
        s.switch(x, 232, True)
        s.line(x, 292, x, 310)
        s.ground(x, 310)
        s.arrow(67, 123, 67, 300, BLUE)
    s.circle(x, node)
    s.line(x, node, 265, node)
    s.rect(265, node-30, 112, 60, 'white', INK)
    s.text(278, node-17, 'GPIO入力', 19)
    if kind == 0:
        s.text(0, 282, 'VCCにもGNDにもつながらない', 19)
        s.text(0, 319, '入力はHigh / Lowが不定', 20, ORANGE)
        s.text(0, 372, '対策：入力点からGNDへ抵抗を追加', 18)
    elif kind == 1:
        s.text(0, 362, 'VCC → SW → GNDに大電流', 19, ORANGE)
        s.text(0, 395, '電源・配線・接点の抵抗だけで制限', 18)
    else:
        s.text(0, 362, '3.3 V / 10 kΩ = 0.33 mA', 20, BLUE)
        s.text(0, 395, 'SW OFF : High    SW ON : Low', 19)
    return s


def buck_panel(on):
    s = Scene(400, 410)
    c = BLUE if on else ORANGE
    s.text(0, 0, 'スイッチON' if on else 'スイッチOFF', 23, c, True)
    s.text(0, 38, '入力から負荷へ電力を送る' if on else 'Lの電流がダイオードを通って続く', 18)
    # Positive input, series switch, inductor, capacitor and resistive load.
    s.text(0, 92, 'VIN', 18)
    s.line(20, 124, 72, 124)
    s.circle(72, 124, 3, 'white')
    s.circle(118, 124, 3, 'white')
    s.line(76, 124, 114, 124 if on else 100)
    s.text(76, 72, 'SW', 18)
    s.line(118, 124, 175, 124)
    s.circle(153, 124)
    # Four half-circle coils, not a generic L block.
    for i in range(4):
        s.path(f'M{175+20*i},124 a10,12 0 0 1 20,0')
    s.text(205, 72, 'L', 18)
    s.line(255, 124, 356, 124)
    s.text(303, 84, 'VOUT', 18)
    s.line(284, 124, 284, 204)
    s.line(268, 204, 300, 204)
    s.line(268, 214, 300, 214)
    s.line(284, 214, 284, 294)
    s.text(253, 230, 'C', 18)
    s.line(356, 124, 356, 190)
    s.resistor(356, 190, 72)
    s.line(356, 262, 356, 294)
    s.text(307, 208, '負荷', 18)
    s.line(20, 294, 356, 294)
    s.line(20, 124, 20, 170)
    s.circle(20, 209, 26, 'white')
    s.line(20, 170, 20, 183)
    s.line(20, 235, 20, 294)
    s.text(13, 187, '+', 19)
    s.text(14, 210, '−', 19)
    # Diode anode on ground, cathode on switching node (upwards).
    s.line(153, 124, 153, 195)
    s.line(139, 195, 167, 195)
    s.path('M153,195 L139,225 L167,225 Z', INK, 2, 'white')
    s.line(153, 225, 153, 294)
    s.text(176, 200, 'D', 18)
    s.ground(205, 294)
    # Direction arrows sit beside the actual circuit branches.
    s.arrow(50 if on else 170, 151, 252, 151, c)
    s.arrow(380, 172, 380, 270, c)
    s.arrow(329, 317, 48 if on else 153, 317, c)
    if not on:
        s.arrow(126, 278, 126, 234, c)
        s.text(0, 351, 'Dが導通し、GND側からLへ還流', 19)
    else:
        s.text(0, 351, 'Lの電流が増加。Dは逆バイアス', 19)
    return s


def hal_flow(mobile):
    w = 448 if mobile else 848
    s = Scene(w, 680 if mobile else 474)
    if mobile:
        s.text(24, 20, 'HAL経由', 22, BLUE, True)
        s.rect(24, 65, 176, 62, PALE_BLUE, BLUE)
        s.text(38, 80, 'アプリ', 20)
        s.arrow(112, 132, 112, 164)
        s.rect(24, 174, 176, 92, PALE_BLUE, BLUE)
        s.text(38, 185, 'HAL内部', 20)
        s.text(38, 222, '引数確認・分岐', 18)
        s.text(247, 20, '直接操作', 22, ORANGE, True)
        s.rect(248, 65, 176, 62, PALE_ORANGE, ORANGE)
        s.text(263, 80, 'アプリ', 20)
        s.arrow(112, 275, 112, 322)
        s.arrow(336, 137, 336, 322, ORANGE)
        s.line(112, 322, 336, 322)
        s.arrow(224, 322, 224, 355)
        for y, title, sub in [(365, 'レジスタ', 'GPIOの出力値を更新'), (478, '周辺回路', 'GPIO回路が出力を駆動')]:
            s.rect(64, y, 320, 82, 'white', INK)
            s.text(80, y+8, title, 21, bold=True)
            s.text(80, y+45, sub, 18)
        s.arrow(224, 451, 224, 470)
        s.arrow(224, 565, 224, 591)
        s.text(182, 599, 'LED点灯', 21)
        s.text(24, 647, 'どちらも最後は同じレジスタを更新する', 18)
    else:
        for y, color, title, detail in [(28, BLUE, 'HAL経由', 'HAL_GPIO_WritePin()'), (190, ORANGE, '直接操作', 'GPIOのレジスタへ書き込む')]:
            s.text(24, y, title, 22, color, True)
            s.text(24, y+40, detail, 18)
            s.rect(24, y+82, 150, 64, 'white', color)
            s.text(60, y+98, 'アプリ', 20)
            if color == BLUE:
                s.arrow(182, y+114, 222, y+114, color)
                s.rect(232, y+82, 194, 64, PALE_BLUE, BLUE)
                s.text(254, y+98, 'HAL内部の処理', 20)
                s.arrow(434, y+114, 500, y+114, color)
            else:
                s.arrow(182, y+114, 500, y+114, color)
        s.line(500, 142, 500, 304)
        s.arrow(500, 223, 536, 223)
        s.rect(546, 180, 260, 86, PALE_BLUE, INK)
        s.text(565, 189, '共通のレジスタ', 22, bold=True)
        s.text(565, 230, 'GPIO出力値を更新', 18)
        s.arrow(676, 275, 676, 308)
        s.rect(546, 318, 260, 64)
        s.text(566, 333, '周辺回路 → LED点灯', 20)
        s.text(24, 425, '違いは、レジスタを更新する処理をHALに任せるかどうか。', 20)
    return s


def points(fn, a, b, n=201):
    return [(a+(b-a)*i/(n-1), fn(a+(b-a)*i/(n-1))) for i in range(n)]


def plot(s, x, y, w, h, xmin, xmax, ymin, ymax, xticks, yticks, xlabel, ylabel):
    def X(v): return x+w*(v-xmin)/(xmax-xmin)
    def Y(v): return y+h-h*(v-ymin)/(ymax-ymin)
    for v, label in yticks:
        s.line(x, Y(v), x+w, Y(v), GRID, 1)
        s.text(x-47, Y(v)-13, label, 18, MUTED, width=44)
    for v, label in xticks:
        s.line(X(v), y+h, X(v), y+h+5, MUTED, 1)
        s.text(X(v)-12, y+h+8, label, 18, MUTED, width=48)
    s.line(x, y, x, y+h, MUTED, 1.6)
    s.line(x, y+h, x+w, y+h, MUTED, 1.6)
    s.text(x, y-35, ylabel, 19)
    s.text(x+w-160, y+h+42, xlabel, 19, width=180)
    return X, Y


def curve(s, coords, X, Y, color, dash=None, stroke=3):
    d = ' '.join(('M' if i == 0 else 'L')+f'{X(x):.3f},{Y(y):.3f}' for i, (x,y) in enumerate(coords))
    s.path(d, color, stroke, dash=dash)


def key(s, x, y, text, color, dash=None):
    s.line(x, y+13, x+34, y+13, color, 3, dash)
    s.text(x+46, y, text, 19)


def motor_profiles(mobile):
    w = 448 if mobile else 720
    s = Scene(w, 534)
    X, Y = plot(s, 78, 62, w-114, 242, -.1, 1.1, 0, 1.08,
                [(0,'0'),(.5,'0.5'),(1,'1')], [(0,'0'),(.5,'50'),(1,'100')], '時間 t / T', '正規化した指令値 [%]')
    s.rect(X(0), Y(1), X(1)-X(0), Y(0)-Y(1), PALE_BLUE, 'none', 0)
    # Redraw the reference grid above the light operating interval.
    for v in (0,.5,1): s.line(78, Y(v), w-36, Y(v), GRID, 1)
    curve(s, [(-.1,0),(0,0),(0,1),(1.1,1)], X,Y,INK,'3 6')
    curve(s, [(-.1,0),(0,0),(1,1),(1.1,1)], X,Y,ORANGE,'10 5')
    curve(s, [(-.1,0),*points(lambda u:3*u*u-2*u*u*u,0,1),(1.1,1)], X,Y,BLUE)
    key(s, 26, 399, 'ステップ：目標値へ一度に変更', INK, '3 6')
    key(s, 26, 437, '直線ランプ：変化率を一定にする', ORANGE, '10 5')
    key(s, 26, 475, 'S字ランプ：開始・終了の傾きが0', BLUE)
    return s


def sigmoid(u): return 1/(1+math.exp(-10*(u-.5)))


def s_functions(mobile):
    w = 448 if mobile else 720
    s = Scene(w, 635)
    X,Y = plot(s,78,62,w-114,242,0,1,0,1,[(0,'0'),(.5,'0.5'),(1,'1')],[(0,'0'),(.5,'0.5'),(1,'1')], '進行度 u = t / T', '出力比 f(u)')
    curve(s,points(sigmoid,0,1),X,Y,INK,'3 6')
    curve(s,points(lambda u:(1-math.cos(math.pi*u))/2,0,1),X,Y,ORANGE,'10 5')
    curve(s,points(lambda u:3*u*u-2*u*u*u,0,1),X,Y,BLUE)
    key(s,24,395,'ロジスティック関数 (kT = 10)',INK,'3 6')
    s.text(70,429,'1 / (1 + exp(−10(u − 0.5)))',18)
    key(s,24,469,'cos補間：(1 − cos(πu)) / 2',ORANGE,'10 5')
    key(s,24,509,'Smoothstep：3u² − 2u³',BLUE)
    s.text(24,558,'ロジスティック関数の端点は約0.0067と0.9933。',17)
    s.text(24,591,'cos補間とSmoothstepの端点は正確に0と1。',17)
    return s


def motion_value(t, smooth):
    if t < 0: return 0.,0.,0.
    if t <= 1:
        if smooth: return (1-math.cos(math.pi*t))/2, math.pi*math.sin(math.pi*t)/2, math.pi**2*math.cos(math.pi*t)/2
        return t,1.,0.
    if t < 2: return 1.,0.,0.
    if t <= 3:
        u=t-2
        if smooth: return (1+math.cos(math.pi*u))/2,-math.pi*math.sin(math.pi*u)/2,-math.pi**2*math.cos(math.pi*u)/2
        return 1-u,-1.,0.
    return 0.,0.,0.


def motion_panel(smooth):
    s = Scene(400, 805)
    color = BLUE if smooth else ORANGE
    s.text(0,0,'S字速度（cos補間）' if smooth else '台形速度',23,color,True)
    s.text(0,38,'加速1 s・定速1 s・減速1 s',18)
    limits=[(0,1.15),(-1.8,1.8),(-5.5,5.5)]
    units=['速度 v [相対値]','加速度 a [相対値/s]','ジャーク j [相対値/s²]']
    for row, (low,high) in enumerate(limits):
        y=112+row*208
        ticks=[(0,'0'),(1,'1')] if row==0 else ([(low*.8,f'{low*.8:.1f}'),(0,'0'),(high*.8,f'{high*.8:.1f}')] if smooth or row==1 else [(0,'0')])
        X,Y=plot(s,62,y,310,105,-.15,3.15,low,high,[(i,str(i)) for i in range(4)],ticks,'時間 t [s]',units[row])
        s.line(62,Y(0),372,Y(0),MUTED,1)
        if row==0 or smooth:
            # Plot continuous values in each physical segment; avoid joining jerk jumps.
            for lo,hi in [(-.15,0),(0,1),(1,2),(2,3),(3,3.15)]:
                eps=1e-8
                curve(s,points(lambda t:motion_value(t,smooth)[row],lo+eps,hi-eps,41),X,Y,color)
        elif row==1:
            curve(s,[(-.15,0),(0,0),(0,1),(1,1),(1,0),(2,0),(2,-1),(3,-1),(3,0),(3.15,0)],X,Y,color)
        else:
            for t,sign in [(0,1),(1,-1),(2,-1),(3,1)]:
                s.arrow(X(t),Y(0),X(t),Y(sign*4.3),color,2.5)
            s.text(70,y+188,'矢印は理想インパルス（高さは任意）',17)
    s.text(0,748,'加速度は連続。ジャークは区間内で有限。' if smooth else '加速度の切替点でジャークは有限値を持たない。',17)
    s.text(0,779,'区間の境界ではジャークが跳ぶ。' if smooth else '矢印の向きは加速度の変化方向を示す。',17)
    return s


def selection_panels():
    panels=[]
    for is_current in [True,False]:
        s=Scene(400,405)
        s.text(0,0,'抵抗を小さくすると電流が増える' if is_current else '抵抗を大きくすると応答が遅くなる',20,bold=True)
        s.text(0,38,'I = VCC / R' if is_current else 'τ = R × C',20,BLUE if is_current else ORANGE)
        X,Y=plot(s,70,120,296,172,0,2,0,3.5 if is_current else 10,
                 [(0,'1'),(1,'10'),(2,'100')],[(0,'0'),(1,'1'),(3,'3')] if is_current else [(0,'0'),(5,'5'),(10,'10')], '抵抗 R [kΩ・対数軸]', '駆動時の電流 I [mA]' if is_current else '時定数 τ [µs]')
        fn=(lambda v:3.3/(10**v)) if is_current else (lambda v:10**v*.1)
        curve(s,points(fn,0,2),X,Y,BLUE if is_current else ORANGE)
        s.circle(X(1),Y(fn(1)),4,BLUE if is_current else ORANGE,BLUE if is_current else ORANGE)
        s.text(0,370,'条件：VCC = 3.3 V' if is_current else '条件：配線・入力容量 C = 100 pF',18)
        panels.append(s)
    return panels


def selection(mobile):
    s=compose(selection_panels(),mobile)
    old=s.h
    s.h+=260 if mobile else 200
    s.text(24,old+2,'抵抗値は上下の条件から決める',22,bold=True)
    s.text(24,old+48,'下限：R ≥ VCC / Iallow',19)
    s.text(24,old+85,'上限：Rup ≤ (VCC − VIH,min) / Ileak,max',18)
    s.text(24,old+122,'上限：Rdown ≤ VIL,max / Ileak,max',18)
    if mobile:
        s.text(24,old+167,'Iallow：駆動側の許容電流',17)
        s.text(24,old+198,'Ileak,max：合計漏れ電流の最大値',17)
        s.text(24,old+229,'τは時定数。10–90%立上り時間は約2.2τ。',17)
    else:
        s.text(460,old+49,'Iallow：駆動側の許容電流',17)
        s.text(460,old+85,'Ileak,max：合計漏れ電流の最大値',17)
        s.text(24,old+162,'τは時定数。10–90%立上り時間は約2.2τ。数値は設計条件の例。',18)
    return s


def validate_math():
    assert abs(sigmoid(0)-0.0066928509242848554)<1e-12
    assert abs(sigmoid(1)-0.9933071490757153)<1e-12
    for fn in [lambda u:(1-math.cos(math.pi*u))/2,lambda u:3*u*u-2*u*u*u,sigmoid]:
        values=[fn(i/1000) for i in range(1001)]
        assert all(a<=b for a,b in zip(values,values[1:]))
    for smooth in [False,True]:
        for t in [.2,.5,.8,1.3,1.7,2.2,2.5,2.8]:
            e=1e-5
            v,a,j=motion_value(t,smooth)
            assert abs((motion_value(t+e,smooth)[0]-motion_value(t-e,smooth)[0])/(2*e)-a)<1e-7
            assert abs((motion_value(t+e,smooth)[1]-motion_value(t-e,smooth)[1])/(2*e)-j)<1e-7
    assert abs(3.3/10000*1000-.33)<1e-12
    assert abs(10000*100e-12*1e6-1)<1e-12
    return 'PASS: endpoints, monotonicity, velocity/acceleration/jerk derivatives, I and RC units'


def main():
    CACHE.mkdir(parents=True,exist_ok=True)
    scenes=[]
    for mobile in [False,True]:
        figures={
            'pull-up-vs-pull-down':compose([pull_panel(True),pull_panel(False)],mobile),
            'wrong-pull-circuits':compose([wrong_panel(i) for i in range(3)],mobile),
            'buck-converter-operation':compose([buck_panel(True),buck_panel(False)],mobile,
                '理想部品・定常状態・連続導通モード：VOUT = VIN × D\nDはスイッチON時間の割合。矢印は主な負荷電流の向き。'),
            'hal-register-access-flow':hal_flow(mobile),
            'motor-command-profiles':motor_profiles(mobile),
            's-curve-functions':s_functions(mobile),
            'trapezoid-vs-scurve-motion':compose([motion_panel(False),motion_panel(True)],mobile),
            'pull-resistor-selection':selection(mobile),
        }
        for name,s in figures.items():
            name+= '-mobile' if mobile else ''
            (CACHE/f'{name}.svg').write_text(s.svg(),encoding='utf-8')
            scenes.append(dict(name=name,width=s.w,height=s.h,svg=s.svg(False),labels=s.labels))
    (CACHE/'scenes.json').write_text(json.dumps(scenes,ensure_ascii=False),encoding='utf-8')
    print(validate_math())
    print(f'{len(scenes)} figures written to {CACHE}')


if __name__=='__main__':
    main()
