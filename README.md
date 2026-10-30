welcome to my blog, hope you enjoy it :D

## 许可

- **网站代码：AGPL-3.0-only**。Copyright © 2026 Season。Season 的原创代码、对上游代码的修改及本仓库组合后的网站程序采用 GNU Affero General Public License **第 3 版，仅此版本**，不提供“或任何后续版本”或其他可选授权。完整条款见 [LICENSE](LICENSE)。程序按现状提供，不作任何担保，具体以许可条款为准。许可调整日期：2026-10-30。
- **文章：CC BY-NC-SA 4.0**。`src/content/posts/` 中原创文章的正文及示例代码采用署名—非商业性使用—相同方式共享 4.0 国际许可，作者以文章署名为准，默认 Season。详见 [文章许可声明](src/content/posts/LICENSE) 和 [完整条款](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.zh-hans)。另有标注的第三方引用或素材保留其原有条款。
- **上游与依赖**：AstroPaper 与 Hatsune Miku Theme 的原有 MIT 版权、许可声明分别保留在 [licenses/AstroPaper.txt](licenses/AstroPaper.txt) 和 [licenses/Hatsune-Miku-Theme.txt](licenses/Hatsune-Miku-Theme.txt)。第三方代码及依赖保留各自许可；上述 AGPL 声明不取消其原有授权。

网站对应源码仓库为 [Season0518/blog](https://github.com/Season0518/blog)。分发或修改网站程序、向网络用户提供修改版服务时，须遵守 AGPL-3.0 的对应源码提供等要求。

本次许可调整及 Git 历史整理不撤回已经向他人授予的旧版本许可。

## 评论

海外版文章页使用 Giscus，评论存放在 `Season0518/blog` 的 Announcements 分类。以文章路径严格匹配讨论，切换亮暗主题时同步评论主题。国内版（`npm run build:cn`）不输出评论区，也不加载 Giscus 客户端。

启用前需将仓库设为公开、开启 Discussions，并确认 [Giscus App](https://github.com/apps/giscus) 已安装且获准访问此仓库。仓库和分类 ID 配置在 `src/components/Giscus.astro`；私有仓库无法加载 Giscus 评论。

确认以上条件后，在海外站的构建环境设置 `PUBLIC_GISCUS_ENABLED=true`。默认显示“评论暂未开放”，不加载 Giscus，避免未配置时出现仓库安装错误。国内版即使设置此变量也不会启用评论。

本地使用 `npm run dev:worldwide` 预览；构建后运行 `node scripts/check-giscus.test.mjs worldwide`。国内版构建后使用同一命令的 `cn` 参数验证隔离。

## 复制

选中文章内容复制时，纯文本与富文本剪贴板都会追加作者、原文地址和 CC BY-NC-SA 4.0 协议。代码块与输入输出样例的 Copy 按钮保留原始内容，便于直接运行或测试。
