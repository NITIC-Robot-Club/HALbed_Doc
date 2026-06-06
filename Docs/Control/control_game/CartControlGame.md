<CartControlGame />

::: note `#include <control.hpp>` とは
この include は、学習用ランタイムが用意している疑似ヘッダです。

- `State` 構造体を使えるようにします。
- `state.position` や `state.velocity`、`state.target` などの現在状態を読めます。
- 返り値は `float control(State state)` の `float` で、モーター出力 `u` として使われます。

標準ライブラリを読み込むための include ではなく、「制御に必要な最低限の型だけを渡す入口」だと考えると分かりやすいです。
:::

## C++ サブセットについて

このページの C++ 実行環境は、制御学習用に絞ったインタプリタです。
本物のコンパイラではありませんが、`control(State state)` で制御入力を返す流れは、実機コードの考え方にかなり近い形で練習できます。