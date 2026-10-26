"""Editable replacement scenes for the serial communication figures.

The returned Scene objects are intended for review/import, not article export.
"""
from redesign_common import (
    Scene, INK, MUTED, GRID, BLUE, ORANGE, BLUE_TINT, ORANGE_TINT,
)


def _device(s, x, y, w, h, title, sub=None, size=20):
    s.box(x, y, w, h, title, sub=sub, color=INK, fill='white', size=size)


def _crossing_gap(s, x, y, width=8):
    """Erase a short horizontal section so a vertical wire reads as a crossing."""
    s.line(x-width/2, y, x+width/2, y, 'white', 6)


def _i2c_wave(mobile=False):
    w, h = (400, 460) if mobile else (840, 440)
    s = Scene(w, h)
    left, right = (92, 356) if mobile else (142, 780)
    unit = (right-left)/9
    top_hi, top_lo = (125, 165) if mobile else (112, 148)
    data_hi, data_lo = (250, 290) if mobile else (232, 268)
    s.text(18 if mobile else 26, 34, 'SCL', 18 if mobile else 20, BLUE, bold=True)
    s.text(18 if mobile else 26, 159 if mobile else 255, 'SDA', 18 if mobile else 20, ORANGE, bold=True)
    # Nine complete clocks: eight data bits, then the receiver ACK bit.
    clock = [(left-22, top_hi), (left, top_hi), (left, top_lo)]
    for i in range(9):
        mid = left+(i+.5)*unit
        end = left+(i+1)*unit
        clock.extend([(mid, top_lo), (mid, top_hi), (end, top_hi), (end, top_lo)])
    clock.extend([(right+12, top_lo), (right+12, top_hi), (right+34, top_hi)])
    s.trace(clock, BLUE)
    bits = [1, 0, 1, 0, 0, 1, 0, 1]  # 0xA5 transmitted MSB first.
    levels = bits + [0]  # receiver acknowledges by pulling SDA low.
    coords = [(left-22, data_hi), (left-8, data_hi), (left-8, data_lo),
              (left, data_lo)]
    # START: SDA falls while SCL is high. Then data changes only during SCL low.
    for i, bit in enumerate(levels):
        x0 = left + i*unit
        xmid = x0 + unit/2
        xend = x0 + unit
        y = data_hi if bit else data_lo
        change_x = x0+unit*.12
        prev = data_lo if i == 0 else (data_hi if levels[i-1] else data_lo)
        coords.extend([(change_x, prev), (change_x, y)])
        coords.extend([(xmid, y), (xend, y)])
    # STOP: SDA rises after the ninth clock while SCL is high.
    coords.extend([(right+26, data_lo), (right+26, data_hi), (right+34, data_hi)])
    s.trace(coords, ORANGE)
    s.text(left-25, 70 if mobile else 63, '開始', 17, ORANGE, bold=True)
    s.text(right-42, 70 if mobile else 63, '終了', 17, ORANGE, bold=True)
    s.text(left+unit*1.7, 184 if mobile else 181, 'データ8 bit（上位bitから送信）', 17 if mobile else 18, INK, width=unit*5.8)
    s.text(left+unit*8.5-16, 184 if mobile else 181, 'ACK', 17 if mobile else 18, ORANGE, bold=True)
    for i, bit in enumerate(bits):
        x = left+(i+.5)*unit
        s.text(x-9, 302 if mobile else 299, str(bit), 17, MUTED, bold=True)
    s.text(left+unit*8.5-16, 302 if mobile else 299, '0', 17, ORANGE, bold=True)
    note_y = 350 if mobile else 350
    if mobile:
        s.text(18, note_y, 'SCLがLOWの間にSDAが変化します。', 17, INK, width=360)
        s.text(18, note_y+30, '開始・終了は例外です。', 17, INK, width=360)
        s.text(18, note_y+60, 'ACKでは受信側がSDAをLOWにします。', 17, INK, width=360)
    else:
        s.text(142, note_y, 'SCLがLOWの間にSDAが変化します。ACKでは受信側がSDAをLOWにします。', 18, INK, width=660)
        s.text(142, note_y+36, '開始・終了では、SCLがHIGHの間にSDAが変化します。', 18, MUTED, width=660)
    return s


def i2c_clock_data_signal(mobile=False):
    return _i2c_wave(False)


def i2c_open_drain_pullup(mobile=False):
    if mobile:
        s = Scene(400, 510)
        s.text(20, 20, 'I²Cのオープンドレイン出力', 20, INK, bold=True, width=360)
        # Pull-up resistor and line are drawn as a real circuit.
        s.text(177, 70, 'VCC', 18, BLUE, bold=True)
        s.line(202, 96, 202, 117, BLUE)
        s.resistor(202, 117, 54)
        s.text(222, 129, 'RPU', 17, BLUE, bold=True)
        s.line(202, 171, 202, 219, BLUE)
        s.line(55, 219, 350, 219, INK, 3)
        s.text(20, 207, 'SDA', 18, INK, bold=True)
        _device(s, 88, 285, 226, 76, 'オープンドレイン出力', size=18)
        s.line(202, 219, 202, 285, INK, 2.4)
        s.line(202, 361, 202, 392, INK, 2.4)
        s.ground(202, 392)
        s.text(20, 432, '解放すると抵抗がSDAをHIGHにする', 17, INK, width=360)
        s.text(20, 466, 'LOWにすると電流がGNDへ流れる', 17, INK, width=360)
        return s
    s = Scene(840, 440)
    s.text(28, 24, '出力を解放するとプルアップがバスをHIGHにする', 20, INK, bold=True)
    # Shared bus with a pull-up and two parallel open-drain outputs.
    s.text(395, 78, 'VCC', 18, BLUE, bold=True)
    s.line(421, 103, 421, 119, BLUE)
    s.resistor(421, 119, 60)
    s.text(443, 137, 'RPU', 18, BLUE, bold=True)
    s.line(421, 179, 421, 208, BLUE, 2.5)
    s.line(112, 208, 730, 208, INK, 3)
    s.text(40, 198, 'SDA', 18, INK, bold=True)
    for x, label in ((290, 'デバイスA'), (550, 'デバイスB')):
        _device(s, x-82, 268, 164, 64, label, size=18)
        s.line(x, 208, x, 268, INK, 2.4)
        s.line(x, 332, x, 354, INK, 2.4)
        s.ground(x, 354)
    s.text(106, 92, 'すべての出力を解放', 18, BLUE, bold=True, width=260)
    s.text(106, 124, '→ バスはHIGHになる', 18, BLUE, width=260)
    s.text(106, 374, 'どれかがLOWにするとバスもLOW', 18, ORANGE, bold=True, width=400)
    return s


def i2c_pullup_resistor_tradeoff(mobile=False):
    s = Scene(400, 470) if mobile else Scene(840, 470)
    if mobile:
        x0, x1, y0, y1 = 72, 378, 110, 316
        s.text(18, 18, 'プルアップ抵抗の選び方', 20, INK, bold=True, width=365)
    else:
        x0, x1, y0, y1 = 112, 790, 112, 330
        s.text(28, 22, '抵抗を小さくするとLOW時の電流が増える', 20, INK, bold=True)
    # Logarithmic axes: R = 1 kΩ..100 kΩ, I = 3.3 mA..0.033 mA at 3.3 V.
    def px(r):
        import math
        return x0 + (math.log10(r)-3)/2*(x1-x0)
    def py(ma):
        import math
        return y1 - (math.log10(ma)-math.log10(.033))/(2)*(y1-y0)
    s.line(x0, y1, x1, y1, INK, 1.8)
    s.line(x0, y0, x0, y1, INK, 1.8)
    for r in (1000, 10000, 100000):
        x = px(r)
        s.line(x, y0, x, y1, GRID, 1.2)
        s.line(x, y1, x, y1+6, INK, 1.6)
        s.text(x-22, y1+10, f'{r//1000} kΩ', 17 if mobile else 18, INK, width=70)
    for ma in (.033, .1, .33, 1, 3.3):
        y = py(ma)
        s.line(x0, y, x1, y, GRID, 1.2)
        s.line(x0-5, y, x0, y, INK, 1.6)
        s.text(4 if mobile else 24, y-11, f'{ma:g}', 17, INK, width=58)
    points=[]
    for i in range(61):
        r=1000*10**(2*i/60)
        points.append((px(r), py(3300/r)))
    s.trace(points, BLUE, stroke=3)
    s.text(220 if mobile else 520, 54, 'I = 3.3 V / R', 18, BLUE, bold=True, width=170)
    s.text(78 if mobile else 348, y1+38, 'プルアップ抵抗 R（対数目盛）', 17 if mobile else 18, INK, width=260)
    s.text(8 if mobile else 28, y0-35, 'LOW電流（mA）', 17 if mobile else 18, INK, width=170)
    if mobile:
        s.text(18, 388, '3.3 Vの例：1 kΩで3.3 mA', 17, INK, width=364)
        s.text(18, 418, '100 kΩなら0.033 mA。素子の定格も確認。', 17, INK, width=364)
    else:
        s.text(115, 394, '3.3 Vの例：1 kΩで3.3 mA、100 kΩで0.033 mA。', 18, MUTED, width=690)
        s.text(115, 417, '立ち上がり時間・漏れ電流・許容シンク電流も確認します。', 18, MUTED, width=690)
    return s


def i2c_shared_bus(mobile=False):
    s = Scene(400, 460) if mobile else Scene(840, 400)
    left, right = (45, 355) if mobile else (96, 790)
    y1, y2 = (132, 198) if mobile else (126, 200)
    for y, label, color in ((y1, 'SCL', BLUE), (y2, 'SDA', ORANGE)):
        s.line(left, y, right, y, color, 3)
        s.text(12, y-12, label, 17 if mobile else 18, color, bold=True)
    # Two distinct pull-ups; each terminates at only its own signal conductor.
    x_scl, x_sda = left+38, left+78
    s.text(x_scl-19, 36, 'VCC', 18, BLUE, bold=True)
    s.line(x_scl, 62, x_scl, 76, BLUE, 2)
    s.resistor(x_scl, 76, 48)
    s.text(x_scl+12, 89, 'RPU', 18, BLUE, bold=True)
    s.line(x_scl, 124, x_scl, y1, BLUE, 2)
    # Place the SDA pull-up below its bus to keep its branch from crossing SCL.
    s.line(x_sda, y2, x_sda, y2+18, BLUE, 2)
    s.resistor(x_sda, y2+18, 48)
    s.text(x_sda+12, y2+32, 'RPU', 18, BLUE, bold=True)
    s.line(x_sda, y2+66, x_sda, y2+82, BLUE, 2)
    s.text(x_sda-18, y2+92, 'VCC', 18, BLUE, bold=True)
    nodes = [(200, 'MCU'), (440, 'センサ'), (680, 'EEPROM')]
    if mobile:
        nodes = [(75, 'MCU'), (200, 'センサ'), (325, 'EEPROM')]
    for x, label in nodes:
        box_y = y1+15
        s.line(x, y1, x, box_y, BLUE, 2)
        s.line(x, y2-16, x, y2, ORANGE, 2)
        s.circle(x, y1, 3.5, BLUE); s.circle(x, y2, 3.5, ORANGE)
        box_width = 112
        _device(s, x-box_width/2, box_y, box_width, y2-16-box_y, label, size=17)
    if mobile:
        s.text(18, 354, '各ノードをSCLとSDAの両方へ接続します。', 17, INK, width=364)
        s.text(18, 386, 'SCLとSDAは別々の線です。', 17, INK, width=364)
        s.text(18, 418, 'コントローラはアドレスで機器を選びます。', 17, INK, width=364)
    else:
        s.text(170, 352, 'SCLとSDAを共有し、アドレスで機器を選択します。', 18, INK, width=620)
    return s


def spi_chip_select_wiring(mobile=False):
    s = Scene(400, 520) if mobile else Scene(840, 450)
    if mobile:
        s.text(18, 18, 'SPI：共有線と個別CS', 20, INK, bold=True, width=365)
        mx, my, mw, mh = 120, 372, 160, 72
        devs=[(58, 118, 'デバイス1'), (242, 118, 'デバイス2'), (58, 242, 'デバイス3')]
        _device(s, mx, my, mw, mh, 'コントローラ', size=18)
        for x,y,label in devs: _device(s,x,y,100,58,label,size=17)
        # Shared SCK/MOSI fanout rails above the devices, kept distinct.
        s.line(38, 83, 362, 83, BLUE, 2.5); s.text(18, 68, 'SCK', 17, BLUE, bold=True)
        s.line(38, 98, 362, 98, ORANGE, 2.5); s.text(18, 98, 'MOSI', 17, ORANGE, bold=True)
        for x,y,_ in devs:
            cx=x+50
            s.line(cx,83,cx,y,BLUE,2); s.line(cx,98,cx,y,ORANGE,2)
        # MISO return rail along the right edge, with branches to each device.
        s.line(368, 154, 368, 296, BLUE, 2.5)
        for x,y,_ in devs: s.line(x+100,y+29,368,y+29,BLUE,2)
        s.arrow(368, 296, 280, 396, BLUE, 2.3)
        s.text(286, 310, 'MISO', 17, BLUE, bold=True)
        for i,(x,y,_) in enumerate(devs):
            cy=y+58
            s.line(mx, my+20+i*15, x+100, cy, ORANGE, 2)
            s.text(18, cy-12, f'CS{i}', 17, ORANGE, bold=True)
        s.text(18, 465, 'SCK・MOSI・MISOは共有し、CSは機器ごとに接続します。', 17, INK, width=364)
        return s
    s.text(28, 22, 'SPIデータ線を共有し、CSで機器を選択する', 20, INK, bold=True)
    c=(75,128,150,82); devices=[(320,135,'デバイス1'),(500,135,'デバイス2'),(680,135,'デバイス3')]
    _device(s,*c,'MCU',size=19)
    for x,y,name in devices: _device(s,x,y,128,72,name,size=18)
    # Three independent MCU top pins rise to their matching shared trunks.
    for i,(name,color,y,pin) in enumerate((('SCK',BLUE,78,32),('MOSI',ORANGE,98,64),('MISO',BLUE,118,96))):
        s.text(25,y-14,name,17,color,bold=True)
        s.line(225,y,810,y,color,2.4)
    for px,rail_y,color in ((115,78,BLUE),(150,98,ORANGE),(185,118,BLUE)):
        s.line(px,128,px,rail_y,color,2.1)
        s.line(px,rail_y,225,rail_y,color,2.1)
    # Device taps use three separate top pins. Gaps mark crossings without joins.
    for x,_,_ in devices:
        _crossing_gap(s,x+32,98); _crossing_gap(s,x+32,118)
        _crossing_gap(s,x+64,118)
        s.line(x+32,78,x+32,135,BLUE,2.1)
        s.line(x+64,98,x+64,135,ORANGE,2.1)
        s.line(x+96,118,x+96,135,BLUE,2.1)
        for px,rail_y,color in ((x+32,78,BLUE),(x+64,98,ORANGE),(x+96,118,BLUE)):
            s.circle(px,rail_y,3,color)
    # Individual CS wires route below the devices and meet their bottom edges.
    cs_routes=[]
    for i,(x,y,_) in enumerate(devices):
        sy=252+i*24; source_x=115+i*35; target_x=x+64
        cs_routes.append((i,sy,source_x,target_x))
        s.text(36,sy-13,f'CS{i}',17,ORANGE,bold=True,width=62)
        s.line(source_x,sy,target_x,sy,ORANGE,2)
        s.line(target_x,sy,target_x,207,ORANGE,2)
        s.circle(target_x,207,3,ORANGE)
    # Keep later controller drops visibly separate from earlier CS rails.
    for i,sy,source_x,target_x in cs_routes:
        for j,other_y,other_source,other_target in cs_routes[:i]:
            if other_source <= source_x <= other_target:
                _crossing_gap(s,source_x,other_y)
    for i,sy,source_x,target_x in cs_routes:
        s.line(source_x,210,source_x,sy,ORANGE,2)
    s.text(322, 335, '選択中の機器だけがMISOを出力します。', 18, INK, width=480)
    return s


def spi_daisy_chain_wiring(mobile=False):
    s = Scene(400, 560) if mobile else Scene(840, 470)
    if mobile:
        s.text(18, 18, 'SPIデイジーチェーン', 20, INK, bold=True)
        _device(s, 120, 70, 160, 62, 'コントローラ', size=18)
        for y,n in ((210,'デバイス1'),(322,'デバイス2'),(434,'デバイス3')):
            _device(s, 120, y, 160, 62, n, size=18)
        # Shared clock and select run vertically along the left side.
        for x,label,color in ((48,'SCK',BLUE),(78,'CS',ORANGE)):
            s.line(x, 132, x, 496, color, 2.4)
            s.text(14, 48 if x==48 else 76, label, 17, color, bold=True)
        for y,_ in ((210,'Device 1'),(322,'Device 2'),(434,'Device 3')):
            s.line(48,y+26,120,y+26,BLUE,2); s.line(78,y+26,120,y+26,ORANGE,2)
        # MOSI enters SDI, SDO proceeds to the next SDI, final SDO returns as MISO.
        s.arrow(200,132,200,210,BLUE,2.5); s.text(220,164,'MOSI → SDI',17,BLUE,width=160)
        s.arrow(200,272,200,322,BLUE,2.5); s.text(220,282,'SDO → SDI',17,BLUE,width=160)
        s.arrow(200,384,200,434,BLUE,2.5); s.text(220,394,'SDO → SDI',17,BLUE,width=160)
        s.path('M280,465 H344 V101 H280', BLUE, 2.5)
        s.arrow(344,101,280,101,BLUE,2.5)
        s.text(282, 488, 'SDO → MISO', 17, BLUE, width=110)
        s.text(18, 520, '1本のデータ経路が各機器を順に通ります。', 17, INK, width=364)
        return s
    s.text(28, 22, '各機器がデータを次の機器へ順送りします', 20, INK, bold=True)
    _device(s, 48, 176, 150, 84, 'コントローラ', size=19)
    devs=[(256,176,'デバイス1'),(448,176,'デバイス2'),(640,176,'デバイス3')]
    for x,y,name in devs: _device(s,x,y,142,84,name,size=18)
    # The data chain is a single loop: controller out -> three devices -> controller in.
    s.arrow(198,196,256,196,BLUE,2.8); s.text(200,153,'MOSI → SDI',17,BLUE,width=120)
    s.arrow(398,196,448,196,BLUE,2.8); s.text(395,153,'SDO → SDI',17,BLUE,width=130)
    s.arrow(590,196,640,196,BLUE,2.8); s.text(586,153,'SDO → SDI',17,BLUE,width=130)
    s.path('M782,218 H818 V320 H112 V260', BLUE, 2.8)
    s.arrow(112,320,112,260,BLUE,2.8)
    s.text(333, 334, 'デバイス3のSDO → コントローラのMISO', 17, BLUE, width=360)
    # Shared clock and select trunks use distinct controller pins.
    for y,label,color in ((80,'SCK',BLUE),(106,'CS',ORANGE)):
        s.text(28,y-13,label,17,color,bold=True)
        s.line(112,y,760,y,color,2.4)
    s.line(90,176,90,80,BLUE,2.1); s.line(90,80,112,80,BLUE,2.1)
    s.line(140,176,140,106,ORANGE,2.1); s.line(112,106,140,106,ORANGE,2.1)
    # Each device has separate top pins; the SCK drop crosses CS without joining it.
    for x,_,_ in devs:
        _crossing_gap(s,x+45,106)
        s.line(x+45,80,x+45,176,BLUE,2.1)
        s.line(x+95,106,x+95,176,ORANGE,2.1)
        s.circle(x+45,80,3,BLUE); s.circle(x+95,106,3,ORANGE)
    s.text(186, 386, 'SCKとCSは3台で共有します。', 18, INK, width=570)
    s.text(186, 416, '各機器のシフトレジスタがデータ列の一部を受け持ちます。', 17, MUTED, width=620)
    return s


def uart_connection(mobile=False):
    s = Scene(400, 400) if mobile else Scene(840, 400)
    if mobile:
        _device(s, 95, 62, 210, 92, '機器A', 'TX / RX', size=19)
        _device(s, 95, 217, 210, 92, '機器B', 'TX / RX', size=19)
        s.arrow(132,154,132,217,BLUE,2.6); s.text(145,171,'TX A → RX B',17,BLUE,width=220)
        s.arrow(268,217,268,154,ORANGE,2.6); s.text(18,184,'TX B → RX A',17,ORANGE,width=120)
        s.line(200,154,200,172,INK,2); s.line(200,172,332,172,INK,2); s.line(332,172,332,309,INK,2)
        s.line(332,309,200,309,INK,2); s.line(200,309,200,330,INK,2); s.ground(200,330)
        s.text(18, 350, 'GNDも共通に接続します。', 17, MUTED, width=364)
        return s
    _device(s, 80, 106, 220, 106, '機器A', 'TX A     RX A', size=20)
    _device(s, 540, 106, 220, 106, '機器B', 'RX B     TX B', size=20)
    s.arrow(300,140,540,140,BLUE,2.8); s.text(344,104,'TX A → RX B',18,BLUE,bold=True,width=190)
    s.arrow(540,188,300,188,ORANGE,2.8); s.text(344,200,'TX B → RX A',18,ORANGE,bold=True,width=190)
    s.line(190,212,190,270,INK,2); s.line(650,212,650,270,INK,2)
    s.line(190,270,650,270,INK,2); s.ground(420,270)
    s.text(307, 338, 'TXとRXを交差接続し、GNDを共通にします。', 18, INK, width=500)
    return s


def uart_frame_8n1(mobile=False):
    s = Scene(400, 520) if mobile else Scene(840, 420)
    if mobile:
        s.text(18,18,'UARTフレーム：8N1',20,INK,bold=True)
        x0, cell, y = 20, 36, 120
        labels=['開始']+[f'D{i}' for i in range(8)]+['停止']
        for i,label in enumerate(labels):
            x=x0+i*cell
            fill=ORANGE_TINT if i in (0,9) else BLUE_TINT
            color=ORANGE if i in (0,9) else BLUE
            s.rect(x,y,cell,64,fill,color,1.6)
            s.text(x+2,y+14,label,17,INK,bold=True,width=cell-4)
        s.text(18, 216, '各bitは同じ長さ', 17, MUTED)
        s.text(18, 280, 'アイドル HIGH', 17, INK, bold=True)
        s.line(18, 304, 92, 304, BLUE, 2.5); s.text(104,292,'開始 bit はLOW',17,ORANGE,width=270)
        s.text(18, 344, 'データ8 bitを下位 bitから送信', 17, INK, width=364)
        s.text(18, 376, 'Nはパリティなし', 17, INK)
        s.text(18, 408, '停止 bit は1 bit分HIGH', 17, INK, width=364)
        s.text(18, 460, '9600 bpsでは1 bitは約104 μs', 17, MUTED, width=364)
        return s
    x0, cell, y = 36, 76, 130
    labels=['開始']+[f'D{i}' for i in range(8)]+['停止']
    for i,label in enumerate(labels):
        x=x0+i*cell
        fill=ORANGE_TINT if i in (0,9) else BLUE_TINT
        color=ORANGE if i in (0,9) else BLUE
        s.rect(x,y,cell,72,fill,color,1.8)
        s.text(x+8,y+17,label,18,INK,bold=True,width=cell-16)
    s.text(30, 80, 'アイドル HIGH', 18, MUTED, bold=True)
    s.text(34, 236, '10 bitを同じ長さで送信', 18, INK, bold=True)
    s.line(x0, 266, x0+cell*10, 266, BLUE, 2)
    for i in range(11):
        x=x0+i*cell
        s.line(x,258,x,274,BLUE,1.5)
    s.text(34, 302, '開始 bit はLOW', 18, ORANGE, bold=True)
    s.text(200, 302, 'データ8 bitを下位 bitから送信', 18, INK, width=570)
    s.text(34, 338, 'Nはパリティなし', 18, INK)
    s.text(34, 374, '停止 bit は1 bit分HIGH', 18, INK)
    return s


def uart_waveform(mobile=False):
    s = Scene(400, 500) if mobile else Scene(840, 430)
    x0, cell = (48, 30) if mobile else (118, 62)
    yhi, ylo = (139, 205) if mobile else (126, 210)
    bits=[0,1,0,1,0,0,1,0,1,1]  # start, 0xA5 LSB-first, stop
    end=x0+len(bits)*cell
    s.text(16 if mobile else 28, 22, 'TX' if mobile else 'UART TX：0xA5、8N1', 20, INK, bold=True)
    s.text(16 if mobile else 30, yhi-30, 'HIGH', 17, MUTED, bold=True)
    s.text(16 if mobile else 30, ylo-4, 'LOW', 17, MUTED, bold=True)
    coords=[(x0-18,yhi),(x0,yhi),(x0,ylo)]
    for i,b in enumerate(bits):
        y=yhi if b else ylo
        coords.extend([(x0+i*cell,y),(x0+(i+1)*cell,y)])
        if i+1<len(bits):
            next_y=yhi if bits[i+1] else ylo
            coords.append((x0+(i+1)*cell,next_y))
    coords.append((end+18,yhi))
    s.trace(coords, BLUE, stroke=2.8 if mobile else 3.2)
    for i in range(11):
        x=x0+i*cell
        s.line(x, yhi-14, x, ylo+18, GRID, 1.2, dash='4 4')
    labels=['開始']+[f'D{i}' for i in range(8)]+['停止']
    for i,label in enumerate(labels):
        x=x0+(i+.5)*cell
        s.text(x-(cell/2), 239 if mobile else 254, label, 17, ORANGE if i in (0,9) else INK, bold=i in (0,9), width=cell)
        s.text(x-(cell/2), 275 if mobile else 287, str(bits[i]), 17, BLUE, bold=True, width=cell)
    if mobile:
        s.text(18, 330, '開始 bit 0、データ0xA5（下位 bitから）、', 17, INK, width=364)
        s.text(18, 360, '停止 bit 1。各bitの幅は同じです。', 17, INK, width=364)
        s.text(18, 410, 'フレーム間はHIGHです。', 17, MUTED, width=364)
    else:
        s.text(118, 342, '開始0 ｜ データ 1,0,1,0,0,1,0,1 ｜ 停止1', 18, INK, width=680)
        s.text(118, 379, '各bitの長さは同じです。フレーム間はHIGHです。', 18, MUTED, width=680)
    return s


def _size_floor(drawer):
    def draw(mobile=False):
        scene = drawer(mobile)
        floor = 17 if mobile else 18
        for label in scene.labels:
            label['size'] = max(floor, label['size'])
        return scene
    return draw


DRAWERS = {
    'i2c-clock-data-signal': i2c_clock_data_signal,
    'i2c-open-drain-pullup': i2c_open_drain_pullup,
    'i2c-pullup-resistor-tradeoff': i2c_pullup_resistor_tradeoff,
    'i2c-shared-bus': i2c_shared_bus,
    'spi-chip-select-wiring': spi_chip_select_wiring,
    'spi-daisy-chain-wiring': spi_daisy_chain_wiring,
    'uart_connection': uart_connection,
    'uart-connection': uart_connection,
    'uart-frame-8n1': uart_frame_8n1,
    'uart-waveform': uart_waveform,
}
DRAWERS = {name: _size_floor(drawer) for name, drawer in DRAWERS.items()}
