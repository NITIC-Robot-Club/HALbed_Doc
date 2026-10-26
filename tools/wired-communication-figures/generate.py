"""Regenerate the wired-communication article figures as compact SVG diagrams.

The SVGs are the editable source; PNGs retain legacy article filenames.
Run from any directory with Python 3.10+.
"""
from html import escape
from pathlib import Path
import json
import math
import shutil

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'Docs/Technical_articles/Other_Articles/Wired_communication/images/Wired_Communication'
INK, MUTED, GRID = '#263238', '#52616B', '#DCE3E7'
BLUE, ORANGE, PALE_BLUE, PALE_ORANGE = '#0072B2', '#D55E00', '#EDF6FA', '#FFF3EA'
GREEN, PALE_GREEN = '#00865A', '#EAF5F0'
W, H = 1040, 390

class SVG:
    def __init__(self, title, desc, width=W, height=H):
        self.title, self.desc, self.body = title, desc, []
        self.width, self.height = width, height
    def line(self,x1,y1,x2,y2,c=INK,sw=3,dash=None):
        da=f' stroke-dasharray="{dash}"' if dash else ''
        self.body.append(f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round"{da}/>')
    def path(self,d,c=BLUE,sw=3,fill='none',dash=None):
        da=f' stroke-dasharray="{dash}"' if dash else ''
        self.body.append(f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"{da}/>')
    def rect(self,x,y,w,h,label='',fill='white',stroke=INK,fs=20):
        self.body.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="2" fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>')
        if label: self.text(x+w/2,y+h/2+fs*.34,label,fs,INK,anchor='middle',bold=True)
    def text(self,x,y,s,fs=19,c=INK,anchor='start',bold=False):
        lines=str(s).splitlines() or ['']
        if len(lines)==1:
            content=escape(lines[0])
        else:
            first=-(len(lines)-1)*.6
            content=''.join(f'<tspan x="{x}" dy="{first if i==0 else 1.2}em">{escape(line)}</tspan>' for i,line in enumerate(lines))
        self.body.append(f'<text x="{x}" y="{y}" font-family="Noto Sans JP,sans-serif" font-size="{fs}" font-weight="{700 if bold else 400}" fill="{c}" text-anchor="{anchor}">{content}</text>')
    def dot(self,x,y,c=INK,r=5): self.body.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>')
    def arrow(self,x1,y1,x2,y2,c=BLUE,sw=3):
        self.line(x1,y1,x2,y2,c,sw); a=math.atan2(y2-y1,x2-x1)
        p1=(x2-12*math.cos(a)+6*math.sin(a),y2-12*math.sin(a)-6*math.cos(a)); p2=(x2-12*math.cos(a)-6*math.sin(a),y2-12*math.sin(a)+6*math.cos(a))
        self.path(f'M{x2},{y2} L{p1[0]},{p1[1]} L{p2[0]},{p2[1]} Z',c,1,c)
    def wave(self,x,y,w,levels,c=BLUE,step=42,sw=3):
        d=f'M{x},{y+levels[0]*step}'
        px=x
        for i,v in enumerate(levels[1:]):
            nx=x+(i+1)*w/(len(levels)-1); d+=f' H{nx} V{y+v*step}'; px=nx
        self.path(d,c,sw)
    def save(self,name):
        svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{self.height}" viewBox="0 0 {self.width} {self.height}" role="img" aria-labelledby="title desc"><title id="title">{escape(self.title)}</title><desc id="desc">{escape(self.desc)}</desc><rect width="100%" height="100%" fill="white"/>{"".join(self.body)}</svg>'
        (OUT/f'{name}.svg').write_text(svg,encoding='utf-8')

def make(name,title,desc,draw):
    s=SVG(title,desc); draw(s); s.save(name)

def make_mobile(name,title,desc,height,draw):
    s=SVG(title,desc,360,height); draw(s); s.save(f'{name}-mobile')

def architecture(s):
    s.rect(55,130,195,105,'MCU\nCANコントローラ',PALE_BLUE,BLUE,21)
    s.rect(420,130,210,105,'CAN\nトランシーバ',PALE_ORANGE,ORANGE,21)
    s.rect(790,130,195,105,'CANバス', 'white',INK,21)
    s.arrow(250,162,420,162,BLUE); s.text(335,145,'TX',17,BLUE,anchor='middle',bold=True)
    s.arrow(420,205,250,205,ORANGE); s.text(335,229,'RX',17,ORANGE,anchor='middle',bold=True)
    s.arrow(630,162,790,162,BLUE); s.text(710,143,'CANH / CANL',17,BLUE,anchor='middle')
    s.text(520,284,'フレーム処理',17,MUTED,anchor='middle'); s.text(887,284,'差動信号の送受信',17,MUTED,anchor='middle')

def bus(s):
    s.line(100,140,940,140,BLUE,5); s.line(100,210,940,210,ORANGE,5)
    s.text(65,146,'CANH',18,BLUE,anchor='end',bold=True); s.text(65,216,'CANL',18,ORANGE,anchor='end',bold=True)
    for x,label in [(210,'ノード A'),(520,'ノード B'),(830,'ノード C')]:
        s.rect(x-76,45,152,54,label,'white',INK,18)
        s.line(x-16,99,x-16,140,BLUE,2)
        # A small wire bridge shows CANL crossing CANH without joining it.
        bridge=f'M{x+16},210 V148 C{x+16},136 {x+36},136 {x+36},148 V99'
        s.path(bridge,'white',8); s.path(bridge,ORANGE,2)
        s.dot(x-16,140,BLUE,4); s.dot(x+16,210,ORANGE,4)
    s.rect(95,165,42,28,'120 Ω',PALE_ORANGE,ORANGE,13); s.rect(903,165,42,28,'120 Ω',PALE_ORANGE,ORANGE,13)
    for x in (116,924):
        s.line(x,140,x,165,ORANGE,2); s.line(x,193,x,210,ORANGE,2)
    s.text(520,286,'ノードはCANH・CANLをそれぞれ短く分岐して接続',17,MUTED,anchor='middle')
    s.text(520,330,'幹線の両端に終端抵抗を1本ずつ',19,INK,anchor='middle',bold=True)

def broadcast(s):
    s.rect(60,150,185,80,'送信ノード',PALE_BLUE,BLUE,20)
    s.line(245,170,955,170,BLUE,3); s.line(245,210,955,210,ORANGE,3)
    s.text(580,157,'CANH',15,BLUE,anchor='middle',bold=True); s.text(580,234,'CANL',15,ORANGE,anchor='middle',bold=True)
    for i,x in enumerate([390,580,770,930]):
        s.line(x-8,170,x-8,210,BLUE,2); s.line(x+8,170,x+8,210,ORANGE,2)
        s.dot(x-8,170,BLUE,4); s.dot(x+8,210,ORANGE,4)
        s.text(x,280,'受信ノード' if i<3 else 'ほかの全ノード',15,MUTED,anchor='middle')
    s.arrow(270,190,360,190,ORANGE,4); s.text(300,130,'1フレーム',17,ORANGE,anchor='middle',bold=True)

def differential(s,noise=False,compare=False):
    if compare:
        s.text(270,78,'単端：信号とGNDの差',19,INK,anchor='middle',bold=True)
        s.line(80,235,465,235,GRID,2); s.line(80,115,80,235,INK,2)
        s.wave(105,135,335,[0,0,1,1,0,0,1,1,0],BLUE,55,4)
        s.text(105,270,'信号線',16,BLUE,bold=True); s.line(190,264,228,264,INK,2); s.text(237,270,'基準GND',16,MUTED)
        s.text(770,78,'差動：2線間の差',19,INK,anchor='middle',bold=True)
        s.text(545,130,'CANH',16,BLUE,bold=True); s.text(545,190,'CANL',16,ORANGE,bold=True)
        s.wave(625,112,330,[0,0,1,1,0,0,1,1,0],BLUE,30,4)
        s.wave(625,172,330,[1,1,0,0,1,1,0,0,1],ORANGE,30,4)
        s.text(545,270,'受信器は CANH − CANL を判定',16,GREEN,bold=True)
        s.text(520,335,'単端はGNDの揺れに影響されやすく、差動は同相成分を抑えやすい',16,MUTED,anchor='middle')
        return
    # Three aligned traces: bus high/low, common-mode disturbance, receiver difference.
    s.text(60,72,'CANH',18,BLUE,bold=True); s.text(60,155,'CANL',18,ORANGE,bold=True)
    s.wave(160,72,780,[0,0,1,1,0,0,1,1,0],BLUE,28,4)
    s.wave(160,155,780,[1,1,0,0,1,1,0,0,1],ORANGE,28,4)
    if noise:
        s.text(60,245,'ノイズ',17,MUTED,bold=True); s.wave(160,225,780,[0,0,0,1,1,0,0,0,0],MUTED,24,2)
        s.text(160,305,'同相ノイズが両線に同じ向きで重なる',17,MUTED)
        s.text(160,342,'受信器は CANH − CANL の差を見る',18,INK,bold=True)
    else:
        s.text(60,245,'差電圧',17,GREEN,bold=True); s.wave(160,225,780,[0,0,1,1,0,0,1,1,0],GREEN,24,3)
        s.text(160,310,'ドミナント：CANH > CANL　／　レセシブ：差が小さい',17,INK)

def reflection(s):
    s.text(95,88,'送信端',16,INK,anchor='middle',bold=True); s.text(930,88,'終端',16,INK,anchor='middle',bold=True)
    s.line(120,125,920,125,INK,3); s.rect(870,110,60,30,'120Ω',PALE_ORANGE,ORANGE,14)
    s.arrow(200,125,720,125,BLUE,3); s.text(460,108,'入射波',16,BLUE,anchor='middle')
    s.arrow(740,165,250,165,ORANGE,3); s.text(490,190,'不整合時の反射波',16,ORANGE,anchor='middle')
    s.text(520,275,'終端抵抗 ≈ ケーブルの特性インピーダンス',20,INK,anchor='middle',bold=True)
    s.text(520,315,'CANでは一般に幹線の両端へ約120 Ω',17,MUTED,anchor='middle')

def frame(s,fd=False):
    if fd:
        parts=[('SOF',60),('Arbitration',215),('Control',115),('Data 0–64 byte',330),('CRC',130),('ACK',70),('EOF',70)]
    else:
        parts=[('SOF',60),('Arbitration',220),('Control',130),('Data 0–8 byte',270),('CRC',130),('ACK',70),('EOF',70)]
    x=40
    for i,(lab,w) in enumerate(parts):
        c=[INK,BLUE,ORANGE,GREEN,BLUE,ORANGE,INK][i]; fill=['#fff',PALE_BLUE,PALE_ORANGE,PALE_GREEN,PALE_BLUE,PALE_ORANGE,'#fff'][i]
        s.rect(x,125,w,70,lab,fill,c,15); x+=w
    s.text(520,255,'フィールドは左から順に送信される',18,MUTED,anchor='middle')
    if fd: s.text(520,300,'データ長とビットレート切替の位置は制御フィールドで決まる',16,INK,anchor='middle')
    else: s.text(520,300,'標準IDは11 bit、拡張IDは29 bit',16,INK,anchor='middle')

def stuffing(s):
    bits=[1,0,0,0,0,0,1,1,0,1]
    x=115
    for i,b in enumerate(bits):
        color=ORANGE if i==6 else INK; fill=PALE_ORANGE if i==6 else 'white'
        s.rect(x,115,64,64,str(b),fill,color,25); x+=76
    s.text(267,225,'5つ目まで同じ値が続く',17,MUTED,anchor='middle')
    s.arrow(460,215,520,215,ORANGE,3)
    s.text(705,225,'反対値のスタッフビットを挿入',17,ORANGE,anchor='middle',bold=True)
    s.text(520,300,'スタッフビットは受信側で取り除く（SOF〜CRC sequence）',16,INK,anchor='middle')

def arbitration(s):
    s.text(90,84,'送信ノード A',17,BLUE,bold=True); s.text(90,144,'ID 0x120',16,BLUE)
    s.text(90,230,'送信ノード B',17,ORANGE,bold=True); s.text(90,290,'ID 0x130',16,ORANGE)
    a='00100100000'; b='00100110000'; x0=280; step=56
    for row,bits,col in [(120,a,BLUE),(265,b,ORANGE)]:
        for i,v in enumerate(bits):
            x=x0+i*step; s.line(x,row,x+step-6,row,INK,2)
            s.text(x+step/2,row-14,v,18,col,anchor='middle',bold=True)
    xdiff=x0+6*step+step/2
    s.line(xdiff,92,xdiff,310,ORANGE,2,'5 5')
    s.text(xdiff,350,'ここで 1 を送った側が負ける',15,ORANGE,anchor='middle')
    s.text(870,195,'IDが小さい\n優先度が高い',20,INK,anchor='middle',bold=True)

def error_states(s):
    states=[('Error Active','通常送信',GREEN,PALE_GREEN),('Error Passive','制限付き送信',ORANGE,PALE_ORANGE),('Bus Off','送信停止', '#B42318','#FDEDEC')]
    xs=[85,405,725]
    for i,(a,b,c,f) in enumerate(states):
        s.rect(xs[i],135,230,110,a+'\n'+b,f,c,20)
    s.arrow(315,190,405,190,ORANGE); s.arrow(635,190,725,190,'#B42318')
    s.text(360,151,'TEC / REC 上昇',14,ORANGE,anchor='middle'); s.text(680,151,'TEC ≥ 256',14,'#B42318',anchor='middle')
    s.arrow(725,270,315,270,GREEN); s.text(520,312,'回復条件を満たすと復帰（Bus Off解除手順はMCU仕様を確認）',15,MUTED,anchor='middle')

def canfd_compare(s):
    s.text(90,102,'Classical CAN',20,BLUE,bold=True); s.text(90,231,'CAN FD',20,ORANGE,bold=True)
    for y,label,width,color in [(130,'最大8 byte',340,BLUE),(260,'最大64 byte',680,ORANGE)]:
        s.rect(300,y-30,width,56,label,PALE_BLUE if color==BLUE else PALE_ORANGE,color,18)
    s.text(520,340,'CAN FDはデータフェーズを高速化できる（対応ノードが必要）',16,INK,anchor='middle')

def i2c_open_drain(s):
    s.line(525,65,525,120,BLUE,3); s.text(525,54,'VCC',18,BLUE,anchor='middle',bold=True)
    s.rect(510,120,30,68,'RPU',PALE_BLUE,BLUE,16); s.line(525,188,525,218,BLUE,3)
    s.line(190,218,850,218,INK,3); s.text(190,205,'SDA',17,INK,anchor='end',bold=True)
    s.rect(380,218,290,85,'Open-drain outputs',PALE_ORANGE,ORANGE,18)
    s.line(525,303,525,325,INK,3); s.line(475,325,575,325,INK,3); s.line(490,335,560,335,INK,2)
    s.text(175,115,'HIGH：全ノードが解放',16,GREEN); s.text(700,355,'LOW：いずれかが引き下げ',16,ORANGE)

def pull_tradeoff(s):
    # R vs static low-state sink current; 3.3V, illustrative only.
    s.line(170,285,930,285,INK,2); s.line(170,80,170,285,INK,2)
    s.text(550,330,'プルアップ抵抗 R',16,INK,anchor='middle'); s.text(88,93,'I = 3.3 V / R',16,BLUE,anchor='middle')
    pts=[]
    for i in range(60):
        r=1+i*99/59; x=170+(r-1)/99*740; current=3.3/r; y=280-(current-.03)/3.27*180; pts.append((x,y))
    d='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts); s.path(d,BLUE,4)
    s.text(170,310,'1 kΩ',14,MUTED); s.text(930,310,'100 kΩ',14,MUTED,anchor='end')
    s.text(555,105,'抵抗を小さくするとLOW時の電流が増える',18,INK,anchor='middle',bold=True)
    s.text(555,140,'プルアップ電圧・漏れ電流・許容シンク電流・配線容量で選ぶ',16,MUTED,anchor='middle')

def i2c_wave(s):
    s.text(75,115,'SCL',18,BLUE,bold=True); s.text(75,238,'SDA',18,ORANGE,bold=True)
    # START and STOP occur while SCL is high. SDA changes for data only in
    # low phases; the last low interval is the ACK bit (device pulls low).
    s.path('M150,88 H230 V120 H295 V88 H360 V120 H425 V88 H490 V120 H555 V88 H620 V120 H685 V88 H750 V120 H815 V88 H880 V120 H945 V88 H970',BLUE,3)
    s.path('M150,210 H180 V240 H280 V210 H410 V240 H540 V210 H670 V240 H955 V210 H970',ORANGE,3)
    s.text(195,278,'START',14,ORANGE,anchor='middle',bold=True)
    for x,label in [(345,'D0'),(475,'D1'),(605,'D2'),(735,'D3'),(865,'ACK')]:
        s.text(x,278,label,14,GREEN if label=='ACK' else MUTED,anchor='middle')
    s.text(955,278,'STOP',14,GREEN,anchor='end',bold=True)
    s.text(150,330,'例：データ線はSCL=LOW中に変化。ACKでは受信側がSDAをLOWにする。',16,INK)

def i2c_bus(s):
    s.line(110,120,930,120,BLUE,4); s.line(110,165,930,165,ORANGE,4)
    s.text(80,126,'SCL',15,BLUE,anchor='end',bold=True); s.text(80,171,'SDA',15,ORANGE,anchor='end',bold=True)
    for x,label in [(260,'MCU'),(500,'センサ'),(740,'EEPROM')]:
        s.line(x,120,x,165,INK,2); s.line(x,165,x,235,INK,2); s.rect(x-72,235,144,58,label,'white',INK,17)
    s.text(520,340,'SCL と SDA は共有線。各ノードは固有アドレスで選択する',16,INK,anchor='middle')

def spi(s,daisy=False):
    labels=['MCU','Device 1','Device 2','Device 3'] if daisy else ['MCU','Device 1','Device 2','Device 3']
    xs=[100,400,650,900] if daisy else [100,390,650,910]
    for x,l in zip(xs,labels): s.rect(x-70,140,140,80,l,PALE_BLUE if x==100 else 'white',BLUE if x==100 else INK,17)
    if daisy:
        for a,b,lab in [(170,330,'MOSI'),(470,580,'MOSI'),(720,830,'MOSI')]: s.arrow(a,160,b,160,BLUE); s.text((a+b)/2,146,lab,13,BLUE,anchor='middle')
        for a,b in [(330,170),(580,470),(830,720)]: s.arrow(a,205,b,205,ORANGE)
        s.text(520,300,'データがデバイス間を順に通過',17,INK,anchor='middle')
    else:
        for x in xs[1:]:
            for y,lab,c in [(155,'SCK',BLUE),(185,'MOSI',ORANGE),(215,'MISO',GREEN)]:
                s.line(170,y,x-70,y,c,2); s.text((170+x-70)/2,y-6,lab,12,c,anchor='middle')
        for i,x in enumerate(xs[1:]): s.line(170,250+i*24,x,250+i*24,ORANGE,2); s.text(160,255+i*24,f'CS{i}',13,ORANGE,anchor='end')
        s.text(520,350,'SCK / MOSI / MISO を共有し、CSで対象を選ぶ',16,INK,anchor='middle')

def uart(s):
    s.rect(65,135,220,110,'機器 A',PALE_BLUE,BLUE,20); s.rect(755,135,220,110,'機器 B',PALE_BLUE,BLUE,20)
    s.arrow(285,165,755,165,BLUE); s.text(520,151,'TX A → RX B',17,BLUE,anchor='middle',bold=True)
    s.arrow(755,215,285,215,ORANGE); s.text(520,241,'TX B → RX A',17,ORANGE,anchor='middle',bold=True)
    s.line(175,245,175,300,INK,2); s.line(865,245,865,300,INK,2); s.line(175,300,865,300,INK,2); s.text(520,330,'GND を共通化',16,MUTED,anchor='middle')

def uart_frame(s):
    s.text(115,100,'Idle = HIGH',16,MUTED); s.text(115,250,'LSB first',15,MUTED)
    parts=[('Start',95,ORANGE),('D0',85,BLUE),('D1',85,BLUE),('D2',85,BLUE),('D3',85,BLUE),('D4',85,BLUE),('D5',85,BLUE),('D6',85,BLUE),('D7',85,BLUE),('Stop',95,ORANGE)]
    x=125
    for label,w,c in parts:
        s.rect(x,145,w,64,label,PALE_ORANGE if c==ORANGE else PALE_BLUE if c==BLUE else PALE_GREEN,c,15); x+=w
    s.text(520,290,'8N1：Start + 8 data + 1 Stop（パリティなし）',16,INK,anchor='middle')
    s.text(520,326,'1 bit 時間 = 1 / baud rate',16,MUTED,anchor='middle')

def uart_waveform(s):
    # Example 8N1 waveform carrying 0xA5, LSB first.
    x0,step,high,low=190,72,130,220
    s.text(82,high+6,'High',16,MUTED); s.text(90,low+6,'Low',16,MUTED)
    s.text(82,88,'UART TX',18,BLUE,bold=True)
    s.line(x0,high,x0+step*10,high,GRID,1,'5 5'); s.line(x0,low,x0+step*10,low,GRID,1,'5 5')
    bits=[0,1,0,1,0,0,1,0,1,1] # start, D0..D7 for 0xA5, stop
    d=f'M100,{high} H{x0} V{low if bits[0]==0 else high}'
    for i,b in enumerate(bits):
        x=x0+(i+1)*step
        d+=f' H{x} V{low if b==0 else high}'
        if i<9: s.line(x,104,x,250,GRID,1,'4 5')
        if i==0: s.text(x0+step/2,280,'Start',15,ORANGE,anchor='middle',bold=True)
        elif i<9: s.text(x0+(i+.5)*step,280,f'D{i-1}',15,BLUE,anchor='middle')
        else: s.text(x0+step*9.5,280,'Stop',15,ORANGE,anchor='middle',bold=True)
    d+=f' H{930}'
    s.path(d,BLUE,4)
    s.text(190,330,'例：0xA5（LSB first）　・　アイドルはHIGH　・　各ビット幅 = 1 / baud rate',16,INK)

# Narrow article variants use a 360 px viewBox and keep labels at 16 px or larger.
def mbus(s):
    s.text(18,28,'ノードは幹線へ短く分岐して接続',17,INK,bold=True)
    s.line(52,155,340,155,BLUE,4); s.line(52,205,340,205,ORANGE,4)
    s.text(18,160,'CANH',16,BLUE,bold=True); s.text(18,210,'CANL',16,ORANGE,bold=True)
    for x in (71,321):
        s.line(x,155,x,165,ORANGE,2); s.line(x,195,x,205,ORANGE,2)
        s.rect(x-19,165,38,30,'',PALE_ORANGE,ORANGE,14)
    for x,label in [(105,'ノード A'),(180,'ノード B'),(255,'ノード C')]:
        s.rect(x-39,55,78,38,label,'white',INK,16)
        s.line(x-7,93,x-7,155,BLUE,2)
        bridge=f'M{x+7},205 V162 C{x+7},149 {x+22},149 {x+22},162 V93'
        s.path(bridge,'white',8); s.path(bridge,ORANGE,2)
        s.dot(x-7,155,BLUE,4); s.dot(x+7,205,ORANGE,4)
    s.text(180,260,'幹線の両端に120 Ωを1本ずつ',17,INK,anchor='middle',bold=True)
    s.text(180,294,'途中のノードには終端を追加しない',16,MUTED,anchor='middle')

def mbroadcast(s):
    s.text(18,28,'フレームはバス上の全ノードへ届く',17,INK,bold=True)
    s.rect(105,55,150,50,'送信ノード',PALE_BLUE,BLUE,17)
    s.line(28,150,332,150,BLUE,4); s.line(28,190,332,190,ORANGE,4)
    s.text(180,143,'CANH',16,BLUE,anchor='middle',bold=True); s.text(180,211,'CANL',16,ORANGE,anchor='middle',bold=True)
    s.arrow(72,170,288,170,ORANGE,3)
    s.text(180,244,'1フレーム',16,ORANGE,anchor='middle',bold=True)
    for x,label in [(8,'ノード A'),(130,'ノード B'),(252,'ノード C')]:
        s.arrow(x+50,260,x+50,290,BLUE,2)
        s.rect(x,292,100,64,label+'\n受信','white',INK,16)
    s.text(180,405,'各ノードがIDなどを見て採否を判断',16,MUTED,anchor='middle')

def mcontroller(s):
    s.text(18,28,'フレーム処理と電気信号の変換',17,INK,bold=True)
    s.rect(35,58,290,72,'MCU\nCANコントローラ',PALE_BLUE,BLUE,18)
    s.arrow(180,132,180,184,BLUE,3); s.text(195,163,'TX',16,BLUE,bold=True)
    s.rect(55,185,250,65,'CANトランシーバ',PALE_ORANGE,ORANGE,18)
    s.arrow(180,253,180,302,ORANGE,3); s.text(198,286,'CANH / CANL',16,ORANGE)
    s.text(180,350,'受信データはRXからMCUへ戻る',16,MUTED,anchor='middle')

def mframe(s,fd=False):
    fields=[('開始','SOF'),('調停','ID・RTR'),('制御','長さなど'),('データ','0–8 byte' if not fd else '0–64 byte'),('検査','CRC'),('応答','ACK'),('終了','EOF')]
    y=42
    for i,(name,value) in enumerate(fields):
        color=[INK,BLUE,ORANGE,GREEN,BLUE,ORANGE,INK][i]
        fill=['white',PALE_BLUE,PALE_ORANGE,PALE_GREEN,PALE_BLUE,PALE_ORANGE,'white'][i]
        s.rect(30,y,300,42,name+'　 '+value,fill,color,16); y+=52
    s.text(180,y+18,'各フィールドはこの順に送信',16,MUTED,anchor='middle')

def mstuff(s):
    s.text(18,28,'同じ値が5 bit続くと反対値を挿入',17,INK,bold=True)
    bits=['1','0','0','0','0','0','1','1','0','1']
    x0=18; gap=3; cell=29
    for i,b in enumerate(bits):
        color=ORANGE if i==6 else INK; fill=PALE_ORANGE if i==6 else 'white'
        s.rect(x0+i*(cell+gap),72,cell,44,b,fill,color,17)
    s.text(18,145,'0が5つ続いた直後に、スタッフビット1を挿入',16,ORANGE)
    s.text(18,184,'受信側はスタッフビットを取り除く',16,MUTED)

def mdiff(s,noise=False):
    s.text(18,28,'2本の線の電圧差を受信する',17,INK,bold=True)
    s.text(18,82,'CANH',16,BLUE,bold=True); s.text(18,152,'CANL',16,ORANGE,bold=True)
    s.wave(86,52,250,[0,0,1,1,0,0,1,1,0],BLUE,24,3)
    s.wave(86,122,250,[1,1,0,0,1,1,0,0,1],ORANGE,24,3)
    if noise:
        s.text(18,230,'同相ノイズ',16,MUTED,bold=True)
        s.wave(108,202,225,[0,0,1,1,0,0,1,1,0],MUTED,20,2)
        s.text(18,290,'同じノイズが両線に加わると、',16,INK)
        s.text(18,316,'差をとる受信器では影響を抑えやすい。',16,INK)
    else:
        s.text(18,225,'差電圧',16,GREEN,bold=True)
        s.wave(86,195,250,[0,0,1,1,0,0,1,1,0],GREEN,24,3)
        s.text(18,280,'ドミナント：CANH > CANL',16,INK)
        s.text(18,308,'レセシブ：2線の差が小さい',16,INK)

def mtermination(s):
    s.text(18,28,'ケーブル端で信号を吸収して反射を抑える',17,INK,bold=True)
    s.text(20,90,'送信端',16,INK); s.text(340,90,'終端',16,INK,anchor='end')
    s.line(28,135,332,135,INK,3)
    s.arrow(45,115,300,115,BLUE,3); s.text(170,105,'入射波',16,BLUE,anchor='middle')
    s.arrow(300,180,45,180,ORANGE,3); s.text(170,202,'不整合時の反射',16,ORANGE,anchor='middle')
    s.rect(126,265,108,52,'Z₀ に整合',PALE_BLUE,BLUE,17)
    s.text(180,352,'CAN幹線の両端に約120 Ω',16,INK,anchor='middle',bold=True)

def marbitration(s):
    a='00100100000'; b='00100110000'; x0=48; cell=25
    s.text(18,28,'IDはMSBから比較',17,INK,bold=True)
    s.text(18,54,'0（ドミナント）が優先',16,INK)
    s.text(18,124,'0x120',16,BLUE,bold=True); s.text(18,183,'0x130',16,ORANGE,bold=True)
    for y,bits,color in [(100,a,BLUE),(159,b,ORANGE)]:
        for i,bit in enumerate(bits):
            x=72+i*24
            s.rect(x,y,21,35,bit,PALE_BLUE if color==BLUE else PALE_ORANGE,color,16)
    x=72+6*24+10
    s.line(x,92,x,202,ORANGE,2,'4 4')
    s.text(18,242,'7桁目（bit 6）で差が出る',16,ORANGE,bold=True)
    s.text(18,272,'0x130側は1を送り、0を読んで送信を中止',16,INK)
    s.text(18,300,'0x120側が送信を続ける',16,INK)

def merrors(s):
    s.text(18,28,'エラーカウンターに応じて送信を制限',17,INK,bold=True)
    rows=[('Error Active','通常送信',GREEN,PALE_GREEN),('Error Passive','制限付き送信',ORANGE,PALE_ORANGE),('Bus Off','送信停止','#B42318','#FDEDEC')]
    y=55
    for i,(name,desc,color,fill) in enumerate(rows):
        s.rect(45,y,270,66,name+'\n'+desc,fill,color,17)
        if i<2:
            s.arrow(180,y+68,180,y+102,color,2)
            s.text(195,y+91,'TEC / REC 増加' if i==0 else 'TEC ≥ 256',16,color)
        y+=140
    s.text(180,492,'復帰条件とBus Off解除手順はMCU仕様を確認',16,MUTED,anchor='middle')

def mfdcompare(s):
    s.text(18,28,'データ長の違い',17,INK,bold=True)
    for y,label,width,value,color,fill in [(82,'Classical CAN：最大8 byte',150,'8 byte',BLUE,PALE_BLUE),(182,'CAN FD：最大64 byte',280,'64 byte',ORANGE,PALE_ORANGE)]:
        s.text(18,y,label,16,color,bold=True); s.rect(18,y+18,width,38,value,fill,color,16)
    s.text(18,285,'FD対応ノードが必要。データフェーズでは',16,INK)
    s.text(18,311,'ビットレートを上げられる場合がある。',16,INK)

def mipull(s):
    s.text(18,28,'開放なら抵抗がHIGHへ引き上げる',17,INK,bold=True)
    s.text(180,64,'VCC',17,BLUE,anchor='middle',bold=True)
    s.line(180,70,180,92,BLUE,3); s.rect(145,92,70,48,'RPU',PALE_BLUE,BLUE,17)
    s.line(180,140,180,175,BLUE,3); s.line(55,175,305,175,INK,3)
    s.text(48,168,'SDA',16,INK,anchor='end',bold=True)
    s.rect(95,225,170,68,'Open-drain',PALE_ORANGE,ORANGE,17)
    s.line(180,175,180,225,ORANGE,3); s.line(180,293,180,325,INK,3)
    s.line(135,325,225,325,INK,3); s.line(150,336,210,336,INK,2)
    s.text(180,380,'解放：HIGH　／　LOW出力：接地へ引く',16,INK,anchor='middle')

def legacy_uart(s):
    uart(s)

FIGS={
 'can-controller-vs-transceiver':('CANコントローラとCANトランシーバ','コントローラがフレーム処理、トランシーバがCANH/CANLの電気信号を扱う',architecture),
 'can-bus-connection':('CANバス接続と終端抵抗','幹線の両端に120Ωを置き、各ノードを短い分岐で接続する',bus),
 'can-message-broadcast':('CANメッセージのブロードキャスト','送信フレームはバス上の全ノードへ届き、受信側がIDなどで採否を判断する',broadcast),
 'can-differential-signal':('CANの差動信号','CANHとCANLの差電圧でドミナントとレセシブを表す',differential),
 'differential-noise-immunity':('差動信号と同相ノイズ','両線に同じ向きで加わるノイズは差をとる受信器で抑制される',lambda s:differential(s,True)),
 'single-ended-vs-differential':('単端信号と差動信号','信号線と基準電位で読む方式と、2線間の差で読む方式の違い',lambda s:differential(s,False,True)),
 'can-termination-reflection-check':('CAN終端と反射','終端抵抗はケーブルの特性インピーダンスに合わせ、幹線の両端に置く',reflection),
 'classical-can-frame':('Classical CANデータフレーム','CANデータフレームの基本フィールド',lambda s:frame(s,False)),
 'can-bit-stuffing':('CANビットスタッフィング','同じ値が5 bit続いた後、反対値のスタッフビットを挿入する',stuffing),
 'can-arbitration-retransmission':('CAN IDによる調停','複数送信のビット単位比較で、レセシブを送ってドミナントを読むノードは送信を中止する',arbitration),
 'can-error-state-flow':('CANノードのエラー状態','TEC/RECに応じてError Active、Error Passive、Bus Offへ遷移する',error_states),
 'can-vs-canfd-frame':('Classical CANとCAN FD','Classical CANは最大8 byte、CAN FDは最大64 byteのデータを扱える',canfd_compare),
 'can-fd-frame-detail':('CAN FDデータフレーム','CAN FDデータフレームを制御・データ・CRC領域で分けて見る',lambda s:frame(s,True)),
 'i2c-open-drain-pullup':('I2Cオープンドレインとプルアップ','出力解放で抵抗がHIGHにし、いずれかの出力がLOWへ引き下げる',i2c_open_drain),
 'i2c-pullup-resistor-tradeoff':('I2Cプルアップ抵抗の選定','3.3Vの例では低い抵抗ほどLOW時のシンク電流が大きくなる',pull_tradeoff),
 'i2c-clock-data-signal':('I2Cのクロックとデータ','SCLのクロックに合わせてSDAを読み書きし、STARTとSTOPで区切る',i2c_wave),
 'i2c-shared-bus':('I2C共有バス','SCLとSDAを複数デバイスで共有しアドレス指定する',i2c_bus),
 'spi-chip-select-wiring':('SPIの配線','クロックとデータ線を共有し、個別のCSでスレーブを選択する',lambda s:spi(s,False)),
 'spi-daisy-chain-wiring':('SPIデイジーチェーン','シフトデータをデバイス間で順送りする直列接続例',lambda s:spi(s,True)),
 'uart-connection':('UARTの接続','TXとRXを交差接続し、GNDを共通化する',uart),
 'uart_connection':('UART TX/RXの交差接続','UARTでは送信端TXを相手機器のRXへつなぐ',legacy_uart),
 'uart-frame-8n1':('UART 8N1フレーム','8N1はスタート、8データ、パリティなし、ストップ1 bit',uart_frame),
 'uart-waveform':('UART 8N1の信号波形','0xA5をLSB firstで送る例。アイドルと開始・データ・停止ビットを示す',uart_waveform),
}

MOBILE_FIGS={
 'can-bus-connection':(330,mbus),
 'can-message-broadcast':(540,mbroadcast),
 'can-controller-vs-transceiver':(380,mcontroller),
 'classical-can-frame':(440,lambda s:mframe(s,False)),
 'can-bit-stuffing':(220,mstuff),
 'can-differential-signal':(330,lambda s:mdiff(s,False)),
 'differential-noise-immunity':(350,lambda s:mdiff(s,True)),
 'can-termination-reflection-check':(390,mtermination),
 'can-arbitration-retransmission':(320,marbitration),
 'can-error-state-flow':(530,merrors),
 'can-fd-frame-detail':(440,lambda s:mframe(s,True)),
 'can-vs-canfd-frame':(340,mfdcompare),
 'i2c-open-drain-pullup':(410,mipull),
}

if __name__=='__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    for name,(title,desc,draw) in FIGS.items(): make(name,title,desc,draw)
    for name,(height,draw) in MOBILE_FIGS.items():
        title,desc,_=FIGS[name]
        make_mobile(name,title,desc,height,draw)
    # Old article paths remain supported by matching SVGs with the same design.
    bus_svg=(OUT/'can-bus-connection.svg')
    for alias in ('can-connection.svg','can-connection-low-layer.svg'):
        shutil.copyfile(bus_svg,OUT/alias)
    (ROOT/'tools/wired-communication-figures/manifest.json').write_text(json.dumps({k:{'title':v[0],'description':v[1]} for k,v in FIGS.items()},ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Generated {len(FIGS)} SVG diagrams and {len(MOBILE_FIGS)} mobile variants in {OUT}')
