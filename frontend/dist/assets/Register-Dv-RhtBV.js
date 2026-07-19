import{a as e}from"./rolldown-runtime-CNC7AqOf.js";import{c as t,s as n}from"./motion-vendor-CYHVKki_.js";import{a as r,s as i,u as a}from"./index-Dq8IAdGU.js";var o=e(t(),1),s=()=>{let[e,t]=(0,o.useState)(!1),[n,i]=(0,o.useState)(``),[s,c]=(0,o.useState)(!1),l=a();return{loading:e,error:n,showSuccessModal:s,handleRegister:async(e,n)=>{e.preventDefault(),t(!0),i(``);try{let e=await fetch(`${r}/api/auth/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({name:n.name,email:n.email,password:n.password,fitness_goal:n.goal})}),t=await e.json();if(!e.ok)throw Error(t.error||`Initialization failed. System conflict.`);t.success&&c(!0)}catch(e){i(e.message)}finally{t(!1)}},handleModalConfirm:()=>l(`/login`)}},c=n(),l=`#8FBF63`,u=`#9DCB72`,d=`rgba(143, 191, 99, 0.22)`,f=`rgba(143, 191, 99, 0.05)`,p=[`Peak Metabolic Efficiency`,`Muscle Hypertrophy`,`Fat Loss Protocol`,`Endurance & VO2 Max`,`Athletic Performance`,`Recovery Optimization`],m=({className:e=``})=>(0,c.jsxs)(`svg`,{viewBox:`0 0 24 24`,className:e,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,c.jsx)(`path`,{d:`M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z`}),(0,c.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`})]}),h=({className:e=``})=>(0,c.jsxs)(`svg`,{viewBox:`0 0 24 24`,className:e,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,c.jsx)(`path`,{d:`M17.94 17.94A10.94 10.94 0 0 1 12 19.5C5 19.5 1.5 12 1.5 12a20.86 20.86 0 0 1 4.22-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4.5c7 0 10.5 7.5 10.5 7.5a20.83 20.83 0 0 1-2.42 3.6M14.12 14.12a3 3 0 1 1-4.24-4.24`}),(0,c.jsx)(`path`,{d:`M1.5 1.5l21 21`})]}),g=()=>{let[e,t]=(0,o.useState)({name:``,email:``,password:``,goal:`Peak Metabolic Efficiency`}),[n,r]=(0,o.useState)(``),[a,g]=(0,o.useState)(!1),{loading:_,error:v,showSuccessModal:y,handleRegister:b,handleModalConfirm:x}=s(),S=[e.name,e.email,e.password].filter(Boolean).length,C=Math.round(S/3*100),w=n=>r=>t({...e,[n]:r.target.value});return(0,c.jsxs)(`div`,{"data-theme":`dark`,className:`relative min-h-screen min-h-[100dvh] w-full bg-[#0e0e0e] font-['DM_Sans'] text-[#e5e2e1] overflow-x-hidden`,children:[(0,c.jsx)(`style`,{children:`
        .vitalis-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, #0e0e0e 100%);
        }
        .vitalis-grid {
          background-image:
            linear-gradient(${f} 1px, transparent 1px),
            linear-gradient(90deg, ${f} 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @media (min-width: 640px) {
          .vitalis-grid { background-size: 48px 48px; }
        }
        .vitalis-scan-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${l}, transparent);
          border-radius: 999px;
          animation: vitalis-scan 3s ease-in-out infinite;
          opacity: 0.6;
        }
        @keyframes vitalis-scan {
          0%   { transform: translateX(-100%); opacity: 0; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.6; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .vitalis-spinner {
          width: 14px; height: 14px;
          border: 2px solid #161f00;
          border-top-color: transparent;
          border-radius: 50%;
          animation: vitalis-spin 0.7s linear infinite;
        }
        @keyframes vitalis-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vitalis-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vitalis-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes vitalis-fade-left {
          from { opacity: 0; transform: translateX(-22px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes vitalis-scale-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes vitalis-modal-in {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .v-hero-eyebrow {
          opacity: 0;
          animation: vitalis-fade-left 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }
        .v-hero-h1 {
          opacity: 0;
          animation: vitalis-fade-left 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s forwards;
        }
        .v-hero-sub {
          opacity: 0;
          animation: vitalis-fade-left 0.6s cubic-bezier(0.22,1,0.36,1) 0.45s forwards;
        }
        .v-hero-goals {
          opacity: 0;
          animation: vitalis-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .v-card {
          opacity: 0;
          animation: vitalis-scale-in 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
        }
        .v-card-logo     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.42s forwards; }
        .v-card-progress { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.52s forwards; }
        .v-card-title    { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s forwards; }
        .v-card-sub      { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.70s forwards; }
        .v-card-field1   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.78s forwards; }
        .v-card-field2   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.86s forwards; }
        .v-card-field3   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.94s forwards; }
        .v-card-field4   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.02s forwards; }
        .v-card-btn      { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.12s forwards; }
        .v-card-footer   { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.22s forwards; }
        .v-modal-card {
          animation: vitalis-modal-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .goal-select-custom {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238FBF63' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 38px !important;
        }
      `}),(0,c.jsx)(`div`,{className:`fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format&fit=crop')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]`}),(0,c.jsx)(`div`,{className:`vitalis-vignette fixed inset-0 z-[1]`}),(0,c.jsx)(`div`,{className:`vitalis-grid fixed inset-0 z-[2]`}),y&&(0,c.jsxs)(`div`,{className:`fixed inset-0 z-[100] flex items-center justify-center p-4`,children:[(0,c.jsx)(`div`,{className:`absolute inset-0 bg-black/80 backdrop-blur-md`}),(0,c.jsxs)(`div`,{className:`v-modal-card relative w-full max-w-[400px] bg-[#121210]/80 backdrop-blur-[32px] saturate-[140%] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 text-center overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]`,style:{border:`1px solid ${d}`},children:[(0,c.jsx)(`div`,{className:`vitalis-scan-bar`}),(0,c.jsx)(`div`,{className:`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6`,style:{backgroundColor:`${l}1a`,border:`1px solid ${d}`},children:(0,c.jsx)(`svg`,{className:`w-8 h-8 sm:w-10 sm:h-10`,fill:`none`,viewBox:`0 0 24 24`,style:{color:l},stroke:`currentColor`,children:(0,c.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2.5,d:`M5 13l4 4L19 7`})})}),(0,c.jsx)(`h2`,{className:`font-['Bebas_Neue'] text-[26px] sm:text-3xl tracking-wider text-[#e5e2e1] mb-2 uppercase`,children:`Identity Encrypted`}),(0,c.jsx)(`p`,{className:`text-[11px] sm:text-[12px] text-[#c4c9b0]/60 tracking-wider mb-6 sm:mb-8 leading-relaxed uppercase`,children:`Your clinical athlete profile has been successfully initialized into the Vitalis Core.`}),(0,c.jsxs)(`button`,{onClick:x,className:`w-full text-[#161f00] font-bold text-[11px] tracking-[0.2em] uppercase p-3.5 sm:p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95`,style:{backgroundColor:l},onMouseEnter:e=>e.currentTarget.style.backgroundColor=u,onMouseLeave:e=>e.currentTarget.style.backgroundColor=l,children:[(0,c.jsx)(`svg`,{className:`w-4 h-4`,fill:`none`,viewBox:`0 0 24 24`,stroke:`currentColor`,children:(0,c.jsx)(`path`,{strokeLinecap:`round`,strokeLinejoin:`round`,strokeWidth:2.5,d:`M11 16l-4-4m0 0l4-4m-4 4h14`})}),`Go Back to Login`]})]})]}),(0,c.jsxs)(`div`,{className:`relative z-10 w-full min-h-screen min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_480px]`,children:[(0,c.jsxs)(`div`,{className:`hidden lg:flex flex-col justify-center p-14 gap-4`,children:[(0,c.jsx)(`span`,{className:`v-hero-eyebrow text-[11px] font-semibold tracking-[0.35em] uppercase opacity-80`,style:{color:l},children:`Vitalis Performance OS`}),(0,c.jsxs)(`h1`,{className:`v-hero-h1 font-['Bebas_Neue'] text-[clamp(52px,5.5vw,82px)] leading-[0.95] tracking-wider`,children:[`BUILD`,(0,c.jsx)(`br`,{}),`YOUR`,(0,c.jsx)(`br`,{}),(0,c.jsx)(`span`,{style:{color:l},children:`ATHLETE`}),(0,c.jsx)(`br`,{}),`PROFILE.`]}),(0,c.jsx)(`p`,{className:`v-hero-sub text-[13px] text-[#e5e2e1]/45 max-w-[320px] leading-relaxed font-light mt-1`,children:`Choose your goal, sync your biometrics, and let the AI engine build a program around your biology.`}),(0,c.jsx)(`div`,{className:`v-hero-goals flex flex-wrap gap-2 mt-5 pt-6 border-t border-white/10`,children:p.map(e=>(0,c.jsx)(`span`,{className:`text-[10px] font-semibold tracking-[0.12em] uppercase py-[5px] px-3 rounded-full`,style:{border:`1px solid ${d}`,color:`${l}80`,backgroundColor:f},children:e},e))})]}),(0,c.jsx)(`div`,{className:`flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:p-8 min-h-screen min-h-[100dvh] lg:min-h-0`,children:(0,c.jsxs)(`div`,{className:`v-card relative w-full max-w-[400px] bg-[#121210]/65 backdrop-blur-[32px] saturate-[140%] rounded-[20px] p-6 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] my-auto`,style:{border:`1px solid ${d}`},children:[(0,c.jsx)(`div`,{className:`vitalis-scan-bar`}),(0,c.jsxs)(`div`,{className:`v-card-logo flex items-center gap-3 mb-6`,children:[(0,c.jsx)(`div`,{className:`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0`,style:{backgroundColor:l},children:(0,c.jsx)(`svg`,{viewBox:`0 0 24 24`,className:`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round`,children:(0,c.jsx)(`path`,{d:`M3 12h3l3-8 4 16 3-10 2 2h3`})})}),(0,c.jsx)(`span`,{className:`font-['Bebas_Neue'] text-[20px] sm:text-[22px] tracking-[0.12em] text-[#e5e2e1]`,children:`VITALIS`})]}),(0,c.jsxs)(`div`,{className:`v-card-progress flex justify-between items-center mb-2`,children:[(0,c.jsx)(`span`,{className:`text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c4c9b0]/40`,children:`Profile Setup`}),(0,c.jsxs)(`span`,{className:`font-['Bebas_Neue'] text-[16px] leading-none`,style:{color:l},children:[C,`%`]})]}),(0,c.jsx)(`div`,{className:`v-card-progress h-[2px] bg-white/5 rounded-full mb-6 sm:mb-8 overflow-hidden`,children:(0,c.jsx)(`div`,{className:`h-full rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`,style:{width:`${C}%`,backgroundColor:l,boxShadow:`0 0 8px ${l}66`}})}),(0,c.jsx)(`h2`,{className:`v-card-title font-['Bebas_Neue'] text-[26px] sm:text-[32px] tracking-wider leading-none mb-1.5 text-[#e5e2e1]`,children:`CREATE IDENTITY`}),(0,c.jsx)(`p`,{className:`v-card-sub text-xs text-[#c4c9b0]/55 tracking-wide mb-6 sm:mb-8`,children:`Initialize your clinical athlete profile.`}),(0,c.jsxs)(`form`,{onSubmit:t=>b(t,e),className:`space-y-4 sm:space-y-5`,children:[v&&(0,c.jsx)(`div`,{className:`bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 text-center`,children:v}),(0,c.jsxs)(`div`,{className:`v-card-field1 relative`,children:[(0,c.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:n===`name`?l:`rgba(255,255,255,0.5)`},children:`Full Name`}),(0,c.jsx)(`input`,{type:`text`,className:`w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]`,style:{borderColor:n===`name`?`${l}80`:void 0,backgroundColor:n===`name`?`${l}0d`:void 0},placeholder:`Your name`,required:!0,value:e.name,onChange:w(`name`),onFocus:()=>r(`name`),onBlur:()=>r(``)})]}),(0,c.jsxs)(`div`,{className:`v-card-field2 relative`,children:[(0,c.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:n===`email`?l:`rgba(255,255,255,0.5)`},children:`Email Address`}),(0,c.jsx)(`input`,{type:`email`,className:`w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]`,style:{borderColor:n===`email`?`${l}80`:void 0,backgroundColor:n===`email`?`${l}0d`:void 0},placeholder:`athlete@vitalis.io`,required:!0,value:e.email,onChange:w(`email`),onFocus:()=>r(`email`),onBlur:()=>r(``)})]}),(0,c.jsxs)(`div`,{className:`v-card-field3 relative`,children:[(0,c.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:n===`password`?l:`rgba(255,255,255,0.5)`},children:`Password`}),(0,c.jsxs)(`div`,{className:`relative`,children:[(0,c.jsx)(`input`,{type:a?`text`:`password`,className:`w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 pr-11 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]`,style:{borderColor:n===`password`?`${l}80`:void 0,backgroundColor:n===`password`?`${l}0d`:void 0},placeholder:`••••••••••••`,required:!0,value:e.password,onChange:w(`password`),onFocus:()=>r(`password`),onBlur:()=>r(``)}),(0,c.jsx)(`button`,{type:`button`,onClick:()=>g(e=>!e),"aria-label":a?`Hide password`:`Show password`,"aria-pressed":a,tabIndex:-1,className:`absolute right-0 top-0 h-full w-11 flex items-center justify-center text-white/35 hover:text-white/70 transition-colors`,children:a?(0,c.jsx)(h,{className:`w-[18px] h-[18px]`}):(0,c.jsx)(m,{className:`w-[18px] h-[18px]`})})]})]}),(0,c.jsxs)(`div`,{className:`v-card-field4 relative`,children:[(0,c.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:n===`goal`?l:`rgba(255,255,255,0.5)`},children:`Primary Goal`}),(0,c.jsx)(`select`,{className:`goal-select-custom w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none cursor-pointer appearance-none transition-all text-[#e5e2e1]`,style:{borderColor:n===`goal`?`${l}80`:void 0,backgroundColor:n===`goal`?`${l}0d`:void 0},value:e.goal,onChange:w(`goal`),onFocus:()=>r(`goal`),onBlur:()=>r(``),children:p.map(e=>(0,c.jsx)(`option`,{className:`bg-[#1a1a1a] text-[#e5e2e1]`,value:e,children:e},e))})]}),(0,c.jsxs)(`button`,{type:`submit`,disabled:_,className:`v-card-btn group relative w-full text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-3.5 sm:p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2`,style:{backgroundColor:l},onMouseEnter:e=>{_||(e.currentTarget.style.backgroundColor=u)},onMouseLeave:e=>{e.currentTarget.style.backgroundColor=l},children:[(0,c.jsx)(`div`,{className:`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none`}),_?(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(`div`,{className:`vitalis-spinner`}),` Initializing...`]}):(0,c.jsxs)(c.Fragment,{children:[`Initiate Optimization `,(0,c.jsx)(`span`,{className:`text-lg`,children:`→`})]})]})]}),(0,c.jsxs)(`div`,{className:`v-card-footer mt-6 sm:mt-7 text-center text-xs text-[#c4c9b0]/45`,children:[`Already have an account?`,(0,c.jsx)(i,{to:`/login`,className:`font-semibold ml-1 transition-colors`,style:{color:`${l}cc`},onMouseEnter:e=>e.currentTarget.style.color=l,onMouseLeave:e=>e.currentTarget.style.color=`${l}cc`,children:`Sign in`})]})]})})]})]})};export{g as default};