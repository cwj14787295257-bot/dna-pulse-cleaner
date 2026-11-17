# DNA Pulse Cleaner (DNA 芯片脉冲积碳清洁工具)

> **Zero-Driver 15W H₂O₂ Pulse Micro-Cavitation De-Carbonizing Web App for Evolv DNA Chipsets**  
> **专为 Evolv DNA 全系芯片打造的 15W 医用级双氧水脉冲微爆积碳清洁独立网页端工具**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Web Serial](https://img.shields.io/badge/Platform-Web%20Serial%20API-success.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)
[![UI: Apple Bento Grid](https://img.shields.io/badge/Design-Apple%20Minimalism-black.svg)](#)
[![Zero Build](https://img.shields.io/badge/Zero--Build-Pure%20Static%20HTML5-orange.svg)](#)

---

## 简体中文 (Chinese)

### 1. 项目简介

**DNA Pulse Cleaner** 是一个免安装、零构建、纯静态的现代化专业 Web 应用程序。它通过浏览器原生的 **Web Serial API**，以标准 `115200 8-N-1` 串口直接与 Evolv DNA 芯片（DNA 60, DNA 75, DNA 200, DNA 250, DNA 75C, DNA 250C, DNA 100C, DNA 60C, DNA 80C 等）建立 CDC ACM 通信，实现毫秒级精准的 **15.0W 脉冲控制** 与冷阻实时监测。

配合医用级 3% 双氧水（过氧化氢 $H_2O_2$ 溶液），利用高频脉冲热解产生的微气泡空化效应（Micro-cavitation），在不损伤发热丝金属基底的前提下，安全、快速、彻底地剥离顽固积碳与焦油绝缘层，并自动生成清洗前后的阻值对比与结算报告。

### 2. 核心特性

- 🔌 **免驱直连 (Zero-Driver Web Serial)**:
  - 浏览器原生驱动，无需安装额外驱动或庞大的桌面套件；
  - 严格支持 Evolv 芯片 CDC ACM 协议，自动识别 USB Vendor ID `0x268B`；
- ⚡ **无硬件虚拟演示模式 (High-Fidelity Virtual Simulation)**:
  - 在手机端浏览器或未连接硬件时一键切换；
  - 内置真实发热丝热力学与双氧水汽化剥离动力学模型，离线环境下也能完整体验清洁全流程；
- 🎯 **15W 黄金热量微爆控制台**:
  - 脉冲功率 (10.0W~25.0W, 默认 15.0W)
  - 脉冲脉宽 (300ms~1200ms, 默认 600ms)
  - 汽化吸热停顿窗 (100ms~500ms, 默认 200ms)
  - 防忘关安全超时 (15s / 30s 推荐 / 60s / 持续手动关)
- ⌨️ **空格键一键急停与启停**:
  - 支持键盘 **Space (空格键)** 瞬间开启或急停脉冲，保障双手操作双氧水滴管时的绝对安全；
- 📊 **5 宫格实时指标仪表盘**:
  - ① 基准冷阻 ($R_{pre}$) vs 实时阻值 ($R_{live}$) 及动态差值比对 ($\Delta R$)
  - ② 实时脉冲输出功率与电压计算 ($V = \sqrt{P \times R}$)
  - ③ 动态 SVG 环形时钟倒计时与状态倒计时
  - ④ 累计微爆脉冲轮次与吸收能量估算 ($J = \sum P \times t$)
  - ⑤ 发热丝与主板芯片温度监视 (°C) 及 3 级热态预警 ("常温安全" / "温升监视" / "过热告警")
- 📈 **60 FPS 紧凑型微阻动态示波器**:
  - 实时绘制功率脉冲、输出电压、动态阻抗曲线，直观洞察液滴沸腾与微爆扰动；
- ✨ **智能沉淀与结算报告卡片**:
  - 停止后自动静置 1 秒测量最终阻值，计算净净化量并生成评级，支持一键采纳基准或复制报告。

### 3. 双氧水脉冲清洁物理原理

1. **积碳成因**: 发热丝在长期使用中，烟油中的游离糖分、香精和植物甘油在热表面发生热解脱水与聚合反应，形成高阻抗的焦糊积碳与绝缘层，导致冷阻异常漂移与发热不均。
2. **催化分解与微气泡生成**:
   $$2H_2O_2 \xrightarrow{Heat / Metal} 2H_2O + O_2 \uparrow + \Delta Q$$
   向热金属表面滴入 3% 双氧水后，在 15W（约 100°C~130°C 的液相汽化窗口）脉冲加热下，双氧水发生剧烈的非均相接触热催化分解，瞬间产生大量密集的纳米级水蒸气与活性单线态氧微气泡。
3. **微爆空化剥离 (Micro-Cavitation Effect)**:
   高温微气泡在积碳孔隙内急剧膨胀并破裂，瞬间产生局部冲击微射流，形成微爆机械冲刷力，将物理附着的顽固焦炭晶格震碎剥离。
4. **氧化降解**:
   热解释放的初生态活性氧具有极高的氧化电位，能将残存的难溶焦油氧化降解为可溶性短链化合物，随蒸汽带走。

### 4. 浏览器兼容性与环境要求

| 浏览器 | 硬件直连 (Web Serial) | 虚拟演示模式 (Simulation) |
|---|---|---|
| **Google Chrome (桌面版 >= 89)** | ✅ 完美支持 | ✅ 完美支持 |
| **Microsoft Edge (桌面版 >= 89)** | ✅ 完美支持 | ✅ 完美支持 |
| **Opera (桌面版 >= 75)** | ✅ 完美支持 | ✅ 完美支持 |
| **Apple Safari (macOS / iOS)** | ❌ (内核未实现 Web Serial) | ✅ 完美支持 (自动启用仿真) |
| **Mozilla Firefox** | ❌ (内核未实现 Web Serial) | ✅ 完美支持 (自动启用仿真) |
| **手机移动端浏览器** | ❌ (缺少 USB 串口权限) | ✅ 完美支持 (自动启用仿真) |

> ⚠️ **重要提示**: Web Serial API 是浏览器标准安全接口，**强制要求运行在 HTTPS 安全上下文或 `http://localhost` 本地环境中**。部署到 GitHub Pages 会自动获得合规的免费公网 HTTPS 地址。

### 5. 一键部署到 GitHub Pages

无需任何构建步骤（无需 Node.js 打包，无需 npm build），直接上传即发布：

1. 在 GitHub 上新建一个公开仓库，例如命名为 `dna-pulse-cleaner`；
2. 在本地项目根目录关联远程仓库并推送：
   ```bash
   git remote add origin https://github.com/<你的GitHub用户名>/dna-pulse-cleaner.git
   git branch -M main
   git push -u origin main
   ```
3. 打开 GitHub 仓库页面，点击 **Settings** -> **Pages**；
4. 在 **Build and deployment** 下将 **Source** 设为 `Deploy from a branch`，Branch 选择 `main` / `/(root)`，点击 **Save**；
5. 约 1 分钟后，即可获得永久免费的 HTTPS 公网访问地址：
   `https://<你的GitHub用户名>.github.io/dna-pulse-cleaner/`

---

## English (EN)

### 1. Introduction

**DNA Pulse Cleaner** is a zero-build, self-contained, standalone web application engineered for Evolv DNA chipsets (DNA 60, DNA 75, DNA 200, DNA 250, DNA 75C, DNA 250C, DNA 100C, DNA 60C, DNA 80C, etc.). It communicates natively via the browser's **Web Serial API** (`115200 8-N-1` CDC ACM protocol) without requiring driver installations or heavy desktop software.

Combining millisecond-accurate 15.0W pulse heating kinetics with medical-grade 3% hydrogen peroxide ($H_2O_2$) solution, it utilizes micro-cavitation bubble bursts to effectively strip stubborn carbon buildup and oxide layers from heating coils, restoring pure cold resistance.

### 2. Highlights

- **Native Web Serial Interface**: Zero driver configuration, direct CDC ACM serial terminal.
- **Hardware-Free Simulation Demo**: Real-time coil thermal thermodynamics and resistance restoration modeling for instant evaluation in any browser.
- **15W Sweet-Spot Pulse Console**: Micro-adjustable power, pulse width, cooldown window, and 30s auto-cutoff safety protection.
- **Emergency Spacebar Safety Trigger**: Start or stop firing instantly with the keyboard Space key.
- **5-Tile Live Telemetry Dashboard**: Benchmark vs live cold resistance ($\Delta R$), firing power/voltage ($V=\sqrt{P \times R}$), circular timer, pulse cycle count, energy ($J$), and board/coil temperatures.
- **60 FPS Live Oscilloscope Canvas**: Smooth multi-channel curves visualizing pulse dynamics and boiling drop resistance fluctuations.
- **Settlement & Purification Report**: Automatic 1s settling cooldown, final resistance reading, $\Delta R$ grading, and one-click benchmark adoption.

### 3. Scientific Mechanism: 15W H₂O₂ Pulse Micro-Cavitation

- **Thermocatalytic Cleavage**: Droplets of 3% $H_2O_2$ in contact with the heated metal wire decompose rapidly ($2H_2O_2 \rightarrow 2H_2O + O_2 \uparrow$).
- **Micro-Cavitation Jet**: Microscopic vapor and singlet oxygen bubbles generate shockwaves upon collapse within the porous carbon deposit, mechanically fracturing and stripping the carbon lattice.
- **Clean Restitution**: The pure metallic resistance is restored without excessive dry-burning heat stress that degrades wire metallurgy.

### 4. GitHub Pages Deployment

1. Create a GitHub repository (e.g. `dna-pulse-cleaner`).
2. Push repository files:
   ```bash
   git remote add origin https://github.com/<your-username>/dna-pulse-cleaner.git
   git branch -M main
   git push -u origin main
   ```
3. In repository **Settings** -> **Pages**, set branch to `main` (`/root`).
4. Instant live HTTPS access at: `https://<your-username>.github.io/dna-pulse-cleaner/`.

---

## 自动化测试与工程验证 (Testing & Verification)

本工程包含完整的端到端自动化测试套件：

- `node verify_syntax.js`: 校验 `index.html` 内联 JavaScript 语法的正确编译（Node.js VM 校验）。
- `node verify_dom_elements.js`: 校验 50 核心 DOM 节点 ID 与 40 关键函数签名的完整性。
- `node test_e2e_simulation.js`: 在沙箱中执行 14 项端到端全链路时序与边界测试（连接、单发脉冲、循环微爆、安全超时保护、结算卡片、阻值采纳、空格键防双重触发、暗亮色主题、紧急停机截断、温度单位换算等）。

执行测试：
```bash
node verify_syntax.js
node verify_dom_elements.js
node test_e2e_simulation.js
```

---

## 开源协议 (License)

本项目采用 [MIT License](LICENSE) 开源协议。
