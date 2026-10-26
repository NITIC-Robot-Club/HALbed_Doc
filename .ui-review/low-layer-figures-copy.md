# Low_Layer図版の文言点検

対象：16原稿に含まれる全367テキスト要素。重複も配置ごとに数える。

111種類の文字列を全文確認。軸は量と単位、系列は線種と式、回路は部品名・状態・電流方向の対応を確認した。短い部品記号・目盛の値は、対応する回路・軸の中で読む。

| # | 場所 | 現在の文 | 該当軸 | 直した文 | 状態 |
|---|---|---|---|---|---|
| 1 | pull-up-vs-pull-down (24,24) | プルアップ | なし |  | 済 |
| 2 | pull-up-vs-pull-down (24,61) | 開放時はHigh | なし |  | 済 |
| 3 | pull-up-vs-pull-down (109,100) | VCC | なし |  | 済 |
| 4 | pull-up-vs-pull-down (164,164) | R | なし |  | 済 |
| 5 | pull-up-vs-pull-down (172,272) | SW OFF | なし |  | 済 |
| 6 | pull-up-vs-pull-down (301,212) | GPIO入力 | なし |  | 済 |
| 7 | pull-up-vs-pull-down (24,382) | SW OFF : High    SW ON : Low | なし |  | 済 |
| 8 | pull-up-vs-pull-down (448,24) | プルダウン | なし |  | 済 |
| 9 | pull-up-vs-pull-down (448,61) | 開放時はLow | なし |  | 済 |
| 10 | pull-up-vs-pull-down (533,100) | VCC | なし |  | 済 |
| 11 | pull-up-vs-pull-down (596,164) | SW OFF | なし |  | 済 |
| 12 | pull-up-vs-pull-down (588,271) | R | なし |  | 済 |
| 13 | pull-up-vs-pull-down (725,212) | GPIO入力 | なし |  | 済 |
| 14 | pull-up-vs-pull-down (448,382) | SW OFF : Low     SW ON : High | なし |  | 済 |
| 15 | wrong-pull-circuits (24,24) | 入力が浮く | なし |  | 済 |
| 16 | wrong-pull-circuits (24,62) | SW OFF | なし |  | 済 |
| 17 | wrong-pull-circuits (98,100) | VCC | なし |  | 済 |
| 18 | wrong-pull-circuits (302,212) | GPIO入力 | なし |  | 済 |
| 19 | wrong-pull-circuits (24,306) | VCCにもGNDにもつながらない | なし |  | 済 |
| 20 | wrong-pull-circuits (24,343) | 入力はHigh / Lowが不定 | なし |  | 済 |
| 21 | wrong-pull-circuits (24,396) | 対策：入力点からGNDへ抵抗を追加 | なし |  | 済 |
| 22 | wrong-pull-circuits (448,24) | 電源が短絡する | なし |  | 済 |
| 23 | wrong-pull-circuits (448,62) | SW ON | なし |  | 済 |
| 24 | wrong-pull-circuits (522,100) | VCC | なし |  | 済 |
| 25 | wrong-pull-circuits (726,212) | GPIO入力 | なし |  | 済 |
| 26 | wrong-pull-circuits (448,386) | VCC → SW → GNDに大電流 | なし |  | 済 |
| 27 | wrong-pull-circuits (448,419) | 電源・配線・接点の抵抗だけで制限 | なし |  | 済 |
| 28 | wrong-pull-circuits (236,473) | 抵抗で電流を制限する | なし |  | 済 |
| 29 | wrong-pull-circuits (236,511) | SW ON | なし |  | 済 |
| 30 | wrong-pull-circuits (310,549) | VCC | なし |  | 済 |
| 31 | wrong-pull-circuits (370,609) | 10 kΩ | なし |  | 済 |
| 32 | wrong-pull-circuits (514,661) | GPIO入力 | なし |  | 済 |
| 33 | wrong-pull-circuits (236,835) | 3.3 V / 10 kΩ = 0.33 mA | なし |  | 済 |
| 34 | wrong-pull-circuits (236,868) | SW OFF : High    SW ON : Low | なし |  | 済 |
| 35 | buck-converter-operation (24,24) | スイッチON | なし |  | 済 |
| 36 | buck-converter-operation (24,62) | 入力から負荷へ電力を送る | なし |  | 済 |
| 37 | buck-converter-operation (24,116) | VIN | なし |  | 済 |
| 38 | buck-converter-operation (100,96) | SW | なし |  | 済 |
| 39 | buck-converter-operation (229,96) | L | なし |  | 済 |
| 40 | buck-converter-operation (327,108) | VOUT | なし |  | 済 |
| 41 | buck-converter-operation (277,254) | C | なし |  | 済 |
| 42 | buck-converter-operation (331,232) | 負荷 | なし |  | 済 |
| 43 | buck-converter-operation (37,211) | + | なし |  | 済 |
| 44 | buck-converter-operation (38,234) | − | なし |  | 済 |
| 45 | buck-converter-operation (200,224) | D | なし |  | 済 |
| 46 | buck-converter-operation (24,375) | Lの電流が増加。Dは逆バイアス | なし |  | 済 |
| 47 | buck-converter-operation (448,24) | スイッチOFF | なし |  | 済 |
| 48 | buck-converter-operation (448,62) | Lの電流がダイオードを通って続く | なし |  | 済 |
| 49 | buck-converter-operation (448,116) | VIN | なし |  | 済 |
| 50 | buck-converter-operation (524,96) | SW | なし |  | 済 |
| 51 | buck-converter-operation (653,96) | L | なし |  | 済 |
| 52 | buck-converter-operation (751,108) | VOUT | なし |  | 済 |
| 53 | buck-converter-operation (701,254) | C | なし |  | 済 |
| 54 | buck-converter-operation (755,232) | 負荷 | なし |  | 済 |
| 55 | buck-converter-operation (461,211) | + | なし |  | 済 |
| 56 | buck-converter-operation (462,234) | − | なし |  | 済 |
| 57 | buck-converter-operation (624,224) | D | なし |  | 済 |
| 58 | buck-converter-operation (448,375) | Dが導通し、GND側からLへ還流 | なし |  | 済 |
| 59 | buck-converter-operation (24,466) | 理想部品・定常状態・連続導通モード：VOUT = VIN × D / DはスイッチON時間の割合。矢印は主な負荷電流の向き。 | なし |  | 済 |
| 60 | hal-register-access-flow (24,28) | HAL経由 | なし |  | 済 |
| 61 | hal-register-access-flow (24,68) | HAL_GPIO_WritePin() | なし |  | 済 |
| 62 | hal-register-access-flow (60,126) | アプリ | なし |  | 済 |
| 63 | hal-register-access-flow (254,126) | HAL内部の処理 | なし |  | 済 |
| 64 | hal-register-access-flow (24,190) | 直接操作 | なし |  | 済 |
| 65 | hal-register-access-flow (24,230) | GPIOのレジスタへ書き込む | なし |  | 済 |
| 66 | hal-register-access-flow (60,288) | アプリ | なし |  | 済 |
| 67 | hal-register-access-flow (565,189) | 共通のレジスタ | なし |  | 済 |
| 68 | hal-register-access-flow (565,230) | GPIO出力値を更新 | なし |  | 済 |
| 69 | hal-register-access-flow (566,333) | 周辺回路 → LED点灯 | なし |  | 済 |
| 70 | hal-register-access-flow (24,425) | 違いは、レジスタを更新する処理をHALに任せるかどうか。 | なし |  | 済 |
| 71 | motor-command-profiles (31,291) | 0 | なし |  | 済 |
| 72 | motor-command-profiles (31,178.963) | 50 | なし |  | 済 |
| 73 | motor-command-profiles (31,66.9259) | 100 | なし |  | 済 |
| 74 | motor-command-profiles (116.5,312) | 0 | なし |  | 済 |
| 75 | motor-command-profiles (369,312) | 0.5 | なし |  | 済 |
| 76 | motor-command-profiles (621.5,312) | 1 | なし |  | 済 |
| 77 | motor-command-profiles (78,27) | 正規化した指令値 [%] | なし |  | 済 |
| 78 | motor-command-profiles (524,346) | 時間 t / T | なし |  | 済 |
| 79 | motor-command-profiles (72,399) | ステップ：目標値へ一度に変更 | なし |  | 済 |
| 80 | motor-command-profiles (72,437) | 直線ランプ：変化率を一定にする | なし |  | 済 |
| 81 | motor-command-profiles (72,475) | S字ランプ：開始・終了の傾きが0 | なし |  | 済 |
| 82 | s-curve-functions (31,291) | 0 | なし |  | 済 |
| 83 | s-curve-functions (31,170) | 0.5 | なし |  | 済 |
| 84 | s-curve-functions (31,49) | 1 | なし |  | 済 |
| 85 | s-curve-functions (66,312) | 0 | なし |  | 済 |
| 86 | s-curve-functions (369,312) | 0.5 | なし |  | 済 |
| 87 | s-curve-functions (672,312) | 1 | なし |  | 済 |
| 88 | s-curve-functions (78,27) | 出力比 f(u) | なし |  | 済 |
| 89 | s-curve-functions (524,346) | 進行度 u = t / T | なし |  | 済 |
| 90 | s-curve-functions (70,395) | ロジスティック関数 (kT = 10) | なし |  | 済 |
| 91 | s-curve-functions (70,429) | 1 / (1 + exp(−10(u − 0.5))) | なし |  | 済 |
| 92 | s-curve-functions (70,469) | cos補間：(1 − cos(πu)) / 2 | なし |  | 済 |
| 93 | s-curve-functions (70,509) | Smoothstep：3u² − 2u³ | なし |  | 済 |
| 94 | s-curve-functions (24,558) | ロジスティック関数の端点は約0.0067と0.9933。 | なし |  | 済 |
| 95 | s-curve-functions (24,591) | cos補間とSmoothstepの端点は正確に0と1。 | なし |  | 済 |
| 96 | trapezoid-vs-scurve-motion (24,24) | 台形速度 | なし |  | 済 |
| 97 | trapezoid-vs-scurve-motion (24,62) | 加速1 s・定速1 s・減速1 s | なし |  | 済 |
| 98 | trapezoid-vs-scurve-motion (39,228) | 0 | なし |  | 済 |
| 99 | trapezoid-vs-scurve-motion (39,136.696) | 1 | なし |  | 済 |
| 100 | trapezoid-vs-scurve-motion (88.0909,249) | 0 | なし |  | 済 |
| 101 | trapezoid-vs-scurve-motion (182.03,249) | 1 | なし |  | 済 |
| 102 | trapezoid-vs-scurve-motion (275.97,249) | 2 | なし |  | 済 |
| 103 | trapezoid-vs-scurve-motion (369.909,249) | 3 | なし |  | 済 |
| 104 | trapezoid-vs-scurve-motion (86,101) | 速度 v [相対値] | なし |  | 済 |
| 105 | trapezoid-vs-scurve-motion (236,283) | 時間 t [s] | なし |  | 済 |
| 106 | trapezoid-vs-scurve-motion (39,425.5) | -1.4 | なし |  | 済 |
| 107 | trapezoid-vs-scurve-motion (39,383.5) | 0 | なし |  | 済 |
| 108 | trapezoid-vs-scurve-motion (39,341.5) | 1.4 | なし |  | 済 |
| 109 | trapezoid-vs-scurve-motion (88.0909,457) | 0 | なし |  | 済 |
| 110 | trapezoid-vs-scurve-motion (182.03,457) | 1 | なし |  | 済 |
| 111 | trapezoid-vs-scurve-motion (275.97,457) | 2 | なし |  | 済 |
| 112 | trapezoid-vs-scurve-motion (369.909,457) | 3 | なし |  | 済 |
| 113 | trapezoid-vs-scurve-motion (86,309) | 加速度 a [相対値/s] | なし |  | 済 |
| 114 | trapezoid-vs-scurve-motion (236,491) | 時間 t [s] | なし |  | 済 |
| 115 | trapezoid-vs-scurve-motion (39,591.5) | 0 | なし |  | 済 |
| 116 | trapezoid-vs-scurve-motion (88.0909,665) | 0 | なし |  | 済 |
| 117 | trapezoid-vs-scurve-motion (182.03,665) | 1 | なし |  | 済 |
| 118 | trapezoid-vs-scurve-motion (275.97,665) | 2 | なし |  | 済 |
| 119 | trapezoid-vs-scurve-motion (369.909,665) | 3 | なし |  | 済 |
| 120 | trapezoid-vs-scurve-motion (86,517) | ジャーク j [相対値/s²] | なし |  | 済 |
| 121 | trapezoid-vs-scurve-motion (236,699) | 時間 t [s] | なし |  | 済 |
| 122 | trapezoid-vs-scurve-motion (94,740) | 矢印は理想インパルス（高さは任意） | 余（文字ではなく配置を修正） | 文言は保持し、横軸ラベルと重ならない位置へ移動。 | 済 |
| 123 | trapezoid-vs-scurve-motion (24,772) | 加速度の切替点でジャークは有限値を持たない。 | なし |  | 済 |
| 124 | trapezoid-vs-scurve-motion (24,803) | 矢印の向きは加速度の変化方向を示す。 | なし |  | 済 |
| 125 | trapezoid-vs-scurve-motion (448,24) | S字速度（cos補間） | なし |  | 済 |
| 126 | trapezoid-vs-scurve-motion (448,62) | 加速1 s・定速1 s・減速1 s | なし |  | 済 |
| 127 | trapezoid-vs-scurve-motion (463,228) | 0 | なし |  | 済 |
| 128 | trapezoid-vs-scurve-motion (463,136.696) | 1 | なし |  | 済 |
| 129 | trapezoid-vs-scurve-motion (512.091,249) | 0 | なし |  | 済 |
| 130 | trapezoid-vs-scurve-motion (606.03,249) | 1 | なし |  | 済 |
| 131 | trapezoid-vs-scurve-motion (699.97,249) | 2 | なし |  | 済 |
| 132 | trapezoid-vs-scurve-motion (793.909,249) | 3 | なし |  | 済 |
| 133 | trapezoid-vs-scurve-motion (510,101) | 速度 v [相対値] | なし |  | 済 |
| 134 | trapezoid-vs-scurve-motion (660,283) | 時間 t [s] | なし |  | 済 |
| 135 | trapezoid-vs-scurve-motion (463,425.5) | -1.4 | なし |  | 済 |
| 136 | trapezoid-vs-scurve-motion (463,383.5) | 0 | なし |  | 済 |
| 137 | trapezoid-vs-scurve-motion (463,341.5) | 1.4 | なし |  | 済 |
| 138 | trapezoid-vs-scurve-motion (512.091,457) | 0 | なし |  | 済 |
| 139 | trapezoid-vs-scurve-motion (606.03,457) | 1 | なし |  | 済 |
| 140 | trapezoid-vs-scurve-motion (699.97,457) | 2 | なし |  | 済 |
| 141 | trapezoid-vs-scurve-motion (793.909,457) | 3 | なし |  | 済 |
| 142 | trapezoid-vs-scurve-motion (510,309) | 加速度 a [相対値/s] | なし |  | 済 |
| 143 | trapezoid-vs-scurve-motion (660,491) | 時間 t [s] | なし |  | 済 |
| 144 | trapezoid-vs-scurve-motion (463,633.5) | -4.4 | なし |  | 済 |
| 145 | trapezoid-vs-scurve-motion (463,591.5) | 0 | なし |  | 済 |
| 146 | trapezoid-vs-scurve-motion (463,549.5) | 4.4 | なし |  | 済 |
| 147 | trapezoid-vs-scurve-motion (512.091,665) | 0 | なし |  | 済 |
| 148 | trapezoid-vs-scurve-motion (606.03,665) | 1 | なし |  | 済 |
| 149 | trapezoid-vs-scurve-motion (699.97,665) | 2 | なし |  | 済 |
| 150 | trapezoid-vs-scurve-motion (793.909,665) | 3 | なし |  | 済 |
| 151 | trapezoid-vs-scurve-motion (510,517) | ジャーク j [相対値/s²] | なし |  | 済 |
| 152 | trapezoid-vs-scurve-motion (660,699) | 時間 t [s] | なし |  | 済 |
| 153 | trapezoid-vs-scurve-motion (448,772) | 加速度は連続。ジャークは区間内で有限。 | なし |  | 済 |
| 154 | trapezoid-vs-scurve-motion (448,803) | 区間の境界ではジャークが跳ぶ。 | なし |  | 済 |
| 155 | pull-resistor-selection (24,24) | 抵抗を小さくすると電流が増える | なし |  | 済 |
| 156 | pull-resistor-selection (24,62) | I = VCC / R | なし |  | 済 |
| 157 | pull-resistor-selection (47,303) | 0 | なし |  | 済 |
| 158 | pull-resistor-selection (47,253.857) | 1 | なし |  | 済 |
| 159 | pull-resistor-selection (47,155.571) | 3 | なし |  | 済 |
| 160 | pull-resistor-selection (82,324) | 1 | なし |  | 済 |
| 161 | pull-resistor-selection (230,324) | 10 | なし |  | 済 |
| 162 | pull-resistor-selection (378,324) | 100 | なし |  | 済 |
| 163 | pull-resistor-selection (94,109) | 駆動時の電流 I [mA] | なし |  | 済 |
| 164 | pull-resistor-selection (230,358) | 抵抗 R [kΩ・対数軸] | なし |  | 済 |
| 165 | pull-resistor-selection (24,394) | 条件：VCC = 3.3 V | なし |  | 済 |
| 166 | pull-resistor-selection (448,24) | 抵抗を大きくすると応答が遅くなる | なし |  | 済 |
| 167 | pull-resistor-selection (448,62) | τ = R × C | なし |  | 済 |
| 168 | pull-resistor-selection (471,303) | 0 | なし |  | 済 |
| 169 | pull-resistor-selection (471,217) | 5 | なし |  | 済 |
| 170 | pull-resistor-selection (471,131) | 10 | なし |  | 済 |
| 171 | pull-resistor-selection (506,324) | 1 | なし |  | 済 |
| 172 | pull-resistor-selection (654,324) | 10 | なし |  | 済 |
| 173 | pull-resistor-selection (802,324) | 100 | なし |  | 済 |
| 174 | pull-resistor-selection (518,109) | 時定数 τ [µs] | なし |  | 済 |
| 175 | pull-resistor-selection (654,358) | 抵抗 R [kΩ・対数軸] | なし |  | 済 |
| 176 | pull-resistor-selection (448,394) | 条件：配線・入力容量 C = 100 pF | なし |  | 済 |
| 177 | pull-resistor-selection (24,455) | 抵抗値は上下の条件から決める | なし |  | 済 |
| 178 | pull-resistor-selection (24,501) | 下限：R ≥ VCC / Iallow | なし |  | 済 |
| 179 | pull-resistor-selection (24,538) | 上限：Rup ≤ (VCC − VIH,min) / Ileak,max | 内・誤（本文補足で解消） | 図直下：Rup/Rdownはプルアップ/プルダウン抵抗。VIH,min/VIL,maxはHigh/Lowの保証しきい値。 | 済 |
| 180 | pull-resistor-selection (24,575) | 上限：Rdown ≤ VIL,max / Ileak,max | 内・誤（本文補足で解消） | 図直下：Rup/Rdownはプルアップ/プルダウン抵抗。VIH,min/VIL,maxはHigh/Lowの保証しきい値。 | 済 |
| 181 | pull-resistor-selection (460,502) | Iallow：駆動側の許容電流 | なし |  | 済 |
| 182 | pull-resistor-selection (460,538) | Ileak,max：合計漏れ電流の最大値 | なし |  | 済 |
| 183 | pull-resistor-selection (24,615) | τは時定数。10–90%立上り時間は約2.2τ。数値は設計条件の例。 | なし |  | 済 |
| 184 | pull-up-vs-pull-down-mobile (24,24) | プルアップ | なし |  | 済 |
| 185 | pull-up-vs-pull-down-mobile (24,61) | 開放時はHigh | なし |  | 済 |
| 186 | pull-up-vs-pull-down-mobile (109,100) | VCC | なし |  | 済 |
| 187 | pull-up-vs-pull-down-mobile (164,164) | R | なし |  | 済 |
| 188 | pull-up-vs-pull-down-mobile (172,272) | SW OFF | なし |  | 済 |
| 189 | pull-up-vs-pull-down-mobile (301,212) | GPIO入力 | なし |  | 済 |
| 190 | pull-up-vs-pull-down-mobile (24,382) | SW OFF : High    SW ON : Low | なし |  | 済 |
| 191 | pull-up-vs-pull-down-mobile (24,458) | プルダウン | なし |  | 済 |
| 192 | pull-up-vs-pull-down-mobile (24,495) | 開放時はLow | なし |  | 済 |
| 193 | pull-up-vs-pull-down-mobile (109,534) | VCC | なし |  | 済 |
| 194 | pull-up-vs-pull-down-mobile (172,598) | SW OFF | なし |  | 済 |
| 195 | pull-up-vs-pull-down-mobile (164,705) | R | なし |  | 済 |
| 196 | pull-up-vs-pull-down-mobile (301,646) | GPIO入力 | なし |  | 済 |
| 197 | pull-up-vs-pull-down-mobile (24,816) | SW OFF : Low     SW ON : High | なし |  | 済 |
| 198 | wrong-pull-circuits-mobile (24,24) | 入力が浮く | なし |  | 済 |
| 199 | wrong-pull-circuits-mobile (24,62) | SW OFF | なし |  | 済 |
| 200 | wrong-pull-circuits-mobile (98,100) | VCC | なし |  | 済 |
| 201 | wrong-pull-circuits-mobile (302,212) | GPIO入力 | なし |  | 済 |
| 202 | wrong-pull-circuits-mobile (24,306) | VCCにもGNDにもつながらない | なし |  | 済 |
| 203 | wrong-pull-circuits-mobile (24,343) | 入力はHigh / Lowが不定 | なし |  | 済 |
| 204 | wrong-pull-circuits-mobile (24,396) | 対策：入力点からGNDへ抵抗を追加 | なし |  | 済 |
| 205 | wrong-pull-circuits-mobile (24,473) | 電源が短絡する | なし |  | 済 |
| 206 | wrong-pull-circuits-mobile (24,511) | SW ON | なし |  | 済 |
| 207 | wrong-pull-circuits-mobile (98,549) | VCC | なし |  | 済 |
| 208 | wrong-pull-circuits-mobile (302,661) | GPIO入力 | なし |  | 済 |
| 209 | wrong-pull-circuits-mobile (24,835) | VCC → SW → GNDに大電流 | なし |  | 済 |
| 210 | wrong-pull-circuits-mobile (24,868) | 電源・配線・接点の抵抗だけで制限 | なし |  | 済 |
| 211 | wrong-pull-circuits-mobile (24,922) | 抵抗で電流を制限する | なし |  | 済 |
| 212 | wrong-pull-circuits-mobile (24,960) | SW ON | なし |  | 済 |
| 213 | wrong-pull-circuits-mobile (98,998) | VCC | なし |  | 済 |
| 214 | wrong-pull-circuits-mobile (158,1058) | 10 kΩ | なし |  | 済 |
| 215 | wrong-pull-circuits-mobile (302,1110) | GPIO入力 | なし |  | 済 |
| 216 | wrong-pull-circuits-mobile (24,1284) | 3.3 V / 10 kΩ = 0.33 mA | なし |  | 済 |
| 217 | wrong-pull-circuits-mobile (24,1317) | SW OFF : High    SW ON : Low | なし |  | 済 |
| 218 | buck-converter-operation-mobile (24,24) | スイッチON | なし |  | 済 |
| 219 | buck-converter-operation-mobile (24,62) | 入力から負荷へ電力を送る | なし |  | 済 |
| 220 | buck-converter-operation-mobile (24,116) | VIN | なし |  | 済 |
| 221 | buck-converter-operation-mobile (100,96) | SW | なし |  | 済 |
| 222 | buck-converter-operation-mobile (229,96) | L | なし |  | 済 |
| 223 | buck-converter-operation-mobile (327,108) | VOUT | なし |  | 済 |
| 224 | buck-converter-operation-mobile (277,254) | C | なし |  | 済 |
| 225 | buck-converter-operation-mobile (331,232) | 負荷 | なし |  | 済 |
| 226 | buck-converter-operation-mobile (37,211) | + | なし |  | 済 |
| 227 | buck-converter-operation-mobile (38,234) | − | なし |  | 済 |
| 228 | buck-converter-operation-mobile (200,224) | D | なし |  | 済 |
| 229 | buck-converter-operation-mobile (24,375) | Lの電流が増加。Dは逆バイアス | なし |  | 済 |
| 230 | buck-converter-operation-mobile (24,458) | スイッチOFF | なし |  | 済 |
| 231 | buck-converter-operation-mobile (24,496) | Lの電流がダイオードを通って続く | なし |  | 済 |
| 232 | buck-converter-operation-mobile (24,550) | VIN | なし |  | 済 |
| 233 | buck-converter-operation-mobile (100,530) | SW | なし |  | 済 |
| 234 | buck-converter-operation-mobile (229,530) | L | なし |  | 済 |
| 235 | buck-converter-operation-mobile (327,542) | VOUT | なし |  | 済 |
| 236 | buck-converter-operation-mobile (277,688) | C | なし |  | 済 |
| 237 | buck-converter-operation-mobile (331,666) | 負荷 | なし |  | 済 |
| 238 | buck-converter-operation-mobile (37,645) | + | なし |  | 済 |
| 239 | buck-converter-operation-mobile (38,668) | − | なし |  | 済 |
| 240 | buck-converter-operation-mobile (200,658) | D | なし |  | 済 |
| 241 | buck-converter-operation-mobile (24,809) | Dが導通し、GND側からLへ還流 | なし |  | 済 |
| 242 | buck-converter-operation-mobile (24,900) | 理想部品・定常状態・連続導通モード / VOUT = VIN × D / D：スイッチON時間の割合 / 矢印：主な負荷電流の向き | なし |  | 済 |
| 243 | hal-register-access-flow-mobile (24,20) | HAL経由 | なし |  | 済 |
| 244 | hal-register-access-flow-mobile (38,80) | アプリ | なし |  | 済 |
| 245 | hal-register-access-flow-mobile (38,185) | HAL内部 | なし |  | 済 |
| 246 | hal-register-access-flow-mobile (38,222) | 引数確認・分岐 | なし |  | 済 |
| 247 | hal-register-access-flow-mobile (247,20) | 直接操作 | なし |  | 済 |
| 248 | hal-register-access-flow-mobile (263,80) | アプリ | なし |  | 済 |
| 249 | hal-register-access-flow-mobile (80,373) | レジスタ | なし |  | 済 |
| 250 | hal-register-access-flow-mobile (80,410) | GPIOの出力値を更新 | なし |  | 済 |
| 251 | hal-register-access-flow-mobile (80,486) | 周辺回路 | なし |  | 済 |
| 252 | hal-register-access-flow-mobile (80,523) | GPIO回路が出力を駆動 | なし |  | 済 |
| 253 | hal-register-access-flow-mobile (182,599) | LED点灯 | なし |  | 済 |
| 254 | hal-register-access-flow-mobile (24,647) | どちらも最後は同じレジスタを更新する | なし |  | 済 |
| 255 | motor-command-profiles-mobile (31,291) | 0 | なし |  | 済 |
| 256 | motor-command-profiles-mobile (31,178.963) | 50 | なし |  | 済 |
| 257 | motor-command-profiles-mobile (31,66.9259) | 100 | なし |  | 済 |
| 258 | motor-command-profiles-mobile (93.8333,312) | 0 | なし |  | 済 |
| 259 | motor-command-profiles-mobile (233,312) | 0.5 | なし |  | 済 |
| 260 | motor-command-profiles-mobile (372.167,312) | 1 | なし |  | 済 |
| 261 | motor-command-profiles-mobile (78,27) | 正規化した指令値 [%] | なし |  | 済 |
| 262 | motor-command-profiles-mobile (252,346) | 時間 t / T | なし |  | 済 |
| 263 | motor-command-profiles-mobile (72,399) | ステップ：目標値へ一度に変更 | なし |  | 済 |
| 264 | motor-command-profiles-mobile (72,437) | 直線ランプ：変化率を一定にする | なし |  | 済 |
| 265 | motor-command-profiles-mobile (72,475) | S字ランプ：開始・終了の傾きが0 | なし |  | 済 |
| 266 | s-curve-functions-mobile (31,291) | 0 | なし |  | 済 |
| 267 | s-curve-functions-mobile (31,170) | 0.5 | なし |  | 済 |
| 268 | s-curve-functions-mobile (31,49) | 1 | なし |  | 済 |
| 269 | s-curve-functions-mobile (66,312) | 0 | なし |  | 済 |
| 270 | s-curve-functions-mobile (233,312) | 0.5 | なし |  | 済 |
| 271 | s-curve-functions-mobile (400,312) | 1 | なし |  | 済 |
| 272 | s-curve-functions-mobile (78,27) | 出力比 f(u) | なし |  | 済 |
| 273 | s-curve-functions-mobile (252,346) | 進行度 u = t / T | なし |  | 済 |
| 274 | s-curve-functions-mobile (70,395) | ロジスティック関数 (kT = 10) | なし |  | 済 |
| 275 | s-curve-functions-mobile (70,429) | 1 / (1 + exp(−10(u − 0.5))) | なし |  | 済 |
| 276 | s-curve-functions-mobile (70,469) | cos補間：(1 − cos(πu)) / 2 | なし |  | 済 |
| 277 | s-curve-functions-mobile (70,509) | Smoothstep：3u² − 2u³ | なし |  | 済 |
| 278 | s-curve-functions-mobile (24,558) | ロジスティック関数の端点は約0.0067と0.9933。 | なし |  | 済 |
| 279 | s-curve-functions-mobile (24,591) | cos補間とSmoothstepの端点は正確に0と1。 | なし |  | 済 |
| 280 | trapezoid-vs-scurve-motion-mobile (24,24) | 台形速度 | なし |  | 済 |
| 281 | trapezoid-vs-scurve-motion-mobile (24,62) | 加速1 s・定速1 s・減速1 s | なし |  | 済 |
| 282 | trapezoid-vs-scurve-motion-mobile (39,228) | 0 | なし |  | 済 |
| 283 | trapezoid-vs-scurve-motion-mobile (39,136.696) | 1 | なし |  | 済 |
| 284 | trapezoid-vs-scurve-motion-mobile (88.0909,249) | 0 | なし |  | 済 |
| 285 | trapezoid-vs-scurve-motion-mobile (182.03,249) | 1 | なし |  | 済 |
| 286 | trapezoid-vs-scurve-motion-mobile (275.97,249) | 2 | なし |  | 済 |
| 287 | trapezoid-vs-scurve-motion-mobile (369.909,249) | 3 | なし |  | 済 |
| 288 | trapezoid-vs-scurve-motion-mobile (86,101) | 速度 v [相対値] | なし |  | 済 |
| 289 | trapezoid-vs-scurve-motion-mobile (236,283) | 時間 t [s] | なし |  | 済 |
| 290 | trapezoid-vs-scurve-motion-mobile (39,425.5) | -1.4 | なし |  | 済 |
| 291 | trapezoid-vs-scurve-motion-mobile (39,383.5) | 0 | なし |  | 済 |
| 292 | trapezoid-vs-scurve-motion-mobile (39,341.5) | 1.4 | なし |  | 済 |
| 293 | trapezoid-vs-scurve-motion-mobile (88.0909,457) | 0 | なし |  | 済 |
| 294 | trapezoid-vs-scurve-motion-mobile (182.03,457) | 1 | なし |  | 済 |
| 295 | trapezoid-vs-scurve-motion-mobile (275.97,457) | 2 | なし |  | 済 |
| 296 | trapezoid-vs-scurve-motion-mobile (369.909,457) | 3 | なし |  | 済 |
| 297 | trapezoid-vs-scurve-motion-mobile (86,309) | 加速度 a [相対値/s] | なし |  | 済 |
| 298 | trapezoid-vs-scurve-motion-mobile (236,491) | 時間 t [s] | なし |  | 済 |
| 299 | trapezoid-vs-scurve-motion-mobile (39,591.5) | 0 | なし |  | 済 |
| 300 | trapezoid-vs-scurve-motion-mobile (88.0909,665) | 0 | なし |  | 済 |
| 301 | trapezoid-vs-scurve-motion-mobile (182.03,665) | 1 | なし |  | 済 |
| 302 | trapezoid-vs-scurve-motion-mobile (275.97,665) | 2 | なし |  | 済 |
| 303 | trapezoid-vs-scurve-motion-mobile (369.909,665) | 3 | なし |  | 済 |
| 304 | trapezoid-vs-scurve-motion-mobile (86,517) | ジャーク j [相対値/s²] | なし |  | 済 |
| 305 | trapezoid-vs-scurve-motion-mobile (236,699) | 時間 t [s] | なし |  | 済 |
| 306 | trapezoid-vs-scurve-motion-mobile (94,740) | 矢印は理想インパルス（高さは任意） | 余（文字ではなく配置を修正） | 文言は保持し、横軸ラベルと重ならない位置へ移動。 | 済 |
| 307 | trapezoid-vs-scurve-motion-mobile (24,772) | 加速度の切替点でジャークは有限値を持たない。 | なし |  | 済 |
| 308 | trapezoid-vs-scurve-motion-mobile (24,803) | 矢印の向きは加速度の変化方向を示す。 | なし |  | 済 |
| 309 | trapezoid-vs-scurve-motion-mobile (24,853) | S字速度（cos補間） | なし |  | 済 |
| 310 | trapezoid-vs-scurve-motion-mobile (24,891) | 加速1 s・定速1 s・減速1 s | なし |  | 済 |
| 311 | trapezoid-vs-scurve-motion-mobile (39,1057) | 0 | なし |  | 済 |
| 312 | trapezoid-vs-scurve-motion-mobile (39,965.696) | 1 | なし |  | 済 |
| 313 | trapezoid-vs-scurve-motion-mobile (88.0909,1078) | 0 | なし |  | 済 |
| 314 | trapezoid-vs-scurve-motion-mobile (182.03,1078) | 1 | なし |  | 済 |
| 315 | trapezoid-vs-scurve-motion-mobile (275.97,1078) | 2 | なし |  | 済 |
| 316 | trapezoid-vs-scurve-motion-mobile (369.909,1078) | 3 | なし |  | 済 |
| 317 | trapezoid-vs-scurve-motion-mobile (86,930) | 速度 v [相対値] | なし |  | 済 |
| 318 | trapezoid-vs-scurve-motion-mobile (236,1112) | 時間 t [s] | なし |  | 済 |
| 319 | trapezoid-vs-scurve-motion-mobile (39,1254.5) | -1.4 | なし |  | 済 |
| 320 | trapezoid-vs-scurve-motion-mobile (39,1212.5) | 0 | なし |  | 済 |
| 321 | trapezoid-vs-scurve-motion-mobile (39,1170.5) | 1.4 | なし |  | 済 |
| 322 | trapezoid-vs-scurve-motion-mobile (88.0909,1286) | 0 | なし |  | 済 |
| 323 | trapezoid-vs-scurve-motion-mobile (182.03,1286) | 1 | なし |  | 済 |
| 324 | trapezoid-vs-scurve-motion-mobile (275.97,1286) | 2 | なし |  | 済 |
| 325 | trapezoid-vs-scurve-motion-mobile (369.909,1286) | 3 | なし |  | 済 |
| 326 | trapezoid-vs-scurve-motion-mobile (86,1138) | 加速度 a [相対値/s] | なし |  | 済 |
| 327 | trapezoid-vs-scurve-motion-mobile (236,1320) | 時間 t [s] | なし |  | 済 |
| 328 | trapezoid-vs-scurve-motion-mobile (39,1462.5) | -4.4 | なし |  | 済 |
| 329 | trapezoid-vs-scurve-motion-mobile (39,1420.5) | 0 | なし |  | 済 |
| 330 | trapezoid-vs-scurve-motion-mobile (39,1378.5) | 4.4 | なし |  | 済 |
| 331 | trapezoid-vs-scurve-motion-mobile (88.0909,1494) | 0 | なし |  | 済 |
| 332 | trapezoid-vs-scurve-motion-mobile (182.03,1494) | 1 | なし |  | 済 |
| 333 | trapezoid-vs-scurve-motion-mobile (275.97,1494) | 2 | なし |  | 済 |
| 334 | trapezoid-vs-scurve-motion-mobile (369.909,1494) | 3 | なし |  | 済 |
| 335 | trapezoid-vs-scurve-motion-mobile (86,1346) | ジャーク j [相対値/s²] | なし |  | 済 |
| 336 | trapezoid-vs-scurve-motion-mobile (236,1528) | 時間 t [s] | なし |  | 済 |
| 337 | trapezoid-vs-scurve-motion-mobile (24,1601) | 加速度は連続。ジャークは区間内で有限。 | なし |  | 済 |
| 338 | trapezoid-vs-scurve-motion-mobile (24,1632) | 区間の境界ではジャークが跳ぶ。 | なし |  | 済 |
| 339 | pull-resistor-selection-mobile (24,24) | 抵抗を小さくすると電流が増える | なし |  | 済 |
| 340 | pull-resistor-selection-mobile (24,62) | I = VCC / R | なし |  | 済 |
| 341 | pull-resistor-selection-mobile (47,303) | 0 | なし |  | 済 |
| 342 | pull-resistor-selection-mobile (47,253.857) | 1 | なし |  | 済 |
| 343 | pull-resistor-selection-mobile (47,155.571) | 3 | なし |  | 済 |
| 344 | pull-resistor-selection-mobile (82,324) | 1 | なし |  | 済 |
| 345 | pull-resistor-selection-mobile (230,324) | 10 | なし |  | 済 |
| 346 | pull-resistor-selection-mobile (378,324) | 100 | なし |  | 済 |
| 347 | pull-resistor-selection-mobile (94,109) | 駆動時の電流 I [mA] | なし |  | 済 |
| 348 | pull-resistor-selection-mobile (230,358) | 抵抗 R [kΩ・対数軸] | なし |  | 済 |
| 349 | pull-resistor-selection-mobile (24,394) | 条件：VCC = 3.3 V | なし |  | 済 |
| 350 | pull-resistor-selection-mobile (24,453) | 抵抗を大きくすると応答が遅くなる | なし |  | 済 |
| 351 | pull-resistor-selection-mobile (24,491) | τ = R × C | なし |  | 済 |
| 352 | pull-resistor-selection-mobile (47,732) | 0 | なし |  | 済 |
| 353 | pull-resistor-selection-mobile (47,646) | 5 | なし |  | 済 |
| 354 | pull-resistor-selection-mobile (47,560) | 10 | なし |  | 済 |
| 355 | pull-resistor-selection-mobile (82,753) | 1 | なし |  | 済 |
| 356 | pull-resistor-selection-mobile (230,753) | 10 | なし |  | 済 |
| 357 | pull-resistor-selection-mobile (378,753) | 100 | なし |  | 済 |
| 358 | pull-resistor-selection-mobile (94,538) | 時定数 τ [µs] | なし |  | 済 |
| 359 | pull-resistor-selection-mobile (230,787) | 抵抗 R [kΩ・対数軸] | なし |  | 済 |
| 360 | pull-resistor-selection-mobile (24,823) | 条件：配線・入力容量 C = 100 pF | なし |  | 済 |
| 361 | pull-resistor-selection-mobile (24,884) | 抵抗値は上下の条件から決める | なし |  | 済 |
| 362 | pull-resistor-selection-mobile (24,930) | 下限：R ≥ VCC / Iallow | なし |  | 済 |
| 363 | pull-resistor-selection-mobile (24,967) | 上限：Rup ≤ (VCC − VIH,min) / Ileak,max | 内・誤（本文補足で解消） | 図直下：Rup/Rdownはプルアップ/プルダウン抵抗。VIH,min/VIL,maxはHigh/Lowの保証しきい値。 | 済 |
| 364 | pull-resistor-selection-mobile (24,1004) | 上限：Rdown ≤ VIL,max / Ileak,max | 内・誤（本文補足で解消） | 図直下：Rup/Rdownはプルアップ/プルダウン抵抗。VIH,min/VIL,maxはHigh/Lowの保証しきい値。 | 済 |
| 365 | pull-resistor-selection-mobile (24,1049) | Iallow：駆動側の許容電流 | なし |  | 済 |
| 366 | pull-resistor-selection-mobile (24,1080) | Ileak,max：合計漏れ電流の最大値 | なし |  | 済 |
| 367 | pull-resistor-selection-mobile (24,1111) | τは時定数。10–90%立上り時間は約2.2τ。 | なし |  | 済 |

全367件／判定済367件。表示の関係は表示点検シートの16状態と突合。図内の略記は対象記事の補足と一緒に読む前提。
