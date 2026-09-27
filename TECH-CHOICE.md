# 技術選型草稿

## 遊戲需求

這是一款目標約 10 分鐘的文字密室：玩家在四個房間查看日常物件、收集工具，並分別解數字推理、顏色排序、掃雷格和電線排序。主要難題是遊戲狀態和道具依賴，不是即時動畫或複雜畫面。執行目標是 VS Code Live Server，並希望不必安裝或 build 就能遊玩。

## 方案比較

| 方案 | 優點 | 取捨 | Live Server 配合度 |
| --- | --- | --- | --- |
| 原生 HTML、CSS、JavaScript | 無套件、無建置步驟；瀏覽器直接執行；足夠處理線索、筆記和密碼狀態 | 專案很大時，需自行整理 UI 和狀態 | 最適合；Live Server 直接提供靜態檔案 |
| React + Vite | 元件與互動狀態更適合大型 UI；生態系成熟 | 需要 Node、套件安裝與 Vite 開發伺服器/build；Live Server 本身無法直接編譯 JSX | 可服務 build 後的靜態檔，但多了不必要流程 |
| Phaser | 適合 Canvas、動畫、碰撞與即時遊戲循環 | 本作是文字調查，遊戲引擎會增加概念與程式量，優勢用不上 | 可透過額外設定或套件使用，但非此作所需 |

## 決定

選用 **原生 HTML + CSS + JavaScript ES modules**。JavaScript 不需編譯；四個房間各有 HTML 網址，遊戲狀態、背包、工具依賴和四種謎題規則集中在 `game.mjs`，房間內容和互動在 `app.mjs`。原生 DOM 按鈕、拖放事件和鍵盤事件即可支援顏色片、格子板、電線和數字鎖，不需要額外遊戲引擎。進度放在 `sessionStorage`，只保留在目前瀏覽器分頁。

**VS Code Live Server 是靜態開發伺服器，不是框架，也不是程式語言。**它會把根目錄檔案送到瀏覽器，讓 ES modules 能透過 HTTP 載入。

## 本機執行

1. 在 VS Code 開啟 `MoonFestivalHW` 資料夾。
2. 安裝或啟用 VS Code 的 **Live Server** 擴充功能。
3. 在根目錄 `index.html` 按右鍵，選 **Open with Live Server**。
4. 預設網址通常是 `http://127.0.0.1:5500/`；若該埠已使用，Live Server 會選其他埠。

本次已用本機靜態 HTTP 伺服器在瀏覽器驗證，網址為 `http://localhost:8000/`；Live Server 擴充功能本身未在此環境單獨驗證。遊戲不依賴特定伺服器埠。

## 驗證

遊戲規則的 Node 測試檔是 `game.test.mjs`，可在安裝 Node.js 的環境執行 `node --test game.test.mjs`。目前工作環境沒有 Node.js，因此需以瀏覽器實測代替單元測試執行；驗證時應涵蓋四種機關、錯誤順序、提示面板、拖放及點選回退。