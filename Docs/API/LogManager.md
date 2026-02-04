# LogManager README

## 概要
LogManager クラスは、UARTを使ってログを出力するライブラリ。ログレベルやタグフィルタリングを設定でき、ANSIカラーコードを使ってログを色分けする。

> [!CAUTION]
> LogManager を多用すると、UARTの帯域を圧迫し、リアルタイム性が要求される処理に影響を与える可能性があります。必要最低限のログ出力に留めることを推奨します。

## クラス概要
### LogManager
LogManager クラスは、UARTハンドルを受け取り、ログ出力を管理する。ログレベルやタグフィルタリングを設定することで、必要なログだけを出力可能。

#### コンストラクタ
```cpp
LogManager(UART_HandleTypeDef* uart = nullptr, LogLevel level = LogLevel::INFO);
```
- uart: UARTハンドル。
- level: 初期ログレベル（デフォルトはINFO）。

#### メソッド

##### void setUART(UART_HandleTypeDef* uart);
UARTハンドルを設定する。

##### void setLogLevel(LogLevel level);
ログレベルを設定する。
> [!NOTE]
> LogLevel
> `NONE`: ログ出力なし。
> `ERROR`: エラーログ。
> `WARN`: 警告ログ。
> `INFO`: 情報ログ。
> `DBG`: デバッグログ。
> `VERBOSE`: 詳細ログ。

##### void setTagFilter(const char* tag);
タグフィルタを設定する。指定されたタグだけログを出力する。

##### void log(LogLevel level, const char* tag, const char* fmt, ...);
指定されたログレベル、タグ、フォーマット文字列でログを出力する。
> [!NOTE]
> この中のUART出力部をUSBCDC等に変更することでログの出力先を変えることができる。
> (20225/08/05時点ではUARTのみサポートしている)


## 使用方法
### CubeMXの設定
1. UARTを設定し、適切なボーレートやピンを指定する。

### cppmain
1. UARTハンドルを指定して、LogManager インスタンスを生成する。
   ```cpp
   HALbed::LogManager logger(&huart2, HALbed::LogLevel::DEBUG);
   ```

2. setLogLevel() メソッドでログレベルを設定する。
   ```cpp
   logger.setLogLevel(HALbed::LogLevel::INFO);
   ```

3. log() メソッドでログを出力する。
   ```cpp
   logger.log(HALbed::LogLevel::INFO, "Main", "System initialized.");
   ```


## 注意事項
- UARTの初期化が正しく行われている必要がある。
- タグフィルタを設定した場合、指定されたタグ以外のログは出力されない。

---
## サンプルコード
LogManager のサンプルコード
```cpp
#include "main.h"
#include "../Library/HALbed/Inc/LogManager.hpp"

extern UART_HandleTypeDef huart2;
using namespace HALbed;
LogManager logger(&huart2);

extern "C" void cppmain(void)
{
    logger.setLogLevel(LogLevel::VERBOSE);
    LOGI("cppmain", "Starting C++ main function");
    LOGD("cppmain", "Debugging enabled");
    LOGW("cppmain", "This is a warning message");
    LOGE("cppmain", "This is an error message");
    LOGV("cppmain", "Verbose logging is active");
    logger.setTagFilter("cppmain");
    LOGI("cppmain", "Log level set to VERBOSE");
    LOGI("debug", "This message should not appear due to tag filter");  // このメッセージは表示されない
    while (true) {
        logger.log(LogLevel::DBG, "Loop", "Heartbeat");
        HAL_Delay(1000);
    }
}
```