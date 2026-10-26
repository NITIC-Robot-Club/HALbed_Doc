"""CAN figures: readable topology and mathematically consistent signals."""
import math
from redesign_common import Scene, INK, MUTED, GRID, BLUE, ORANGE, BLUE_TINT


def architecture(mobile=False):
    s=Scene(400 if mobile else 840,650 if mobile else 380)
    if mobile:
        s.box(24,24,352,96,'MCU / CANコントローラ','フレームの生成・受信処理')
        s.arrow(120,128,120,218,BLUE);s.text(130,153,'TX',18)
        s.arrow(278,218,278,128,INK);s.text(288,153,'RX',18)
        s.box(24,226,352,96,'CANトランシーバ','論理信号と差動電圧を変換')
        for x,label in [(120,'CANH'),(278,'CANL')]:
            s.line(x,322,x,438,BLUE if label=='CANH' else INK)
            s.text(x+12,367,label,18,width=80)
        s.box(24,446,352,72,'CANバス')
        s.text(24,560,'送信・受信の両方が同じ2線を使う。',18)
    else:
        for x,title,sub in [(24,'MCU','CANコントローラ'),(320,'トランシーバ','電気信号の変換'),(642,'CANバス','CANH / CANL')]:
            s.box(x,98,174 if x==642 else 204,102,title,sub,size=21)
        s.arrow(236,124,312,124,BLUE);s.text(252,81,'TX',18)
        s.arrow(312,175,236,175,INK);s.text(252,207,'RX',18)
        s.line(524,128,642,128,BLUE);s.text(539,90,'CANH',17)
        s.line(524,176,642,176,INK);s.text(539,203,'CANL',17)
        s.text(24,267,'フレーム処理',20,bold=True,width=240)
        s.text(320,267,'差動信号の送受信',20,bold=True,width=260)
        s.text(24,321,'2本の線は双方向。受信した論理値はRXからMCUへ戻る。',18)
    return s


def bus(mobile=False,broadcast=False):
    s=Scene(400 if mobile else 840,445 if mobile else 410)
    left,right=(40,360) if mobile else (72,790)
    yh,yl=(190,246) if mobile else (170,226)
    s.text(24,20,'全ノードが同じバスを共有する' if broadcast else '終端抵抗は幹線の両端だけ',21,bold=True)
    s.text(24,yh-30,'CANH',17,BLUE);s.text(24,yl+12,'CANL',17)
    s.line(left,yh,right,yh,BLUE,2.8);s.line(left,yl,right,yl,INK,2.8)
    xs=[92,200,308] if mobile else [230,440,650]
    for i,x in enumerate(xs):
        w=102 if mobile else 154
        label=('送信' if i==0 else '受信') if broadcast else f'ノード {chr(65+i)}'
        s.box(x-w/2,82 if mobile else 76,w,64,label,size=17 if mobile else 20)
        pin_y=146 if mobile else 140
        s.line(x-10,pin_y,x-10,yh,BLUE)
        # The CANL branch crosses CANH without a connection dot.
        d=f'M{x+10},{pin_y} V{yh-9} C{x+10},{yh-2} {x+20},{yh-2} {x+20},{yh+5} V{yl}'
        s.path(d,'white',7);s.path(d,INK,2)
        s.circle(x-10,yh,3,BLUE);s.circle(x+20,yl,3)
    for x in (left+8,right-8):
        s.resistor(x,yh,yl-yh)
        s.text(x-20 if x<100 else x-44,yl+45,'120 Ω',16,width=80)
    if broadcast:
        s.arrow(left+20,yl+100,right-30,yl+100,BLUE)
        s.text(24,s.h-48,'ID等で、各ノードが受信の採否を決める。',17)
    else:
        s.text(24,s.h-75,'2線へ別々に接続し、分岐は短くする。',18)
        s.text(24,s.h-40,'途中のノードに終端抵抗を追加しない。',17,MUTED)
    return s


def arbitration(mobile=False):
    s=Scene(400 if mobile else 840,430)
    s.text(24,20,'11 bit IDをMSBから比較',21,bold=True)
    a=f'{0x120:011b}';b=f'{0x130:011b}'
    x0,step=(116,22) if mobile else (220,51)
    diff=next(i for i,(p,q) in enumerate(zip(a,b)) if p!=q)
    s.rect(x0+diff*step-3,87,step,196,BLUE_TINT,'none',0)
    for i in range(11):s.text(x0+i*step,64,str(10-i),14,MUTED,width=28)
    for y,label,bits,color in [(112,'A 0x120',a,INK),(177,'B 0x130',b,INK),(242,'バス',a,BLUE)]:
        s.text(24,y,label,17 if mobile else 20,bold=True,width=x0-28)
        for i,v in enumerate(bits):
            s.text(x0+i*step,y,'—' if label.startswith('B') and i>diff else v,20,color,width=step)
        s.line(x0-4,y+34,x0+11*step-8,y+34,GRID,1)
    s.text(24,305,'ID bit 4：Bは1を送信、バスで0を観測。',17)
    s.text(24,343,'Bは送信を止め、Aの送信が続く。',18)
    s.text(24,387,'0（ドミナント）が優先。',17,MUTED)
    return s


def stuffing(mobile=False):
    s=Scene(400 if mobile else 840,350)
    s.text(24,20,'同じ値が5 bit続いたら\n反対値を挿入' if mobile else '同じ値が5 bit続いたら反対値を挿入',19,bold=True)
    bits=[1,0,0,0,0,0,1,1,0,1]
    x0,step=(28,34) if mobile else (94,68)
    for i,v in enumerate(bits):
        x=x0+i*step
        if i==6:s.rect(x-5,91,step-7,58,BLUE_TINT,BLUE)
        s.text(x,101,str(v),24 if not mobile else 22,BLUE if i==6 else INK,width=step)
    s.line(x0+step,161,x0+step*6-12,161,INK,1.5)
    s.text(24,194,'0が5つ続く → スタッフビット1を挿入',17)
    s.text(24,239,'受信側は挿入したビットを取り除く。',18)
    s.text(24,288,'Classical CANの動的スタッフィング例',17,MUTED)
    return s


def fields(mobile=False,fd=False):
    s=Scene(400 if mobile else 840,670 if mobile else 345)
    s.text(24,20,'CAN FD データフレーム' if fd else 'Classical CAN データフレーム',21,bold=True)
    data=[('SOF','開始'),('調停','ID・RRS' if fd else 'ID・RTR'),('制御','FDF・BRS・DLC' if fd else 'DLC等'),('データ','0–64 byte' if fd else '0–8 byte'),('CRC','誤り検出'),('ACK','受信の応答'),('EOF','終了')]
    if mobile:
        for i,(label,value) in enumerate(data):
            y=82+i*66
            s.text(24,y,str(i+1),17,MUTED,width=26)
            s.text(60,y,label,19,bold=True,width=90)
            s.text(168,y,value,18,width=208)
            s.line(24,y+48,376,y+48,GRID,1)
        s.text(24,579,'上から送信順。フィールド幅は模式的。',17,MUTED)
        if fd:s.text(24,616,'CAN FDにはリモートフレームはない。',17)
    else:
        widths=[48,126,106,260,86,80,86];x=24
        for i,((label,value),w) in enumerate(zip(data,widths)):
            s.rect(x,102,w,70,BLUE_TINT if label=='データ' else 'white',INK,1.2)
            s.text(x+6,123,label,17,bold=label=='データ',width=w-10)
            x+=w
        s.arrow(24,203,816,203,INK,1.6)
        s.text(24,225,'左から送信順。幅は実際のビット長を示さない。',18,MUTED)
        s.text(24,277,'IDとRRSで調停。BRSはデータフェーズの速度切替を指示。' if fd else '標準IDは11 bit、拡張IDは29 bit。データ部は最大8 byte。',18)
    return s


def errors(mobile=False):
    s=Scene(400 if mobile else 840,715 if mobile else 650)
    width=352 if mobile else 350
    s.text(24,20,'エラーカウンターと送信状態',21,bold=True)
    for y,title,sub in [(70,'Error Active','通常のエラー通知'),(258,'Error Passive','受動エラーフラグで通知'),(446,'Bus Off','バスから切り離して送信停止')]:
        s.box(24,y,width,80,title,sub,color=INK,fill=BLUE_TINT if title=='Error Active' else 'white')
    for y,cond in [(158,'TEC ≥ 128 または REC ≥ 128'),(346,'TEC ≥ 256')]:
        s.arrow(46,y,46,y+88,INK)
        s.text(72,y+17,cond,17,width=304 if mobile else 680)
    if mobile:
        s.text(24,563,'TEC：送信エラーカウンター',17)
        s.text(24,596,'REC：受信エラーカウンター',17)
        s.text(24,636,'両方が127以下でActiveへ戻る。',17)
        s.text(24,672,'Bus Offからの復帰はMCU仕様を確認。',17)
    else:
        s.text(420,86,'TEC：送信エラーカウンター',18,width=390)
        s.text(420,126,'REC：受信エラーカウンター',18,width=390)
        s.text(420,265,'Error Passiveからは、',18)
        s.text(420,301,'両カウンターが127以下で',18)
        s.text(420,337,'Error Activeへ戻る。',18)
        s.text(420,459,'Bus Offの復帰条件・解除手順は',18)
        s.text(420,495,'対象MCUの仕様を確認する。',18)
        s.text(24,583,'RECの増加だけではBus Offへ移行しない。',18,MUTED)
    return s


def compare(mobile=False):
    s=Scene(400 if mobile else 840,400)
    x,w=(70,300) if mobile else (170,620)
    for y,label,byte in [(82,'Classical CAN',8),(214,'CAN FD',64)]:
        s.text(24,y-40,f'{label}：最大{byte} byte',20,bold=True)
        s.rect(x,y,w*byte/64,38,BLUE_TINT,BLUE)
    for n in (0,8,16,32,64):
        xx=x+w*n/64;s.line(xx,280,xx,285,MUTED,1)
        s.text(xx-10,293,str(n),16,MUTED,width=40)
    s.line(x,280,x+w,280,MUTED,1)
    s.text(24,340,'データ部の長さ [byte]\nヘッダ等は含めない。' if mobile else 'データ部の長さ [byte]。ヘッダ等は含めない。',17)
    return s


def signals(mobile=False,noise=False):
    s=Scene(400 if mobile else 840,645 if noise else 530)
    x,w=(66,306) if mobile else (100,696)
    bits=[1,1,0,0,1,0,1,1]
    def values(t):
        bit=bits[min(int(t),7)];dom=1-bit
        n=(.32*math.exp(-((t-2.65)/.16)**2)-.23*math.exp(-((t-5.45)/.24)**2)) if noise else 0
        return 2.5+dom+n,2.5-dom+n,n,2*dom
    s.text(24,20,('同相ノイズと差電圧' if mobile else '同相ノイズを加えても、差電圧は変わらない') if noise else 'CANH − CANLで論理値を判定',19,bold=True)
    y0=82;h=150
    for v in (1.5,2.5,3.5):
        yy=y0+h-(v-1)/3*h;s.line(x,yy,x+w,yy,GRID,1);s.text(22,yy-12,str(v),16,MUTED,width=42)
    s.text(x,49,'線の電圧 [V]',17)
    for i,c,dash in [(0,BLUE,None),(1,INK,'7 4')]:
        pts=[(x+w*j/400,y0+h-(values(8*j/400)[i]-1)/3*h) for j in range(401)]
        s.trace(pts,c,dash)
    s.text(x,253,'CANH：実線　CANL：破線',17)
    if noise:
        yn=324
        s.text(x,294,'両線に加わる同じノイズ [V]',17)
        s.line(x,yn+35,x+w,yn+35,GRID,1)
        s.text(24,yn+23,'0',16,MUTED,width=30)
        s.trace([(x+w*j/240,yn+35-values(8*j/240)[2]*65) for j in range(241)],MUTED)
    yd=438 if noise else 330
    s.text(x,yd-31,'差電圧 [V]',17)
    for v in (0,2):
        yy=yd+62-v*31;s.line(x,yy,x+w,yy,GRID,1);s.text(24,yy-12,str(v),16,MUTED,width=30)
    s.trace([(x+w*j/400,yd+62-values(8*j/400)[3]*31) for j in range(401)],BLUE)
    s.text(s.w-100,yd+75,'時間 →',16,MUTED,width=80)
    s.text(24,s.h-91,'差が約2 V：ドミナント（0）',17)
    s.text(24,s.h-58,'差が約0 V：レセシブ（1）',17)
    s.text(24,s.h-27,'高速CANの代表値を使った模式図。',16,MUTED)
    return s


def reflection(mobile=False):
    s=Scene(400 if mobile else 840,470)
    x1,x2=60,s.w-60
    for y,title,matched in [(105,'整合：終端抵抗 R = Z₀',True),(282,'不整合：終端抵抗がZ₀と異なる',False)]:
        s.text(24,y-65,title,19,bold=True)
        s.line(x1,y,x2,y,INK)
        s.circle(x1,y,4,INK,'white');s.circle(x2,y,4,INK,'white')
        s.arrow(x1+20,y-18,x2-20,y-18,BLUE)
        s.text(x1+18,y+18,'反射なし（理想条件）' if matched else '反射波が戻る',17)
        if not matched:s.arrow(x2-20,y+68,x1+20,y+68,ORANGE)
    s.text(24,401,'Z₀：ケーブルの特性インピーダンス',17)
    s.text(24,436,'CAN幹線は通常、両端に約120 Ω。',17,MUTED)
    return s


def single_compare(mobile=False):
    s=Scene(840,500)
    for y,title,a,b in [(65,'単端：信号とGNDの電圧差','信号','GND'),(281,'差動：2本の信号線の電圧差','CANH','CANL')]:
        s.text(24,y-40,title,20,bold=True)
        s.box(24,y+20,150,112,'送信側',size=20)
        s.box(660,y+20,156,112,'受信側',size=20)
        for yy,label,c in [(y+53,a,BLUE),(y+104,b,INK)]:
            s.line(174,yy,660,yy,c);s.text(340,yy-29,label,17,width=180)
    s.text(24,453,'差動受信器は、両線に共通する電圧変動の影響を抑える。',18,MUTED)
    return s


DRAWERS={
 'can-controller-vs-transceiver':architecture,
 'can-bus-connection':bus,'can-connection':bus,'can-connection-low-layer':bus,
 'can-message-broadcast':lambda mobile=False:bus(mobile,True),
 'can-arbitration-retransmission':arbitration,'can-bit-stuffing':stuffing,
 'can-error-state-flow':errors,
 'classical-can-frame':lambda mobile=False:fields(mobile,False),
 'can-fd-frame-detail':lambda mobile=False:fields(mobile,True),
 'can-vs-canfd-frame':compare,
 'can-differential-signal':signals,
 'differential-noise-immunity':lambda mobile=False:signals(mobile,True),
 'can-termination-reflection-check':reflection,
 'single-ended-vs-differential':single_compare,
}
