# turns-out-content · 「原来如此 TURNS OUT」内容库

一天一条冷知识 App 的策展内容仓库。git 即数据库：每张卡的改动走 commit，回滚看历史，审稿开 PR。

## 结构
- content/latest.json — App 读取的当前内容包（永远指向最新）
- content/cards-vN.json — 每次归档的不可变快照（v1 = 36 张；v2 = 45 张，废止 bars 线表，2026-08-18）
- content/schema.md — 卡片字段规范

## App 如何取数
1. 仓库 Settings → Pages → 从 main 分支根目录发布
2. 内容包 URL：https://<你的用户名>.github.io/<仓库名>/content/latest.json
3. App 启动时拉取并缓存；取不到走「闭馆」错误页

## 更新流程
1. 在卡片生产台审新卡 → 让设计师归档出 cards-v(N+1).json
2. 新快照入 content/，并覆盖 latest.json
3. commit 信息写清：新增 N 张 / 删除编号 / 改动原因
