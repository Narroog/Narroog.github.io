# 访问统计与访客自报身份

网站仍然公开访问。未填写身份的访客只进入 Umami 的普通访问统计；主动填写称呼并勾选同意的访客，会额外产生 `identified-pageview` 事件，记录称呼、浏览器内随机编号、页面及事件时间。

称呼是访客自报，**不是经过验证的真实身份**。同名访客不会自动合并；同一访客换浏览器、清除站点数据或重新提交，也会产生新的随机编号。本次接入没有加入登录系统。现有 Giscus 评论中的 GitHub 登录不能用于识别所有阅读者。

## 启用

目前尚无 Umami 账户，未配置变量时统计关闭，身份填写入口也不会显示。没有发送任何访问或身份数据。过去没有记录的访问无法补回。

1. 在 [Umami](https://umami.is/) 创建账户，并添加网站 `narroog.github.io`（也可以使用自己的 Umami 服务）。
2. 打开网站设置中的 Tracking code，找到 `src` 和 `data-website-id`。参见 [官方安装说明](https://docs.umami.is/docs/collect-data)。建议使用当前 Umami 或 v2.17+，以支持此接入使用的隐私配置。
3. 在 GitHub 仓库 Settings → Secrets and variables → Actions → Variables 添加两个 **Repository variables**：

   | 变量               | 值                              |
   | ------------------ | ------------------------------- |
   | `UMAMI_SCRIPT_URL` | 安装脚本的完整 HTTPS `src` 地址 |
   | `UMAMI_WEBSITE_ID` | `data-website-id` 中的 UUID     |

   这两个是公开安装参数，不是 API 密钥或账户密码。两者必须同时填写；只填写一个时构建会明确报错。

4. 发布这次代码后，在 Actions 中手动运行 `Deploy Quartz site to GitHub Pages`，或推送到 `v4` 分支触发构建。
5. 打开网站进行验收：匿名浏览、填写称呼并勾选同意、打开另一篇文章、停止后续身份记录、再打开一篇文章。确认 Umami 普通页面统计与 `identified-pageview` 事件符合预期。

本地构建可在 PowerShell 中设置相同变量：

```powershell
$env:UMAMI_SCRIPT_URL = '<安装脚本的 HTTPS src>'
$env:UMAMI_WEBSITE_ID = '<网站 UUID>'
npm run build
```

删除两个 Repository variables 并重新构建发布，即可关闭本次统计与身份入口。

## 后台查看

- **访问量与页面热度**：网站 Dashboard 的 Visitors、Views、Pages；按日期查看访问趋势、页面访问量、来源、地区和设备。访客数是统计工具的估计，不是精确实名人数。
- **自报身份与浏览页面**：Events 中查看 `identified-pageview`，展开事件数据中的 `visitor_label`、`visitor_id`、`identity_source` 和 `page`。在提供事件明细或 Sessions 活动视图的版本中，查看事件时间及对应页面；后台具体界面和可用报表取决于 Umami 版本及账户套餐。
- `identity_source` 固定为 `self-reported`。不要仅凭姓名或昵称确认某个人真的访问过。

额外的身份事件是命名事件，不会再次发送普通 pageview，不应使正常页面浏览量翻倍。代码没有调用 `umami.identify()` 给整个匿名会话打上实名标签；称呼只出现在自愿提交之后的身份事件里。这样停止后续身份记录后，后续页面事件不再携带称呼，普通匿名统计仍可继续。

## 访客控制与数据边界

- 页面展示统计告知，身份填写默认折叠，不阻碍阅读。称呼限制为 80 字符；不要要求访客填写手机号、身份证号等敏感信息。
- 称呼和随机编号仅在访客勾选同意并提交后保存到本浏览器的 localStorage。存储受限时，仅在当前页面内暂存，不阻碍浏览。
- 每次修改称呼需要重新勾选同意，并产生新的编号。停止身份记录会清除浏览器中的保存值；已发送到后台的数据不会自动删除，需要站主在统计服务中另外处理。
- 开启浏览器 Do Not Track 或 `umami.disabled` 时，不发送身份事件，Umami 脚本也配置为尊重 Do Not Track。
- 页面地址不包含查询参数与片段。详见 [Umami tracker 配置](https://docs.umami.is/docs/tracker-configuration)。统计脚本被拦截或网络不可达时，网站仍可浏览；脚本未加载时无法提交身份。
- Umami 接收请求时会接触访客的网络地址。普通匿名统计仍能展示会话活动，所以这里只停止发送称呼，不能保证匿名会话与之前的身份事件之间完全无法关联。
- SDK 的发送失败可能被内部静默处理。界面只确认浏览器保存成功，不宣称服务器已接收。广告拦截、网络故障及未执行 JavaScript 都可能造成漏记；上线后需用真实账户验证数据接收。

用户填写的称呼以及事件明细应保留在统计账户中，不要把后台 API 密钥或访问者名单放入公开仓库或公开页面。
