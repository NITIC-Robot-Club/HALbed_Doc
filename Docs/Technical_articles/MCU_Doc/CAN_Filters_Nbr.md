---
tags:
  - 開発資料
  - MCU
  - CAN
  - CANFD
  - 用語解説
thumbnail:
  targets:
    - article-home
    - mcu-home
  description: 'CubeMXで設定するときに出てくる"Filters Nbr" その意味と設定について解説'
  order: 30
---

# CAN/CANFD Filters Nbr 

## 概要

`Filters Nbr` は、
**CAN / FDCAN で使用するIDフィルタの個数** を設定する項目です。
標準IDと拡張IDでそれぞれ設定することができます。
---

## CAN ID の種類

CAN ID には主に2種類あります。

| 種類   |   ID長 | 関係する設定            |
| ---- | ----: | ----------------- |
| 標準ID | 11bit | `Std Filters Nbr` |
| 拡張ID | 29bit | `Ext Filters Nbr` |

---

## 設定例

標準IDのCAN通信を使う場合は、例えば次のように設定します。

```c
hfdcan1.Init.StdFiltersNbr = 1;
hfdcan1.Init.ExtFiltersNbr = 0;
```

この場合、

* 標準ID用のフィルタを1個使う
* 拡張ID用のフィルタは使わない

という意味になります。

---

## 標準IDの例

標準IDは、次のような短いCAN IDです。

```text
0x123
0x200
0x7FF
```

これらは 11bit のIDなので、`Std Filters Nbr` に関係します。

---

## 拡張IDの例

拡張IDは、次のような長いCAN IDです。

```text
0x18FF50E5
0x1ABCDEFF
```

これらは 29bit のIDなので、`Ext Filters Nbr` に関係します。

---

## 注意点

`Std Filters Nbr = 0` にすると、
**標準ID用のフィルタを用意しない** という意味になります。

その状態で標準IDのフィルタを設定しようとすると、受信できなかったり、設定がうまくいかなかったりします。

---

## まとめ

`Std Filters Nbr` は、

**標準IDのCANメッセージを受信するために、標準IDフィルタを何個使うかを決める設定**

です。

基本的に `1` 以上に設定します。

`Ext Filters Nbr` は、
**拡張IDのCANメッセージを受信するために、拡張IDフィルタを何個使うかを決める設定**
です。
拡張IDを使う場合は、基本的に `1` 以上に設定します。
