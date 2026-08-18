# 卡片字段规范 v1

每张卡一个 JSON 对象，中英双语字段成对出现（英文字段 = 中文字段名 + e）。

## 必填
- no — 档案编号（字符串，如 "1129"，全库唯一）
- cat — 分类：自然/天文/人体/物理/历史/语言/城市/食物/数学/艺术
- q / qe — 问题（封套上只印这个；要有反转，不是查表题）
- a / ae — 答案（短，2-8 字）
- short / shorte — 收藏列表用的一句话
- body / bodye — 正文，恰好 3 段：现象 → 机制 → 常见误解或边界
- fig / fige — 图版说明（"图版 Ⅰ　…"）
- src / srcMeta（+ srce / srcMetae）— 铭牌出处：文献名 + 机构/年份
- query — Wikimedia Commons 检索词（英文，具体名词优先学名）

## plate — 详情页图版（按 type 取字段）
- bars 已废止（2026-08-18）：不再使用条形对比图；数值对比改用 curve / stat，或直接 slot 实物图
- type: "curve" — ti/tie；vals[] 数值序列；xa/xb/xmid 轴标；mark/marke 标记点
- type: "stat" — ti/tie；big 大数字；unit/unite 单位；note/notee
- type: "slot" — 纯图版：img（Commons 图 URL）+ imgTitle
- 任何 type 都可带 img/imgTitle 作为展品图

## visual — 揭晓页主视觉
- {type:"relief"} — 版画浮雕（默认）
- {type:"duo", a:{query,l}, b:{query,l}} — A/B 对照两图
- {type:"model"} — 定制 3D 仪器（仅几何本身即答案的卡；由设计师手工建）

## 质检红线（金星标准）
1. 事实可溯源，srcMeta 必须真实存在
2. 问题有反转；纯数量问答整批 ≤1 张
3. 插图必须与内容直接相关（宁缺毋滥）
4. 禁用 bars 线表；curve / stat 必须讲真实数字故事，否则回到实物图
