import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ProfilePage: QuartzComponent = () => {
  return (
    <section class="profile-page">
      <header class="profile-hero">
        <div class="profile-avatar" aria-hidden="true">
          CD
        </div>
        <div class="profile-hero-copy">
          <p class="profile-kicker">Ph.D. Student · Thermal Management · Semiconductor Devices</p>
          <h1>Chenkun Deng</h1>
          <p>
            I study thermal issues in advanced transistors, with a focus on thermal design,
            electro-thermal behavior, and simulation-driven understanding of device reliability.
          </p>
          <div class="profile-tags" aria-label="Research keywords">
            <span>FinFETs</span>
            <span>GaN HEMTs</span>
            <span>Thermal Design</span>
            <span>TCAD</span>
          </div>
        </div>
      </header>

      <section class="profile-section profile-focus" aria-labelledby="research-focus">
        <p class="profile-section-label">Research Focus</p>
        <h2 id="research-focus">Thermal Issues in Transistors</h2>
        <p>
          My main research focuses on <strong>thermal issues in transistors</strong>, with current
          emphasis on <strong>thermal design of advanced-node transistors (FinFETs)</strong> and{" "}
          <strong>gallium nitride high-electron-mobility transistors (GaN HEMTs)</strong>.
        </p>
      </section>

      <div class="profile-grid">
        <section class="profile-panel" aria-labelledby="education">
          <h2 id="education">Education</h2>
          <ol class="profile-timeline">
            <li>
              <time>2025 - current</time>
              <div>
                <strong>Ph.D. student</strong>
                <span>School of Aerospace Engineering, Tsinghua University</span>
              </div>
            </li>
            <li>
              <time>2021 - 2025</time>
              <div>
                <strong>Math-Physics + Energy &amp; Power Eng.</strong>
                <span>Weiyang College, Tsinghua University</span>
              </div>
            </li>
          </ol>
        </section>

        <section class="profile-panel" aria-labelledby="technical-strengths">
          <h2 id="technical-strengths">Technical Strengths</h2>
          <div class="profile-skill-list">
            <article>
              <h3>Programming</h3>
              <p>
                Scientific computing, research scripting, data processing, and reproducible
                workflows.
              </p>
            </article>
            <article>
              <h3>Advanced Thermal Modeling</h3>
              <p>
                Thermal transport, electro-thermal analysis, and device-level heat dissipation
                problems.
              </p>
            </article>
            <article>
              <h3>TCAD</h3>
              <p>
                Technology Computer-Aided Design for transistor behavior and thermal performance
                analysis.
              </p>
            </article>
          </div>
        </section>
      </div>

      <section class="profile-section" aria-labelledby="awards">
        <div class="profile-section-heading">
          <p class="profile-section-label">Recognition</p>
          <h2 id="awards">Awards and Recognitions</h2>
        </div>
        <ul class="profile-awards">
          <li>
            <strong>Scholarship for Future Scholar</strong>
            <span>Tsinghua University · Sep 2025</span>
          </li>
          <li>
            <strong>Scholarship for Excellence in Scientific and Technological Innovation</strong>
            <span>Tsinghua University · Sep 2024</span>
          </li>
          <li>
            <strong>Scholarship for Excellence Academic</strong>
            <span>Tsinghua University · Sep 2024</span>
          </li>
        </ul>
      </section>

      <section class="profile-section" aria-labelledby="publications">
        <div class="profile-section-heading">
          <p class="profile-section-label">Selected Publication</p>
          <h2 id="publications">Publications</h2>
        </div>
        <article class="profile-publication">
          <div class="profile-publication-year">2026</div>
          <div>
            <h3>Modulating self-heating effects in FinFETs through doping engineering</h3>
            <p>
              <strong>C.K. Deng</strong>, Z.L. Tang, Y. Shen, B.Y. Cao.{" "}
              <em>Applied Physics Letters</em>, 2026, 128(6): 063502.
            </p>
          </div>
        </article>
      </section>

      <section class="profile-contact" aria-labelledby="contact">
        <div>
          <p class="profile-section-label">Contact</p>
          <h2 id="contact">Let us connect</h2>
        </div>
        <div class="profile-contact-links">
          <a href="mailto:dcknarog7@gmail.com">dcknarog7@gmail.com</a>
          <a href="https://orcid.org/0009-0002-6166-0662">ORCID</a>
        </div>
      </section>
    </section>
  )
}

export default (() => ProfilePage) satisfies QuartzComponentConstructor
