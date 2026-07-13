(function(){
  "use strict";

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const safeUrl = url => {
    if (!url) return "#";
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:","https:","mailto:","tel:"].includes(parsed.protocol) ? parsed.href : "#";
    } catch { return "#"; }
  };

  const LOCAL_PROJECT_IMAGES = {
    "sis-mini-factory": "assets/images/cabinet-open.jpg",
    "plc-esp32-motor-control": "assets/images/motor-control.jpg",
    "fruit-vegetable-recognition": "assets/images/fruit-recognition.jpg",
    "solar-oven": "assets/images/solar-oven.svg"
  };

  const FALLBACK_PROFILE = {
    nameAr: "محمد العربي التليلي",
    nameEn: "Mohammed Larbi Tlili",
    roleAr: "مهندس أنظمة مدمجة وأتمتة صناعية",
    roleEn: "Embedded Systems & Industrial Automation",
    bioAr: "متخصص في الأنظمة المدمجة والأتمتة الصناعية. أطور حلولًا تجمع بين PLC وESP32 وHMI وIoT لتحويل الأفكار إلى أنظمة ذكية قابلة للتطبيق.",
    profileImageURL: "assets/images/profile.png",
    email: "", github: "", linkedin: "", whatsapp: "", cvUrl: ""
  };

  const FALLBACK_PROJECTS = [
    {id:"sis-mini-factory",slug:"sis-mini-factory",title:"SIS Mini Factory",category:"Industrial Automation",shortDescription:"نظام مصنع ذكي مصغر يجمع PLC وHMI وESP32 مع التحكم والمراقبة الصناعية.",fullDescription:"مشروع مصنع ذكي مصغر يدمج المتحكم المنطقي PLC وشاشة HMI ولوحة ESP32 وصفحة ويب، مع أزرار حقيقية وريليات وحساسات ونظام مراقبة وتحكم متكامل.",tags:["PLC","HMI","ESP32","Control Panel"],date:"2026",featured:true,published:true,order:1},
    {id:"plc-esp32-motor-control",slug:"plc-esp32-motor-control",title:"PLC–ESP32 Motor Control",category:"IoT & Automation",shortDescription:"مراقبة وتحكم بمحرك واحد باستخدام PLC وESP32 مع تسجيل الأحداث.",fullDescription:"نظام كامل للتحكم في تشغيل وإيقاف محرك باستخدام PLC Schneider وESP32. يتضمن قياس الحرارة، حالات الإنذار والطوارئ، إحصائيات التشغيل، سجل الأحداث، والتحكم عن بعد من واجهة ويب.",tags:["PLC","ESP32","Firebase","Web Dashboard"],date:"2026",featured:true,published:true,order:2},
    {id:"fruit-vegetable-recognition",slug:"fruit-vegetable-recognition",title:"Fruit & Vegetable Recognition",category:"Artificial Intelligence",shortDescription:"واجهة ويب للتعرف على الفواكه والخضروات من الصور باستخدام نموذج ذكاء اصطناعي.",fullDescription:"تطبيق ويب يسمح بالتقاط صورة أو رفعها، ثم تمريرها إلى نموذج تصنيف لعرض نوع الفاكهة أو الخضار والنتيجة للمستخدم.",tags:["AI","CNN","Python","Web App"],date:"2026",featured:true,published:true,order:3},
    {id:"solar-oven",slug:"solar-oven",title:"Solar Oven",category:"Renewable Energy",shortDescription:"تصميم فرن شمسي وقياس الأداء الحراري لمواد مركبة مختلفة.",fullDescription:"مشروع تطوير فرن شمسي متنقل مع دراسة تخزين الطاقة الحرارية ومقارنة مواد مرجعية وطوب مطحون وMill Scale، إضافة إلى قياس درجة الحرارة والرطوبة.",tags:["Solar Energy","Thermal Storage","Sensors"],date:"2026",featured:true,published:true,order:4}
  ];

  function imageForProject(p){
    return p.mainImage || LOCAL_PROJECT_IMAGES[p.slug || p.id] || "assets/images/solar-oven.svg";
  }

  function loadJsonp(url, timeoutMs = 15000){
    return new Promise((resolve, reject) => {
      const callback = "__larbiPortfolioCallback_" + Date.now() + "_" + Math.floor(Math.random()*10000);
      const script = document.createElement("script");
      const timer = setTimeout(() => cleanup(new Error("انتهت مهلة تحميل البيانات.")), timeoutMs);

      function cleanup(error, data){
        clearTimeout(timer);
        try { delete window[callback]; } catch {}
        script.remove();
        error ? reject(error) : resolve(data);
      }

      window[callback] = data => cleanup(null, data);
      script.onerror = () => cleanup(new Error("تعذر الاتصال بقاعدة البيانات."));
      const separator = url.includes("?") ? "&" : "?";
      script.src = `${url}${separator}callback=${encodeURIComponent(callback)}&_=${Date.now()}`;
      document.head.appendChild(script);
    });
  }

  async function loadData(){
    const apiUrl = window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.apiUrl;
    if (!apiUrl) return {profile:FALLBACK_PROFILE, projects:FALLBACK_PROJECTS};

    try {
      const data = await loadJsonp(apiUrl);
      if (!data || data.ok !== true) throw new Error("استجابة غير صالحة");
      return {
        profile: Object.assign({}, FALLBACK_PROFILE, data.profile || {}),
        projects: Array.isArray(data.projects) && data.projects.length ? data.projects : FALLBACK_PROJECTS
      };
    } catch (error) {
      console.warn("Using local fallback data:", error);
      return {profile:FALLBACK_PROFILE, projects:FALLBACK_PROJECTS};
    }
  }

  function projectCard(p){
    const tags = (p.tags || []).slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    return `<a class="project-card" href="project.html?slug=${encodeURIComponent(p.slug || p.id)}">
      <div class="project-image"><img src="${esc(imageForProject(p))}" alt="${esc(p.title)}"></div>
      <div class="project-body">
        <span class="project-category">${esc(p.category || "")}</span>
        <h3>${esc(p.title)}</h3><p>${esc(p.shortDescription || "")}</p>
        <div class="tags">${tags}</div>
      </div></a>`;
  }

  async function renderHome(){
    const {profile, projects} = await loadData();
    const setText = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val || ""; };

    setText("nameAr",profile.nameAr);
    setText("roleAr",profile.roleAr);
    setText("roleEn",profile.roleEn);
    setText("bioAr",profile.bioAr);

    const pic=document.getElementById("profileImage");
    if(pic) pic.src=profile.profileImageURL || profile.profileImage || "assets/images/profile.png";

    const cv=document.getElementById("cvBtn");
    if(cv){cv.href=safeUrl(profile.cvUrl); if(!profile.cvUrl) cv.style.opacity=".55";}

    const email=document.getElementById("emailBtn");
    if(email) email.href=profile.email ? `mailto:${profile.email}` : "#";

    const socials=document.getElementById("socials");
    if(socials){
      const items=[];
      if(profile.linkedin) items.push(`<a href="${safeUrl(profile.linkedin)}" target="_blank" title="LinkedIn">in</a>`);
      if(profile.github) items.push(`<a href="${safeUrl(profile.github)}" target="_blank" title="GitHub">GH</a>`);
      if(profile.email) items.push(`<a href="mailto:${esc(profile.email)}" title="Email">✉</a>`);
      if(profile.whatsapp) items.push(`<a href="${safeUrl(profile.whatsapp)}" target="_blank" title="WhatsApp">WA</a>`);
      socials.innerHTML=items.join("");
    }

    const grid=document.getElementById("projectsGrid");
    if(grid){
      const visible=projects
        .filter(p=>p.published!==false && p.featured!==false)
        .sort((a,b)=>(a.order||999)-(b.order||999));
      grid.innerHTML=visible.length ? visible.map(projectCard).join("") :
        `<div class="empty-state">لا توجد مشاريع منشورة حاليًا.</div>`;
    }
  }

  async function renderProject(){
    const root=document.getElementById("projectRoot");
    if(!root) return;

    const {projects} = await loadData();
    const slug=new URLSearchParams(location.search).get("slug");
    const p=projects.find(x=>(x.slug||x.id)===slug && x.published!==false);

    if(!p){
      root.innerHTML=`<div class="container empty-state" style="margin-top:70px">المشروع غير موجود أو غير منشور.</div>`;
      return;
    }

    document.title=`${p.title} | Larbi Portfolio`;
    const tags=(p.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    const gallery=(p.gallery||[]).filter(Boolean).map(img=>`<img src="${esc(img)}" alt="${esc(p.title)}">`).join("");
    const links=[
      p.liveUrl&&`<a href="${safeUrl(p.liveUrl)}" target="_blank">فتح المشروع المباشر</a>`,
      p.githubUrl&&`<a href="${safeUrl(p.githubUrl)}" target="_blank">GitHub</a>`,
      p.videoUrl&&`<a href="${safeUrl(p.videoUrl)}" target="_blank">مشاهدة الفيديو</a>`,
      p.pdfUrl&&`<a href="${safeUrl(p.pdfUrl)}" target="_blank">تحميل التقرير PDF</a>`
    ].filter(Boolean).join("");

    root.innerHTML=`
      <section class="project-hero"><div class="container project-hero-grid">
        <div class="project-detail">
          <div class="project-meta">${esc(p.category||"")} • ${esc(p.date||"")}</div>
          <h1>${esc(p.title)}</h1><p class="lead">${esc(p.shortDescription||"")}</p>
          <div class="tags">${tags}</div>
        </div>
        <div class="project-cover"><img src="${esc(imageForProject(p))}" alt="${esc(p.title)}"></div>
      </div></section>
      <section><div class="container project-content">
        <article class="content-card"><h2>عن المشروع</h2>
          <p>${esc(p.fullDescription||p.shortDescription||"")}</p>
          ${gallery?`<h2>صور المشروع</h2><div class="gallery">${gallery}</div>`:""}
        </article>
        <aside class="side-card"><h3>معلومات المشروع</h3>
          <p><b>التصنيف:</b> ${esc(p.category||"—")}</p>
          <p><b>التاريخ:</b> ${esc(p.date||"—")}</p>
          <div class="link-stack">${links||"<span style='color:#8fa5b8'>ستضاف الروابط لاحقًا.</span>"}</div>
        </aside>
      </div></section>`;
  }

  document.addEventListener("DOMContentLoaded", async()=>{
    const adminUrl = window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.adminUrl;
    ["adminNavLink","adminFooterLink"].forEach(id=>{
      const el=document.getElementById(id);
      if(el && adminUrl){ el.href=adminUrl; el.target="_blank"; }
    });

    const menuBtn=document.getElementById("menuBtn"), links=document.getElementById("navLinks");
    if(menuBtn&&links) menuBtn.addEventListener("click",()=>links.classList.toggle("open"));

    if(document.getElementById("projectsGrid")) await renderHome();
    if(document.getElementById("projectRoot")) await renderProject();
  });
})();