"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

#lp, #lp * { box-sizing: border-box; }
#lp {
  --g:       #22c55e;
  --gl:      #4ade80;
  --gd:      #16a34a;
  --gg:      rgba(34,197,94,.28);
  --dk:      #090b10;
  --dk2:     #111827;
  --dk3:     #1f2937;
  --gr:      #6b7280;
  --grl:     #9ca3af;
  --bd:      rgba(255,255,255,.1);
  --glass:   rgba(255,255,255,.06);
  --glassb:  rgba(255,255,255,.11);
  --fd:      'Bricolage Grotesque', sans-serif;
  --fb:      'DM Sans', sans-serif;
  --spring:  cubic-bezier(.34,1.56,.64,1);
  --ease:    cubic-bezier(.16,1,.3,1);
  font-family: var(--fb);
  color: var(--dk2);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

#lp a { text-decoration: none; }
#lp .con { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

/* BUTTONS */
#lp .btn { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; border-radius:100px; font-family:var(--fd); font-weight:700; font-size:.88rem; cursor:pointer; transition:all .25s var(--spring); border:none; }
#lp .btn-g { background:var(--g); color:#fff; }
#lp .btn-g:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 8px 28px var(--gg); }
#lp .btn-g:active { transform:scale(.97); }
#lp .btn-o { background:transparent; color:rgba(255,255,255,.78); border:1.5px solid rgba(255,255,255,.2); }
#lp .btn-o:hover { border-color:rgba(255,255,255,.55); color:#fff; background:rgba(255,255,255,.07); }

/* LABELS / TITLES */
#lp .slabel { display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:12px; }
#lp .slabel-g { color:var(--gd); }
#lp .slabel-gl { color:rgba(34,197,94,.75); }
#lp .stitle { font-family:var(--fd); font-size:clamp(1.85rem,3.8vw,2.9rem); font-weight:800; letter-spacing:-1.5px; line-height:1.1; }
#lp .ssub { font-size:.98rem; color:var(--gr); line-height:1.8; margin-top:14px; max-width:500px; }

/* SCROLL REVEALS */
#lp .rev { opacity:0; transform:translateY(28px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
#lp .rev.on { opacity:1; transform:none; }
#lp .rev-l { opacity:0; transform:translateX(-28px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
#lp .rev-l.on { opacity:1; transform:none; }
#lp .rev-r { opacity:0; transform:translateX(28px); transition:opacity .7s var(--ease), transform .7s var(--ease); }
#lp .rev-r.on { opacity:1; transform:none; }
#lp .d1 { transition-delay:.1s; }
#lp .d2 { transition-delay:.2s; }
#lp .d3 { transition-delay:.3s; }

/* NAV */
#lnav { position:fixed; top:0; left:0; right:0; z-index:200; padding:18px 0; transition:all .35s ease; }
#lnav.scrolled { background:rgba(9,11,16,.9); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid var(--bd); padding:11px 0; }
#lnav .nav-i { display:flex; align-items:center; justify-content:space-between; }
#lnav .logo { font-family:var(--fd); font-weight:800; font-size:1.3rem; color:#fff; letter-spacing:-1px; }
#lnav .logo em { color:var(--g); font-style:normal; }
#lnav .nav-links { display:flex; align-items:center; gap:28px; list-style:none; }
#lnav .nav-links a { color:rgba(255,255,255,.58); font-size:.86rem; font-weight:500; transition:color .2s; position:relative; }
#lnav .nav-links a::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1.5px; background:var(--g); transition:width .25s var(--ease); }
#lnav .nav-links a:hover { color:#fff; }
#lnav .nav-links a:hover::after { width:100%; }
#lnav .nav-r { display:flex; align-items:center; gap:10px; }
@media(max-width:768px){ #lnav .nav-links { display:none; } }

/* HERO */
#lhero { min-height:100vh; background:var(--dk); display:flex; align-items:center; padding:130px 0 80px; position:relative; overflow:hidden; }
#lhero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px); background-size:54px 54px; mask-image:radial-gradient(ellipse at 65% 35%, black 25%, transparent 75%); -webkit-mask-image:radial-gradient(ellipse at 65% 35%, black 25%, transparent 75%); }
#lp .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; animation:lp-breathe 9s ease-in-out infinite; }
#lp .orb-1 { width:580px; height:580px; background:radial-gradient(circle,rgba(34,197,94,.12) 0%,transparent 70%); right:-80px; top:-130px; }
#lp .orb-2 { width:300px; height:300px; background:radial-gradient(circle,rgba(34,197,94,.08) 0%,transparent 70%); left:6%; bottom:12%; animation-delay:-4.5s; }
@keyframes lp-breathe { 0%,100%{transform:scale(1) translateY(0)} 50%{transform:scale(1.07) translateY(-22px)} }
#cglow { position:absolute; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,.1) 0%,transparent 70%); pointer-events:none; transform:translate(-50%,-50%); transition:left .12s ease, top .12s ease; z-index:0; opacity:0; }

#lp .hero-grid { display:grid; grid-template-columns:1fr 1.08fr; gap:60px; align-items:center; position:relative; z-index:1; }
#lp .hero-badge { display:inline-flex; align-items:center; gap:8px; padding:5px 14px; background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.28); border-radius:100px; color:var(--gl); font-size:.7rem; font-weight:700; letter-spacing:.5px; text-transform:uppercase; margin-bottom:22px; }
#lp .bdot { width:6px; height:6px; border-radius:50%; background:var(--g); animation:lp-pdot 2s infinite; }
@keyframes lp-pdot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }
#lp h1 { font-family:var(--fd); font-size:clamp(2.7rem,4.5vw,4.1rem); font-weight:800; line-height:1.04; letter-spacing:-2.5px; color:#fff; margin-bottom:20px; }
#lp .h1-mark { color:var(--gl); position:relative; display:inline-block; }
#lp .h1-mark::after { content:''; position:absolute; left:-2px; right:-2px; bottom:0; height:4px; background:var(--g); opacity:.38; border-radius:2px; transform:skewX(-4deg); }
#lp .hero-sub { font-size:1.08rem; line-height:1.78; color:rgba(255,255,255,.52); max-width:450px; margin-bottom:34px; }
#lp .hero-ctas { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
#lp .hero-benefits { display:flex; align-items:center; gap:20px; margin-top:22px; padding-top:18px; border-top:1px solid rgba(255,255,255,.07); }
#lp .hb-item { display:flex; align-items:center; gap:7px; font-size:.8rem; color:rgba(255,255,255,.48); }
#lp .hb-ic { width:18px; height:18px; border-radius:50%; background:rgba(34,197,94,.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
#lp .hb-ic svg { width:9px; height:9px; }
#lp .hb-item strong { color:rgba(255,255,255,.82); font-weight:600; }
#lp .hero-proof { display:flex; align-items:center; gap:9px; margin-top:34px; color:rgba(255,255,255,.32); font-size:.8rem; }
#lp .pavs { display:flex; }
#lp .pav { width:28px; height:28px; border-radius:50%; border:2px solid var(--dk); display:flex; align-items:center; justify-content:center; font-size:.58rem; font-weight:700; margin-left:-6px; }
#lp .pav:first-child { margin-left:0; }
#lp .pav-a { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; }
#lp .pav-b { background:linear-gradient(135deg,#0891b2,#0e7490); color:#fff; }
#lp .pav-c { background:linear-gradient(135deg,#be185d,#9d174d); color:#fff; }
#lp .pav-d { background:linear-gradient(135deg,#b45309,#92400e); color:#fff; }

/* MAP DEMO WIDGET */
#lp .map-demo { position:relative; }
#lp .map-card { background:rgba(255,255,255,.048); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,.11); border-radius:18px; overflow:hidden; transition:transform .4s ease; }
#lp .mc-hdr { padding:16px 20px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; }
#lp .mc-title { font-family:var(--fd); font-size:.8rem; font-weight:700; color:rgba(255,255,255,.86); }
#lp .mc-phase { font-size:.62rem; font-weight:700; padding:3px 10px; background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.22); border-radius:100px; color:var(--gl); }
#lp .mc-prog-track { height:3px; background:rgba(255,255,255,.07); }
#lp .mc-prog-fill { height:100%; background:linear-gradient(90deg,var(--gd),var(--gl)); width:0; transition:width 1.1s var(--ease); }
#lp .mc-tasks { padding:6px 0; }
#lp .mct { display:flex; align-items:center; gap:11px; padding:8px 18px; transition:background .2s; }
#lp .mct:hover { background:rgba(255,255,255,.025); }
#lp .mct-chk { width:19px; height:19px; border-radius:50%; border:2px solid rgba(255,255,255,.18); flex-shrink:0; position:relative; transition:all .35s var(--spring); }
#lp .mct-chk.done { background:var(--g); border-color:var(--g); }
#lp .mct-chk.done::after { content:''; position:absolute; width:9px; height:5px; border-left:2.5px solid #fff; border-bottom:2.5px solid #fff; top:50%; left:50%; transform:translate(-50%,-62%) rotate(-45deg); }
#lp .mct-chk.active { border-color:var(--g); box-shadow:0 0 0 4px rgba(34,197,94,.18); }
#lp .mct-info { flex:1; min-width:0; }
#lp .mct-name { font-size:.8rem; color:rgba(255,255,255,.8); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:all .3s; }
#lp .mct-name.done { color:rgba(255,255,255,.3); text-decoration:line-through; }
#lp .mct-meta { font-size:.66rem; color:rgba(255,255,255,.28); margin-top:1px; }
#lp .op { font-size:.6rem; font-weight:700; padding:2px 7px; border-radius:100px; }
#lp .op-prov { background:rgba(99,102,241,.16); color:#a5b4fc; }
#lp .op-cli { background:rgba(34,197,94,.12); color:var(--gl); }
#lp .op-joint { background:rgba(245,158,11,.12); color:#fcd34d; }
#lp .mc-foot { padding:10px 18px; border-top:1px solid rgba(255,255,255,.05); display:flex; align-items:center; gap:8px; }
#lp .mc-avs { display:flex; }
#lp .mc-av { width:24px; height:24px; border-radius:50%; border:2px solid rgba(255,255,255,.07); display:flex; align-items:center; justify-content:center; font-size:.55rem; font-weight:700; margin-left:-5px; }
#lp .mc-av:first-child { margin-left:0; }
#lp .mc-av-y { background:#6366f1; color:#fff; }
#lp .mc-av-t { background:var(--gd); color:#fff; }
#lp .mc-live { margin-left:auto; display:flex; align-items:center; gap:5px; font-size:.66rem; color:var(--gl); }
#lp .mc-ldot { width:6px; height:6px; border-radius:50%; background:var(--g); animation:lp-pdot 1.6s infinite; }
#lp .demo-notif { position:absolute; bottom:-16px; right:-20px; background:rgba(9,11,16,.92); backdrop-filter:blur(16px); border:1px solid rgba(34,197,94,.22); border-radius:12px; padding:10px 14px; display:flex; align-items:center; gap:9px; min-width:200px; opacity:0; transform:translateY(10px) scale(.96); transition:all .5s var(--spring); pointer-events:none; z-index:10; }
#lp .demo-notif.show { opacity:1; transform:translateY(0) scale(1); }
#lp .dn-icon { width:28px; height:28px; border-radius:7px; background:rgba(34,197,94,.18); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
#lp .dn-t { font-size:.73rem; font-weight:600; color:rgba(255,255,255,.86); }
#lp .dn-s { font-size:.66rem; color:rgba(255,255,255,.36); margin-top:1px; }

@media(max-width:900px){ #lp .hero-grid { grid-template-columns:1fr; gap:40px; } #lp .map-demo { order:-1; } }

/* WAVE */
#lp .wave-wrap { line-height:0; }
#lp .wave-wrap svg { display:block; width:100%; }

/* PROBLEM */
#lproblem { background:#f7f8fc; padding:80px 0 0; overflow:hidden; }
#lp .prob-hdr { text-align:center; margin-bottom:52px; }
#lp .prob-hdr .ssub { margin:14px auto 0; }
#lp .ba-wrap { position:relative; height:460px; border-radius:24px 24px 0 0; overflow:hidden; cursor:col-resize; user-select:none; -webkit-user-select:none; }
#lp .ba-side { position:absolute; inset:0; padding:48px 60px; display:flex; flex-direction:column; justify-content:center; }
#lp .ba-before { background:#0c0e15; z-index:2; clip-path:inset(0 35% 0 0); }
#lp .ba-after { background:#ecfdf5; z-index:1; }
#lp .ba-tag { font-family:var(--fd); font-size:.6rem; font-weight:800; letter-spacing:3px; text-transform:uppercase; margin-bottom:18px; }
#lp .ba-before .ba-tag { color:#ef4444; }
#lp .ba-after .ba-tag { color:var(--gd); }
#lp .ba-h { font-family:var(--fd); font-size:clamp(1.3rem,2.4vw,1.8rem); font-weight:800; letter-spacing:-.7px; line-height:1.2; margin-bottom:16px; }
#lp .ba-before .ba-h { color:rgba(255,255,255,.88); }
#lp .ba-after .ba-h { color:var(--dk2); }
#lp .ba-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
#lp .ba-list li { display:flex; align-items:flex-start; gap:9px; font-size:.86rem; line-height:1.55; }
#lp .ba-before .ba-list li { color:rgba(255,255,255,.45); }
#lp .ba-after .ba-list li { color:#374151; }
#lp .ba-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:5px; }
#lp .ba-before .ba-dot { background:#ef4444; }
#lp .ba-after .ba-dot { background:var(--g); }
#lp .ba-handle { position:absolute; top:0; bottom:0; width:2px; background:#fff; z-index:10; left:65%; cursor:col-resize; }
#lp .ba-knob { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:40px; height:40px; border-radius:50%; background:#fff; box-shadow:0 4px 18px rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; gap:4px; }
#lp .ba-arr { width:0; height:0; border-style:solid; }
#lp .arr-l { border-width:5px 6px 5px 0; border-color:transparent #9ca3af transparent transparent; }
#lp .arr-r { border-width:5px 0 5px 6px; border-color:transparent transparent transparent #9ca3af; }
@media(max-width:640px){ #lp .ba-wrap{height:560px} #lp .ba-side{padding:28px 22px} }

/* METRICS */
#lmetrics { background:var(--dk2); padding:68px 0; position:relative; overflow:hidden; }
#lmetrics::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(34,197,94,.07) 0%,transparent 55%); pointer-events:none; }
#lp .metrics-row { display:grid; grid-template-columns:repeat(3,1fr); position:relative; z-index:1; }
#lp .metric { padding:36px 28px; text-align:center; border-right:1px solid rgba(255,255,255,.07); }
#lp .metric:last-child { border-right:none; }
#lp .metric-num { font-family:var(--fd); font-size:clamp(2.8rem,5vw,4rem); font-weight:800; color:var(--gl); letter-spacing:-2px; line-height:1; display:inline-block; }
#lp .metric-sfx { font-size:clamp(1.4rem,2.5vw,2rem); font-weight:800; color:var(--gl); }
#lp .metric-lbl { font-size:.86rem; color:rgba(255,255,255,.42); margin-top:10px; line-height:1.6; }
#lp .metric-lbl b { color:rgba(255,255,255,.75); font-weight:600; }
@media(max-width:700px){ #lp .metrics-row{grid-template-columns:1fr} #lp .metric{border-right:none;border-bottom:1px solid rgba(255,255,255,.07)} #lp .metric:last-child{border-bottom:none} }

/* HOW IT WORKS */
#lhow { background:#fff; padding:120px 0; overflow:hidden; }
#lp .how-hdr { max-width:440px; margin-bottom:80px; }
#lp .how-steps { position:relative; padding-left:28px; }
#lp .how-vline { position:absolute; left:27px; top:28px; width:2px; background:linear-gradient(to bottom, var(--g), rgba(34,197,94,.06)); bottom:28px; transform-origin:top; transform:scaleY(0); transition:transform 1.6s var(--ease); }
#lp .how-vline.on { transform:scaleY(1); }
#lp .how-step { display:grid; grid-template-columns:56px 1fr 252px; gap:24px 28px; align-items:center; padding:36px 0; position:relative; opacity:0; transform:translateX(-18px); transition:opacity .6s var(--ease), transform .6s var(--ease); }
#lp .how-step.on { opacity:1; transform:none; }
#lp .how-step:nth-child(2){ transition-delay:.15s; }
#lp .how-step:nth-child(3){ transition-delay:.3s; }
#lp .how-step:not(:last-child)::after { content:''; position:absolute; left:24px; bottom:0; right:0; height:1px; background:rgba(0,0,0,.05); }
#lp .step-num { width:54px; height:54px; border-radius:50%; background:var(--g); display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-size:1.15rem; font-weight:800; color:#fff; flex-shrink:0; position:relative; z-index:1; box-shadow:0 0 0 8px rgba(34,197,94,.1); }
#lp .step-t { font-family:var(--fd); font-size:1.38rem; font-weight:800; letter-spacing:-.5px; color:var(--dk2); margin-bottom:8px; }
#lp .step-d { font-size:.91rem; color:var(--gr); line-height:1.74; max-width:340px; }
#lp .step-vis { background:var(--dk); border-radius:11px; border:1px solid rgba(255,255,255,.07); overflow:hidden; }
#lp .sv-bar { height:3px; background:var(--g); transform-origin:left; transform:scaleX(0); transition:transform 1.1s var(--ease) .45s; }
#lp .how-step.on .sv-bar { transform:scaleX(1); }
#lp .sv-body { padding:13px 15px; display:flex; flex-direction:column; gap:7px; }
#lp .sv-row { display:flex; align-items:center; gap:7px; }
#lp .sv-c { width:12px; height:12px; border-radius:50%; border:1.5px solid rgba(255,255,255,.12); flex-shrink:0; }
#lp .sv-c.done { background:var(--g); border-color:var(--g); }
#lp .sv-ln { flex:1; height:5px; background:rgba(255,255,255,.07); border-radius:3px; }
#lp .sv-ln.done { background:rgba(34,197,94,.28); }
#lp .sv-ln.s { flex:.6; }
#lp .sv-tag { font-size:.58rem; font-weight:700; padding:1px 6px; border-radius:100px; flex-shrink:0; }
#lp .sv-tag-p { background:rgba(99,102,241,.15); color:#a5b4fc; }
#lp .sv-tag-c { background:rgba(34,197,94,.12); color:var(--gl); }
@media(max-width:900px){ #lp .how-step{grid-template-columns:54px 1fr} #lp .step-vis{display:none} }

/* FEATURES */
#lfeatures { background:#f7f8fc; padding:120px 0; overflow:hidden; }
#lp .feat-grid { display:grid; grid-template-columns:290px 1fr; gap:48px; align-items:start; margin-top:56px; }
#lp .feat-tabs { display:flex; flex-direction:column; gap:3px; }
#lp .ftab { display:flex; align-items:center; gap:13px; padding:13px 14px; border-radius:11px; cursor:pointer; border:1.5px solid transparent; transition:all .25s var(--ease); }
#lp .ftab:hover { background:rgba(34,197,94,.06); }
#lp .ftab.active { background:#fff; border-color:rgba(34,197,94,.22); box-shadow:0 4px 18px rgba(0,0,0,.07); }
#lp .ftab-ic { width:36px; height:36px; border-radius:9px; background:rgba(34,197,94,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .25s; }
#lp .ftab.active .ftab-ic { background:var(--g); }
#lp .ftab-ic svg { width:16px; height:16px; color:var(--gd); transition:color .25s; }
#lp .ftab.active .ftab-ic svg { color:#fff; }
#lp .ftab-tn { font-family:var(--fd); font-size:.83rem; font-weight:700; color:var(--dk2); }
#lp .ftab-td { font-size:.73rem; color:var(--grl); margin-top:2px; }
#lp .feat-display { position:sticky; top:108px; }
#lp .fpanel { display:none; animation:lp-fadeUp .4s var(--ease) forwards; }
#lp .fpanel.active { display:block; }
@keyframes lp-fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
#lp .fmock { background:var(--dk); border-radius:16px; border:1px solid rgba(255,255,255,.08); overflow:hidden; padding:22px; min-height:330px; }
#lp .fm-lbl { font-size:.65rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,.28); margin-bottom:16px; }
#lp .fm-ph { background:rgba(255,255,255,.04); border-radius:8px; padding:11px 13px; margin-bottom:8px; }
#lp .fm-ph-name { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--gl); margin-bottom:8px; }
#lp .fm-row { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
#lp .fmt-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
#lp .fmt-dot.c { background:var(--g); }
#lp .fmt-dot.a { background:#f59e0b; }
#lp .fmt-dot.p { background:rgba(255,255,255,.15); }
#lp .fmt-n { font-size:.77rem; color:rgba(255,255,255,.65); }
#lp .fmt-d { font-size:.68rem; color:rgba(255,255,255,.24); margin-left:auto; }
#lp .fm-own-r { display:flex; align-items:center; gap:9px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.05); }
#lp .fm-own-r:last-child { border-bottom:none; }
#lp .fm-ni { display:flex; align-items:flex-start; gap:9px; padding:11px; background:rgba(255,255,255,.04); border-radius:8px; margin-bottom:7px; }
#lp .fm-ni-ic { width:26px; height:26px; border-radius:6px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
#lp .fm-ni-ic svg { width:12px; height:12px; }
#lp .fm-ni-t { font-size:.75rem; color:rgba(255,255,255,.65); line-height:1.5; }
#lp .fm-ni-tm { font-size:.62rem; color:rgba(255,255,255,.26); margin-top:2px; }
#lp .fm-sk { display:flex; align-items:center; gap:9px; padding:9px 11px; background:rgba(255,255,255,.04); border-radius:8px; margin-bottom:6px; }
#lp .fm-sk-av { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:700; color:#fff; flex-shrink:0; }
#lp .fm-sk-n { font-size:.78rem; color:rgba(255,255,255,.78); font-weight:500; }
#lp .fm-sk-r { font-size:.67rem; color:rgba(255,255,255,.3); }
#lp .fm-sk-s { margin-left:auto; font-size:.62rem; font-weight:700; padding:2px 7px; border-radius:100px; }
#lp .fm-act { display:flex; align-items:flex-start; gap:8px; margin-bottom:11px; }
#lp .fm-act-av { width:22px; height:22px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:.52rem; font-weight:700; color:#fff; }
#lp .fm-act-t { font-size:.75rem; color:rgba(255,255,255,.62); line-height:1.55; }
#lp .fm-act-t strong { color:rgba(255,255,255,.84); font-weight:600; }
#lp .fm-act-tm { font-size:.62rem; color:rgba(255,255,255,.26); margin-top:2px; }
#lp .fm-stats { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:12px; }
#lp .fm-stat { background:rgba(255,255,255,.05); border-radius:8px; padding:11px; }
#lp .fm-stat-n { font-family:var(--fd); font-size:1.35rem; font-weight:800; color:var(--gl); }
#lp .fm-stat-l { font-size:.66rem; color:rgba(255,255,255,.33); margin-top:2px; }
#lp .fm-bar-row { margin-top:10px; }
#lp .fm-bar-lbl { display:flex; justify-content:space-between; font-size:.66rem; color:rgba(255,255,255,.38); margin-bottom:4px; }
#lp .fm-bar-track { height:5px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; }
#lp .fm-bar-fill { height:100%; border-radius:3px; background:var(--g); }
@media(max-width:900px){ #lp .feat-grid{grid-template-columns:1fr} #lp .feat-display{position:relative;top:0} #lp .feat-tabs{flex-direction:row;overflow-x:auto;gap:7px;padding-bottom:4px} #lp .ftab{min-width:auto;flex-shrink:0} }

/* INTEGRATIONS */
#lintegrations { background:var(--dk); padding:120px 0; position:relative; overflow:hidden; }
#lp .integ-glow { position:absolute; width:700px; height:700px; background:radial-gradient(circle,rgba(34,197,94,.06) 0%,transparent 65%); border-radius:50%; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
#lp .integ-hdr { text-align:center; position:relative; z-index:1; }
#lp .integ-hdr .stitle { color:#fff; }
#lp .integ-hdr .ssub { color:rgba(255,255,255,.44); margin:14px auto 0; }
#lp .eco-wrap { position:relative; width:480px; height:480px; margin:60px auto 0; }
#lp .eco-ring { position:absolute; top:50%; left:50%; border-radius:50%; border:1px solid rgba(255,255,255,.06); transform:translate(-50%,-50%); }
#lp .eco-ring-1 { width:180px; height:180px; }
#lp .eco-ring-2 { width:340px; height:340px; }
#lp .eco-ring-3 { width:460px; height:460px; border-style:dashed; border-color:rgba(255,255,255,.035); animation:lp-spin 70s linear infinite; }
@keyframes lp-spin { to{transform:translate(-50%,-50%) rotate(360deg)} }
#lp .eco-center { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:66px; height:66px; background:var(--g); border-radius:16px; display:flex; align-items:center; justify-content:center; z-index:5; box-shadow:0 0 36px rgba(34,197,94,.45); }
#lp .eco-center svg { width:30px; height:30px; color:#fff; }
#lp .eco-svg { position:absolute; inset:0; pointer-events:none; z-index:2; width:100%; height:100%; }
#lp .eco-conn { stroke:rgba(34,197,94,.22); stroke-width:1.5; stroke-dasharray:5 4; animation:lp-flow 3s linear infinite; fill:none; }
#lp .eco-conn:nth-child(2){ animation-delay:-1s; }
#lp .eco-conn:nth-child(3){ animation-delay:-2s; }
@keyframes lp-flow { to{stroke-dashoffset:-36} }
#lp .eco-node { position:absolute; transform:translate(-50%,-50%); z-index:4; }
#lp .eco-node-hs { top:10%; left:50%; }
#lp .eco-node-sf { top:78%; left:17%; }
#lp .eco-node-sl { top:78%; left:83%; }
#lp .eco-card { display:flex; align-items:center; gap:10px; padding:11px 15px; background:rgba(255,255,255,.07); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.1); border-radius:12px; transition:all .3s var(--spring); cursor:default; white-space:nowrap; }
#lp .eco-card:hover { background:rgba(255,255,255,.11); border-color:rgba(34,197,94,.3); transform:translateY(-4px) scale(1.02); box-shadow:0 8px 28px rgba(0,0,0,.35); }
#lp .eco-logo { width:32px; height:32px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:.68rem; color:#fff; flex-shrink:0; }
#lp .eco-logo-hs { background:#ff7a59; }
#lp .eco-logo-sf { background:#00a1e0; }
#lp .eco-logo-sl { background:#4a154b; }
#lp .eco-nm { font-family:var(--fd); font-size:.78rem; font-weight:700; color:rgba(255,255,255,.88); }
#lp .eco-sb { font-size:.64rem; color:rgba(255,255,255,.3); margin-top:1px; }
#lp .integ-copy { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:60px; position:relative; z-index:1; }
#lp .integ-item { text-align:center; padding:24px; background:var(--glass); border:1px solid var(--glassb); border-radius:14px; }
#lp .integ-item-t { font-family:var(--fd); font-size:.88rem; font-weight:700; color:rgba(255,255,255,.85); margin-bottom:6px; }
#lp .integ-item-d { font-size:.8rem; color:rgba(255,255,255,.38); line-height:1.65; }
@media(max-width:700px){ #lp .eco-wrap{width:320px;height:320px} #lp .integ-copy{grid-template-columns:1fr} }

/* TESTIMONIALS */
#ltestimonials { background:#f7f8fc; padding:120px 0; overflow:hidden; }
#lp .test-inner { max-width:840px; margin:0 auto; text-align:center; }
#lp .test-qm { font-family:Georgia,serif; font-size:6.5rem; line-height:.4; color:var(--g); opacity:.22; display:block; margin-bottom:20px; }
#lp .test-track { overflow:hidden; }
#lp .test-slides { display:flex; transition:transform .7s var(--ease); }
#lp .test-slide { min-width:100%; padding:0 12px; }
#lp .test-quote { font-family:Georgia,'Times New Roman',serif; font-size:clamp(1.15rem,2.1vw,1.55rem); line-height:1.65; color:var(--dk2); font-style:italic; margin-bottom:26px; }
#lp .test-author { display:flex; align-items:center; justify-content:center; gap:12px; }
#lp .test-av { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.78rem; flex-shrink:0; }
#lp .test-av-1 { background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; }
#lp .test-av-2 { background:linear-gradient(135deg,#0891b2,#0e7490); color:#fff; }
#lp .test-av-3 { background:linear-gradient(135deg,#be185d,#9d174d); color:#fff; }
#lp .test-nm { font-family:var(--fd); font-size:.88rem; font-weight:700; color:var(--dk2); text-align:left; }
#lp .test-rl { font-size:.76rem; color:var(--gr); text-align:left; margin-top:2px; }
#lp .test-dots { display:flex; justify-content:center; gap:7px; margin-top:32px; }
#lp .tdot { width:6px; height:6px; border-radius:3px; background:#d1d5db; cursor:pointer; transition:all .3s; }
#lp .tdot.active { width:22px; background:var(--g); }

/* CTA */
#lcta { background:var(--dk); padding:120px 0; text-align:center; position:relative; overflow:hidden; }
#lp .cta-glow { position:absolute; width:900px; height:400px; background:radial-gradient(ellipse,rgba(34,197,94,.1) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
#lp .cta-hl { font-family:var(--fd); font-size:clamp(1.9rem,4.2vw,3.3rem); font-weight:800; letter-spacing:-2px; line-height:1.07; color:#fff; max-width:640px; margin:14px auto 18px; position:relative; z-index:1; }
#lp .cta-sub { color:rgba(255,255,255,.45); font-size:.97rem; line-height:1.78; max-width:420px; margin:0 auto 38px; position:relative; z-index:1; }
#lp .cta-form { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }
#lp .cta-inp { padding:13px 22px; border-radius:100px; background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.14); color:#fff; font-size:.9rem; font-family:var(--fb); width:265px; outline:none; transition:all .2s; }
#lp .cta-inp::placeholder { color:rgba(255,255,255,.3); }
#lp .cta-inp:focus { border-color:var(--g); background:rgba(255,255,255,.1); }
#lp .cta-urg { margin-top:16px; font-size:.76rem; color:rgba(255,255,255,.26); position:relative; z-index:1; }
#lp .cta-urg em { color:var(--gl); font-style:normal; font-weight:600; }
@media(max-width:560px){ #lp .cta-form{flex-direction:column;align-items:center} #lp .cta-inp{width:100%;max-width:300px} }

/* FOOTER */
#lfooter { background:#04060b; padding:54px 0 34px; border-top:1px solid rgba(255,255,255,.05); }
#lp .footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:36px; margin-bottom:40px; }
#lp .fbrand .logo { display:inline-block; margin-bottom:12px; }
#lp .fbrand p { font-size:.8rem; color:rgba(255,255,255,.28); line-height:1.78; max-width:210px; }
#lp .fcol h4 { font-family:var(--fd); font-size:.68rem; font-weight:700; color:rgba(255,255,255,.35); text-transform:uppercase; letter-spacing:2px; margin-bottom:14px; }
#lp .fcol ul { list-style:none; display:flex; flex-direction:column; gap:9px; padding:0; }
#lp .fcol a { font-size:.8rem; color:rgba(255,255,255,.32); transition:color .2s; }
#lp .fcol a:hover { color:rgba(255,255,255,.72); }
#lp .footer-btm { display:flex; align-items:center; justify-content:space-between; padding-top:22px; border-top:1px solid rgba(255,255,255,.05); }
#lp .footer-copy { font-size:.76rem; color:rgba(255,255,255,.2); }
#lp .footer-socs { display:flex; gap:10px; }
#lp .fsoc { width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.32); transition:all .2s; }
#lp .fsoc:hover { border-color:var(--g); color:var(--g); }
#lp .fsoc svg { width:14px; height:14px; }
@media(max-width:768px){ #lp .footer-grid{grid-template-columns:1fr 1fr} }
@media(max-width:460px){ #lp .footer-grid{grid-template-columns:1fr} #lp .footer-btm{flex-direction:column;gap:12px;text-align:center} }
`;

const FEATURES = [
  {
    id: "p1", label: "Shared Deal Timeline", desc: "Visual plan both sides can track",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Deal Timeline — Acme Corp</div>
        <div className="fm-ph"><div className="fm-ph-name">Phase 1 — Discovery</div>
          <div className="fm-row"><div className="fmt-dot c"></div><div className="fmt-n">Requirements gathered</div><div className="fmt-d">Mar 4</div></div>
          <div className="fm-row"><div className="fmt-dot c"></div><div className="fmt-n">Security questionnaire</div><div className="fmt-d">Mar 9</div></div>
        </div>
        <div className="fm-ph"><div className="fm-ph-name">Phase 2 — Evaluation</div>
          <div className="fm-row"><div className="fmt-dot a"></div><div className="fmt-n">Live demo session</div><div className="fmt-d">Mar 14</div></div>
          <div className="fm-row"><div className="fmt-dot p"></div><div className="fmt-n">Internal champion review</div><div className="fmt-d">Mar 21</div></div>
        </div>
        <div className="fm-ph"><div className="fm-ph-name">Phase 3 — Decision</div>
          <div className="fm-row"><div className="fmt-dot p"></div><div className="fmt-n">Procurement review</div><div className="fmt-d">Mar 25</div></div>
          <div className="fm-row"><div className="fmt-dot p"></div><div className="fmt-n">Contract execution</div><div className="fmt-d">Mar 28</div></div>
        </div>
      </div>
    ),
  },
  {
    id: "p2", label: "Task Ownership", desc: "Every task has a clear owner",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <polyline points="23 11 17 17 14 14"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Task Ownership</div>
        {[["Discovery call notes shared","op-prov","Provider"],["Security questionnaire","op-joint","Joint"],["Schedule live demo","op-prov","Provider"],["Internal champion sign-off","op-cli","Client"],["Procurement approval","op-cli","Client"],["Contract redlines","op-joint","Joint"]].map(([name,cls,lbl])=>(
          <div className="fm-own-r" key={name}><div className="fmt-n" style={{flex:1}}>{name}</div><span className={`op ${cls}`}>{lbl}</span></div>
        ))}
      </div>
    ),
  },
  {
    id: "p3", label: "Automated Nudges", desc: "Smart reminders keep deals moving",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Automated Reminders</div>
        <div className="fm-ni"><div className="fm-ni-ic" style={{background:"rgba(245,158,11,.15)"}}><svg viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth={2.5}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></div><div><div className="fm-ni-t">Reminder sent to Sarah Kim — task due in 2 days</div><div className="fm-ni-tm">Today at 9:00 AM</div></div></div>
        <div className="fm-ni"><div className="fm-ni-ic" style={{background:"rgba(34,197,94,.12)"}}><svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></div><div><div className="fm-ni-t">Marcus Reed completed &ldquo;Requirements doc&rdquo;</div><div className="fm-ni-tm">Yesterday at 2:34 PM</div></div></div>
        <div className="fm-ni"><div className="fm-ni-ic" style={{background:"rgba(239,68,68,.12)"}}><svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div><div className="fm-ni-t">At-risk: &ldquo;Procurement review&rdquo; is 5 days overdue</div><div className="fm-ni-tm">Mar 20 at 8:00 AM</div></div></div>
      </div>
    ),
  },
  {
    id: "p4", label: "Stakeholder Mapping", desc: "Know every decision-maker",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Stakeholder Map — Acme Corp</div>
        <div className="fm-sk"><div className="fm-sk-av" style={{background:"#4f46e5"}}>SK</div><div><div className="fm-sk-n">Sarah Kim</div><div className="fm-sk-r">VP Engineering · Champion</div></div><span className="fm-sk-s" style={{background:"rgba(34,197,94,.12)",color:"#4ade80"}}>Active</span></div>
        <div className="fm-sk"><div className="fm-sk-av" style={{background:"#0891b2"}}>MR</div><div><div className="fm-sk-n">Marcus Reed</div><div className="fm-sk-r">CTO · Economic Buyer</div></div><span className="fm-sk-s" style={{background:"rgba(245,158,11,.12)",color:"#fcd34d"}}>Evaluating</span></div>
        <div className="fm-sk"><div className="fm-sk-av" style={{background:"#be185d"}}>LT</div><div><div className="fm-sk-n">Lisa Torres</div><div className="fm-sk-r">Legal · Blocker</div></div><span className="fm-sk-s" style={{background:"rgba(239,68,68,.12)",color:"#f87171"}}>Not engaged</span></div>
      </div>
    ),
  },
  {
    id: "p5", label: "Activity & Engagement", desc: "See who's engaged and when",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Activity Feed</div>
        <div className="fm-act"><div className="fm-act-av" style={{background:"#4ade80",color:"#052e16"}}>SK</div><div><div className="fm-act-t"><strong>Sarah Kim</strong> marked &ldquo;Security review&rdquo; complete</div><div className="fm-act-tm">2 minutes ago</div></div></div>
        <div className="fm-act"><div className="fm-act-av" style={{background:"#6366f1"}}>You</div><div><div className="fm-act-t"><strong>You</strong> added task: &ldquo;Pilot environment setup&rdquo;</div><div className="fm-act-tm">1 hour ago</div></div></div>
        <div className="fm-act"><div className="fm-act-av" style={{background:"#0891b2"}}>MR</div><div><div className="fm-act-t"><strong>Marcus Reed</strong> viewed the MAP — spent 4 minutes</div><div className="fm-act-tm">Today, 10:22 AM</div></div></div>
        <div className="fm-act"><div className="fm-act-av" style={{background:"#6366f1"}}>You</div><div><div className="fm-act-t"><strong>You</strong> sent share link to <strong>lisa@acme.com</strong></div><div className="fm-act-tm">Yesterday, 3:15 PM</div></div></div>
      </div>
    ),
  },
  {
    id: "p6", label: "Manager Dashboard", desc: "Pipeline visibility at a glance",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    panel: (
      <div>
        <div className="fm-lbl">Pipeline Dashboard</div>
        <div className="fm-stats">
          <div className="fm-stat"><div className="fm-stat-n">12</div><div className="fm-stat-l">Active MAPs</div></div>
          <div className="fm-stat"><div className="fm-stat-n">$2.4M</div><div className="fm-stat-l">Pipeline value</div></div>
          <div className="fm-stat"><div className="fm-stat-n">3</div><div className="fm-stat-l">At-risk deals</div></div>
          <div className="fm-stat"><div className="fm-stat-n">78%</div><div className="fm-stat-l">Avg completion</div></div>
        </div>
        {[["Acme Corp","78%","78%","var(--g)"],["TechStart Inc","45%","45%","#f59e0b"],["Global Logistics","92%","92%","var(--g)"]].map(([name,pct,w,c])=>(
          <div className="fm-bar-row" key={name} style={{marginTop:"8px"}}>
            <div className="fm-bar-lbl"><span>{name}</span><span>{pct}</span></div>
            <div className="fm-bar-track"><div className="fm-bar-fill" style={{width:w,background:c}}></div></div>
          </div>
        ))}
      </div>
    ),
  },
];

const TESTIMONIALS = [
  { av:"SL", avClass:"test-av-1", quote:"We used to lose deals in the gap between the demo and the decision. MAP killed that gap. Our buyers now feel like partners in the process, not targets.", name:"Sarah L.", role:"VP of Sales · Series B SaaS Company" },
  { av:"MR", avClass:"test-av-2", quote:"Our forecast accuracy went from a guess to a real number. When buyers are actively updating tasks in the MAP, you know a deal is real. When they go silent, you know early enough to do something about it.", name:"Marcus R.", role:"CRO · Enterprise Software Firm" },
  { av:"AK", avClass:"test-av-3", quote:"I was skeptical another tool would help. But MAP doesn't replace anything — it fills the gap that no CRM was ever designed to fill. The space between you and your buyer.", name:"Ariana K.", role:"Revenue Operations Lead · B2B Services" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("p1");
  const [slide, setSlide] = useState(0);
  const [ctaDone, setCtaDone] = useState(false);

  // Testimonial auto-rotate
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  // All vanilla-JS interactivity
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // ── Nav scroll ──
    const nav = document.getElementById("lnav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // ── Cursor glow ──
    const cglow = document.getElementById("cglow") as HTMLElement | null;
    const hero  = document.getElementById("lhero") as HTMLElement | null;
    if (hero && cglow) {
      const onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        cglow.style.opacity = "1";
        cglow.style.left = e.clientX - r.left + "px";
        cglow.style.top  = e.clientY - r.top  + "px";
      };
      const onLeave = () => { cglow.style.opacity = "0"; };
      hero.addEventListener("mousemove", onMove as EventListener);
      hero.addEventListener("mouseleave", onLeave);
      cleanups.push(() => { hero.removeEventListener("mousemove", onMove as EventListener); hero.removeEventListener("mouseleave", onLeave); });
    }

    // ── Card tilt ──
    const card = document.getElementById("mapCard") as HTMLElement | null;
    if (card) {
      const onTilt = (e: MouseEvent) => {
        const r  = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top  - r.height/2) / (r.height/2)) * -5;
        const ry = ((e.clientX - r.left - r.width/2)  / (r.width/2))  *  5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const onReset = () => { card.style.transform = ""; };
      card.addEventListener("mousemove", onTilt as EventListener);
      card.addEventListener("mouseleave", onReset);
      cleanups.push(() => { card.removeEventListener("mousemove", onTilt as EventListener); card.removeEventListener("mouseleave", onReset); });
    }

    // ── Scroll reveals ──
    const reveals = document.querySelectorAll("#lp .rev, #lp .rev-l, #lp .rev-r");
    const revObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); revObs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    reveals.forEach(el => revObs.observe(el));
    cleanups.push(() => revObs.disconnect());

    // ── Before/After slider ──
    const baWrap   = document.getElementById("baWrap")   as HTMLElement | null;
    const baBefore = document.getElementById("baBefore") as HTMLElement | null;
    const baHandle = document.getElementById("baHandle") as HTMLElement | null;
    if (baWrap && baBefore && baHandle) {
      let dragging = false;
      const setPos = (pct: number) => {
        pct = Math.max(5, Math.min(95, pct));
        baBefore.style.clipPath = `inset(0 ${(100-pct).toFixed(1)}% 0 0)`;
        baHandle.style.left    = pct + "%";
      };
      // Auto-animate on first view
      const baObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        baObs.disconnect();
        let start: number | null = null;
        const animate = (ts: number) => {
          if (!start) start = ts;
          const t = Math.min((ts - start) / 1800, 1);
          setPos(95 + (65 - 95) * (1 - Math.pow(1-t, 4)));
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }, { threshold: 0.3 });
      baObs.observe(baWrap);
      cleanups.push(() => baObs.disconnect());

      const getX = (e: MouseEvent | TouchEvent) => "touches" in e ? e.touches[0].clientX : e.clientX;
      const onDown = () => { dragging = true; };
      const onMove = (e: MouseEvent | TouchEvent) => {
        if (!dragging) return;
        const r = baWrap.getBoundingClientRect();
        setPos(((getX(e) - r.left) / r.width) * 100);
      };
      const onUp = () => { dragging = false; };
      baWrap.addEventListener("mousedown", onDown);
      baWrap.addEventListener("touchstart", onDown, { passive: true });
      window.addEventListener("mousemove", onMove as EventListener, { passive: true });
      window.addEventListener("touchmove", onMove as EventListener, { passive: true });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);
      cleanups.push(() => {
        baWrap.removeEventListener("mousedown", onDown);
        baWrap.removeEventListener("touchstart", onDown);
        window.removeEventListener("mousemove", onMove as EventListener);
        window.removeEventListener("touchmove", onMove as EventListener);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchend", onUp);
      });
    }

    // ── Metric counters ──
    const counters = document.querySelectorAll<HTMLElement>(".metric-num[data-target]");
    const cntObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        cntObs.unobserve(e.target);
        const el      = e.target as HTMLElement;
        const target  = parseFloat(el.dataset.target!);
        const decimal = el.dataset.decimal || "";
        let start: number | null = null;
        const step = (ts: number) => {
          if (!start) start = ts;
          const t   = Math.min((ts - start) / 1800, 1);
          const val = target * (1 - Math.pow(1-t, 3));
          el.textContent = decimal ? (Math.floor(val) + decimal) : String(Math.round(val));
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = decimal ? target + decimal : String(target);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cntObs.observe(el));
    cleanups.push(() => cntObs.disconnect());

    // ── How It Works line + steps ──
    const howLine  = document.getElementById("howLine");
    const howSteps = document.querySelectorAll("#lp .how-step");
    const howObs   = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("on"); });
    }, { threshold: 0.2 });
    howSteps.forEach(s => howObs.observe(s));
    cleanups.push(() => howObs.disconnect());
    const lineObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { howLine?.classList.add("on"); lineObs.disconnect(); }
    }, { threshold: 0.1 });
    if (howLine) lineObs.observe(howLine);
    cleanups.push(() => lineObs.disconnect());

    // ── MAP demo animation ──
    const prog  = document.getElementById("progFill") as HTMLElement | null;
    const notif = document.getElementById("demoNotif") as HTMLElement | null;
    const tasks = [
      { chk:"chk3", nm:"tn3", prog:60 },
      { chk:"chk4", nm:"tn4", prog:80 },
      { chk:"chk5", nm:"tn5", prog:100 },
    ];
    let demoStep = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (prog) setTimeout(() => { prog.style.width = "40%"; }, 600);

    function runDemo() {
      if (demoStep >= tasks.length) {
        timers.push(setTimeout(() => {
          tasks.forEach(t => {
            const c = document.getElementById(t.chk);
            const n = document.getElementById(t.nm);
            c?.classList.remove("done", "active");
            n?.classList.remove("done");
          });
          const c3 = document.getElementById("chk3"); const n3 = document.getElementById("tn3");
          c3?.classList.add("active"); if (n3) n3.classList.remove("done");
          if (prog) prog.style.width = "40%";
          notif?.classList.remove("show");
          demoStep = 0;
          timers.push(setTimeout(runDemo, 2000));
        }, 2500));
        return;
      }
      const t = tasks[demoStep];
      const chk = document.getElementById(t.chk); const nm = document.getElementById(t.nm);
      chk?.classList.remove("active"); chk?.classList.add("done");
      nm?.classList.add("done");
      if (prog) prog.style.width = t.prog + "%";
      const nextChk = demoStep + 1 < tasks.length ? document.getElementById(tasks[demoStep+1].chk) : null;
      nextChk?.classList.remove("done"); nextChk?.classList.add("active");
      notif?.classList.add("show");
      timers.push(setTimeout(() => notif?.classList.remove("show"), 2200));
      demoStep++;
      timers.push(setTimeout(runDemo, 3000));
    }
    timers.push(setTimeout(runDemo, 2500));
    cleanups.push(() => timers.forEach(clearTimeout));

    return () => cleanups.forEach(fn => fn());
  }, []);

  const handleCTA = (e: React.FormEvent) => {
    e.preventDefault();
    setCtaDone(true);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div id="lp">

        {/* ── NAV ── */}
        <nav id="lnav">
          <div className="nav-i con">
            <a href="#lp" className="logo">MAP<em>.</em></a>
            <ul className="nav-links">
              <li><a href="#lproblem">The Problem</a></li>
              <li><a href="#lhow">How It Works</a></li>
              <li><a href="#lfeatures">Features</a></li>
              <li><a href="#lintegrations">Integrations</a></li>
            </ul>
            <div className="nav-r">
              <Link href="/sign-up" className="btn btn-g">Get Early Access</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section id="lhero">
          <div id="cglow"></div>
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="con">
            <div className="hero-grid">
              {/* Left */}
              <div>
                <div className="hero-badge"><span className="bdot"></span>Now in Early Access</div>
                <h1>Turn every buyer<br />into a <span className="h1-mark">partner</span>.</h1>
                <p className="hero-sub">A shared Mutual Action Plan keeps you and your buyer aligned on every step — from first call to signed contract. No more radio silence. No more surprises.</p>
                <div className="hero-ctas">
                  <Link href="/sign-up" className="btn btn-g">Start Closing Faster →</Link>
                  <a href="#lhow" className="btn btn-o">See How It Works</a>
                </div>
                <div className="hero-benefits">
                  {[
                    ["47% faster", "time-to-close"],
                    ["3× more", "touchpoints"],
                    ["31% higher", "win rates"],
                  ].map(([num, label]) => (
                    <div className="hb-item" key={label}>
                      <div className="hb-ic">
                        <svg viewBox="0 0 10 10" fill="none" stroke="#4ade80" strokeWidth={2}><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>
                      </div>
                      <span><strong>{num}</strong> {label}</span>
                    </div>
                  ))}
                </div>
                <div className="hero-proof">
                  <div className="pavs">
                    <div className="pav pav-a">SL</div>
                    <div className="pav pav-b">MR</div>
                    <div className="pav pav-c">AK</div>
                    <div className="pav pav-d">JT</div>
                  </div>
                  <span>Trusted by 200+ sales teams in early access</span>
                </div>
              </div>

              {/* Right: MAP demo */}
              <div className="map-demo">
                <div className="map-card" id="mapCard">
                  <div className="mc-hdr">
                    <span className="mc-title">Acme Corp — Enterprise Deal</span>
                    <span className="mc-phase">Proposal Phase</span>
                  </div>
                  <div className="mc-prog-track"><div className="mc-prog-fill" id="progFill"></div></div>
                  <div className="mc-tasks">
                    {[
                      { id:"t1", chk:"chk1", nm:"tn1", name:"Discovery call & requirements", meta:"Completed Mar 4", done:true, op:"op-prov", oplbl:"Provider" },
                      { id:"t2", chk:"chk2", nm:"tn2", name:"Security questionnaire shared", meta:"Completed Mar 9", done:true, op:"op-joint", oplbl:"Joint" },
                      { id:"t3", chk:"chk3", nm:"tn3", name:"Live demo & Q&A session", meta:"Due Mar 14 · In progress", done:false, active:true, op:"op-prov", oplbl:"Provider" },
                      { id:"t4", chk:"chk4", nm:"tn4", name:"Internal champion review", meta:"Due Mar 21", done:false, op:"op-cli", oplbl:"Client" },
                      { id:"t5", chk:"chk5", nm:"tn5", name:"Contract & pricing review", meta:"Due Mar 28", done:false, op:"op-joint", oplbl:"Joint" },
                    ].map(t => (
                      <div className="mct" key={t.id} id={t.id}>
                        <div className={`mct-chk${t.done?" done":""}${"active" in t && t.active?" active":""}`} id={t.chk}></div>
                        <div className="mct-info">
                          <div className={`mct-name${t.done?" done":""}`} id={t.nm}>{t.name}</div>
                          <div className="mct-meta">{t.meta}</div>
                        </div>
                        <span className={`op ${t.op}`}>{t.oplbl}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mc-foot">
                    <div className="mc-avs">
                      <div className="mc-av mc-av-y">You</div>
                      <div className="mc-av mc-av-t">SK</div>
                    </div>
                    <span style={{fontSize:".7rem",color:"rgba(255,255,255,.32)"}}>Sarah Kim · buyer</span>
                    <div className="mc-live"><span className="mc-ldot"></span>Live</div>
                  </div>
                </div>
                <div className="demo-notif" id="demoNotif">
                  <div className="dn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth={2.5} width={13} height={13}><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div className="dn-t">Task completed!</div>
                    <div className="dn-s">Sarah marked the demo done</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave: hero → problem */}
        <div className="wave-wrap" style={{background:"#090b10"}}>
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" height={70} xmlns="http://www.w3.org/2000/svg">
            <path d="M0,0 C360,70 1080,0 1440,50 L1440,70 L0,70 Z" fill="#f7f8fc"/>
          </svg>
        </div>

        {/* ── PROBLEM ── */}
        <section id="lproblem">
          <div className="con">
            <div className="prob-hdr rev">
              <span className="slabel slabel-g">The Problem</span>
              <h2 className="stitle">Your deals are stalling.<br />Here&rsquo;s why.</h2>
              <p className="ssub">Without a shared plan, buyers go quiet, managers fly blind, and deals slip. Drag the divider.</p>
            </div>
          </div>
          <div className="con">
            <div className="ba-wrap" id="baWrap">
              <div className="ba-side ba-before" id="baBefore">
                <div className="ba-tag">← Without MAP</div>
                <h3 className="ba-h">Chaos, silence,<br />lost momentum.</h3>
                <ul className="ba-list">
                  {["No shared next steps — buyers disappear for weeks","Reps can't see what's actually blocking the deal","Managers guess on pipeline health and forecast","Buyers forget what they committed to","Late-stage surprises kill deals that should close"].map(s => (
                    <li key={s}><span className="ba-dot"></span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="ba-side ba-after">
                <div className="ba-tag">With MAP →</div>
                <h3 className="ba-h">Aligned. Accountable.<br />Moving forward.</h3>
                <ul className="ba-list">
                  {["Shared timeline both sides can see and update","Every task has a clear owner and due date","Managers see deal health at a glance — no guessing","Auto-reminders nudge buyers before tasks slip","Mutual commitment accelerates decisions"].map(s => (
                    <li key={s}><span className="ba-dot"></span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="ba-handle" id="baHandle">
                <div className="ba-knob">
                  <div className="ba-arr arr-l"></div>
                  <div className="ba-arr arr-r"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wave: problem → metrics */}
        <div className="wave-wrap" style={{background:"#f7f8fc"}}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60} xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C480,0 960,60 1440,20 L1440,60 L0,60 Z" fill="#111827"/>
          </svg>
        </div>

        {/* ── METRICS ── */}
        <section id="lmetrics">
          <div className="con">
            <div className="metrics-row">
              <div className="metric rev d1">
                <div><span className="metric-num" data-target="47">0</span><span className="metric-sfx">%</span></div>
                <div className="metric-lbl"><b>Faster deal cycles</b><br />Average reduction in time-to-close</div>
              </div>
              <div className="metric rev d2">
                <div><span className="metric-num" data-target="31">0</span><span className="metric-sfx">%</span></div>
                <div className="metric-lbl"><b>Higher close rates</b><br />More deals cross the finish line</div>
              </div>
              <div className="metric rev d3">
                <div><span className="metric-num" data-target="3" data-decimal=".2">0</span><span className="metric-sfx">x</span></div>
                <div className="metric-lbl"><b>More buyer touchpoints</b><br />MAP deals generate far more engagement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagonal: metrics → how */}
        <div style={{background:"#111827",height:0}}>
          <div style={{background:"#fff",clipPath:"polygon(0 0,100% 50px,100% 100%,0 100%)",height:"70px",marginTop:"-1px"}}></div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <section id="lhow">
          <div className="con">
            <div className="how-hdr rev">
              <span className="slabel slabel-g">How It Works</span>
              <h2 className="stitle">From first call<br />to closed deal.</h2>
              <p className="ssub" style={{textAlign:"left"}}>Three steps. One shared plan. Both sides finally on the same page.</p>
            </div>
            <div className="how-steps">
              <div className="how-vline" id="howLine"></div>
              {[
                { n:1, t:"Create", d:"Build a tailored MAP in seconds from your template. Set phases, tasks, owners, and due dates.", rows:[["done","done","sv-tag-p","Prov"],["","","sv-tag-c","Client"],["","s","sv-tag-p","Prov"]] },
                { n:2, t:"Collaborate", d:"Share a private link with your buyer — no login needed. Both sides update progress together in real time.", rows:[["done","done","sv-tag-c","Client"],["done","done s","sv-tag-p","Prov"],["","","sv-tag-c","Client"]] },
                { n:3, t:"Close", d:"Track progress, get alerts on at-risk milestones, and clear blockers before they kill the deal.", rows:[["done","done","sv-tag-p","Prov"],["done","done","sv-tag-c","Client"],["done","done s","sv-tag-p","Prov"]] },
              ].map(step => (
                <div className="how-step" key={step.n} id={`hs${step.n}`}>
                  <div className="step-num">{step.n}</div>
                  <div>
                    <div className="step-t">{step.t}</div>
                    <div className="step-d">{step.d}</div>
                  </div>
                  <div className="step-vis">
                    <div className="sv-bar"></div>
                    <div className="sv-body">
                      {step.rows.map(([c,l,tc,tl],i) => (
                        <div className="sv-row" key={i}>
                          <div className={`sv-c${c?" "+c:""}`}></div>
                          <div className={`sv-ln${l?" "+l:""}`}></div>
                          <span className={`sv-tag ${tc}`}>{tl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Angled: how → features */}
        <div style={{background:"#fff",height:0}}>
          <div style={{background:"#f7f8fc",clipPath:"polygon(0 50px,100% 0,100% 100%,0 100%)",height:"70px"}}></div>
        </div>

        {/* ── FEATURES ── */}
        <section id="lfeatures">
          <div className="con">
            <div className="rev">
              <span className="slabel slabel-g">Features</span>
              <h2 className="stitle">Everything you need<br />to run a tighter deal.</h2>
            </div>
            <div className="feat-grid">
              <div className="feat-tabs">
                {FEATURES.map(f => (
                  <div key={f.id} className={`ftab${activeTab===f.id?" active":""}`} onClick={()=>setActiveTab(f.id)}>
                    <div className="ftab-ic">{f.icon}</div>
                    <div><div className="ftab-tn">{f.label}</div><div className="ftab-td">{f.desc}</div></div>
                  </div>
                ))}
              </div>
              <div className="feat-display">
                {FEATURES.map(f => (
                  <div key={f.id} className={`fpanel${activeTab===f.id?" active":""}`}>
                    <div className="fmock">{f.panel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Wave: features → integrations */}
        <div className="wave-wrap" style={{background:"#f7f8fc"}}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60} xmlns="http://www.w3.org/2000/svg">
            <path d="M0,20 C400,60 1000,0 1440,40 L1440,60 L0,60 Z" fill="#090b10"/>
          </svg>
        </div>

        {/* ── INTEGRATIONS ── */}
        <section id="lintegrations">
          <div className="integ-glow"></div>
          <div className="con">
            <div className="integ-hdr rev">
              <span className="slabel slabel-gl">Integrations</span>
              <h2 className="stitle">Works with the tools<br />you already use.</h2>
              <p className="ssub">No new workflows. MAP slots into your existing stack and keeps everything in sync.</p>
            </div>
            <div className="eco-wrap rev">
              <svg className="eco-svg" viewBox="0 0 480 480" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <line className="eco-conn" x1="240" y1="240" x2="240" y2="88"/>
                <line className="eco-conn" x1="240" y1="240" x2="90" y2="348"/>
                <line className="eco-conn" x1="240" y1="240" x2="390" y2="348"/>
              </svg>
              <div className="eco-ring eco-ring-1"></div>
              <div className="eco-ring eco-ring-2"></div>
              <div className="eco-ring eco-ring-3"></div>
              <div className="eco-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} width={30} height={30}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div className="eco-node eco-node-hs">
                <div className="eco-card"><div className="eco-logo eco-logo-hs">HS</div><div><div className="eco-nm">HubSpot</div><div className="eco-sb">CRM sync</div></div></div>
              </div>
              <div className="eco-node eco-node-sf">
                <div className="eco-card"><div className="eco-logo eco-logo-sf">SF</div><div><div className="eco-nm">Salesforce</div><div className="eco-sb">Opportunity sync</div></div></div>
              </div>
              <div className="eco-node eco-node-sl">
                <div className="eco-card"><div className="eco-logo eco-logo-sl">Sl</div><div><div className="eco-nm">Slack</div><div className="eco-sb">Notifications</div></div></div>
              </div>
            </div>
            <div className="integ-copy rev">
              {[["Bidirectional CRM Sync","MAP milestones write back to your HubSpot or Salesforce deal stages automatically."],["Slack Notifications","Get alerts in your team channel the moment a buyer updates a task or goes quiet."],["Zero Workflow Disruption","No new logins for your buyers. One link, zero friction, full collaboration."]].map(([t,d])=>(
                <div className="integ-item" key={t}><div className="integ-item-t">{t}</div><div className="integ-item-d">{d}</div></div>
              ))}
            </div>
          </div>
        </section>

        {/* Wave: integrations → testimonials */}
        <div className="wave-wrap" style={{background:"#090b10"}}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60} xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C600,0 900,60 1440,10 L1440,60 Z" fill="#f7f8fc"/>
          </svg>
        </div>

        {/* ── TESTIMONIALS ── */}
        <section id="ltestimonials">
          <div className="con">
            <div className="test-inner">
              <div className="rev"><span className="slabel slabel-g">What Teams Are Saying</span></div>
              <span className="test-qm rev">&ldquo;</span>
              <div className="test-track">
                <div className="test-slides" style={{transform:`translateX(-${slide*100}%)`}}>
                  {TESTIMONIALS.map((t,i)=>(
                    <div className="test-slide" key={i}>
                      <p className="test-quote">&ldquo;{t.quote}&rdquo;</p>
                      <div className="test-author">
                        <div className={`test-av ${t.avClass}`}>{t.av}</div>
                        <div><div className="test-nm">{t.name}</div><div className="test-rl">{t.role}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="test-dots">
                {TESTIMONIALS.map((_,i)=>(
                  <div key={i} className={`tdot${slide===i?" active":""}`} onClick={()=>setSlide(i)}></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Diagonal: testimonials → CTA */}
        <div style={{background:"#f7f8fc",height:0}}>
          <div style={{background:"#090b10",clipPath:"polygon(0 0,100% 60px,100% 100%,0 100%)",height:"80px"}}></div>
        </div>

        {/* ── CTA ── */}
        <section id="lcta">
          <div className="cta-glow"></div>
          <div className="con">
            <div className="rev">
              <span className="slabel slabel-gl">Ready to close faster?</span>
              <h2 className="cta-hl">Your buyers want clarity.<br />Give it to them.</h2>
              <p className="cta-sub">Stop losing deals to silence and confusion. MAP gives both sides the shared accountability that turns conversations into contracts.</p>
              {ctaDone ? (
                <p style={{color:"#4ade80",fontFamily:"var(--fd)",fontSize:"1.1rem",fontWeight:700,position:"relative",zIndex:1}}>You&rsquo;re on the list! We&rsquo;ll be in touch soon.</p>
              ) : (
                <form className="cta-form" onSubmit={handleCTA}>
                  <input className="cta-inp" type="email" placeholder="your@company.com" required aria-label="Work email" />
                  <button type="submit" className="btn btn-g">Get Early Access →</button>
                </form>
              )}
              <div className="cta-urg"><em>Limited beta spots available.</em> &nbsp;No credit card required.</div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer id="lfooter">
          <div className="con">
            <div className="footer-grid">
              <div className="fbrand">
                <a href="#lp" className="logo">MAP<em>.</em></a>
                <p>Shared action plans that move deals from stalled to signed. Built for modern B2B sales teams.</p>
              </div>
              <div className="fcol">
                <h4>Product</h4>
                <ul>
                  <li><a href="#lfeatures">Features</a></li>
                  <li><a href="#lintegrations">Integrations</a></li>
                  <li><a href="#lhow">How It Works</a></li>
                  <li><a href="#lcta">Pricing</a></li>
                </ul>
              </div>
              <div className="fcol">
                <h4>Company</h4>
                <ul>
                  <li><a href="#">About</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
              <div className="fcol">
                <h4>Legal</h4>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Security</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-btm">
              <div className="footer-copy">&copy; 2025 MAP. All rights reserved.</div>
              <div className="footer-socs">
                {[
                  ["Twitter",<svg key="tw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>],
                  ["LinkedIn",<svg key="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>],
                ].map(([label, icon])=>(
                  <a href="#" key={label as string} className="fsoc" aria-label={label as string}>{icon}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
