> Headset-only release: see `docs/HEADSET_ONLY_UPDATE.md` (or `HEADSET_ONLY_UPDATE.md` from this folder) for the current feature set and setup. Earlier simulator references below describe previous versions and are not current features.

# 验证记录 — 2026-10-13

## 本次重新执行

- `npm ci --no-audit --no-fund`：成功。
- `npm test`：12 项通过，0 失败，包括 PGlite 数据库/RLS、React Demo 完整流程及新增回归。
- 新增 Unity FIFO/重复 ACK 测试：前一个事件尚未确认时不发送后续任务/结束事件；重复拒绝 ACK 不重复通知 Unity。
- 新增模拟离线云同步测试：保存失败后完成的尝试仍在队列；清除 UI 错误不隐藏上传失败；恢复后只保留最终完成结果。此测试 mock API，不是实际 Supabase 网络测试。
- 扩展账号缓存测试：同一身份从教师变为学生后不再返回其他学生缓存。
- `npm run build`：通过 TypeScript 和生产构建。
- `npm run lint`：0 errors，原 Toast Fast Refresh warning 保留。
- C# 拒绝事件处理改为不发新事件的本地暂停；未在 Unity 编译验证。

真实部署、Auth、跨设备、WebGL 渲染及头显测试仍待执行；详细步骤见 FINAL_HANDOVER.md。未把静态测试当成设备验收。

---

以下为随原包保留的历史验证说明，并非本次新增执行的证据。

# 验证记录 — 2026-10-11

## 已执行

- `npm ci` 成功安装原依赖；新增依赖通过 npm 安装并更新 lockfile。
- `npm run build`：TypeScript 检查与 Vite 生产构建通过。
- `npm run lint`：0 errors；保留原 Toast 模块的 1 条 Fast Refresh warning。
- `npm test`：10 项测试通过：
  1. React 与宿主 JS 协议往返、iframe 来源校验、训练桥接握手、命令确认。
  2. 在 PGlite PostgreSQL 引擎执行完整 SQL migration；测试重新计分、重复保存、终态不可变、学生隔离、教师分配、匿名拒绝和角色不可自行修改。
  3. 本地账号隔离、待同步队列修订确认与存储容量错误。
  4. 暂停/恢复计时。
  5. 重复错误和完成事件不重复计分。
  6. 拒绝其他会话、未知任务、错序任务、暂停操作和提前结束。
  7. 完整训练计分及结束停止计时。
  8. 退出 VR 暂停训练。
  9. 消息格式与大小校验。
  10. 在 jsdom 中挂载真实 React 训练页面，点击完成 Demo 的五步流程，进入 Feedback；退出并重新选择账号后仍保留结果。

## 仍需实际环境验收

- jsdom 是 DOM 测试，不是 WebGL 渲染或头显测试。尝试安装本机浏览器时下载未得到有效浏览器包，因此没有运行真实浏览器视觉/渲染验收。
- 未取得 Unity 原工程和编辑器，未编译本次 C# 脚本、未修改现有 wasm，也未验证模型交互或 WebXR 设备兼容。
- SQL 与权限在本地 PostgreSQL 引擎内测试，没有连接用户的 Supabase 云项目；注册邮件、线上 Auth/RLS、网络重试和跨设备查询仍需配置后验收。
- 未部署线上网站，HTTPS、静态平台资源限制和 XR 权限需在选定环境确认。
- Vite 提示主要 JS chunk 较大，构建仍成功。Unity 原资源总量约 65 MiB；最终头显加载时间与帧率需要实测。

请使用根 README 的逐项验收清单，不要将本说明中的静态检查或模拟测试当作真实设备通过的证明。
