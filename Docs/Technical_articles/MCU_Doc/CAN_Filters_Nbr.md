---
tags:
  - 開発資料
  - MCU
  - CAN
  - CAN FD
  - 用語解説
thumbnail:
  targets:
    - article-home
    - mcu-home
  description: 'CubeMXで設定するときに出てくる"Filters Nbr" その意味と設定について解説'
  order: 30
---

# CAN / CAN FDのFilters Nbrとは

## Filters Nbrの意味

`Filters Nbr`は、FDCANのメッセージRAMに確保するIDフィルター要素の数です。標準ID用（`Std Filters Nbr`）と拡張ID用（`Ext Filters Nbr`）を別々に設定します。

フィルター1個がID 1個だけに対応するとは限りません。マスクや範囲指定を使えば、1個のフィルターで複数のIDを受け付けることもできます。

## 標準IDと拡張ID

CAN ID には主に2種類あります。

| 種類   |   ID長 | 関係する設定            |
| ---- | ----: | ----------------- |
| 標準ID | 11bit | `Std Filters Nbr` |
| 拡張ID | 29bit | `Ext Filters Nbr` |

---

## 設定例

標準IDのフィルターだけを1個使う場合は、次のように設定します。

```c
hfdcan1.Init.StdFiltersNbr = 1;
hfdcan1.Init.ExtFiltersNbr = 0;
```

この設定では、標準ID用のフィルター要素を1個、拡張ID用の領域を0個確保します。実際に受信するIDやマスクは、別途`HAL_FDCAN_ConfigFilter()`などで設定します。

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

## 使わないID形式は0にする

`Std Filters Nbr = 0` にすると、
標準IDを受信しないなら、`Std Filters Nbr = 0`にできます。この状態で標準ID用のフィルターを設定しようとしても、格納先の領域がないため設定できません。

---

## まとめ

`Std Filters Nbr` は、

**標準IDのCANメッセージを受信するために、標準IDフィルタを何個使うかを決める設定**

です。

必要なフィルター要素数だけを確保します。標準IDを使わないなら`Std Filters Nbr = 0`、拡張IDを使わないなら`Ext Filters Nbr = 0`で構いません。
