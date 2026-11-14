import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/visitorIdentity.scss"
// @ts-ignore
import script from "./scripts/visitorIdentity.inline"

export default (() => {
  const VisitorIdentity: QuartzComponent = ({ cfg }: QuartzComponentProps) => {
    if (cfg.analytics?.provider !== "umami") return null
    return (
      <aside class="visitor-identity" aria-label="访问统计与自愿身份填写">
        <p class="visitor-notice">
          本站使用 Umami 统计访问量、浏览页面、访问时间、来源及设备信息。你可以匿名浏览。
        </p>
        <details>
          <summary>让站主知道你来过（自愿填写）</summary>
          <p>
            提交后，站主可看到你填写的称呼及此后访问的页面与时间。称呼由你自报，不经过身份验证。
            信息会保存在此浏览器；换设备需重新填写。停止后续身份记录不会删除已经发送的记录。
          </p>
          <form class="visitor-identity-form">
            <label for="visitor-label">你希望站主如何称呼你？</label>
            <input id="visitor-label" name="visitor-label" type="text" maxLength={80} required />
            <label class="visitor-consent">
              <input name="visitor-consent" type="checkbox" required />
              <span>
                我同意保存以上称呼，并将此后在本站的页面访问与它关联，直到我停止身份记录。
              </span>
            </label>
            <div class="visitor-actions">
              <button type="submit" disabled>
                保存并关联后续访问
              </button>
              <button type="button" class="visitor-forget" hidden>
                停止后续身份记录
              </button>
            </div>
          </form>
          <p class="visitor-status" role="status" aria-live="polite">
            正在连接访问统计…
          </p>
          <noscript>身份填写需要启用 JavaScript；你仍可继续浏览本站。</noscript>
        </details>
      </aside>
    )
  }
  VisitorIdentity.css = style
  VisitorIdentity.afterDOMLoaded = script
  return VisitorIdentity
}) satisfies QuartzComponentConstructor
