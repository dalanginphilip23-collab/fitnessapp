import{a as e}from"./rolldown-runtime-CNC7AqOf.js";import{c as t,s as n}from"./motion-vendor-CYHVKki_.js";import{a as r,i,o as a,u as o}from"./index-Cuy2WIor.js";var s=e(t(),1),c=()=>{let[e,t]=(0,s.useState)(``),[n,c]=(0,s.useState)(!1),l=o(),{setUser:u}=i(),d=e=>({id:e.id||e.user?.id,name:e.name||e.user?.name,email:e.email||e.user?.email,avatar:e.avatar||e.user?.avatar,goal:e.goal||e.user?.goal});return{error:e,loading:n,handleSubmit:async(e,{email:n,password:i})=>{e.preventDefault(),t(``),c(!0);try{let e=await fetch(`${r}/api/auth/login`,{method:`POST`,credentials:`include`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:n,password:i})}),t=await e.json();if(!e.ok)throw Error(t.message||`Login failed`);let a=d(t);if(!a.id)throw Error(`Login response did not include a user ID.`);u(a),l(`/dashboard`)}catch(e){t(e.message)}finally{c(!1)}},loginWithGoogle:a({onSuccess:async e=>{t(``),c(!0);try{let t=await fetch(`${r}/api/auth/google-login`,{method:`POST`,credentials:`include`,headers:{"Content-Type":`application/json`},body:JSON.stringify({code:e.code})}),n=t.headers.get(`content-type`);if(!n||!n.includes(`application/json`))throw Error(`Server response was not JSON. Check backend console.`);let i=await t.json();if(!t.ok)throw Error(i.message||`Google synchronization failed.`);let a=d(i);if(!a.id)throw Error(`Google login response did not include a user ID.`);u(a),l(`/dashboard`)}catch(e){console.error(`Google Login Error:`,e),t(e.message)}finally{c(!1)}},onError:()=>t(`Google Authentication Interrupted.`),flow:`auth-code`})}},l=n(),u=`#8FBF63`,d=`#9DCB72`,f=`rgba(143, 191, 99, 0.22)`,p=`rgba(143, 191, 99, 0.05)`,m=({className:e=``})=>(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,className:e,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`path`,{d:`M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z`}),(0,l.jsx)(`circle`,{cx:`12`,cy:`12`,r:`3`})]}),h=({className:e=``})=>(0,l.jsxs)(`svg`,{viewBox:`0 0 24 24`,className:e,fill:`none`,stroke:`currentColor`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,l.jsx)(`path`,{d:`M17.94 17.94A10.94 10.94 0 0 1 12 19.5C5 19.5 1.5 12 1.5 12a20.86 20.86 0 0 1 4.22-5.94M9.9 4.24A10.4 10.4 0 0 1 12 4.5c7 0 10.5 7.5 10.5 7.5a20.83 20.83 0 0 1-2.42 3.6M14.12 14.12a3 3 0 1 1-4.24-4.24`}),(0,l.jsx)(`path`,{d:`M1.5 1.5l21 21`})]}),g=()=>{let[e,t]=(0,s.useState)(``),[n,r]=(0,s.useState)(``),[i,a]=(0,s.useState)(``),[g,_]=(0,s.useState)(!1),v=o(),{error:y,loading:b,handleSubmit:x,loginWithGoogle:S}=c();return(0,l.jsxs)(`div`,{"data-theme":`dark`,className:`relative min-h-screen min-h-[100dvh] w-full bg-[#0e0e0e] font-['DM_Sans'] text-[#e5e2e1] overflow-x-hidden`,children:[(0,l.jsxs)(`button`,{type:`button`,onClick:()=>v(`/`),className:`fixed top-5 left-5 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-[11px] font-semibold tracking-widest uppercase text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all`,children:[(0,l.jsx)(`span`,{className:`text-base leading-none`,children:`←`}),`Back`]}),(0,l.jsx)(`style`,{children:`
        .vitalis-vignette {
          background: radial-gradient(ellipse at center, transparent 30%, #0e0e0e 100%);
        }
        .vitalis-grid {
          background-image:
            linear-gradient(${p} 1px, transparent 1px),
            linear-gradient(90deg, ${p} 1px, transparent 1px);
          background-size: 32px 32px;
        }
        @media (min-width: 640px) {
          .vitalis-grid { background-size: 48px 48px; }
        }
        .vitalis-scan-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${u}, transparent);
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
        .v-hero-stats {
          opacity: 0;
          animation: vitalis-fade-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
        }
        .v-card {
          opacity: 0;
          animation: vitalis-scale-in 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s forwards;
        }
        .v-card-logo    { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.5s  forwards; }
        .v-card-title   { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.62s forwards; }
        .v-card-sub     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.70s forwards; }
        .v-card-field1  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.80s forwards; }
        .v-card-field2  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 0.90s forwards; }
        .v-card-forgot  { opacity: 0; animation: vitalis-fade-in 0.4s ease            0.98s forwards; }
        .v-card-btn     { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.05s forwards; }
        .v-card-divider { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.15s forwards; }
        .v-card-google  { opacity: 0; animation: vitalis-fade-up 0.5s cubic-bezier(0.22,1,0.36,1) 1.22s forwards; }
        .v-card-footer  { opacity: 0; animation: vitalis-fade-in 0.4s ease            1.35s forwards; }
      `}),(0,l.jsx)(`div`,{className:`fixed inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1800&q=80&auto=format&fit=crop')] bg-cover bg-[center_30%] brightness-[0.28] saturate-[0.7]`}),(0,l.jsx)(`div`,{className:`vitalis-vignette fixed inset-0 z-[1]`}),(0,l.jsx)(`div`,{className:`vitalis-grid fixed inset-0 z-[2]`}),(0,l.jsxs)(`div`,{className:`relative z-10 w-full min-h-screen min-h-[100dvh] grid grid-cols-1 lg:grid-cols-[1fr_480px]`,children:[(0,l.jsxs)(`div`,{className:`hidden lg:flex flex-col justify-center p-14 gap-4`,children:[(0,l.jsx)(`span`,{className:`v-hero-eyebrow text-[11px] font-semibold tracking-[0.35em] uppercase opacity-80`,style:{color:u},children:`Vitalis Performance OS`}),(0,l.jsxs)(`h1`,{className:`v-hero-h1 font-['Bebas_Neue'] text-[clamp(56px,6vw,88px)] leading-[0.95] tracking-wider`,children:[`TRAIN`,(0,l.jsx)(`br`,{}),`HARDER.`,(0,l.jsx)(`br`,{}),(0,l.jsx)(`span`,{style:{color:u},children:`RECOVER`}),(0,l.jsx)(`br`,{}),`SMARTER.`]}),(0,l.jsx)(`p`,{className:`v-hero-sub text-[13px] text-[#e5e2e1]/45 max-w-[320px] leading-relaxed font-light mt-1`,children:`AI-powered biometric tracking that adapts to your body in real time. Every rep, every rest, optimized.`}),(0,l.jsxs)(`div`,{className:`v-hero-stats flex gap-8 mt-6 pt-6 border-t border-white/10`,children:[(0,l.jsxs)(`div`,{className:`flex flex-col`,children:[(0,l.jsx)(`span`,{className:`font-['Bebas_Neue'] text-3xl leading-none`,style:{color:u},children:`12K+`}),(0,l.jsx)(`span`,{className:`text-[10px] tracking-widest uppercase text-white/30`,children:`Athletes`})]}),(0,l.jsxs)(`div`,{className:`flex flex-col`,children:[(0,l.jsx)(`span`,{className:`font-['Bebas_Neue'] text-3xl leading-none`,style:{color:u},children:`98%`}),(0,l.jsx)(`span`,{className:`text-[10px] tracking-widest uppercase text-white/30`,children:`Recovery`})]})]})]}),(0,l.jsx)(`div`,{className:`flex items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:p-8 min-h-screen min-h-[100dvh] lg:min-h-0`,children:(0,l.jsxs)(`div`,{className:`v-card relative w-full max-w-[400px] bg-[#121210]/65 backdrop-blur-[32px] saturate-[140%] rounded-[20px] p-6 sm:p-8 md:p-10 shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] my-auto`,style:{border:`1px solid ${f}`},children:[(0,l.jsx)(`div`,{className:`vitalis-scan-bar`}),(0,l.jsxs)(`div`,{className:`v-card-logo flex items-center gap-3 mb-7 sm:mb-9`,children:[(0,l.jsx)(`div`,{className:`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0`,style:{backgroundColor:u},children:(0,l.jsx)(`svg`,{viewBox:`0 0 24 24`,className:`w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] fill-none stroke-[#161f00] stroke-[2.2] stroke-linecap-round stroke-linejoin-round`,children:(0,l.jsx)(`path`,{d:`M3 12h3l3-8 4 16 3-10 2 2h3`})})}),(0,l.jsx)(`span`,{className:`font-['Bebas_Neue'] text-[20px] sm:text-[22px] tracking-[0.12em] text-[#e5e2e1]`,children:`VITALIS`})]}),(0,l.jsx)(`h2`,{className:`v-card-title font-['Bebas_Neue'] text-[26px] sm:text-[32px] tracking-wider leading-none mb-1.5 text-[#e5e2e1]`,children:`ACCESS PORTAL`}),(0,l.jsx)(`p`,{className:`v-card-sub text-xs text-[#c4c9b0]/55 tracking-wide mb-6 sm:mb-8`,children:`Enter credentials to synchronize biometrics.`}),(0,l.jsxs)(`form`,{onSubmit:t=>x(t,{email:e,password:n}),className:`space-y-4 sm:space-y-5`,children:[y&&(0,l.jsx)(`div`,{className:`bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] font-semibold tracking-widest uppercase p-2.5 text-center`,children:y}),(0,l.jsxs)(`div`,{className:`v-card-field1 relative`,children:[(0,l.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:i===`email`?u:`rgba(255,255,255,0.5)`},children:`Email Address`}),(0,l.jsx)(`input`,{type:`email`,className:`w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]`,style:{borderColor:i===`email`?`${u}80`:void 0,backgroundColor:i===`email`?`${u}0d`:void 0},placeholder:`athlete@vitalis.io`,required:!0,value:e,onChange:e=>t(e.target.value),onFocus:()=>a(`email`),onBlur:()=>a(``)})]}),(0,l.jsxs)(`div`,{className:`v-card-field2 relative`,children:[(0,l.jsx)(`label`,{className:`block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2 transition-colors`,style:{color:i===`password`?u:`rgba(255,255,255,0.5)`},children:`Password`}),(0,l.jsxs)(`div`,{className:`relative`,children:[(0,l.jsx)(`input`,{type:g?`text`:`password`,className:`w-full bg-white/5 border border-white/10 rounded-xl text-sm p-3 sm:p-3.5 pr-11 outline-none transition-all placeholder:text-white/10 text-[#e5e2e1]`,style:{borderColor:i===`password`?`${u}80`:void 0,backgroundColor:i===`password`?`${u}0d`:void 0},placeholder:`••••••••••••`,required:!0,value:n,onChange:e=>r(e.target.value),onFocus:()=>a(`password`),onBlur:()=>a(``)}),(0,l.jsx)(`button`,{type:`button`,onClick:()=>_(e=>!e),"aria-label":g?`Hide password`:`Show password`,"aria-pressed":g,tabIndex:-1,className:`absolute right-0 top-0 h-full w-11 flex items-center justify-center text-white/35 hover:text-white/70 transition-colors`,children:g?(0,l.jsx)(h,{className:`w-[18px] h-[18px]`}):(0,l.jsx)(m,{className:`w-[18px] h-[18px]`})})]})]}),(0,l.jsx)(`div`,{className:`v-card-forgot flex justify-end -mt-2 sm:-mt-3`,children:(0,l.jsx)(`a`,{href:`/reset-password`,className:`text-[10px] font-semibold tracking-widest uppercase transition-colors`,style:{color:`${u}b3`},onMouseEnter:e=>e.currentTarget.style.color=u,onMouseLeave:e=>e.currentTarget.style.color=`${u}b3`,children:`Forgot password?`})}),(0,l.jsxs)(`button`,{type:`submit`,disabled:b,className:`v-card-btn group relative w-full text-[#161f00] font-bold text-[11px] tracking-[0.25em] uppercase p-3.5 sm:p-4 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2`,style:{backgroundColor:u},onMouseEnter:e=>{b||(e.currentTarget.style.backgroundColor=d)},onMouseLeave:e=>{e.currentTarget.style.backgroundColor=u},children:[(0,l.jsx)(`div`,{className:`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none`}),b?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`div`,{className:`vitalis-spinner`}),` Processing...`]}):(0,l.jsxs)(l.Fragment,{children:[`Initialize Session `,(0,l.jsx)(`span`,{className:`text-lg`,children:`→`})]})]}),(0,l.jsxs)(`div`,{className:`v-card-divider flex items-center gap-3 py-1`,children:[(0,l.jsx)(`div`,{className:`flex-1 h-[1px] bg-white/5`}),(0,l.jsx)(`span`,{className:`text-[10px] tracking-[0.3em] uppercase text-white/20`,children:`or`}),(0,l.jsx)(`div`,{className:`flex-1 h-[1px] bg-white/5`})]}),(0,l.jsxs)(`button`,{type:`button`,onClick:()=>S(),className:`v-card-google w-full bg-white/5 border border-white/10 rounded-xl text-[11px] font-semibold tracking-widest uppercase p-3 sm:p-3.5 flex items-center justify-center gap-2.5 hover:bg-white/10 transition-colors text-[#e5e2e1]`,children:[(0,l.jsxs)(`svg`,{className:`w-4 h-4 shrink-0`,viewBox:`0 0 24 24`,children:[(0,l.jsx)(`path`,{d:`M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z`,fill:`#4285F4`}),(0,l.jsx)(`path`,{d:`M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z`,fill:`#34A853`}),(0,l.jsx)(`path`,{d:`M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z`,fill:`#FBBC05`}),(0,l.jsx)(`path`,{d:`M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z`,fill:`#EA4335`})]}),(0,l.jsx)(`span`,{className:`whitespace-nowrap`,children:`Continue with Google`})]})]}),(0,l.jsxs)(`div`,{className:`v-card-footer mt-6 sm:mt-7 text-center text-xs text-[#c4c9b0]/45`,children:[`Don't have an account?`,(0,l.jsx)(`a`,{href:`/register`,className:`font-semibold ml-1 transition-colors`,style:{color:`${u}cc`},onMouseEnter:e=>e.currentTarget.style.color=u,onMouseLeave:e=>e.currentTarget.style.color=`${u}cc`,children:`Register`})]})]})})]})]})};export{g as default};