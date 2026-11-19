/* =====================================================================
   Online Utility Hub — application core
   Modules: utils · settings · registry (categories + 20 tools) · UI shell
            router · pages · homepage · search · blog enhancer · init
   ===================================================================== */
(function(){
'use strict';
if(document.body&&document.body.id==='layout')return;
var D=document,W=window;

/* ---------- 1. UTILITIES ---------- */
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
function byId(id){return D.getElementById(id)}
var ESC_MAP={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return ESC_MAP[c]})}
function store(k,v){try{if(v===undefined){var x=localStorage.getItem(k);return x?JSON.parse(x):null}localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
function ico(id,cls){return '<svg class="ico'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#i-'+id+'"></use></svg>'}
function decodeEntities(t){if(t.indexOf('&')<0)return t;var ta=D.createElement('textarea');ta.innerHTML=t;return ta.value}
function readJSON(id,fb){var el=byId(id);if(!el)return fb;var t=decodeEntities((el.textContent||'').trim());if(!t)return fb;try{return JSON.parse(t)}catch(e){if(W.console)console.warn('FUH: invalid JSON in #'+id+', using defaults.');return fb}}
function merge(a,b){if(!b||typeof b!=='object')return a;Object.keys(b).forEach(function(k){var bv=b[k];if(bv&&typeof bv==='object'&&!Array.isArray(bv)&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))merge(a[k],bv);else a[k]=bv});return a}
function safeUrl(u){u=String(u||'').trim();return /^(https?:\/\/|mailto:|tel:|\/|#|\?|data:image\/)/i.test(u)?u:''}
function debounce(fn,ms){var t;return function(){var a=arguments,s=this;clearTimeout(t);t=setTimeout(function(){fn.apply(s,a)},ms||200)}}
function fmt(x,d){if(!isFinite(x))return '—';return Number(x).toLocaleString(undefined,{maximumFractionDigits:d==null?2:d})}
function bytes(n){return n<1024?n+' B':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(2)+' MB'}
function loadScript(src){return new Promise(function(res,rej){var ex=$('script[src="'+src+'"]');if(ex&&ex.getAttribute('data-ok')){res();return}var s=D.createElement('script');s.src=src;s.async=true;s.onload=function(){s.setAttribute('data-ok','1');res()};s.onerror=rej;D.head.appendChild(s)})}
function downloadBlob(blob,name){if(!blob){toast('Nothing to download yet','warn');return}var a=D.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;D.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},2000);toast('Download started','ok')}
function fallbackCopy(t){var ta=D.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';D.body.appendChild(ta);ta.select();try{D.execCommand('copy')}catch(e){}ta.remove()}
function copyText(t,msg){t=String(t||'').trim();if(!t){toast('Nothing to copy yet','warn');return}var done=function(){toast(msg||'Copied to clipboard','ok')};if(navigator.clipboard&&W.isSecureContext){navigator.clipboard.writeText(t).then(done,function(){fallbackCopy(t);done()})}else{fallbackCopy(t);done()}}
function toast(msg,type){var w=byId('toast-wrap');if(!w)return;var t=D.createElement('div');t.className='toast '+(type||'');t.setAttribute('role','status');t.innerHTML=ico(type==='err'?'alert':type==='warn'?'info':'check')+'<span>'+esc(msg)+'</span>';w.appendChild(t);while(w.children.length>3)w.removeChild(w.firstChild);setTimeout(function(){t.classList.add('out');setTimeout(function(){t.remove()},350)},2600)}
function crand(){var a=new Uint32Array(1);W.crypto.getRandomValues(a);return a[0]/4294967296}
function rndInt(max){var a=new Uint32Array(1),lim=Math.floor(4294967296/max)*max;do{W.crypto.getRandomValues(a)}while(a[0]>=lim);return a[0]%max}
function slugify(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

/* ---------- 2. SETTINGS (merged with Layout widget JSON) ---------- */
var DEFAULTS={siteName:'Online Utility Hub',tagline:'Free Online Multi Utility Tools for Everyday Tasks',logoText:'FUH',logoUrl:'',
heroBadge:'100% free · No signup · Runs in your browser',heroHeading:'Free Online Multi Utility Tools',heroHighlight:'for Everyday Tasks',
heroSubtitle:'Calculators, converters, image, text and developer tools that work instantly in your browser. Fast, private and free forever.',
heroImage:'',ctaPrimaryText:'Explore All Tools',ctaSecondaryText:'Read the Blog',ctaSecondaryUrl:'/search?max-results=9',
searchPlaceholder:'Search free tools... e.g. BMI, QR code, GST',popularSearches:['BMI Calculator','EMI Calculator','Password Generator','QR Code','Image Compressor','Word Counter'],
announcement:{enabled:false,text:'',linkText:'',url:''},holiday:{enabled:false,text:''},fonts:{heading:'Poppins',body:'Inter'},layout:{sidebar:'right'},usePageUrls:false,
sections:{hero:true,search:true,featured:true,categories:true,recent:true,trending:true,mostused:true,collections:true,why:true,stats:true,testimonials:true,faq:true,newsletter:true,blog:true,productivity:true,app:true,community:true,cta:true},
features:{darkMode:true,backToTop:true,whatsapp:true,telegram:true,floatingShare:true,cookieBanner:true,popup:false,loader:true,ads:false,adPlaceholders:true,bottomNav:true,infiniteScroll:false,readingProgress:true},
featuredTools:['bmi-calculator','emi-calculator','merge-pdf','password-generator','qr-code-generator','image-compressor','word-counter','gst-calculator'],
trendingTools:['merge-pdf','pdf-to-jpg','image-compressor','jpg-to-pdf','qr-code-generator','case-converter'],
toolIcons:{},categoryIcons:{},
stats:[{value:1000000,suffix:'+',label:'Happy Users'},{value:'auto',suffix:'',label:'Free Utility Tools'},{value:150,suffix:'+',label:'Countries'},{value:10000000,suffix:'+',label:'Calculations Done'},{value:100000,suffix:'+',label:'Files Converted'}],
social:{},whatsappNumber:'',telegramUrl:'',
contact:{email:'hello@onlineutilityhub.com',businessEmail:'partners@onlineutilityhub.com',phone:'',address:'',hours:'',mapEmbed:''},
author:{name:'Online Utility Hub Team',role:'Tools and productivity writers',bio:'We build free, privacy-first utility tools and write practical guides.',avatar:''},
newsletter:{title:'Get new tools in your inbox',text:'One short email when we launch something useful. No spam, unsubscribe anytime.',button:'Subscribe',action:'',field:'EMAIL'},
popup:{title:'Bookmark us for later',text:'Press Ctrl+D (Cmd+D on Mac) to save this site.',button:'Got it'},
cookieText:'We use cookies and local storage to remember your preferences (like dark mode) and, if enabled, to show ads.',
notFound:{title:'This page took a coffee break',text:'The page you are looking for does not exist or was moved.'},
footerAbout:'',legalUpdated:'September 1, 2026',adsenseClient:''};
var S=merge(JSON.parse(JSON.stringify(DEFAULTS)),readJSON('fuh-settings',{}));
var TESTI=readJSON('fuh-testimonials',[]);
var FAQS=readJSON('fuh-faq',[{q:'Are the tools free?',a:'Yes, every tool is free with no sign-up.'},{q:'Are my files uploaded?',a:'No. Everything runs in your browser.'}]);
if(!Array.isArray(TESTI))TESTI=[];if(!Array.isArray(FAQS))FAQS=[];
var HJ=readJSON('fuh-home',{})||{};
var PG=merge(JSON.parse(JSON.stringify({"useBloggerPagesFor": [], "about": {"title": "About {site}", "subtitle": "Free Online Multi Utility Tools for Everyday Tasks", "missionTitle": "Our mission", "mission": "Make everyday digital tasks effortless by giving everyone fast, beautiful and genuinely free tools that respect their privacy.", "visionTitle": "Our vision", "vision": "A web where simple utilities are instant, ad-light, accessible to everyone and never require an account or an upload.", "storyTitle": "Our story", "story": ["{site} started with a simple frustration: most free online tools are slow, cluttered, ask you to sign up, or quietly upload your files to a server. We wanted the opposite.", "So we built a toolbox where calculations, conversions and image processing happen right in your browser. No uploads, no waiting, no catch. Just open a tool and get your answer."], "timelineTitle": "Our journey", "timeline": [{"title": "The idea", "text": "A handful of calculators built for friends and colleagues."}, {"title": "Privacy-first rebuild", "text": "Every tool rewritten to run fully in the browser."}, {"title": "{tools} tools and growing", "text": "Calculators, converters, PDF, text, image, color and developer tools."}, {"title": "What is next", "text": "More converters, more PDF tools and a mobile app."}], "featuresTitle": "What makes us different", "features": ["Instant results that update as you type", "Your files and data never leave your device", "Clean, accessible design with dark mode", "Copy, download, print and share on every tool"], "achievementsEyebrow": "Achievements", "achievementsTitle": "By the numbers", "teamEyebrow": "Team", "teamTitle": "The people behind the tools", "teamText": "A small team that loves building useful things.", "team": [{"name": "Alex Morgan", "role": "Founder and Product", "photo": "", "bio": "Turns everyday annoyances into simple tools.", "link": ""}, {"name": "Riya Patel", "role": "Lead Engineer", "photo": "", "bio": "Makes every tool fast, private and reliable.", "link": ""}, {"name": "Sam Lee", "role": "Design", "photo": "", "bio": "Designs clean interfaces that just work.", "link": ""}, {"name": "Jordan Diaz", "role": "Content and SEO", "photo": "", "bio": "Writes the guides that help you get more done.", "link": ""}]}, "contact": {"title": "Contact Us", "subtitle": "Questions, ideas or partnership requests? We would love to hear from you.", "formTitle": "Send us a message", "button": "Send message", "formNote": "Sending opens your email app with the message ready to go.", "infoTitle": "Get in touch"}})),readJSON('fuh-pages',{})||{});
function tpl(t){return String(t==null?'':t).replace(/\{site\}/g,S.siteName).replace(/\{tools\}/g,String(typeof TOOLS!=='undefined'?TOOLS.length:''))}
var HOME=location.origin+'/';

/* ---------- 3. REGISTRY: CATEGORIES ---------- */
var CATS=[
{id:'calculators',name:'Calculators',icon:'calc',desc:'Everyday math made instant: age, BMI, percentages and a full calculator.'},
{id:'finance',name:'Finance Tools',icon:'finance',desc:'Plan loans, taxes and currency conversions with clear, accurate numbers.'},
{id:'text',name:'Text Tools',icon:'text',desc:'Count, clean and transform text in a single click.'},
{id:'image',name:'Image Tools',icon:'image',desc:'Compress and convert images privately, right in your browser.'},
{id:'developer',name:'Developer Tools',icon:'code',desc:'Encoders, generators and handy utilities for builders.'},
{id:'color',name:'Color Tools',icon:'color',desc:'Pick colors, convert formats and generate beautiful palettes.'},
{id:'converters',name:'Converters',icon:'swap',desc:'Convert units, currencies, cases, encodings and image formats.'},
{id:'pdf',name:'PDF Tools',icon:'pdf',desc:'Merge, split, rotate, number, watermark and convert PDFs privately in your browser.'},
{id:'productivity',name:'Productivity Tools',icon:'zap',desc:'Small helpers that save you minutes every single day.'},
{id:'utility',name:'Utility Tools',icon:'grid',desc:'Handy generators and everyday utilities for any task.'},
{id:'seo',name:'SEO Tools',icon:'search',desc:'Meta tags, sitemaps, keyword research and search previews for better rankings.'},
{id:'network',name:'Network and Security',icon:'shield',desc:'Passwords, hashes, checksums, URLs, subnets and privacy templates.'},
{id:'social',name:'Social Media and YouTube',icon:'youtube',desc:'Thumbnails, titles, tags, hashtags, bios and captions for creators.'}];
function catById(id){for(var i=0;i<CATS.length;i++)if(CATS[i].id===id)return CATS[i];return null}
function catIcon(c){return (S.categoryIcons&&S.categoryIcons[c.id])||c.icon}

/* ---------- 4. TOOL UI HELPERS ---------- */
function F(label,id,inner,help){return '<div class="field"><label for="'+id+'">'+label+'</label>'+inner+(help?'<small class="muted" style="font-size:.76rem">'+help+'</small>':'')+'</div>'}
function I(id,type,attrs){return '<input class="inp" id="'+id+'" type="'+(type||'text')+'" '+(attrs||'')+'>'}
function SEL(id,opts,v){return '<select class="inp" id="'+id+'">'+opts.map(function(o){var ov=Array.isArray(o)?o[0]:o,ol=Array.isArray(o)?o[1]:o;return '<option value="'+esc(ov)+'"'+(String(ov)===String(v)?' selected':'')+'>'+esc(ol)+'</option>'}).join('')+'</select>'}
function TA(id,ph,rows,cls){return '<textarea class="inp'+(cls?' '+cls:'')+'" id="'+id+'" placeholder="'+esc(ph||'')+'" rows="'+(rows||7)+'" spellcheck="false"></textarea>'}
function ROW(){return '<div class="field-row">'+Array.prototype.slice.call(arguments).join('')+'</div>'}
function OUT(ph){return '<div class="result empty" id="t-out" aria-live="polite">'+esc(ph||'Your result will appear here.')+'</div>'}
function SEG(id,opts,on){return '<div class="seg" id="'+id+'" role="tablist">'+opts.map(function(o){return '<button type="button" role="tab" data-v="'+o[0]+'" class="'+(o[0]===on?'on':'')+'" aria-selected="'+(o[0]===on)+'">'+esc(o[1])+'</button>'}).join('')+'</div>'}
function segVal(id){var b=$('#'+id+' .on');return b?b.getAttribute('data-v'):''}
function segWire(id,cb){$$('#'+id+' button').forEach(function(b){b.addEventListener('click',function(){$$('#'+id+' button').forEach(function(x){x.classList.remove('on');x.setAttribute('aria-selected','false')});b.classList.add('on');b.setAttribute('aria-selected','true');if(cb)cb(b.getAttribute('data-v'))})})}
function val(id){var e=byId(id);return e?e.value:''}
function num(id){var x=parseFloat(val(id));return isFinite(x)?x:NaN}
function onAll(ids,fn){ids.split(' ').forEach(function(id){var e=byId(id);if(!e)return;e.addEventListener('input',fn);if(e.tagName==='SELECT'||e.type==='checkbox'||e.type==='date'||e.type==='color'||e.type==='datetime-local')e.addEventListener('change',fn)})}
function setOut(html,err){var o=byId('t-out');if(!o)return;o.className='result'+(err?' err':'');o.innerHTML=html}
function outEmpty(msg){var o=byId('t-out');if(!o)return;o.className='result empty';o.textContent=msg||'Your result will appear here.'}
function kv(pairs){return '<div class="kv">'+pairs.map(function(p){return '<div><small>'+esc(p[0])+'</small><b>'+esc(p[1])+'</b></div>'}).join('')+'</div>'}
function big(t){return '<span class="big-num grad-text">'+esc(t)+'</span>'}
function flag(id,bad){var e=byId(id);if(e){e.classList.toggle('bad',!!bad);e.setAttribute('aria-invalid',bad?'true':'false')}}
function dropZone(id,accept,label){return '<label class="drop" id="'+id+'-zone" for="'+id+'">'+ico('upload','ico-lg')+'<b>'+esc(label)+'</b><small>or drag and drop a file here</small><input id="'+id+'" type="file" accept="'+accept+'"></label>'}
function wireDrop(id,cb){var inp=byId(id),z=byId(id+'-zone');if(!inp||!z)return;inp.addEventListener('change',function(){if(inp.files&&inp.files[0])cb(inp.files[0])});['dragenter','dragover'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.add('over')})});['dragleave','drop'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.remove('over')})});z.addEventListener('drop',function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)cb(f)})}
function readImage(file,cb){if(!file||!/^image\//.test(file.type)){toast('Please choose an image file','err');return}var url=URL.createObjectURL(file),img=new Image();img.onload=function(){cb(img,url)};img.onerror=function(){toast('Could not read that image','err')};img.src=url}
function encode(img,w,h,type,q,bg,cb){var c=D.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.drawImage(img,0,0,w,h);c.toBlob(function(b){if(!b){toast('Your browser cannot encode this format','err');return}cb(b)},type,q)}
function figure(src,cap){return '<figure><img alt="'+esc(cap)+'" src="'+src+'"><figcaption>'+esc(cap)+'</figcaption></figure>'}
function baseName(f){return String(f&&f.name||'image').replace(/\.[^.]+$/,'').replace(/[^\w-]+/g,'-').slice(0,60)||'image'}
function b64enc(s){var by=new TextEncoder().encode(s),bin='';for(var i=0;i<by.length;i+=0x8000)bin+=String.fromCharCode.apply(null,by.subarray(i,i+0x8000));return btoa(bin)}
function b64dec(s){s=s.replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var bin=atob(s),by=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)by[i]=bin.charCodeAt(i);return new TextDecoder('utf-8',{fatal:true}).decode(by)}
function hexToRgb(h){h=String(h||'').replace('#','').trim();if(h.length===3)h=h.split('').map(function(c){return c+c}).join('');if(!/^[0-9a-fA-F]{6}$/.test(h))return null;var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(function(x){return ('0'+Math.max(0,Math.min(255,Math.round(x))).toString(16)).slice(-2)}).join('').toUpperCase()}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return [h,s*100,l*100]}
function hslToRgb(h,s,l){h=((h%360)+360)%360;s/=100;l/=100;var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return [(r+m)*255,(g+m)*255,(b+m)*255]}

/* ---------- PDF ENGINE (pdf-lib + pdf.js, loaded only when a PDF tool opens) ---------- */
var PDFLIB_URL='https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',PDFJS_BASE='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/',pdfjsP=null;
function uerr(m){var e=new Error(m);e.user=true;return e}
function needPdfLib(){return loadScript(PDFLIB_URL).then(function(){if(!W.PDFLib)throw uerr('The PDF engine could not load. Check your connection and try again.');return W.PDFLib},function(){throw uerr('The PDF engine could not load. Check your connection and try again.')})}
function needPdfJs(){if(!pdfjsP)pdfjsP=import(PDFJS_BASE+'pdf.min.mjs').then(function(m){m.GlobalWorkerOptions.workerSrc=PDFJS_BASE+'pdf.worker.min.mjs';return m}).catch(function(){pdfjsP=null;throw uerr('The PDF reader could not load. Check your connection and try again.')});return pdfjsP}
function isPdf(f){return !!f&&(f.type==='application/pdf'||/\.pdf$/i.test(f.name||''))}
function pdfErr(e){var m=String(e&&e.message||e||'');if(e&&e.user)return m;if(/encrypt|password/i.test(m)||(e&&e.name==='PasswordException'))return 'This PDF is password-protected. Remove the password first, then try again.';if(/WinAnsi|cannot encode/i.test(m))return 'Please use standard Latin letters, numbers and symbols for text added to the PDF.';return 'Could not process this PDF. It may be damaged or not a valid PDF file.'}
function openPdf(file){if(!isPdf(file))return Promise.reject(uerr('Please choose a PDF file.'));if(file.size>150*1048576)return Promise.reject(uerr('This file is larger than 150 MB.'));return needPdfLib().then(function(L){return file.arrayBuffer().then(function(buf){return L.PDFDocument.load(buf)})})}
function pdfBlob(b){return new Blob([b],{type:'application/pdf'})}
function parsePages(str,max){str=String(str||'').trim();if(!str)return [];var out=[];str.split(',').forEach(function(part){part=part.trim();if(!part)return;var m=part.match(/^(\d*)\s*-\s*(\d*)$/);if(m&&(m[1]||m[2])){var a=m[1]?+m[1]:1,b=m[2]?+m[2]:max;if(a>b){var t=a;a=b;b=t}if(a>max)throw uerr('Page '+a+' does not exist (this PDF has '+max+' pages).');for(var i=a;i<=Math.min(b,max);i++)if(out.indexOf(i-1)<0)out.push(i-1)}else if(/^\d+$/.test(part)){var n=+part;if(n<1||n>max)throw uerr('Page '+n+' does not exist (this PDF has '+max+' pages).');if(out.indexOf(n-1)<0)out.push(n-1)}else throw uerr('Could not understand "'+part+'". Use page numbers and ranges like 1-3, 5, 8-.')});return out}
function pdfDrop(id,label,multi,accept){return '<label class="drop" id="'+id+'-zone" for="'+id+'">'+ico(accept?'image':'pdf','ico-lg')+'<b>'+esc(label)+'</b><small>or drag and drop '+(multi?'files':'a file')+' here · processed on your device</small><input id="'+id+'" type="file" accept="'+(accept||'application/pdf,.pdf')+'"'+(multi?' multiple':'')+'></label>'}
function wireDropMulti(id,cb){var inp=byId(id),z=byId(id+'-zone');if(!inp||!z)return;inp.addEventListener('change',function(){if(inp.files&&inp.files.length)cb(Array.prototype.slice.call(inp.files));inp.value=''});['dragenter','dragover'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.add('over')})});['dragleave','drop'].forEach(function(ev){z.addEventListener(ev,function(e){e.preventDefault();z.classList.remove('over')})});z.addEventListener('drop',function(e){var fl=e.dataTransfer&&e.dataTransfer.files;if(fl&&fl.length)cb(Array.prototype.slice.call(fl))})}
function busy(btn,on){if(!btn)return;if(on){btn.setAttribute('data-l',btn.innerHTML);btn.disabled=true;btn.innerHTML='Working…'}else{btn.disabled=false;if(btn.getAttribute('data-l'))btn.innerHTML=btn.getAttribute('data-l')}}
function downloadMany(list){if(!list.length){toast('Nothing to download yet','warn');return}if(list.length===1){downloadBlob(list[0][0],list[0][1]);return}toast('Downloading '+list.length+' files…','ok');list.forEach(function(it,i){setTimeout(function(){var a=D.createElement('a');a.href=URL.createObjectURL(it[0]);a.download=it[1];D.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},3000)},i*450)})}
function partsHtml(list){return '<div class="parts">'+list.map(function(it){return '<a href="'+URL.createObjectURL(it[0])+'" download="'+esc(it[1])+'"><span>'+ico('pdf','ico-sm')+' '+esc(it[2]||it[1])+'</span><small class="muted">'+bytes(it[0].size)+' '+ico('download','ico-sm')+'</small></a>'}).join('')+'</div>'}
function fileRows(items,img){return items.map(function(f,i){return '<div class="flist-row">'+'<span class="flist-n">'+(i+1)+'</span>'+(img&&f.url?'<img alt="File preview" src="'+f.url+'">':'')+'<span class="flist-name">'+esc(f.file.name)+'<small>'+bytes(f.file.size)+(f.pages?' · '+f.pages+' page'+(f.pages>1?'s':''):'')+'</small></span><button type="button" data-mv="-1" data-i="'+i+'" aria-label="Move up"'+(i===0?' disabled':'')+'>'+ico('arrow-up','ico-sm')+'</button><button type="button" data-mv="1" data-i="'+i+'" aria-label="Move down" style="transform:rotate(180deg)"'+(i===items.length-1?' disabled':'')+'>'+ico('arrow-up','ico-sm')+'</button><button type="button" data-rm="'+i+'" aria-label="Remove">'+ico('x','ico-sm')+'</button></div>'}).join('')}
function listClick(e,items,redraw){var b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-rm')){items.splice(+b.getAttribute('data-rm'),1)}else if(b.hasAttribute('data-mv')){var i=+b.getAttribute('data-i'),j=i+(+b.getAttribute('data-mv'));if(j<0||j>=items.length)return;var t=items[i];items[i]=items[j];items[j]=t}else return;redraw()}
function hexRgb01(L,h){var c=hexToRgb(h)||[0,0,0];return L.rgb(c[0]/255,c[1]/255,c[2]/255)}
/* Single-PDF tool factory: load → options → apply → download */
function pdfTool(o){return function(b){
b.innerHTML=pdfDrop('pf-file',o.label||'Choose a PDF file')+(o.fields||'')+'<div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="pf-go" disabled>'+ico(o.icon||'check')+esc(o.action)+'</button></div>'+OUT('Choose a PDF to get started.');
var file=null,pages=0,outB=null,outN='';if(o.init)o.init();
wireDrop('pf-file',function(f){outB=null;setOut('Reading '+esc(f.name)+'…');openPdf(f).then(function(doc){file=f;pages=doc.getPageCount();byId('pf-go').disabled=false;setOut('<b>Ready:</b> '+esc(f.name)+kv([['Pages',String(pages)],['Size',bytes(f.size)]]))}).catch(function(e){file=null;byId('pf-go').disabled=true;setOut(esc(pdfErr(e)),true)})});
byId('pf-go').addEventListener('click',function(){if(!file){toast('Choose a PDF first','warn');return}var btn=this;busy(btn,true);
needPdfLib().then(function(L){return file.arrayBuffer().then(function(bf){return L.PDFDocument.load(bf)}).then(function(doc){return o.run(L,doc,pages)})}).then(function(r){outB=pdfBlob(r.bytes);outN=baseName(file)+o.suffix+'.pdf';setOut(big(r.title)+kv(r.info.concat([['Original size',bytes(file.size)],['New size',bytes(outB.size)]]))+'<div class="btn-row" style="margin:14px 0 0"><button type="button" class="btn btn-primary btn-sm" data-tool="download">'+ico('download')+'Download PDF</button></div>');toast(r.title,'ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
return {download:function(){if(!outB){toast('Process a PDF first','warn');return}downloadBlob(outB,outN)}};
}}

/* ---------- 5. REGISTRY: WORKING TOOLS ---------- */
var DEF_RATES={base:'USD',note:'Sample rates. Edit before relying on results.',rates:{USD:1,EUR:0.92,GBP:0.79,INR:83.3,JPY:151.5,AUD:1.52,CAD:1.37,AED:3.67,SGD:1.35,CNY:7.24,CHF:0.9,NZD:1.66,ZAR:18.6,SAR:3.75,BRL:5.1,MXN:17.1}};
var UNITS={
length:{label:'Length',u:{m:['Meter',1],km:['Kilometer',1000],cm:['Centimeter',0.01],mm:['Millimeter',0.001],mi:['Mile',1609.344],yd:['Yard',0.9144],ft:['Foot',0.3048],'in':['Inch',0.0254],nmi:['Nautical mile',1852]}},
weight:{label:'Weight',u:{kg:['Kilogram',1],g:['Gram',0.001],mg:['Milligram',0.000001],t:['Metric ton',1000],lb:['Pound',0.45359237],oz:['Ounce',0.028349523125],st:['Stone',6.35029318]}},
temp:{label:'Temperature',u:{C:['Celsius'],F:['Fahrenheit'],K:['Kelvin']}},
area:{label:'Area',u:{m2:['Square meter',1],km2:['Square kilometer',1000000],ft2:['Square foot',0.09290304],yd2:['Square yard',0.83612736],in2:['Square inch',0.00064516],ac:['Acre',4046.8564224],ha:['Hectare',10000]}},
volume:{label:'Volume',u:{l:['Liter',1],ml:['Milliliter',0.001],m3:['Cubic meter',1000],gal:['US gallon',3.785411784],qt:['US quart',0.946352946],cup:['US cup',0.2365882365],floz:['US fluid ounce',0.0295735295625]}},
speed:{label:'Speed',u:{ms:['Meter/second',1],kmh:['Kilometer/hour',1/3.6],mph:['Mile/hour',0.44704],kn:['Knot',0.514444],fts:['Foot/second',0.3048]}},
data:{label:'Data storage',u:{bit:['Bit',0.125],B:['Byte',1],KB:['Kilobyte',1024],MB:['Megabyte',1048576],GB:['Gigabyte',1073741824],TB:['Terabyte',1099511627776]}},
time:{label:'Time',u:{s:['Second',1],min:['Minute',60],h:['Hour',3600],d:['Day',86400],wk:['Week',604800],mo:['Month (avg)',2629746],yr:['Year (avg)',31557600]}}};
var STOP='the a an and or but of to in on at for with is are was were be been it this that as by from your you we our they their he she his her its not have has had do does did so if then than there here what which who will would can could should about into over under more most very just also only'.split(' ');

var TOOLS=[
{slug:'calculator',name:'Online Calculator',icon:'calc',cats:['calculators','utility'],added:'2026-05-02',
desc:'Free online calculator with brackets, percentages, live preview and keyboard support.',
about:'A clean keypad calculator for everyday math. Type an expression or tap the keys, and the answer previews live as you go. Your last calculations stay in the history so you can copy them later.',
features:['Live answer preview while typing','Brackets, decimals and percentages','Full keyboard support (Enter = equals)','Recent calculation history'],
faq:[['Can I type with my keyboard?','Yes. Click the display, type numbers and operators, then press Enter for the result.'],['How does the % key work?','A percentage is divided by 100, so 200*10% equals 20.'],['Is my history saved?','History is kept only while the page is open and is never uploaded.']],
render:function(b){
var keys=['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','(',')','0','.','='];
b.innerHTML='<input class="calc-display" id="c-disp" aria-label="Calculator expression" placeholder="0" inputmode="decimal" autocomplete="off"><div class="keypad" id="c-keys">'+keys.map(function(k){var cls=k==='='?'eq':/[÷×−+%()C⌫]/.test(k)?'op':'';return '<button type="button" class="'+cls+'" data-k="'+k+'" aria-label="'+(k==='⌫'?'Backspace':k==='C'?'Clear':k)+'">'+k+'</button>'}).join('')+'</div><div style="margin-top:14px">'+OUT('Type an expression or tap the keys.')+'</div>';
var d=byId('c-disp'),hist=[];
function ev(e){var s=String(e).replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s+/g,'');if(!s)return '';if(!/^[0-9+\-*\/().%]+$/.test(s))throw new Error('Only numbers and + − × ÷ % ( ) are allowed');s=s.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');var r;try{r=Function('"use strict";return ('+s+')')()}catch(x){throw new Error('Incomplete expression')}if(typeof r!=='number'||!isFinite(r))throw new Error('Math error (e.g. division by zero)');return +parseFloat(r.toPrecision(12))}
function histHtml(){return hist.length?'<div class="muted" style="margin-top:10px;font-size:.85rem">'+hist.map(esc).join('<br>')+'</div>':''}
function preview(){try{var r=ev(d.value);if(r===''){if(hist.length)setOut('<span class="muted">History</span>'+histHtml());else outEmpty('Type an expression or tap the keys.');return}setOut(big('= '+fmt(r,10))+histHtml())}catch(e){setOut(esc(e.message),true)}}
function equals(){try{var r=ev(d.value);if(r==='')return;hist.unshift(d.value+' = '+r);hist=hist.slice(0,6);d.value=String(r);preview()}catch(e){toast(e.message,'err')}}
d.addEventListener('input',preview);
d.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();equals()}});
byId('c-keys').addEventListener('click',function(e){var btn=e.target.closest('button');if(!btn)return;var k=btn.getAttribute('data-k');if(k==='C')d.value='';else if(k==='⌫')d.value=d.value.slice(0,-1);else if(k==='=')return equals();else d.value+=k;preview()});
}},
{slug:'age-calculator',name:'Age Calculator',icon:'cake',cats:['calculators'],added:'2026-05-03',
desc:'Calculate your exact age in years, months and days, plus total days lived and your next birthday.',
about:'Enter a date of birth to see your exact age down to the day. You can also calculate age on any other date, which is handy for forms, eligibility checks and planning.',
features:['Exact years, months and days','Total months, weeks, days and hours','Countdown to next birthday','Age on any custom date'],
faq:[['Does it handle leap years?','Yes. Calculations use real calendar dates, so leap years and month lengths are handled automatically.'],['Can I calculate age on a past or future date?','Yes. Change the "Age on" date to any date you like.'],['Is my birth date stored?','No. The calculation happens in your browser and nothing is saved or sent.']],
render:function(b){
var today=new Date(),iso=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
b.innerHTML=ROW(F('Date of birth','a-dob',I('a-dob','date','max="'+iso+'"')),F('Age on','a-to',I('a-to','date','value="'+iso+'"')))+OUT('Pick your date of birth.');
function calc(){var dv=val('a-dob'),tv=val('a-to');if(!dv){outEmpty('Pick your date of birth.');return}
var b0=new Date(dv+'T00:00:00'),t=tv?new Date(tv+'T00:00:00'):new Date();t.setHours(0,0,0,0);
if(isNaN(b0)||isNaN(t)){setOut('Please enter valid dates.',true);return}
if(b0>t){flag('a-dob',true);setOut('Date of birth must be before the "Age on" date.',true);return}flag('a-dob',false);
var y=t.getFullYear()-b0.getFullYear(),m=t.getMonth()-b0.getMonth(),dd=t.getDate()-b0.getDate();
if(dd<0){m--;dd+=new Date(t.getFullYear(),t.getMonth(),0).getDate()}if(m<0){y--;m+=12}
var days=Math.round((t-b0)/864e5),nb=new Date(t.getFullYear(),b0.getMonth(),b0.getDate());if(nb<t)nb.setFullYear(t.getFullYear()+1);var until=Math.round((nb-t)/864e5);
setOut(big(y+' years, '+m+' months, '+dd+' days')+kv([['Total months',fmt(y*12+m,0)],['Total weeks',fmt(Math.floor(days/7),0)],['Total days',fmt(days,0)],['Total hours',fmt(days*24,0)],['Next birthday',until===0?'Today! Happy birthday':'In '+until+' days'],['Born on a',b0.toLocaleDateString(undefined,{weekday:'long'})]]))}
onAll('a-dob a-to',calc);calc();
}},
{slug:'bmi-calculator',name:'BMI Calculator',icon:'pulse',cats:['calculators'],added:'2026-05-04',
desc:'Check your Body Mass Index in metric or imperial units with your healthy weight range.',
about:'Body Mass Index compares your weight to your height to give a quick screening number. Enter your details in metric or imperial units to see your BMI, category and the healthy weight range for your height.',
features:['Metric and imperial units','Instant BMI category','Healthy weight range for your height','Visual BMI scale'],
faq:[['What is a healthy BMI?','For most adults, a BMI between 18.5 and 24.9 is considered a healthy range.'],['Is BMI accurate for athletes?','BMI does not distinguish muscle from fat, so very muscular people may read higher. Treat it as a screening tool.'],['Does BMI apply to children?','Children and teens use age and sex specific percentiles, so this adult calculator is not suitable for them.']],
render:function(b){
b.innerHTML=SEG('bmi-u',[['m','Metric (cm, kg)'],['i','Imperial (ft, in, lb)']],'m')+'<div id="bmi-f"></div>'+OUT('Enter your height and weight.');
function fields(u){byId('bmi-f').innerHTML=u==='m'?ROW(F('Height (cm)','bmi-h',I('bmi-h','number','min="50" max="272" placeholder="170" inputmode="decimal"')),F('Weight (kg)','bmi-w',I('bmi-w','number','min="10" max="500" placeholder="65" inputmode="decimal"'))):ROW(F('Height (ft)','bmi-ft',I('bmi-ft','number','min="1" max="8" placeholder="5" inputmode="numeric"')),F('Height (in)','bmi-in',I('bmi-in','number','min="0" max="11.9" placeholder="7" inputmode="decimal"')),F('Weight (lb)','bmi-lb',I('bmi-lb','number','min="20" max="1100" placeholder="150" inputmode="decimal"')));onAll(u==='m'?'bmi-h bmi-w':'bmi-ft bmi-in bmi-lb',calc);calc()}
function calc(){var u=segVal('bmi-u'),m,kg;if(u==='m'){m=num('bmi-h')/100;kg=num('bmi-w')}else{var ft=num('bmi-ft'),inch=num('bmi-in');m=((isNaN(ft)?0:ft)*12+(isNaN(inch)?0:inch))*0.0254;kg=num('bmi-lb')*0.45359237}
if(!(m>0.5&&m<2.8)||!(kg>5&&kg<600)){outEmpty('Enter a realistic height and weight.');return}
var bmi=kg/(m*m),cat=bmi<18.5?['Underweight','#38BDF8']:bmi<25?['Healthy weight','#10B981']:bmi<30?['Overweight','#F59E0B']:['Obese','#EF4444'];
var f=u==='m'?1:2.20462262,unit=u==='m'?' kg':' lb',pct=Math.min(100,Math.max(0,(bmi-10)/30*100));
setOut(big('BMI '+bmi.toFixed(1))+'<b style="color:'+cat[1]+'">'+cat[0]+'</b><div class="meter"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+kv([['Healthy weight for your height',fmt(18.5*m*m*f,1)+' – '+fmt(24.9*m*m*f,1)+unit],['BMI Prime',(bmi/25).toFixed(2)],['Scale','Under 18.5 · 18.5–24.9 · 25–29.9 · 30+']])+'<p class="muted" style="margin:10px 0 0;font-size:.8rem">BMI is a screening measure, not a diagnosis. Talk to a doctor about your health.</p>')}
segWire('bmi-u',fields);fields('m');
}},
{slug:'emi-calculator',name:'EMI Calculator',icon:'finance',cats:['finance','calculators'],added:'2026-05-05',
desc:'Calculate your monthly loan EMI, total interest and a yearly repayment schedule instantly.',
about:'Plan home, car or personal loans with confidence. Enter the loan amount, annual interest rate and tenure to see your monthly installment, the total interest you will pay and a year-by-year breakdown.',
features:['Monthly EMI with reducing balance','Total interest and total payment','Principal vs interest chart','Year-by-year amortization table'],
faq:[['What formula is used?','EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate and n the number of months.'],['Does it include processing fees?','No. Add any fees or insurance your lender charges separately.'],['Can I use it for zero-interest loans?','Yes. With a 0% rate the EMI is simply the amount divided by the number of months.']],
render:function(b){
b.innerHTML=ROW(F('Loan amount','emi-p',I('emi-p','number','min="0" value="500000" inputmode="decimal"')),F('Interest rate (% per year)','emi-r',I('emi-r','number','min="0" max="100" step="0.01" value="9.5" inputmode="decimal"')))+ROW(F('Tenure','emi-t',I('emi-t','number','min="1" value="5" inputmode="numeric"')),F('Tenure unit','emi-tu',SEL('emi-tu',[['y','Years'],['m','Months']],'y')))+OUT();
function calc(){var P=num('emi-p'),R=num('emi-r'),T=num('emi-t'),N=val('emi-tu')==='y'?Math.round(T*12):Math.round(T);
var okP=P>0,okR=R>=0&&R<=100,okN=N>=1&&N<=600;flag('emi-p',!okP);flag('emi-r',!okR);flag('emi-t',!okN);
if(!okP||!okR||!okN){outEmpty('Enter a loan amount, an interest rate and a tenure of up to 50 years.');return}
var r=R/1200,emi=r?P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1):P/N,total=emi*N,intr=total-P,rows='',bal=P,yP=0,yI=0;
for(var i=1;i<=N;i++){var ip=bal*r,pp=emi-ip;bal=Math.max(0,bal-pp);yP+=pp;yI+=ip;if(i%12===0||i===N){rows+='<tr><td>Year '+Math.ceil(i/12)+'</td><td>'+fmt(yP,0)+'</td><td>'+fmt(yI,0)+'</td><td>'+fmt(bal,0)+'</td></tr>';yP=0;yI=0}}
var pc=P/total*100;
setOut(big('EMI '+fmt(emi,2)+' / month')+kv([['Principal',fmt(P,2)],['Total interest',fmt(intr,2)],['Total payment',fmt(total,2)],['Number of EMIs',String(N)]])+'<div class="bar-split"><i style="width:'+pc.toFixed(1)+'%;background:var(--primary)"></i><i style="flex:1;background:var(--cyan)"></i></div><div class="legend"><span style="--c:var(--primary)">Principal '+pc.toFixed(1)+'%</span><span style="--c:var(--cyan)">Interest '+(100-pc).toFixed(1)+'%</span></div><div class="tbl-wrap"><table class="table"><thead><tr><th>Period</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead><tbody>'+rows+'</tbody></table></div>')}
onAll('emi-p emi-r emi-t emi-tu',calc);calc();
}},
{slug:'gst-calculator',name:'GST Calculator',icon:'percent',cats:['finance','calculators'],added:'2026-05-06',
desc:'Add or remove GST from any amount with CGST, SGST and IGST breakdown for all common rates.',
about:'Quickly work out GST-inclusive and GST-exclusive prices. Choose a standard rate or enter your own, and get the tax amount with a CGST/SGST split for intra-state sales and IGST for inter-state sales.',
features:['Add GST or remove GST','GST 2.0 rates (5%, 18%, 40%) plus custom','CGST, SGST and IGST split','Instant live results'],
faq:[['What is the difference between inclusive and exclusive GST?','Exclusive means GST is added on top of the price. Inclusive means the price already contains GST and we extract it.'],['How are CGST and SGST calculated?','For intra-state supplies, the GST is split equally between CGST and SGST (or UTGST).'],['Can I use it for VAT?','Yes. Pick "Custom" and enter your VAT rate, since the math is the same.']],
render:function(b){
b.innerHTML=SEG('gst-m',[['add','Add GST'],['rem','Remove GST']],'add')+ROW(F('Amount','gst-a',I('gst-a','number','min="0" value="1000" inputmode="decimal"')),F('GST rate','gst-r',SEL('gst-r',[['0.25','0.25%'],['3','3%'],['5','5%'],['18','18%'],['40','40%'],['c','Custom']],'18')),F('Custom rate (%)','gst-c',I('gst-c','number','min="0" max="100" step="0.01" placeholder="e.g. 15" disabled')))+OUT();
function calc(){byId('gst-c').disabled=val('gst-r')!=='c';var A=num('gst-a'),r=val('gst-r')==='c'?num('gst-c'):parseFloat(val('gst-r')),add=segVal('gst-m')==='add';
flag('gst-a',!(A>=0));if(!(A>=0)||!(r>=0&&r<=100)){outEmpty('Enter an amount and a GST rate between 0 and 100.');return}
var net,gst,total;if(add){net=A;gst=A*r/100;total=A+gst}else{total=A;net=A*100/(100+r);gst=A-net}
setOut(big((add?'Total ':'Net amount ')+fmt(add?total:net,2))+kv([['Net amount',fmt(net,2)],['GST ('+r+'%)',fmt(gst,2)],['CGST ('+(r/2)+'%)',fmt(gst/2,2)],['SGST / UTGST ('+(r/2)+'%)',fmt(gst/2,2)],['IGST ('+r+'%)',fmt(gst,2)],['Total (incl. GST)',fmt(total,2)]]))}
segWire('gst-m',calc);onAll('gst-a gst-r gst-c',calc);calc();
}},
{slug:'percentage-calculator',name:'Percentage Calculator',icon:'percent',cats:['calculators','finance'],added:'2026-05-07',
desc:'Find X% of a number, what percent one number is of another, and percentage increase or decrease.',
about:'Three percentage calculators in one place. Work out discounts, tips, marks, growth rates and more, with results that update as you type.',
features:['X% of Y','X is what % of Y','Percentage increase or decrease','All three update live'],
faq:[['How do I calculate a discount?','Use "What is X% of Y" with the discount percentage and the price, then subtract the result from the price.'],['How is percentage change calculated?','Change % = (new − old) ÷ old × 100.'],['Can I use decimals?','Yes. All fields accept decimal numbers.']],
render:function(b){
function box(t,a,bb,la,lb,pa,pb){return '<div class="card flat" style="padding:16px;margin-bottom:12px"><div class="lbl" style="margin-bottom:10px">'+t+'</div>'+ROW(F(la,a,I(a,'number','placeholder="'+pa+'" inputmode="decimal"')),F(lb,bb,I(bb,'number','placeholder="'+pb+'" inputmode="decimal"')))+'<div class="result empty" id="'+a+'o">—</div></div>'}
b.innerHTML=box('What is X% of Y?','p1a','p1b','X (%)','Y','15','200')+box('X is what percent of Y?','p2a','p2b','X','Y','30','120')+box('Percentage change from X to Y','p3a','p3b','From (X)','To (Y)','80','100')+OUT('Fill in any calculator above.');
function put(id,txt){var o=byId(id);if(txt===null){o.className='result empty';o.textContent='—'}else{o.className='result';o.textContent=txt}}
function calc(){var lines=[],a,c,r;
a=num('p1a');c=num('p1b');if(!isNaN(a)&&!isNaN(c)){r=a/100*c;put('p1ao',a+'% of '+c+' = '+fmt(r,6));lines.push(a+'% of '+c+' = '+fmt(r,6))}else put('p1ao',null);
a=num('p2a');c=num('p2b');if(!isNaN(a)&&!isNaN(c)&&c!==0){r=a/c*100;put('p2ao',a+' is '+fmt(r,4)+'% of '+c);lines.push(a+' is '+fmt(r,4)+'% of '+c)}else put('p2ao',null);
a=num('p3a');c=num('p3b');if(!isNaN(a)&&!isNaN(c)&&a!==0){r=(c-a)/Math.abs(a)*100;var t=(r>=0?'Increase of ':'Decrease of ')+fmt(Math.abs(r),4)+'% ('+a+' → '+c+')';put('p3ao',t);lines.push(t)}else put('p3ao',null);
if(lines.length)setOut(esc(lines.join('\n')));else outEmpty('Fill in any calculator above.')}
onAll('p1a p1b p2a p2b p3a p3b',calc);
}},
{slug:'currency-converter',name:'Currency Converter',icon:'currency',cats:['finance','converters'],added:'2026-08-18',
desc:'Convert between 16 currencies with editable exchange rates saved in your browser.',
about:'A fast currency converter that works even offline. It ships with sample exchange rates that you can edit as JSON and save in your browser, so you always control the numbers you use.',
features:['16 popular currencies','Editable JSON exchange rates','Rates saved in your browser','Swap currencies in one tap'],
faq:[['Are these live exchange rates?','No. The built-in rates are samples so the tool works offline. Update them from a trusted source such as your bank before relying on the result.'],['How do I add a currency?','Open "Edit exchange rates", add a code and its rate against the base currency, then press Save.'],['Where are my rates stored?','In your browser only, using local storage on this device.']],
render:function(b){
var R=store('fuh-rates')||DEF_RATES;
function opts(){return Object.keys(R.rates)}
b.innerHTML=ROW(F('Amount','cur-a',I('cur-a','number','min="0" value="100" inputmode="decimal"')),F('From','cur-f',SEL('cur-f',opts(),'USD')),F('To','cur-t',SEL('cur-t',opts(),'EUR')))+'<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" id="cur-swap">'+ico('swap')+'Swap currencies</button></div>'+OUT()+'<details style="margin-top:16px"><summary class="lbl" style="cursor:pointer">Edit exchange rates (JSON)</summary><div class="field" style="margin-top:10px">'+TA('cur-j','',8,'mono')+'</div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="cur-save">Save rates</button><button class="btn btn-ghost btn-sm" type="button" id="cur-def">Restore sample rates</button></div></details>';
byId('cur-j').value=JSON.stringify(R,null,2);
function rebuild(){var f=val('cur-f'),t=val('cur-t');byId('cur-f').outerHTML=SEL('cur-f',opts(),R.rates[f]?f:opts()[0]);byId('cur-t').outerHTML=SEL('cur-t',opts(),R.rates[t]?t:opts()[1]||opts()[0]);onAll('cur-f cur-t',calc);calc()}
function calc(){var a=num('cur-a'),f=val('cur-f'),t=val('cur-t');flag('cur-a',!(a>=0));if(!(a>=0)||!R.rates[f]||!R.rates[t]){outEmpty('Enter an amount to convert.');return}
var res=a/R.rates[f]*R.rates[t];setOut(big(fmt(a,2)+' '+f+' = '+fmt(res,4)+' '+t)+kv([['1 '+f,fmt(R.rates[t]/R.rates[f],6)+' '+t],['1 '+t,fmt(R.rates[f]/R.rates[t],6)+' '+f],['Rates',R.note||'Custom rates']]))}
byId('cur-swap').addEventListener('click',function(){var f=val('cur-f');byId('cur-f').value=val('cur-t');byId('cur-t').value=f;calc()});
byId('cur-save').addEventListener('click',function(){try{var j=JSON.parse(val('cur-j'));if(!j||typeof j.rates!=='object')throw 0;var ok=Object.keys(j.rates).length>1&&Object.keys(j.rates).every(function(k){return /^[A-Z]{3}$/.test(k)&&typeof j.rates[k]==='number'&&j.rates[k]>0});if(!ok)throw 0;R=j;store('fuh-rates',R);rebuild();toast('Exchange rates saved','ok')}catch(e){toast('Invalid JSON. Use 3-letter codes with positive numbers.','err')}});
byId('cur-def').addEventListener('click',function(){R=JSON.parse(JSON.stringify(DEF_RATES));store('fuh-rates',null);byId('cur-j').value=JSON.stringify(R,null,2);rebuild();toast('Sample rates restored','ok')});
onAll('cur-a cur-f cur-t',calc);calc();
}},
{slug:'unit-converter',name:'Unit Converter',icon:'ruler',cats:['converters','utility'],added:'2026-05-09',
desc:'Convert length, weight, temperature, area, volume, speed, data storage and time units instantly.',
about:'One converter for eight kinds of measurement. Pick a category and units, enter a value, and see the result plus a full table of conversions to every other unit.',
features:['8 measurement categories','60+ units supported','Full conversion table','Precise conversion factors'],
faq:[['Which data storage units are used?','Binary units, where 1 KB = 1024 bytes, matching how most operating systems report sizes.'],['How are temperatures converted?','Values are converted through Celsius using the exact formulas for Fahrenheit and Kelvin.'],['Are US or UK gallons used?','US gallons, quarts, cups and fluid ounces.']],
render:function(b){
b.innerHTML=ROW(F('Category','u-c',SEL('u-c',Object.keys(UNITS).map(function(k){return [k,UNITS[k].label]}),'length')),F('Value','u-v',I('u-v','number','value="1" inputmode="decimal"')))+'<div id="u-sel"></div>'+OUT();
function sel(){var c=val('u-c'),ks=Object.keys(UNITS[c].u),o=ks.map(function(k){return [k,UNITS[c].u[k][0]+' ('+k+')']});byId('u-sel').innerHTML=ROW(F('From','u-f',SEL('u-f',o,ks[0])),F('To','u-t',SEL('u-t',o,ks[1])));onAll('u-f u-t',calc);calc()}
function conv(c,v,f,t){if(c==='temp'){var C=f==='C'?v:f==='F'?(v-32)*5/9:v-273.15;return t==='C'?C:t==='F'?C*9/5+32:C+273.15}return v*UNITS[c].u[f][1]/UNITS[c].u[t][1]}
function calc(){var c=val('u-c'),v=num('u-v'),f=val('u-f'),t=val('u-t');flag('u-v',isNaN(v));if(isNaN(v)||!f){outEmpty('Enter a value to convert.');return}
var rows=Object.keys(UNITS[c].u).map(function(k){return '<tr><td>'+esc(UNITS[c].u[k][0])+'</td><td>'+fmt(conv(c,v,f,k),8)+' '+esc(k)+'</td></tr>'}).join('');
setOut(big(fmt(v,8)+' '+f+' = '+fmt(conv(c,v,f,t),8)+' '+t)+'<div class="tbl-wrap"><table class="table"><thead><tr><th>Unit</th><th>Value</th></tr></thead><tbody>'+rows+'</tbody></table></div>')}
byId('u-c').addEventListener('change',sel);byId('u-v').addEventListener('input',calc);sel();
}},
{slug:'word-counter',name:'Word Counter',icon:'text',cats:['text','productivity'],added:'2026-05-10',
desc:'Count words, characters, sentences and paragraphs with reading time and top keywords.',
about:'Paste an essay, article, caption or email to get live statistics: words, characters, sentences, paragraphs, reading and speaking time, plus the keywords you use most.',
features:['Words, characters, sentences, paragraphs','Reading and speaking time','Top keyword density','Updates live as you type'],
faq:[['How is reading time calculated?','We assume an average reading speed of 200 words per minute and speaking speed of 130 words per minute.'],['Are numbers counted as words?','Yes. Any group of characters separated by spaces counts as a word.'],['Is my text saved?','No. Your text stays in the page and is never uploaded.']],
render:function(b){
b.innerHTML=F('Your text','wc-in',TA('wc-in','Start typing or paste your text here...',9))+OUT('Start typing to see live statistics.');
function calc(){var t=val('wc-in');if(!t.trim()){outEmpty('Start typing to see live statistics.');return}
var words=t.trim().split(/\s+/).filter(Boolean),wc=words.length,chars=Array.from(t).length,ns=Array.from(t.replace(/\s/g,'')).length;
var sent=(t.match(/[^.!?\n]+[.!?]+/g)||[]).length||1,para=t.split(/\n\s*\n/).filter(function(p){return p.trim()}).length;
var freq={};words.forEach(function(w){w=w.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F'-]/g,'');if(w.length>3&&STOP.indexOf(w)<0)freq[w]=(freq[w]||0)+1});
var top=Object.keys(freq).sort(function(a,c){return freq[c]-freq[a]}).slice(0,8);
function mins(n,wpm){var s=Math.round(n/wpm*60);return s<60?s+' sec':Math.floor(s/60)+' min '+(s%60)+' sec'}
setOut(big(fmt(wc,0)+' words')+kv([['Characters',fmt(chars,0)],['Without spaces',fmt(ns,0)],['Sentences',fmt(sent,0)],['Paragraphs',fmt(para,0)],['Reading time',mins(wc,200)],['Speaking time',mins(wc,130)],['Avg. word length',(ns/wc).toFixed(1)+' chars']])+(top.length?'<div class="lbl" style="margin:14px 0 8px">Top keywords</div><div class="chips">'+top.map(function(k){return '<span class="chip">'+esc(k)+' · '+freq[k]+' ('+(freq[k]/wc*100).toFixed(1)+'%)</span>'}).join('')+'</div>':''))}
byId('wc-in').addEventListener('input',debounce(calc,120));
}},
{slug:'character-counter',name:'Character Counter',icon:'hash',cats:['text'],added:'2026-05-11',
desc:'Count characters with and without spaces, letters, digits and lines, with social media limits.',
about:'Know exactly how long your text is before you post it. See characters, letters, digits and lines, and check your text against common limits for X (Twitter), meta descriptions, SMS and Instagram.',
features:['Emoji-aware character count','Letters, digits, spaces and symbols','Line and uppercase counts','Limit meters for popular platforms'],
faq:[['Do emojis count as one character?','We count each visible character, including most emojis, as one. Some platforms count certain emojis as two.'],['What is the ideal meta description length?','Around 150 to 160 characters usually displays fully in search results.'],['What is the SMS limit?','A standard single SMS holds 160 GSM characters.']],
render:function(b){
b.innerHTML=F('Your text','cc2-in',TA('cc2-in','Type or paste text to count characters...',7))+OUT('Start typing to count characters.');
var LIM=[['X / Twitter post',280],['Meta description',160],['SMS message',160],['Instagram caption',2200],['YouTube title',100]];
function calc(){var t=val('cc2-in');if(!t){outEmpty('Start typing to count characters.');return}
var n=Array.from(t).length;
setOut(big(fmt(n,0)+' characters')+kv([['Without spaces',fmt(Array.from(t.replace(/\s/g,'')).length,0)],['Letters',fmt((t.match(/[A-Za-z\u00C0-\u024F]/g)||[]).length,0)],['Digits',fmt((t.match(/[0-9]/g)||[]).length,0)],['Spaces',fmt((t.match(/ /g)||[]).length,0)],['Symbols',fmt((t.match(/[^\sA-Za-z0-9\u00C0-\u024F]/g)||[]).length,0)],['Lines',fmt(t.split('\n').length,0)],['Uppercase',fmt((t.match(/[A-Z]/g)||[]).length,0)],['Lowercase',fmt((t.match(/[a-z]/g)||[]).length,0)]])+'<div style="margin-top:14px;display:grid;gap:10px;white-space:normal">'+LIM.map(function(l){var p=Math.min(100,n/l[1]*100),over=n>l[1];return '<div><div style="display:flex;justify-content:space-between;font-size:.8rem"><span>'+l[0]+'</span><span style="color:'+(over?'var(--error)':'var(--muted)')+'">'+n+' / '+l[1]+(over?' (over)':'')+'</span></div><div class="meter"><i style="width:'+p.toFixed(1)+'%;'+(over?'background:var(--error)':'')+'"></i></div></div>'}).join('')+'</div>')}
byId('cc2-in').addEventListener('input',calc);
}},
{slug:'case-converter',name:'Case Converter',icon:'case',cats:['text','converters'],added:'2026-05-12',
desc:'Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and more.',
about:'Fix accidental caps lock, format headlines or rename variables in seconds. Pick one of eleven styles and your converted text is ready to copy or download.',
features:['11 case styles','Smart Title Case (keeps minor words small)','Developer cases: camel, Pascal, snake, kebab','Live re-conversion while typing'],
faq:[['What is Title Case?','Every major word starts with a capital letter, while short words like "and" or "of" stay lowercase unless they come first.'],['What is snake_case used for?','It is a common naming style for variables, files and database columns, with words joined by underscores.'],['Does it keep line breaks?','Yes, for text styles like upper, lower, title and sentence case.']],
render:function(b){
var MODES=[['upper','UPPERCASE'],['lower','lowercase'],['title','Title Case'],['sentence','Sentence case'],['camel','camelCase'],['pascal','PascalCase'],['snake','snake_case'],['kebab','kebab-case'],['constant','CONSTANT_CASE'],['alt','aLtErNaTiNg'],['inverse','iNVERSE']];
b.innerHTML=F('Your text','cs-in',TA('cs-in','Type or paste text to convert...',6))+'<div class="chips" id="cs-btns" style="margin-bottom:14px">'+MODES.map(function(m){return '<button type="button" class="chip" data-c="'+m[0]+'">'+esc(m[1])+'</button>'}).join('')+'</div>'+OUT('Pick a case style to convert your text.');
var MINOR=['a','an','and','as','at','but','by','for','in','nor','of','on','or','the','to','up','via','vs'],mode='';
function words(s){return s.replace(/([a-z0-9])([A-Z])/g,'$1 $2').split(/[^A-Za-z0-9\u00C0-\u024F]+/).filter(Boolean)}
function conv(t,m){switch(m){case 'upper':return t.toUpperCase();case 'lower':return t.toLowerCase();
case 'title':return t.toLowerCase().replace(/[^\s]+/g,function(w,i){return (i>0&&MINOR.indexOf(w)>-1)?w:w.charAt(0).toUpperCase()+w.slice(1)});
case 'sentence':return t.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z\u00E0-\u00FF])/g,function(a,p,c){return p+c.toUpperCase()});
case 'camel':return words(t).map(function(w,i){w=w.toLowerCase();return i?w.charAt(0).toUpperCase()+w.slice(1):w}).join('');
case 'pascal':return words(t).map(function(w){w=w.toLowerCase();return w.charAt(0).toUpperCase()+w.slice(1)}).join('');
case 'snake':return words(t).join('_').toLowerCase();case 'kebab':return words(t).join('-').toLowerCase();case 'constant':return words(t).join('_').toUpperCase();
case 'alt':var i=0;return t.replace(/[A-Za-z]/g,function(c){return (i++%2)?c.toUpperCase():c.toLowerCase()});
case 'inverse':return t.replace(/[A-Za-z]/g,function(c){return c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()})}return t}
function run(){var t=val('cs-in');if(!mode){outEmpty('Pick a case style to convert your text.');return}if(!t.trim()){outEmpty('Type some text first.');return}setOut(esc(conv(t,mode)))}
byId('cs-btns').addEventListener('click',function(e){var btn=e.target.closest('button');if(!btn)return;mode=btn.getAttribute('data-c');$$('#cs-btns .chip').forEach(function(c){c.classList.toggle('active',c===btn)});run()});
byId('cs-in').addEventListener('input',run);
}},
{slug:'find-and-replace',name:'Find and Replace',icon:'search',cats:['text','productivity'],added:'2026-09-27',
desc:'Find and replace words or phrases in any text, with case-sensitive, whole-word and regular expression options.',
about:'Swap every occurrence of a word, name or phrase in seconds. Paste your text, type what to find and what to replace it with, and preview every change highlighted before applying it. Power users can switch on regular expressions and use capture groups like $1 in the replacement.',
features:['Live preview with every change highlighted','Case-sensitive and whole-word matching','Regular expressions with $1 capture groups','Apply, undo, copy or download the result'],
faq:[['How do I delete a word from my text?','Type the word in "Find" and leave "Replace with" empty. Every match will be removed.'],['What does "whole words only" do?','It only matches complete words, so finding "cat" will not change "category" or "concatenate".'],['Can I use regular expressions?','Yes. Tick "Use regular expression" to write patterns such as \\d+ or (\\w+)@(\\w+), and reference groups with $1, $2 in the replacement.']],
render:function(b){
b.innerHTML=F('Your text','fr-in',TA('fr-in','Paste the text you want to edit...',8))+ROW(F('Find','fr-f',I('fr-f','text','placeholder="Word or phrase to find" autocomplete="off" spellcheck="false"')),F('Replace with','fr-r',I('fr-r','text','placeholder="Leave empty to delete matches" autocomplete="off" spellcheck="false"')))+'<div class="checks"><label><input type="checkbox" id="fr-c"> Case sensitive</label><label><input type="checkbox" id="fr-w"> Whole words only</label><label><input type="checkbox" id="fr-x"> Use regular expression</label></div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="fr-apply">'+ico('check')+'Apply to text</button><button class="btn btn-ghost btn-sm" type="button" id="fr-undo" disabled>'+ico('reset')+'Undo</button></div>'+OUT('Paste your text and type a word to find.');
var last='',undo=null;
function build(){var f=val('fr-f'),rx=byId('fr-x').checked;if(!f)return null;var src=rx?f:f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(byId('fr-w').checked)src='\\b(?:'+src+')\\b';return new RegExp(src,'g'+(byId('fr-c').checked?'':'i'))}
function calc(){var t=val('fr-in'),re;flag('fr-f',false);last='';
if(!t){outEmpty('Paste your text and type a word to find.');return}
try{re=build()}catch(e){flag('fr-f',true);setOut('Invalid regular expression: '+esc(String(e.message).replace(/^Invalid regular expression:\s*/,'')),true);return}
if(!re){outEmpty('Type a word or phrase to find.');return}
var rx=byId('fr-x').checked,rep=val('fr-r'),one=new RegExp(re.source,re.flags.replace('g','')),html='',res='',pos=0,n=0,m,guard=0;
while((m=re.exec(t))&&guard++<100000){if(m[0]===''){re.lastIndex++;continue}var r=rx?m[0].replace(one,rep):rep;html+=esc(t.slice(pos,m.index))+'<mark>'+(r?esc(r):'<s style="opacity:.6">'+esc(m[0])+'</s>')+'</mark>';res+=t.slice(pos,m.index)+r;pos=m.index+m[0].length;n++}
html+=esc(t.slice(pos));res+=t.slice(pos);
if(!n){setOut('<b>No matches found</b> for “'+esc(val('fr-f'))+'”. Try turning off case-sensitive or whole-word matching.');return}
last=res;setOut('<div style="font-family:var(--fh);font-weight:700;margin-bottom:10px">'+n+' match'+(n>1?'es':'')+' '+(rep?'replaced':'removed')+' · preview</div><div style="font-family:var(--fb);line-height:1.7">'+html+'</div>')}
byId('fr-apply').addEventListener('click',function(){if(!last){toast('Nothing to replace yet','warn');return}undo=val('fr-in');byId('fr-in').value=last;byId('fr-undo').disabled=false;calc();toast('Changes applied to your text','ok')});
byId('fr-undo').addEventListener('click',function(){if(undo===null)return;byId('fr-in').value=undo;undo=null;this.disabled=true;calc();toast('Undone')});
onAll('fr-in fr-f fr-r fr-c fr-w fr-x',debounce(calc,120));
return {text:function(){return last||''}};
}},
{slug:'password-generator',name:'Password Generator',icon:'lock',cats:['network','developer','utility'],added:'2026-05-13',
desc:'Generate strong, random passwords with custom length and characters using secure crypto randomness.',
about:'Create passwords that are genuinely hard to guess. This generator uses your browser\u2019s cryptographically secure random number generator and guarantees at least one character from every set you choose.',
features:['Cryptographically secure randomness','Length from 4 to 64 characters','Exclude look-alike characters','Strength meter with entropy estimate'],
faq:[['Are generated passwords stored or sent anywhere?','No. They are created in your browser and disappear when you leave the page.'],['How long should a password be?','Use at least 12 to 16 characters, and a password manager to remember them.'],['What does "exclude similar characters" do?','It removes characters that are easy to confuse, like l, 1, I, O and 0.']],
render:function(b){
b.innerHTML=F('Length: <b id="pw-lv">16</b> characters','pw-len',I('pw-len','range','min="4" max="64" value="16"'))+'<div class="checks"><label><input type="checkbox" id="pw-u" checked> A–Z</label><label><input type="checkbox" id="pw-l" checked> a–z</label><label><input type="checkbox" id="pw-d" checked> 0–9</label><label><input type="checkbox" id="pw-s" checked> Symbols</label><label><input type="checkbox" id="pw-x"> Exclude similar (il1Lo0O)</label></div>'+ROW(F('How many','pw-n',SEL('pw-n',[['1','1 password'],['5','5 passwords'],['10','10 passwords']],'1')))+'<div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="pw-go">'+ico('reset')+'Generate new</button></div>'+OUT();
function gen(){var len=parseInt(val('pw-len'),10);byId('pw-lv').textContent=len;var x=byId('pw-x').checked,sets=[];
function clean(s){return x?s.replace(/[il1Lo0O]/g,''):s}
if(byId('pw-u').checked)sets.push(clean('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));if(byId('pw-l').checked)sets.push(clean('abcdefghijklmnopqrstuvwxyz'));if(byId('pw-d').checked)sets.push(clean('0123456789'));if(byId('pw-s').checked)sets.push('!@#$%^&*()-_=+[]{};:,.?/~');
if(!sets.length){setOut('Select at least one character set.',true);return}
var pool=sets.join(''),n=parseInt(val('pw-n'),10),list=[];
for(var k=0;k<n;k++){var arr=[];sets.forEach(function(s){arr.push(s.charAt(rndInt(s.length)))});while(arr.length<len)arr.push(pool.charAt(rndInt(pool.length)));arr=arr.slice(0,len);for(var i=arr.length-1;i>0;i--){var j=rndInt(i+1),tmp=arr[i];arr[i]=arr[j];arr[j]=tmp}list.push(arr.join(''))}
var bits=len*Math.log2(pool.length),lab=bits<40?['Weak','var(--error)']:bits<60?['Fair','var(--warning)']:bits<80?['Strong','var(--success)']:['Very strong','var(--success)'];
setOut('<div class="mono" style="font-size:1.05rem;line-height:1.9">'+list.map(esc).join('<br>')+'</div><div style="margin-top:10px;font-size:.85rem">Strength: <b style="color:'+lab[1]+'">'+lab[0]+'</b> · about '+Math.round(bits)+' bits of entropy</div><div class="meter"><i style="width:'+Math.min(100,bits/1.28).toFixed(0)+'%"></i></div>')}
onAll('pw-len pw-u pw-l pw-d pw-s pw-x pw-n',gen);byId('pw-go').addEventListener('click',gen);gen();
}},
{slug:'qr-code-generator',name:'QR Code Generator',icon:'qr',cats:['utility','productivity'],added:'2026-05-14',
desc:'Create QR codes for links, text, Wi-Fi and more with custom colors and download them as PNG.',
about:'Turn any link or text into a scannable QR code. Choose the size, colors and error-correction level, preview it instantly and download a high-quality PNG for print or screens.',
features:['Custom foreground and background colors','Sizes up to 512 px','Four error-correction levels','One-click PNG download'],
faq:[['Do these QR codes expire?','No. They are static codes that encode your content directly, so they work forever.'],['How much text can a QR code hold?','We allow up to 1,200 characters. Shorter content produces codes that are easier to scan.'],['Which colors scan best?','Dark code on a light background with strong contrast scans most reliably.']],
render:function(b){
b.innerHTML=F('Text or URL','qr-t',TA('qr-t','https://example.com',3))+ROW(F('Size','qr-s',SEL('qr-s',['160','256','384','512'],'256')),F('Error correction','qr-e',SEL('qr-e',[['L','Low (7%)'],['M','Medium (15%)'],['Q','Quartile (25%)'],['H','High (30%)']],'M')),F('Code color','qr-fg',I('qr-fg','color','value="#0F172A"')),F('Background','qr-bg',I('qr-bg','color','value="#FFFFFF"')))+OUT('Type something to generate a QR code.')+'<div id="qr-box" aria-label="QR code preview"></div>';
byId('qr-t').value='https://example.com';
var gen=debounce(function(){var t=val('qr-t').trim(),box=byId('qr-box');if(!t){box.innerHTML='';outEmpty('Type something to generate a QR code.');return}if(t.length>1200){setOut('Text is too long for a reliable QR code (max 1,200 characters).',true);return}
loadScript('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js').then(function(){box.innerHTML='';var s=parseInt(val('qr-s'),10);try{new W.QRCode(box,{text:t,width:s,height:s,colorDark:val('qr-fg'),colorLight:val('qr-bg'),correctLevel:W.QRCode.CorrectLevel[val('qr-e')]});setOut('<b>QR code ready</b> · '+s+'×'+s+' px · '+t.length+' characters encoded')}catch(e){setOut('Could not create a QR code for this text. Try shorter content or a lower error-correction level.',true)}},function(){setOut('QR library failed to load. Check your connection and try again.',true)})},250);
onAll('qr-t qr-s qr-e qr-fg qr-bg',gen);gen();
return {download:function(){var c=$('#qr-box canvas');if(!c){toast('Generate a QR code first','warn');return}c.toBlob(function(bl){downloadBlob(bl,'qr-code.png')},'image/png')}};
}},
{slug:'base64-encoder',name:'Base64 Encoder',icon:'braces',cats:['developer','converters'],added:'2026-05-15',
desc:'Encode text or files to Base64 with full UTF-8 support and optional URL-safe output.',
about:'Encode any text, including emoji and non-Latin scripts, to Base64. You can also turn a small file into a Base64 data URI for embedding in HTML, CSS or JSON.',
features:['Full UTF-8 and emoji support','URL-safe Base64 option','File to data URI','Live encoding'],
faq:[['Is Base64 encryption?','No. Base64 is an encoding, not encryption. Anyone can decode it, so do not use it to hide secrets.'],['What is URL-safe Base64?','It replaces + and / with - and _ and removes padding, so the result is safe in URLs and file names.'],['How big can files be?','Files up to about 5 MB work well. Larger files create very long strings.']],
render:function(b){
b.innerHTML=F('Text to encode','b64e-in',TA('b64e-in','Type or paste text...',6))+'<div class="checks"><label><input type="checkbox" id="b64e-url"> URL-safe output</label></div>'+dropZone('b64e-file','*/*','Or encode a file to a data URI')+OUT('Type text or choose a file to encode.');
function calc(){var t=val('b64e-in');if(!t){outEmpty('Type text or choose a file to encode.');return}try{var r=b64enc(t);if(byId('b64e-url').checked)r=r.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');setOut('<div class="mono">'+esc(r)+'</div><div class="muted" style="margin-top:8px;font-size:.8rem">'+fmt(r.length,0)+' characters</div>')}catch(e){setOut('Could not encode this text.',true)}}
onAll('b64e-in b64e-url',calc);
wireDrop('b64e-file',function(f){if(f.size>5242880){toast('File is larger than 5 MB','err');return}var rd=new FileReader();rd.onload=function(){setOut('<div class="mono">'+esc(rd.result)+'</div><div class="muted" style="margin-top:8px;font-size:.8rem">'+esc(f.name)+' · '+bytes(f.size)+' → '+fmt(String(rd.result).length,0)+' characters</div>')};rd.readAsDataURL(f)});
}},
{slug:'base64-decoder',name:'Base64 Decoder',icon:'braces',cats:['developer','converters'],added:'2026-05-16',
desc:'Decode Base64 back to readable text with UTF-8 support, URL-safe input and image preview.',
about:'Paste a Base64 string to decode it into readable text. Standard and URL-safe Base64 are both supported, and image data URIs are previewed so you can download the picture.',
features:['Standard and URL-safe input','Automatic padding fix','Image data URI preview','Clear error messages'],
faq:[['Why do I get an invalid Base64 error?','The input contains characters outside the Base64 alphabet or is truncated. Check that you copied the full string.'],['Can it decode images?','Yes. Paste a data:image/... Base64 string to preview and download the image.'],['Is binary data supported?','Text is decoded as UTF-8. Binary files other than images are best decoded with a desktop tool.']],
render:function(b){
b.innerHTML=F('Base64 to decode','b64d-in',TA('b64d-in','SGVsbG8sIHdvcmxkIQ==',6,'mono'))+OUT('Paste Base64 to decode it.')+'<div class="img-preview" id="b64d-img"></div>';
var blob=null;
function calc(){var t=val('b64d-in').trim(),ib=byId('b64d-img');ib.innerHTML='';blob=null;if(!t){outEmpty('Paste Base64 to decode it.');return}
var m=t.match(/^data:(image\/(?:png|jpe?g|gif|webp));base64,([A-Za-z0-9+\/=\s]+)$/);
if(m){try{var bin=atob(m[2].replace(/\s+/g,'')),u=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);blob=new Blob([u],{type:m[1]});var fig=D.createElement('figure'),img=D.createElement('img');img.alt='Decoded image';img.src=URL.createObjectURL(blob);fig.appendChild(img);ib.appendChild(fig);setOut('<b>Image decoded</b> · '+esc(m[1])+' · '+bytes(blob.size)+' · use Download to save it')}catch(e){setOut('This image data is not valid Base64.',true)}return}
if(!/^[A-Za-z0-9+\/=_\-\s]+$/.test(t)){setOut('Invalid Base64: the input contains characters outside the Base64 alphabet.',true);return}
try{setOut('<div>'+esc(b64dec(t))+'</div>')}catch(e){setOut('Invalid Base64, or the decoded bytes are not UTF-8 text.',true)}}
byId('b64d-in').addEventListener('input',calc);
return {download:function(){if(blob)downloadBlob(blob,'decoded-image.'+(blob.type.split('/')[1]||'png'));else return false}};
}},
{slug:'image-compressor',name:'Image Compressor',icon:'compress',cats:['image'],added:'2026-09-10',
desc:'Compress JPG, PNG and WebP images in your browser with adjustable quality and resizing.',
about:'Shrink photos for websites, email and social media without uploading them anywhere. Adjust quality, optionally limit the width, and compare the before and after size instantly.',
features:['Private, in-browser compression','Adjustable quality slider','Optional resize by max width','JPG or WebP output with size comparison'],
faq:[['What quality should I choose?','70 to 80 percent usually looks identical to the original while saving a lot of space.'],['Why did my PNG get bigger?','PNG is lossless. Switch the output to JPG or WebP to get real size savings on photos.'],['Are my images uploaded?','No. Compression happens entirely on your device.']],
render:function(b){
b.innerHTML=dropZone('ic-file','image/jpeg,image/png,image/webp','Choose an image to compress')+ROW(F('Quality: <b id="ic-qv">75</b>%','ic-q',I('ic-q','range','min="10" max="100" value="75"')),F('Max width (px)','ic-w',I('ic-w','number','min="16" placeholder="Keep original"')),F('Output format','ic-f',SEL('ic-f',[['image/jpeg','JPG'],['image/webp','WebP'],['image/png','PNG (lossless)']],'image/jpeg')))+OUT('Choose an image to compress.')+'<div class="img-preview" id="ic-prev"></div>';
var file=null,img=null,url=null,out=null;
var run=debounce(function(){if(!img)return;byId('ic-qv').textContent=val('ic-q');var q=num('ic-q')/100,mw=num('ic-w'),w=img.naturalWidth,h=img.naturalHeight;if(mw>0&&mw<w){h=Math.round(h*mw/w);w=Math.round(mw)}var type=val('ic-f');
encode(img,w,h,type,q,type==='image/jpeg'?'#FFFFFF':null,function(bl){out=bl;var saved=(1-bl.size/file.size)*100;byId('ic-prev').innerHTML=figure(url,'Original · '+bytes(file.size)+' · '+img.naturalWidth+'×'+img.naturalHeight)+figure(URL.createObjectURL(bl),'Compressed · '+bytes(bl.size)+' · '+w+'×'+h);
setOut(saved>0?big('Saved '+saved.toFixed(1)+'%')+kv([['Original',bytes(file.size)],['Compressed',bytes(bl.size)],['Dimensions',w+'×'+h]]):'<b>This image is already well optimized.</b> Try a lower quality, a smaller width or a different format.')})},200);
wireDrop('ic-file',function(f){readImage(f,function(im,u){file=f;img=im;url=u;run()})});
onAll('ic-q ic-w ic-f',function(){byId('ic-qv').textContent=val('ic-q');run()});
return {download:function(){if(!out){toast('Choose an image first','warn');return}var ext=out.type==='image/webp'?'webp':out.type==='image/png'?'png':'jpg';downloadBlob(out,baseName(file)+'-compressed.'+ext)}};
}},
{slug:'collage-maker',name:'Collage Maker',icon:'grid',cats:['image'],added:'2026-11-09',
desc:'Make a photo collage online for free. Pick a layout, adjust spacing, corners and background, then download a high-quality JPG, PNG or WebP.',
about:'Combine 2 to 20 photos into one picture in seconds. Choose a grid, row, column, big-photo or mosaic layout, set the size for Instagram, stories, YouTube or print, and fine-tune spacing, rounded corners and background colour. Everything happens in your browser, so your photos are never uploaded.',
features:['Up to 20 photos in one collage','6 layouts: grid, row, column, big left, big top and mosaic','Sizes for Instagram posts, stories, YouTube, Facebook and A4 print','Adjustable spacing, rounded corners and background colour','Fill (crop) or fit (no crop) photo modes','JPG, PNG or WebP download, 100% private in your browser'],
faq:[['Is this collage maker free?','Yes. It is completely free with no sign-up, no watermark and no limit on how many collages you make.'],['How many photos can I add?','You can add up to 20 photos. Layouts such as Grid, Row and Big left adjust automatically to the number of photos you add.'],['Are my photos uploaded to a server?','No. The collage is drawn on your own device with the browser canvas, so your photos never leave your phone or computer.'],['What size should I use for Instagram?','Use 1:1 square (1080×1080) or 4:5 portrait (1080×1350) for feed posts, and 9:16 (1080×1920) for Stories and Reels.'],['Why are parts of my photos cut off?','Fill mode crops each photo to fill its cell neatly. Switch Photo fit to Fit to show the whole photo with background around it.']],
render:function(b){
var LAYOUTS=[['grid','Grid (auto)'],['row','Row'],['col','Column'],['left','Big left'],['top','Big top'],['mosaic','Mosaic']];
var SIZES=[['1:1','Square 1:1 (Instagram post)'],['4:5','Portrait 4:5 (Instagram)'],['9:16','Story 9:16 (Reels, Status)'],['16:9','Wide 16:9 (YouTube thumbnail)'],['1.91:1','Facebook / link 1.91:1'],['3:2','Photo 3:2'],['2:3','Pinterest 2:3'],['1:1.414','A4 print (portrait)']];
b.innerHTML=pdfDrop('cm-file','Choose photos for your collage',true,'image/*')+
'<div id="cm-list" class="cm-list" aria-label="Selected photos"></div>'+
ROW(F('Layout','cm-l',SEL('cm-l',LAYOUTS,'grid')),F('Size / ratio','cm-r',SEL('cm-r',SIZES,'1:1')),F('Width (px)','cm-w',I('cm-w','number','min="300" max="4000" step="10" value="1080"')))+
ROW(F('Spacing: <b id="cm-gv">12</b> px','cm-g',I('cm-g','range','min="0" max="80" value="12"')),F('Corners: <b id="cm-cv">0</b> px','cm-c',I('cm-c','range','min="0" max="80" value="0"')),F('Background','cm-bg',I('cm-bg','color','value="#ffffff"')))+
ROW(F('Photo fit','cm-fit',SEL('cm-fit',[['cover','Fill (crop to cell)'],['contain','Fit (show whole photo)']],'cover')),F('Download format','cm-f',SEL('cm-f',[['image/jpeg','JPG'],['image/png','PNG'],['image/webp','WebP']],'image/jpeg')),F('Photo order','cm-sh','<button type="button" class="btn btn-ghost btn-sm" id="cm-sh">'+ico('dice')+' Shuffle</button>'))+
OUT('Add 2 or more photos to build your collage.')+
'<div class="cm-stage" id="cm-stage" hidden><canvas id="cm-cv-out" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:12px;box-shadow:0 6px 24px rgba(15,23,42,.12)"></canvas><p style="text-align:center;margin-top:12px"><button type="button" class="btn btn-primary" id="cm-dl">'+ico('download')+' Download collage</button></p></div>'+
'<style>.cm-list{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px}.cm-item{position:relative;width:86px;height:86px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--soft)}.cm-item img{width:100%;height:100%;object-fit:cover;cursor:default;border-radius:0}.cm-item .cm-n{position:absolute;left:4px;top:4px;background:rgba(15,23,42,.75);color:#fff;font-size:11px;font-weight:700;border-radius:8px;padding:1px 6px}.cm-item .cm-b{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;background:rgba(15,23,42,.6)}.cm-item .cm-b button{flex:1;border:0;background:transparent;color:#fff;font-size:13px;line-height:22px;cursor:pointer;padding:0}.cm-item .cm-b button:hover{background:rgba(255,255,255,.2)}</style>';
var items=[],canvas=byId('cm-cv-out'),MAX=20;
function ratio(){var p=val('cm-r').split(':');return parseFloat(p[1])/parseFloat(p[0])}
function cells(n,lay){var r=[],i,k;
if(lay==='row'){for(i=0;i<n;i++)r.push([i/n,0,1/n,1]);return r}
if(lay==='col'){for(i=0;i<n;i++)r.push([0,i/n,1,1/n]);return r}
if(lay==='left'){if(n<2)return [[0,0,1,1]];r.push([0,0,.6,1]);k=n-1;for(i=0;i<k;i++)r.push([.6,i/k,.4,1/k]);return r}
if(lay==='top'){if(n<2)return [[0,0,1,1]];r.push([0,0,1,.62]);k=n-1;for(i=0;i<k;i++)r.push([i/k,.62,1/k,.38]);return r}
if(lay==='mosaic'){r=[[0,0,2/3,2/3],[2/3,0,1/3,1/3],[2/3,1/3,1/3,1/3],[0,2/3,1/3,1/3],[1/3,2/3,1/3,1/3],[2/3,2/3,1/3,1/3]];return r}
var c=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/c),idx=0;for(var y=0;y<rows;y++){var inRow=Math.min(c,n-idx);for(var x=0;x<inRow;x++){r.push([x/inRow,y/rows,1/inRow,1/rows]);idx++}}return r}
function rr(x,X,Y,W,H,R){R=Math.max(0,Math.min(R,W/2,H/2));x.beginPath();x.moveTo(X+R,Y);x.lineTo(X+W-R,Y);x.arcTo(X+W,Y,X+W,Y+R,R);x.lineTo(X+W,Y+H-R);x.arcTo(X+W,Y+H,X+W-R,Y+H,R);x.lineTo(X+R,Y+H);x.arcTo(X,Y+H,X,Y+H-R,R);x.lineTo(X,Y+R);x.arcTo(X,Y,X+R,Y,R);x.closePath()}
function draw(){
byId('cm-gv').textContent=val('cm-g');byId('cm-cv').textContent=val('cm-c');
if(items.length<1){byId('cm-stage').hidden=true;setOut('Add 2 or more photos to build your collage.');byId('t-out').className='result empty';return}
var W=Math.round(Math.min(4000,Math.max(300,num('cm-w')||1080))),H=Math.round(W*ratio()),g=Math.round(num('cm-g')*W/1080)||0,cr=Math.round(num('cm-c')*W/1080)||0,fit=val('cm-fit'),lay=val('cm-l');
canvas.width=W;canvas.height=H;var x=canvas.getContext('2d');x.fillStyle=val('cm-bg')||'#ffffff';x.fillRect(0,0,W,H);x.imageSmoothingQuality='high';
var cs=cells(items.length,lay),iw=W-g,ih=H-g;
cs.forEach(function(c,i){var X=Math.round(g+c[0]*iw),Y=Math.round(g+c[1]*ih),CW=Math.round(c[2]*iw-g),CH=Math.round(c[3]*ih-g);if(CW<2||CH<2)return;var it=items[i%items.length],im=it.img,sw=im.naturalWidth,sh=im.naturalHeight;
x.save();
if(fit==='contain'){var s=Math.min(CW/sw,CH/sh),dw=sw*s,dh=sh*s,dx=X+(CW-dw)/2,dy=Y+(CH-dh)/2;rr(x,dx,dy,dw,dh,cr);x.clip();x.drawImage(im,dx,dy,dw,dh)}
else{rr(x,X,Y,CW,CH,cr);x.clip();var s2=Math.max(CW/sw,CH/sh),cw=CW/s2,ch=CH/s2;x.drawImage(im,(sw-cw)/2,(sh-ch)/2,cw,ch,X,Y,CW,CH)}
x.restore()});
byId('cm-stage').hidden=false;
setOut('<b>'+items.length+'</b> photo'+(items.length>1?'s':'')+' · '+esc(LAYOUTS.filter(function(l){return l[0]===lay})[0][1])+' layout · '+W+'×'+H+' px'+(lay==='mosaic'&&items.length<6?' · Mosaic has 6 cells, so some photos repeat. Add more photos for a unique mosaic.':'')+(items.length<2?' · Add at least one more photo.':''));
}
var redraw=debounce(draw,60);
function list(){var L=byId('cm-list');L.innerHTML=items.map(function(it,i){return '<div class="cm-item"><img src="'+it.url+'" alt="Collage photo '+(i+1)+'"><span class="cm-n">'+(i+1)+'</span><div class="cm-b"><button type="button" data-a="l" data-i="'+i+'" aria-label="Move photo '+(i+1)+' left">&#8592;</button><button type="button" data-a="x" data-i="'+i+'" aria-label="Remove photo '+(i+1)+'">&#10005;</button><button type="button" data-a="r" data-i="'+i+'" aria-label="Move photo '+(i+1)+' right">&#8594;</button></div></div>'}).join('');redraw()}
byId('cm-list').addEventListener('click',function(e){var bt=e.target.closest('button');if(!bt)return;var i=+bt.getAttribute('data-i'),a=bt.getAttribute('data-a'),t;
if(a==='x'){URL.revokeObjectURL(items[i].url);items.splice(i,1)}
else if(a==='l'&&i>0){t=items[i-1];items[i-1]=items[i];items[i]=t}
else if(a==='r'&&i<items.length-1){t=items[i+1];items[i+1]=items[i];items[i]=t}
list()});
function add(files){files=files.filter(function(f){return /^image\//.test(f.type)});if(!files.length){toast('Please choose image files','err');return}
var room=MAX-items.length;if(room<=0){toast('You can add up to '+MAX+' photos','warn');return}if(files.length>room){toast('Only the first '+room+' photos were added (max '+MAX+')','warn');files=files.slice(0,room)}
var left=files.length;files.forEach(function(f){var u=URL.createObjectURL(f),im=new Image();im.onload=function(){items.push({img:im,url:u,name:f.name});if(--left===0)list()};im.onerror=function(){URL.revokeObjectURL(u);toast('Could not read '+f.name,'err');if(--left===0)list()};im.src=u})}
wireDropMulti('cm-file',add);
onAll('cm-l cm-r cm-w cm-g cm-c cm-bg cm-fit',redraw);
byId('cm-sh').addEventListener('click',function(){for(var i=items.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=items[i];items[i]=items[j];items[j]=t}list()});
function dl(){if(!items.length){toast('Add photos first','warn');return}draw();var type=val('cm-f'),ext=type==='image/png'?'png':type==='image/webp'?'webp':'jpg';canvas.toBlob(function(bl){if(!bl){toast('Your browser cannot save this format','err');return}downloadBlob(bl,'collage-'+canvas.width+'x'+canvas.height+'.'+ext)},type,.92)}
byId('cm-dl').addEventListener('click',dl);
return {download:function(){dl()}};
}},
{slug:'jpg-to-png',name:'JPG to PNG Converter',icon:'image',cats:['image','converters'],added:'2026-09-01',
desc:'Convert JPG and JPEG images to lossless PNG format instantly, privately in your browser.',
about:'Convert JPG photos to PNG for editing, transparency workflows or lossless storage. The conversion runs on your device, so your images are never uploaded.',
features:['Lossless PNG output','Keeps original dimensions','No upload, no watermark','Instant preview and download'],
faq:[['Will converting to PNG improve quality?','No. PNG preserves the current pixels exactly but cannot restore detail already lost in the JPG.'],['Why is the PNG larger?','PNG is lossless, so photos usually become larger than the compressed JPG.'],['Can I convert other formats?','Yes. Any image your browser can open will be converted to PNG.']],
render:function(b){
b.innerHTML=dropZone('jp-file','image/jpeg,image/*','Choose a JPG image')+OUT('Choose a JPG image to convert.')+'<div class="img-preview" id="jp-prev"></div>';
var out=null,file=null;
wireDrop('jp-file',function(f){readImage(f,function(im,u){file=f;encode(im,im.naturalWidth,im.naturalHeight,'image/png',1,null,function(bl){out=bl;byId('jp-prev').innerHTML=figure(u,'Original · '+bytes(f.size))+figure(URL.createObjectURL(bl),'PNG · '+bytes(bl.size));setOut(big('Converted to PNG')+kv([['Original',bytes(f.size)],['PNG',bytes(bl.size)],['Dimensions',im.naturalWidth+'×'+im.naturalHeight]]));toast('Converted to PNG','ok')})})});
return {download:function(){if(!out){toast('Choose an image first','warn');return}downloadBlob(out,baseName(file)+'.png')}};
}},
{slug:'webp-to-jpg',name:'WebP to JPG Converter',icon:'image',cats:['image','converters'],added:'2026-09-05',
desc:'Convert WebP images to widely compatible JPG with adjustable quality and background color.',
about:'Some apps and websites still do not accept WebP. Convert WebP images to JPG in one step, choose the quality, and pick a background color for transparent areas.',
features:['Adjustable JPG quality','Custom background for transparency','Keeps original dimensions','Runs entirely in your browser'],
faq:[['What happens to transparent areas?','JPG has no transparency, so transparent pixels are filled with the background color you choose (white by default).'],['Which quality is best?','85 to 92 percent gives excellent quality with reasonable file size.'],['Does it support animated WebP?','Only the first frame is converted, because JPG does not support animation.']],
render:function(b){
b.innerHTML=dropZone('wj-file','image/webp,image/*','Choose a WebP image')+ROW(F('Quality: <b id="wj-qv">90</b>%','wj-q',I('wj-q','range','min="10" max="100" value="90"')),F('Background color','wj-bg',I('wj-bg','color','value="#FFFFFF"')))+OUT('Choose a WebP image to convert.')+'<div class="img-preview" id="wj-prev"></div>';
var out=null,file=null,img=null,url=null;
var run=debounce(function(){if(!img)return;byId('wj-qv').textContent=val('wj-q');encode(img,img.naturalWidth,img.naturalHeight,'image/jpeg',num('wj-q')/100,val('wj-bg'),function(bl){out=bl;byId('wj-prev').innerHTML=figure(url,'Original · '+bytes(file.size))+figure(URL.createObjectURL(bl),'JPG · '+bytes(bl.size));setOut(big('Converted to JPG')+kv([['Original',bytes(file.size)],['JPG',bytes(bl.size)],['Dimensions',img.naturalWidth+'×'+img.naturalHeight]]))})},200);
wireDrop('wj-file',function(f){readImage(f,function(im,u){file=f;img=im;url=u;run()})});
onAll('wj-q wj-bg',function(){byId('wj-qv').textContent=val('wj-q');run()});
return {download:function(){if(!out){toast('Choose an image first','warn');return}downloadBlob(out,baseName(file)+'.jpg')}};
}},
{slug:'avif-to-jpg-png',name:'AVIF to JPG & PNG Converter',icon:'image',cats:['image','converters'],added:'2026-10-07',
desc:'Convert AVIF images to JPG or PNG in your browser with adjustable quality and a custom background color.',
about:'AVIF files are small and sharp, but many apps, editors and upload forms still reject them. Drop in an AVIF image, pick JPG for small files or PNG to keep transparency, and download the converted image in one click.',
features:['Convert AVIF to JPG or PNG','Adjustable JPG quality','Keeps transparency when you choose PNG','Custom background for transparent areas in JPG','Keeps original dimensions','Runs entirely in your browser'],
faq:[['Should I convert AVIF to JPG or PNG?','Choose JPG for photos when you want a small file that opens everywhere. Choose PNG when the image has transparency, text or sharp edges, or when you plan to edit it further.'],['What happens to transparent areas in JPG?','JPG has no transparency, so transparent pixels are filled with the background color you pick (white by default). Choose PNG to keep transparency.'],['Why does my browser say it cannot read the AVIF file?','Opening AVIF needs a recent browser such as Chrome, Edge, Firefox, Opera or Safari 16.4 or later. Update your browser and try again.'],['Are my images uploaded?','No. The conversion happens on your own device, so your images never leave your browser.']],
render:function(b){
b.innerHTML=dropZone('aj-file','image/avif,.avif,image/*','Choose an AVIF image')+ROW(F('Output format','aj-fmt',SEL('aj-fmt',[['jpg','JPG (smaller file)'],['png','PNG (keeps transparency)']],'jpg')),F('JPG quality: <b id="aj-qv">90</b>%','aj-q',I('aj-q','range','min="10" max="100" value="90"')),F('Background color (JPG)','aj-bg',I('aj-bg','color','value="#FFFFFF"')))+OUT('Choose an AVIF image to convert.')+'<div class="img-preview" id="aj-prev"></div>';
var out=null,file=null,img=null,url=null;
function isPng(){return val('aj-fmt')==='png'}
function sync(){byId('aj-qv').textContent=val('aj-q');byId('aj-q').disabled=isPng();byId('aj-bg').disabled=isPng()}
var run=debounce(function(){if(!img)return;sync();var png=isPng(),L=png?'PNG':'JPG';encode(img,img.naturalWidth,img.naturalHeight,png?'image/png':'image/jpeg',png?1:num('aj-q')/100,png?null:val('aj-bg'),function(bl){out=bl;byId('aj-prev').innerHTML=figure(url,'Original AVIF · '+bytes(file.size))+figure(URL.createObjectURL(bl),L+' · '+bytes(bl.size));setOut(big('Converted to '+L)+kv([['Original AVIF',bytes(file.size)],[L,bytes(bl.size)],['Dimensions',img.naturalWidth+'×'+img.naturalHeight]]));toast('Converted to '+L,'ok')})},200);
wireDrop('aj-file',function(f){if(f&&!/^image\//.test(f.type)&&/\.avif$/i.test(f.name||'')){try{f=new File([f],f.name,{type:'image/avif'})}catch(e){}}readImage(f,function(im,u){file=f;img=im;url=u;run()})});
onAll('aj-fmt aj-q aj-bg',function(){sync();run()});
sync();
return {download:function(){if(!out){toast('Choose an AVIF image first','warn');return}downloadBlob(out,baseName(file)+'.'+(isPng()?'png':'jpg'))}};
}},
{slug:'color-palette-generator',name:'Color Picker and Palette Generator',icon:'color',cats:['color','developer'],added:'2026-08-25',
desc:'Pick any color, convert HEX, RGB, HSL and CMYK, and generate harmonious palettes to copy or download.',
about:'Choose a color from the picker, type a HEX code or sample one from an image. Get every common color format and generate complementary, analogous, triadic, tetradic, shade and tint palettes you can copy with a click or download as an image.',
features:['HEX, RGB, HSL and CMYK values','Six palette harmony modes','Pick colors from your own image','Download palette as PNG'],
faq:[['How do I copy a color?','Click any swatch to copy its HEX code to your clipboard.'],['What is an analogous palette?','Colors that sit next to each other on the color wheel, which usually look calm and cohesive.'],['Is my image uploaded when picking colors?','No. The image is drawn on a canvas in your browser only.']],
render:function(b){
b.innerHTML=ROW(F('Pick a color','cp-c',I('cp-c','color','value="#2563EB"')),F('HEX code','cp-h',I('cp-h','text','value="#2563EB" maxlength="7" spellcheck="false" autocomplete="off"')))+SEG('cp-m',[['ana','Analogous'],['comp','Complementary'],['tri','Triadic'],['tet','Tetradic'],['mono','Shades'],['tint','Tints']],'ana')+dropZone('cp-img','image/*','Pick a color from an image (optional)')+'<canvas class="pick-canvas hide" id="cp-canvas"></canvas>'+OUT();
var pal=[];
function palette(h,s,l,m){var r=[];if(m==='comp')r=[[h,s,l],[h+180,s,l],[h,s,Math.max(10,l-20)],[h+180,s,Math.min(90,l+20)],[h,Math.max(10,s-30),l]];else if(m==='tri')r=[[h,s,l],[h+120,s,l],[h+240,s,l],[h+120,s,Math.min(90,l+18)],[h+240,s,Math.max(10,l-18)]];else if(m==='tet')r=[[h,s,l],[h+90,s,l],[h+180,s,l],[h+270,s,l],[h,s,Math.min(92,l+25)]];else if(m==='mono')r=[0,1,2,3,4,5].map(function(i){return [h,s,Math.max(6,l-i*12)]});else if(m==='tint')r=[0,1,2,3,4,5].map(function(i){return [h,Math.max(0,s-i*6),Math.min(97,l+i*9)]});else r=[-40,-20,0,20,40].map(function(d){return [h+d,s,l]});return r.map(function(x){var c=hslToRgb(x[0],x[1],x[2]);return rgbToHex(c[0],c[1],c[2])})}
function calc(hex){var rgb=hexToRgb(hex);flag('cp-h',!rgb);if(!rgb){setOut('Enter a valid HEX color like #2563EB.',true);return}hex=rgbToHex(rgb[0],rgb[1],rgb[2]);byId('cp-c').value=hex.toLowerCase();if(D.activeElement!==byId('cp-h'))byId('cp-h').value=hex;
var hsl=rgbToHsl(rgb[0],rgb[1],rgb[2]),k=1-Math.max(rgb[0],rgb[1],rgb[2])/255,cm=k>=1?[0,0,0]:[(1-rgb[0]/255-k)/(1-k),(1-rgb[1]/255-k)/(1-k),(1-rgb[2]/255-k)/(1-k)];
pal=palette(hsl[0],hsl[1],hsl[2],segVal('cp-m'));
setOut('<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><span style="width:56px;height:56px;border-radius:16px;background:'+hex+';border:1px solid var(--line);display:inline-block"></span>'+big(hex)+'</div>'+kv([['HEX',hex],['RGB','rgb('+rgb.join(', ')+')'],['HSL','hsl('+Math.round(hsl[0])+', '+Math.round(hsl[1])+'%, '+Math.round(hsl[2])+'%)'],['CMYK',cm.map(function(v){return Math.round(v*100)}).join(', ')+', '+Math.round(k*100)]])+'<div class="swatches">'+pal.map(function(c){return '<button type="button" class="swatch" data-hex="'+c+'" aria-label="Copy '+c+'"><i style="background:'+c+'"></i><span>'+c+'</span></button>'}).join('')+'</div>')}
byId('cp-c').addEventListener('input',function(){calc(val('cp-c'))});
byId('cp-h').addEventListener('input',function(){var v=val('cp-h').trim();if(v&&v.charAt(0)!=='#')v='#'+v;if(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v))calc(v);else flag('cp-h',true)});
segWire('cp-m',function(){calc(val('cp-c'))});
byId('t-out').addEventListener('click',function(e){var s=e.target.closest('.swatch');if(s)copyText(s.getAttribute('data-hex'),s.getAttribute('data-hex')+' copied')});
wireDrop('cp-img',function(f){readImage(f,function(im){var cv=byId('cp-canvas'),sc=Math.min(1,640/im.naturalWidth);cv.width=Math.round(im.naturalWidth*sc);cv.height=Math.round(im.naturalHeight*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cv.classList.remove('hide');toast('Click the image to pick a color','ok')})});
byId('cp-canvas').addEventListener('click',function(e){var cv=this,r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)*cv.width/r.width),y=Math.floor((e.clientY-r.top)*cv.height/r.height),p=cv.getContext('2d').getImageData(x,y,1,1).data;calc(rgbToHex(p[0],p[1],p[2]))});
calc('#2563EB');
return {download:function(){if(!pal.length)return;var c=D.createElement('canvas'),w=200;c.width=w*pal.length;c.height=260;var x=c.getContext('2d');pal.forEach(function(h,i){x.fillStyle=h;x.fillRect(i*w,0,w,200);x.fillStyle='#FFFFFF';x.fillRect(i*w,200,w,60);x.fillStyle='#0F172A';x.font='600 22px Arial';x.textAlign='center';x.fillText(h,i*w+w/2,238)});c.toBlob(function(bl){downloadBlob(bl,'palette.png')},'image/png')}};
}},
{slug:'random-number-generator',name:'Random Number Generator',icon:'dice',cats:['productivity','utility'],added:'2026-08-10',
desc:'Generate random numbers in any range, unique or sorted lists, plus quick coin flips and dice rolls.',
about:'Pick lottery numbers, run a giveaway, choose a random winner or make a quick decision. Set a range and quantity, choose unique or sorted results, or tap the coin and dice shortcuts.',
features:['Any range, including decimals','Up to 1,000 numbers at once','Unique and sorted options','Coin flip and dice roll shortcuts'],
faq:[['Are the numbers truly random?','They use your browser\u2019s cryptographically secure random generator, which is suitable for games, draws and giveaways.'],['Why do I get an error with unique numbers?','The range must contain at least as many whole numbers as you ask for.'],['Can I generate decimals?','Yes. Choose the number of decimal places.']],
render:function(b){
b.innerHTML=ROW(F('Minimum','rn-min',I('rn-min','number','value="1"')),F('Maximum','rn-max',I('rn-max','number','value="100"')),F('How many','rn-n',I('rn-n','number','value="1" min="1" max="1000"')),F('Decimal places','rn-d',SEL('rn-d',['0','1','2','3','4'],'0')))+'<div class="checks"><label><input type="checkbox" id="rn-u"> Unique numbers</label><label><input type="checkbox" id="rn-s"> Sort results</label></div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="rn-go">'+ico('dice')+'Generate</button><button class="btn btn-ghost btn-sm" type="button" id="rn-coin">Flip a coin</button><button class="btn btn-ghost btn-sm" type="button" id="rn-die">Roll a die</button></div>'+OUT();
function gen(){var mn=num('rn-min'),mx=num('rn-max'),n=Math.floor(num('rn-n')),dp=parseInt(val('rn-d'),10),uniq=byId('rn-u').checked;
var bad=isNaN(mn)||isNaN(mx)||mn>=mx;flag('rn-min',bad);flag('rn-max',bad);if(bad){setOut('Minimum must be smaller than maximum.',true);return}
if(!(n>=1&&n<=1000)){flag('rn-n',true);setOut('Choose between 1 and 1,000 numbers.',true);return}flag('rn-n',false);
var list=[];if(dp===0){mn=Math.ceil(mn);mx=Math.floor(mx);var span=mx-mn+1;if(uniq&&span<n){setOut('The range only contains '+span+' whole numbers, so '+n+' unique numbers are impossible.',true);return}
if(uniq){var seen={};while(list.length<n){var v=mn+rndInt(span);if(!seen[v]){seen[v]=1;list.push(v)}}}else for(var i=0;i<n;i++)list.push(mn+rndInt(span))}
else{var seen2={};while(list.length<n){var v2=+(mn+crand()*(mx-mn)).toFixed(dp);if(uniq){if(seen2[v2])continue;seen2[v2]=1}list.push(v2)}}
if(byId('rn-s').checked)list.sort(function(a,c){return a-c});
setOut(n===1?big(String(list[0])):'<div class="mono" style="line-height:1.9">'+esc(list.join(', '))+'</div>')}
byId('rn-go').addEventListener('click',gen);
byId('rn-coin').addEventListener('click',function(){setOut(big(rndInt(2)?'Heads':'Tails'))});
byId('rn-die').addEventListener('click',function(){setOut(big('You rolled '+(1+rndInt(6))))});
gen();
}},
{slug:'merge-pdf',name:'Merge PDF',icon:'pdf',cats:['pdf','productivity'],added:'2026-09-27',
desc:'Combine multiple PDF files into one document in the order you choose, privately in your browser.',
about:'Join reports, invoices, scans and chapters into a single PDF. Add as many files as you like, drag them into the right order with the arrow buttons, and download one clean merged document. Nothing is uploaded.',
features:['Merge unlimited PDF files','Reorder and remove files before merging','Keeps original page quality and text','Runs 100% on your device'],
faq:[['Is there a limit on how many PDFs I can merge?','No fixed limit. Very large files depend on your device memory.'],['Will the quality change?','No. Pages are copied exactly as they are, so text stays sharp and searchable.'],['Can I merge password-protected PDFs?','Remove the password first. Encrypted PDFs cannot be merged in the browser.']],
render:function(b){
b.innerHTML=pdfDrop('mg-file','Choose PDF files to merge',true)+'<div class="flist" id="mg-list"></div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="mg-go" disabled>'+ico('pdf')+'Merge PDFs</button><button class="btn btn-ghost btn-sm" type="button" id="mg-clear">'+ico('x')+'Clear list</button></div>'+OUT('Add two or more PDF files to merge.');
var items=[],outB=null;
function draw(){byId('mg-list').innerHTML=fileRows(items);byId('mg-go').disabled=items.length<2;if(!outB)outEmpty(items.length<2?'Add two or more PDF files to merge.':items.length+' files ready. Use the arrows to set the order, then merge.')}
wireDropMulti('mg-file',function(fs){var bad=0;Promise.all(fs.map(function(f){if(!isPdf(f)){bad++;return null}return openPdf(f).then(function(d){return {file:f,pages:d.getPageCount()}},function(e){toast(f.name+': '+pdfErr(e),'err');return null})})).then(function(r){r.forEach(function(x){if(x)items.push(x)});if(bad)toast(bad+' file(s) skipped: not PDF','warn');outB=null;draw()})});
byId('mg-list').addEventListener('click',function(e){listClick(e,items,function(){outB=null;draw()})});
byId('mg-clear').addEventListener('click',function(){items=[];outB=null;draw()});
byId('mg-go').addEventListener('click',function(){var btn=this;busy(btn,true);needPdfLib().then(function(L){return L.PDFDocument.create().then(function(out){return items.reduce(function(p,it){return p.then(function(){return it.file.arrayBuffer().then(function(bf){return L.PDFDocument.load(bf)}).then(function(src){return out.copyPages(src,src.getPageIndices())}).then(function(pgs){pgs.forEach(function(pg){out.addPage(pg)})})})},Promise.resolve()).then(function(){return out.save()})})}).then(function(bytesOut){outB=pdfBlob(bytesOut);var tp=items.reduce(function(a,i){return a+i.pages},0);setOut(big('Merged '+items.length+' PDFs')+kv([['Total pages',String(tp)],['Merged size',bytes(outB.size)]])+'<div class="btn-row" style="margin:14px 0 0"><button type="button" class="btn btn-primary btn-sm" data-tool="download">'+ico('download')+'Download merged PDF</button></div>');toast('PDFs merged','ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
draw();return {download:function(){if(!outB){toast('Merge your PDFs first','warn');return}downloadBlob(outB,'merged.pdf')}};
}},
{slug:'split-pdf',name:'Split PDF',icon:'pdf',cats:['pdf'],added:'2026-09-27',
desc:'Extract selected pages or split a PDF into multiple files by page count, right in your browser.',
about:'Pull out just the pages you need or break a long PDF into smaller files. Extract a custom page range into one document, split every N pages, or save every page as its own PDF.',
features:['Extract custom page ranges like 1-3, 5, 8-','Split every N pages','Save every page as a separate PDF','Download parts individually or all at once'],
faq:[['How do I write page ranges?','Use commas and dashes: "1-3, 5, 9-" means pages 1 to 3, page 5, and page 9 to the end.'],['Does splitting reduce quality?','No. Pages are copied exactly, with text and images unchanged.'],['Can I split a very long PDF into single pages?','Yes, up to 300 parts at a time.']],
render:function(b){
b.innerHTML=pdfDrop('sp-file','Choose a PDF to split')+SEG('sp-m',[['range','Extract pages'],['every','Split every N pages'],['each','Every page separately']],'range')+'<div id="sp-f"></div><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="sp-go" disabled>'+ico('pdf')+'Split PDF</button></div>'+OUT('Choose a PDF to split.');
var file=null,pages=0,parts=[];
function fields(m){byId('sp-f').innerHTML=m==='range'?F('Pages to extract','sp-p',I('sp-p','text','placeholder="e.g. 1-3, 5, 8-" autocomplete="off"')):m==='every'?F('Pages per file','sp-n',I('sp-n','number','min="1" value="2" inputmode="numeric"')):'<p class="muted" style="font-size:.88rem">Each page will be saved as its own PDF file.</p>'}
segWire('sp-m',fields);fields('range');
wireDrop('sp-file',function(f){parts=[];setOut('Reading '+esc(f.name)+'…');openPdf(f).then(function(d){file=f;pages=d.getPageCount();byId('sp-go').disabled=false;setOut('<b>Ready:</b> '+esc(f.name)+kv([['Pages',String(pages)],['Size',bytes(f.size)]]))}).catch(function(e){file=null;byId('sp-go').disabled=true;setOut(esc(pdfErr(e)),true)})});
byId('sp-go').addEventListener('click',function(){if(!file)return;var btn=this,m=segVal('sp-m');busy(btn,true);
needPdfLib().then(function(L){return file.arrayBuffer().then(function(bf){return L.PDFDocument.load(bf)}).then(function(src){var groups=[];
if(m==='range'){var idx=parsePages(val('sp-p'),pages);if(!idx.length)throw uerr('Enter the pages you want to extract, for example 1-3, 5.');groups=[idx]}
else{var n=m==='each'?1:Math.floor(num('sp-n'));if(!(n>=1))throw uerr('Enter how many pages each file should have.');for(var i=0;i<pages;i+=n){var g=[];for(var k=i;k<Math.min(pages,i+n);k++)g.push(k);groups.push(g)}if(groups.length>300)throw uerr('That would create '+groups.length+' files. Please choose a larger page count (max 300 files).')}
return groups.reduce(function(p,g,gi){return p.then(function(acc){return L.PDFDocument.create().then(function(out){return out.copyPages(src,g).then(function(pgs){pgs.forEach(function(x){out.addPage(x)});return out.save()}).then(function(by){var label=g.length===1?'Page '+(g[0]+1):'Pages '+(g[0]+1)+'–'+(g[g.length-1]+1);if(m==='range')label=g.length+' extracted page'+(g.length>1?'s':'');acc.push([pdfBlob(by),baseName(file)+(m==='range'?'-extracted':'-part-'+(gi+1))+'.pdf',label]);return acc})})})},Promise.resolve([]))})}).then(function(list){parts=list;setOut(big(list.length===1?'Pages extracted':'Split into '+list.length+' files')+partsHtml(list)+'<div class="btn-row" style="margin:14px 0 0"><button type="button" class="btn btn-primary btn-sm" data-tool="download">'+ico('download')+(list.length>1?'Download all':'Download PDF')+'</button></div>');toast('PDF split','ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
return {download:function(){downloadMany(parts)}};
}},
{slug:'rotate-pdf',name:'Rotate PDF',icon:'reset',cats:['pdf'],added:'2026-09-27',
desc:'Rotate all pages or selected pages of a PDF by 90, 180 or 270 degrees and save it permanently.',
about:'Fix sideways scans and upside-down pages for good. Rotate every page or only the ones you choose, then download the corrected PDF.',
features:['Rotate 90°, 180° or 270°','All pages or selected pages','Rotation is saved permanently','No quality loss'],
faq:[['Can I rotate just one page?','Yes. Enter its page number, for example "3", or a range like "2-4".'],['Is the rotation permanent?','Yes. The downloaded PDF opens rotated in every viewer.'],['Does rotating reduce quality?','No. Only the page orientation changes.']],
render:pdfTool({action:'Rotate PDF',icon:'reset',suffix:'-rotated',fields:ROW(F('Rotate by','pr-a',SEL('pr-a',[['90','90° clockwise'],['180','180°'],['270','90° counter-clockwise']],'90')),F('Pages (leave blank for all)','pr-p',I('pr-p','text','placeholder="e.g. 1-3, 5" autocomplete="off"'))),
run:function(L,doc,pages){var deg=parseInt(val('pr-a'),10),idx=parsePages(val('pr-p'),pages);if(!idx.length)idx=doc.getPageIndices();var all=doc.getPages();idx.forEach(function(i){var p=all[i];p.setRotation(L.degrees((p.getRotation().angle+deg)%360))});return doc.save().then(function(by){return {bytes:by,title:'Rotated '+idx.length+' page'+(idx.length>1?'s':''),info:[['Angle',deg+'°'],['Pages rotated',String(idx.length)]]}})}})},
{slug:'remove-pdf-pages',name:'Remove PDF Pages',icon:'x',cats:['pdf'],added:'2026-09-27',
desc:'Delete unwanted pages from a PDF by page number or range and download the cleaned-up file.',
about:'Remove blank pages, covers, ads or confidential sections from a PDF. Enter the pages to delete and download a new PDF with only the pages you want to keep.',
features:['Delete single pages or ranges','Keeps remaining pages untouched','Clear errors for invalid page numbers','Private, in-browser processing'],
faq:[['How do I remove several pages at once?','Use commas and ranges, for example "1, 4-6, 10".'],['Can I undo removal?','Your original file is never changed. Just process it again with different pages.'],['Why can’t I remove every page?','A PDF needs at least one page, so at least one page must remain.']],
render:pdfTool({action:'Remove pages',icon:'x',suffix:'-edited',fields:F('Pages to remove','pd-p',I('pd-p','text','placeholder="e.g. 2, 5-7" autocomplete="off"')),
run:function(L,doc,pages){var idx=parsePages(val('pd-p'),pages);if(!idx.length)throw uerr('Enter the pages you want to remove, for example 2, 5-7.');if(idx.length>=pages)throw uerr('You cannot remove every page. At least one page must remain.');idx.sort(function(a,c){return c-a}).forEach(function(i){doc.removePage(i)});return doc.save().then(function(by){return {bytes:by,title:'Removed '+idx.length+' page'+(idx.length>1?'s':''),info:[['Pages left',String(pages-idx.length)]]}})}})},
{slug:'add-page-numbers-to-pdf',name:'Add Page Numbers to PDF',icon:'hash',cats:['pdf'],added:'2026-09-27',
desc:'Add page numbers to any PDF with your choice of position, format, starting number and font size.',
about:'Number reports, theses and contracts in seconds. Choose where the numbers go, pick a format like "Page 1 of 10", and set the starting number and size.',
features:['6 positions: top or bottom, left, center, right','Formats like 1, Page 1 and Page 1 of 10','Custom starting number','Adjustable font size'],
faq:[['Can I skip numbering the cover page?','Set the starting number to 0 and the cover will read 0, or remove the cover first with Remove PDF Pages.'],['Which font is used?','A clean Helvetica that is built into every PDF viewer.'],['Will it cover my content?','Numbers are placed in the page margin. Choose a different position if your document uses that area.']],
render:pdfTool({action:'Add page numbers',icon:'hash',suffix:'-numbered',fields:ROW(F('Position','pn-pos',SEL('pn-pos',[['bc','Bottom center'],['br','Bottom right'],['bl','Bottom left'],['tc','Top center'],['tr','Top right'],['tl','Top left']],'bc')),F('Format','pn-f',SEL('pn-f',[['n','1'],['pn','Page 1'],['pnt','Page 1 of 10'],['nt','1 / 10']],'pnt')),F('Start at','pn-s',I('pn-s','number','value="1" min="0" inputmode="numeric"')),F('Font size','pn-z',I('pn-z','number','value="11" min="6" max="36" inputmode="numeric"'))),
run:function(L,doc,pages){var pos=val('pn-pos'),f=val('pn-f'),st=Math.floor(num('pn-s')),sz=num('pn-z');if(isNaN(st))st=1;if(!(sz>=6&&sz<=36))throw uerr('Font size must be between 6 and 36.');var total=st+pages-1;
return doc.embedFont(L.StandardFonts.Helvetica).then(function(font){doc.getPages().forEach(function(p,i){var n=st+i,txt=f==='n'?String(n):f==='pn'?'Page '+n:f==='pnt'?'Page '+n+' of '+total:n+' / '+total,s=p.getSize(),w=font.widthOfTextAtSize(txt,sz),m=Math.max(18,sz*2),x=pos.charAt(1)==='c'?(s.width-w)/2:pos.charAt(1)==='r'?s.width-w-m:m,y=pos.charAt(0)==='b'?m*0.9:s.height-m*0.9-sz;p.drawText(txt,{x:x,y:y,size:sz,font:font,color:L.rgb(0.2,0.24,0.3)})});return doc.save()}).then(function(by){return {bytes:by,title:'Numbered '+pages+' pages',info:[['Format',f==='pnt'?'Page n of '+total:f==='nt'?'n / '+total:f==='pn'?'Page n':'n'],['Numbers',st+' to '+total]]}})}})},
{slug:'pdf-watermark',name:'Add Watermark to PDF',icon:'shield',cats:['pdf'],added:'2026-09-27',
desc:'Stamp a text watermark like CONFIDENTIAL or DRAFT on every page of a PDF with custom color, size and opacity.',
about:'Protect and label your documents with a text watermark. Choose diagonal, centered or tiled placement, then adjust the color, size and transparency so it stays readable.',
features:['Diagonal, centered or tiled watermark','Custom color and opacity','Adjustable font size','Applied to every page'],
faq:[['Can the watermark be removed?','It is drawn onto each page, so it cannot be removed with a simple click. It is a deterrent, not encryption.'],['Which characters can I use?','Standard Latin letters, numbers and common symbols work with the built-in PDF font.'],['Will it hide my text?','Use a low opacity like 20 to 30 percent so the page stays readable.']],
render:pdfTool({action:'Add watermark',icon:'shield',suffix:'-watermarked',init:function(){onAll('wm-o',function(){byId('wm-ov').textContent=val('wm-o')})},fields:F('Watermark text','wm-t',I('wm-t','text','value="CONFIDENTIAL" maxlength="60"'))+ROW(F('Placement','wm-s',SEL('wm-s',[['diag','Diagonal'],['center','Centered'],['tile','Tiled']],'diag')),F('Font size','wm-z',I('wm-z','number','value="54" min="8" max="200" inputmode="numeric"')),F('Opacity: <b id="wm-ov">25</b>%','wm-o',I('wm-o','range','min="5" max="100" value="25"')),F('Color','wm-c',I('wm-c','color','value="#EF4444"'))),
run:function(L,doc,pages){var t=val('wm-t').trim(),sz=num('wm-z'),op=num('wm-o')/100,st=val('wm-s'),col=hexRgb01(L,val('wm-c'));if(!t)throw uerr('Enter the watermark text.');if(!(sz>=8&&sz<=200))throw uerr('Font size must be between 8 and 200.');
return doc.embedFont(L.StandardFonts.HelveticaBold).then(function(font){var w=font.widthOfTextAtSize(t,sz);doc.getPages().forEach(function(p){var s=p.getSize(),o={size:sz,font:font,color:col,opacity:op};
if(st==='center'){o.x=(s.width-w)/2;o.y=s.height/2-sz/3;p.drawText(t,o)}
else if(st==='diag'){var a=Math.atan2(s.height,s.width),c=Math.cos(a),sn=Math.sin(a);o.rotate=L.radians(a);o.x=s.width/2-(w/2)*c+(sz/3)*sn;o.y=s.height/2-(w/2)*sn-(sz/3)*c;p.drawText(t,o)}
else{o.rotate=L.degrees(30);for(var yy=-s.height;yy<s.height*1.5;yy+=sz*4)for(var xx=-w;xx<s.width+w;xx+=w+sz*2){o.x=xx;o.y=yy;p.drawText(t,o)}}});return doc.save()}).then(function(by){return {bytes:by,title:'Watermark added',info:[['Text',t],['Pages',String(pages)]]}})}})},
{slug:'jpg-to-pdf',name:'JPG to PDF Converter',icon:'image',cats:['pdf','image','converters'],added:'2026-09-27',
desc:'Convert JPG, PNG and WebP images into a single PDF with page size, orientation and margin options.',
about:'Turn photos, scans and screenshots into one tidy PDF. Add your images, reorder them, choose A4, Letter or fit-to-image pages, and download a PDF ready to share or print.',
features:['JPG, PNG and WebP support','A4, Letter or fit-to-image pages','Auto orientation and margins','Reorder images before converting'],
faq:[['Can I combine many images into one PDF?','Yes. Add as many images as you like; each becomes one page in your chosen order.'],['Will my images be compressed?','JPG and PNG images are embedded as they are. Other formats are converted to PNG first.'],['Which page size should I choose?','A4 is standard in most countries, Letter in the US and Canada, and "Fit to image" keeps each page the exact image size.']],
render:function(b){
b.innerHTML=pdfDrop('ip-file','Choose images',true,'image/jpeg,image/png,image/webp,image/gif')+'<div class="flist" id="ip-list"></div>'+ROW(F('Page size','ip-s',SEL('ip-s',[['a4','A4'],['letter','US Letter'],['fit','Fit to image']],'a4')),F('Margin','ip-m',SEL('ip-m',[['0','None'],['20','Small'],['40','Large']],'20')))+'<div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="ip-go" disabled>'+ico('pdf')+'Create PDF</button><button class="btn btn-ghost btn-sm" type="button" id="ip-clear">'+ico('x')+'Clear</button></div>'+OUT('Add one or more images to convert.');
var items=[],outB=null;
function draw(){byId('ip-list').innerHTML=fileRows(items,true);byId('ip-go').disabled=!items.length;if(!outB)outEmpty(items.length?items.length+' image'+(items.length>1?'s':'')+' ready. Reorder if needed, then create your PDF.':'Add one or more images to convert.')}
wireDropMulti('ip-file',function(fs){var bad=0;fs.forEach(function(f){if(!/^image\//.test(f.type)){bad++;return}items.push({file:f,url:URL.createObjectURL(f)})});if(bad)toast(bad+' file(s) skipped: not an image','warn');outB=null;draw()});
byId('ip-list').addEventListener('click',function(e){listClick(e,items,function(){outB=null;draw()})});
byId('ip-clear').addEventListener('click',function(){items=[];outB=null;draw()});
function toPng(f){return new Promise(function(res,rej){readImage(f,function(img){var c=D.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);c.toBlob(function(bl){bl?bl.arrayBuffer().then(res):rej(uerr('Could not convert '+f.name))},'image/png')})})}
byId('ip-go').addEventListener('click',function(){var btn=this,size=val('ip-s'),mg=num('ip-m');busy(btn,true);
needPdfLib().then(function(L){return L.PDFDocument.create().then(function(doc){return items.reduce(function(p,it){return p.then(function(){var f=it.file,jpg=f.type==='image/jpeg',png=f.type==='image/png';return (jpg||png?f.arrayBuffer():toPng(f)).then(function(buf){return jpg?doc.embedJpg(buf):doc.embedPng(buf)}).then(function(im){var iw=im.width*0.75,ih=im.height*0.75,pw,ph;if(size==='fit'){pw=iw+mg*2;ph=ih+mg*2}else{var base=size==='a4'?[595.28,841.89]:[612,792];if(iw>ih){pw=base[1];ph=base[0]}else{pw=base[0];ph=base[1]}}var sc=Math.min((pw-mg*2)/iw,(ph-mg*2)/ih,size==='fit'?1:Infinity),dw=iw*sc,dh=ih*sc,pg=doc.addPage([pw,ph]);pg.drawImage(im,{x:(pw-dw)/2,y:(ph-dh)/2,width:dw,height:dh})})})},Promise.resolve()).then(function(){return doc.save()})})}).then(function(by){outB=pdfBlob(by);setOut(big('PDF created with '+items.length+' page'+(items.length>1?'s':''))+kv([['Page size',size==='fit'?'Fit to image':size.toUpperCase()],['PDF size',bytes(outB.size)]])+'<div class="btn-row" style="margin:14px 0 0"><button type="button" class="btn btn-primary btn-sm" data-tool="download">'+ico('download')+'Download PDF</button></div>');toast('PDF created','ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
draw();return {download:function(){if(!outB){toast('Create the PDF first','warn');return}downloadBlob(outB,'images.pdf')}};
}},
{slug:'pdf-to-jpg',name:'PDF to JPG Converter',icon:'image',cats:['pdf','image','converters'],added:'2026-09-27',
desc:'Convert PDF pages to high-quality JPG or PNG images and download them individually or all at once.',
about:'Turn each page of a PDF into an image for slides, social posts or previews. Choose JPG or PNG, pick the resolution, convert all pages or just a range, and download the images you need.',
features:['JPG or PNG output','Normal, high and print resolution','Convert all pages or a page range','Preview and download each page'],
faq:[['What resolution should I pick?','High (144 DPI) suits screens and sharing. Print (216 DPI) gives sharper images for printing.'],['Is there a page limit?','Up to 100 pages per conversion to keep your browser responsive.'],['Are my files uploaded?','No. Pages are rendered by your browser on your own device.']],
render:function(b){
b.innerHTML=pdfDrop('pj-file','Choose a PDF to convert')+ROW(F('Format','pj-f',SEL('pj-f',[['image/jpeg','JPG'],['image/png','PNG']],'image/jpeg')),F('Resolution','pj-r',SEL('pj-r',[['1','Normal (72 DPI)'],['2','High (144 DPI)'],['3','Print (216 DPI)']],'2')),F('Pages (blank = all)','pj-p',I('pj-p','text','placeholder="e.g. 1-5" autocomplete="off"')))+'<div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="pj-go" disabled>'+ico('image')+'Convert to images</button></div>'+OUT('Choose a PDF to convert.')+'<div class="img-preview" id="pj-prev"></div>';
var file=null,pages=0,outs=[];
wireDrop('pj-file',function(f){outs=[];byId('pj-prev').innerHTML='';if(!isPdf(f)){setOut('Please choose a PDF file.',true);return}setOut('Reading '+esc(f.name)+'…');needPdfJs().then(function(lib){return f.arrayBuffer().then(function(bf){return lib.getDocument({data:new Uint8Array(bf)}).promise})}).then(function(pdf){file=f;pages=pdf.numPages;pdf.destroy();byId('pj-go').disabled=false;setOut('<b>Ready:</b> '+esc(f.name)+kv([['Pages',String(pages)],['Size',bytes(f.size)]]))}).catch(function(e){file=null;byId('pj-go').disabled=true;setOut(esc(pdfErr(e)),true)})});
byId('pj-go').addEventListener('click',function(){if(!file)return;var btn=this,type=val('pj-f'),sc=+val('pj-r'),ext=type==='image/png'?'png':'jpg',idx;try{idx=parsePages(val('pj-p'),pages);if(!idx.length)for(var i=0;i<pages;i++)idx.push(i);if(idx.length>100)throw uerr('Please convert up to 100 pages at a time.')}catch(e){setOut(esc(pdfErr(e)),true);return}
busy(btn,true);outs=[];var prev=byId('pj-prev');prev.innerHTML='';
needPdfJs().then(function(lib){return file.arrayBuffer().then(function(bf){return lib.getDocument({data:new Uint8Array(bf)}).promise})}).then(function(pdf){return idx.reduce(function(p,pi,k){return p.then(function(){setOut('Rendering page '+(k+1)+' of '+idx.length+'…<div class="progress-line"><i style="width:'+Math.round(k/idx.length*100)+'%"></i></div>');return pdf.getPage(pi+1).then(function(page){var vp=page.getViewport({scale:sc}),c=D.createElement('canvas');c.width=Math.floor(vp.width);c.height=Math.floor(vp.height);var ctx=c.getContext('2d');ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,c.width,c.height);return page.render({canvasContext:ctx,viewport:vp}).promise.then(function(){return new Promise(function(res){c.toBlob(res,type,0.92)})}).then(function(bl){page.cleanup();var nm=baseName(file)+'-page-'+(pi+1)+'.'+ext;outs.push([bl,nm]);var u=URL.createObjectURL(bl);prev.insertAdjacentHTML('beforeend','<figure><a href="'+u+'" download="'+esc(nm)+'"><img alt="Page '+(pi+1)+'" src="'+u+'"></a><figcaption>Page '+(pi+1)+' · '+c.width+'×'+c.height+' · '+bytes(bl.size)+' · click to download</figcaption></figure>')})})})},Promise.resolve()).then(function(){pdf.destroy()})}).then(function(){setOut(big('Converted '+outs.length+' page'+(outs.length>1?'s':''))+kv([['Format',ext.toUpperCase()],['Resolution',Math.round(72*sc)+' DPI']])+'<div class="btn-row" style="margin:14px 0 0"><button type="button" class="btn btn-primary btn-sm" data-tool="download">'+ico('download')+(outs.length>1?'Download all images':'Download image')+'</button></div>');toast('Pages converted','ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
return {download:function(){downloadMany(outs)}};
}},
{slug:'pdf-to-text',name:'PDF to Text',icon:'text',cats:['pdf','text','converters'],added:'2026-09-27',
desc:'Extract all text from a PDF page by page so you can copy, edit or download it as a TXT file.',
about:'Get the text out of reports, e-books and articles without retyping. The extractor reads every page, keeps line breaks where possible and labels each page so you can find your place.',
features:['Extracts text from every page','Page-by-page labels','Copy or download as .txt','Word and character counts'],
faq:[['Why is no text found in my PDF?','Scanned PDFs are images of text. They need OCR software, which this tool does not include.'],['Is formatting kept?','Plain text and line breaks are kept. Fonts, tables and images are not.'],['Can I extract text from specific pages?','Yes. Enter a page range such as 2-5 before extracting.']],
render:function(b){
b.innerHTML=pdfDrop('pt-file','Choose a PDF')+F('Pages (blank = all)','pt-p',I('pt-p','text','placeholder="e.g. 1-3" autocomplete="off"'))+'<div class="btn-row"><button class="btn btn-primary btn-sm" type="button" id="pt-go" disabled>'+ico('text')+'Extract text</button></div>'+OUT('Choose a PDF to extract its text.');
var file=null,pages=0,text='';
wireDrop('pt-file',function(f){text='';if(!isPdf(f)){setOut('Please choose a PDF file.',true);return}setOut('Reading '+esc(f.name)+'…');needPdfJs().then(function(lib){return f.arrayBuffer().then(function(bf){return lib.getDocument({data:new Uint8Array(bf)}).promise})}).then(function(pdf){file=f;pages=pdf.numPages;pdf.destroy();byId('pt-go').disabled=false;setOut('<b>Ready:</b> '+esc(f.name)+kv([['Pages',String(pages)],['Size',bytes(f.size)]]))}).catch(function(e){file=null;byId('pt-go').disabled=true;setOut(esc(pdfErr(e)),true)})});
byId('pt-go').addEventListener('click',function(){if(!file)return;var btn=this,idx;try{idx=parsePages(val('pt-p'),pages);if(!idx.length)for(var i=0;i<pages;i++)idx.push(i)}catch(e){setOut(esc(pdfErr(e)),true);return}busy(btn,true);var chunks=[];
needPdfJs().then(function(lib){return file.arrayBuffer().then(function(bf){return lib.getDocument({data:new Uint8Array(bf)}).promise})}).then(function(pdf){return idx.reduce(function(p,pi){return p.then(function(){return pdf.getPage(pi+1).then(function(page){return page.getTextContent().then(function(tc){var s='';tc.items.forEach(function(it){s+=it.str+(it.hasEOL?'\n':' ')});chunks.push('--- Page '+(pi+1)+' ---\n'+s.replace(/[ \t]+\n/g,'\n').replace(/ {2,}/g,' ').trim());page.cleanup()})})})},Promise.resolve()).then(function(){pdf.destroy()})}).then(function(){text=chunks.join('\n\n');var body=text.replace(/--- Page \d+ ---/g,'').trim(),wc=body?body.split(/\s+/).length:0;
if(!wc){setOut('<b>No selectable text found.</b> This PDF is probably a scan (an image of text). Try an OCR tool to recognize the text.');text=''}else setOut(big(fmt(wc,0)+' words extracted')+kv([['Pages',String(idx.length)],['Characters',fmt(body.length,0)]])+'<div class="field" style="margin:14px 0 0"><textarea class="inp" id="pt-out" rows="12" readonly></textarea></div>');var ta=byId('pt-out');if(ta)ta.value=text;toast('Text extracted','ok');busy(btn,false)},function(e){setOut(esc(pdfErr(e)),true);busy(btn,false)})});
return {text:function(){return text},download:function(){if(!text){toast('Extract text first','warn');return}downloadBlob(new Blob([text],{type:'text/plain;charset=utf-8'}),baseName(file)+'.txt')}};
}}

];
/* ---------- 5b. EXTENDED TOOL LIBRARY (ported from the Draftbench toolkit) ---------- */
var LIBS={pdf:PDFLIB_URL};
function dbText(b){var pre=$$('pre',b).map(function(e){return e.innerText.trim()}).filter(Boolean);if(pre.length)return pre.join('\n\n');var ok=$$('.status.ok',b).map(function(e){return e.innerText.trim()}).filter(Boolean);if(ok.length)return ok.join('\n');var ta=$('textarea',b);return ta?ta.value.trim():''}
function dbTool(d){return {slug:d.slug,name:d.name,icon:d.icon,cats:d.cats,added:'2026-09-20',desc:d.desc,
about:d.desc+' It runs entirely in your browser, so nothing you enter or upload ever leaves your device, and you can copy, download, print or share your result.',
features:['Instant results in your browser','No sign-up, no limits, no watermark','Copy, download, print or share results','Works on phones, tablets and desktops'],
faq:[['Is the '+d.name+' free?','Yes. It is completely free to use with no sign-up and no usage limits.'],['Is my data uploaded to a server?','No. Everything is processed locally in your browser on your own device.'],['Does it work on mobile?','Yes. It works in any modern browser on phones, tablets and computers.']],
render:function(b){b.innerHTML='<div class="dbx">'+d.html+'</div>';var box=b.firstChild,go=function(){try{d.init(box)}catch(e){box.insertAdjacentHTML('beforeend','<div class="result err">This tool could not start. Please refresh the page.</div>')}};
if(d.lib){box.insertAdjacentHTML('afterbegin','<div class="status dbx-load">Loading tool engine…</div>');loadScript(LIBS[d.lib]||d.lib).then(function(){var l=$('.dbx-load',box);if(l)l.remove();go()},function(){var l=$('.dbx-load',box);if(l){l.className='result err';l.textContent='A required component could not load. Check your connection and refresh the page.'}})}else go();
return {text:function(){return dbText(box)},download:function(){var a=$$('a[download]',box);if(a.length){a[a.length-1].click();return}return false}}}}}
TOOLS=TOOLS.concat([
{slug:"lorem-ipsum-generator",name:"Lorem Ipsum Generator",icon:"text",cats:["text"],desc:"Generate placeholder lorem ipsum paragraphs or words for designs, mockups and layouts.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"liCount\" value=\"3\" min=\"1\" max=\"20\" style=\"width:70px;\"><select id=\"liUnit\"><option value=\"p\">Paragraphs</option><option value=\"w\">Words</option></select><button class=\"act\" id=\"liBtn\">Generate</button></div><pre id=\"liOut\"></pre>",init(el){
       const words='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
       function pickWords(n){ return Array.from({length:n},()=>words[Math.floor(Math.random()*words.length)]).join(' '); }
       el.querySelector('#liBtn').addEventListener('click',()=>{
         const n=parseInt(el.querySelector('#liCount').value)||3, unit=el.querySelector('#liUnit').value, out=el.querySelector('#liOut');
         if(unit==='w'){ out.textContent=pickWords(n); }
         else { const paras=Array.from({length:n},()=>{ let s=pickWords(30+Math.floor(Math.random()*30)); return s.charAt(0).toUpperCase()+s.slice(1)+'.'; }); out.textContent=paras.join('\n\n'); }
       });
     }},
{slug:"text-cleaner",name:"Text Cleaner",icon:"text",cats:["text"],desc:"Trim lines, remove blank lines and delete duplicate lines from any text in one click.",lib:"",html:"<textarea id=\"tcInput\" placeholder=\"Paste messy text…\"></textarea>\n       <div class=\"row\"><button class=\"act\" data-c=\"trim\">Trim lines</button><button class=\"act\" data-c=\"blank\">Remove blank lines</button><button class=\"act\" data-c=\"dedupe\">Remove duplicate lines</button></div>",init(el){ const ta=el.querySelector('#tcInput');
       el.querySelectorAll('button[data-c]').forEach(b=>b.addEventListener('click',()=>{
         let lines=ta.value.split('\n'); const c=b.dataset.c;
         if(c==='trim') lines=lines.map(l=>l.trim());
         else if(c==='blank') lines=lines.filter(l=>l.trim()!=='');
         else if(c==='dedupe') lines=[...new Set(lines)];
         ta.value=lines.join('\n');
       })); }},
{slug:"reading-time-estimator",name:"Reading Time Estimator",icon:"clock",cats:["text"],desc:"Estimate how long your article takes to read at any words-per-minute speed.",lib:"",html:"<textarea id=\"rtiInput\" placeholder=\"Paste your article…\" oninput=\"void 0\"></textarea><div class=\"row\"><label style=\"font-size:13px;\">Words per minute</label><input type=\"number\" id=\"rtiWpm\" value=\"200\" style=\"width:80px;\"><button class=\"act\" id=\"rtiBtn\">Estimate</button></div><div class=\"status ok\" id=\"rtiOut\"></div>",init(el){ el.querySelector('#rtiBtn').addEventListener('click',()=>{
       const t=el.querySelector('#rtiInput').value.trim(), wpm=parseInt(el.querySelector('#rtiWpm').value)||200, out=el.querySelector('#rtiOut');
       const words=t?t.split(/\s+/).length:0, mins=words/wpm;
       out.textContent = `${words} words — about ${mins<1?Math.ceil(mins*60)+' sec':mins.toFixed(1)+' min'} to read`;
     }); }},
{slug:"palindrome-anagram-checker",name:"Palindrome and Anagram Checker",icon:"case",cats:["text"],desc:"Check whether a word or phrase is a palindrome and whether two words are anagrams.",lib:"",html:"<div class=\"row\"><input type=\"text\" id=\"paA\" placeholder=\"Word or phrase\" style=\"width:200px;\"><button class=\"act\" id=\"paCheck\">Check palindrome</button></div><div class=\"status ok\" id=\"paOut1\"></div>\n       <div class=\"row\" style=\"margin-top:14px;\"><input type=\"text\" id=\"paB1\" placeholder=\"Word 1\" style=\"width:140px;\"><input type=\"text\" id=\"paB2\" placeholder=\"Word 2\" style=\"width:140px;\"><button class=\"act\" id=\"paAnagram\">Check anagram</button></div><div class=\"status ok\" id=\"paOut2\"></div>",init(el){
       const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
       el.querySelector('#paCheck').addEventListener('click',()=>{
         const s=norm(el.querySelector('#paA').value), out=el.querySelector('#paOut1');
         if(!s){ out.textContent='Enter a word or phrase.'; return; }
         out.textContent = s===s.split('').reverse().join('') ? 'Yes — that is a palindrome.' : 'No — not a palindrome.';
       });
       el.querySelector('#paAnagram').addEventListener('click',()=>{
         const a=norm(el.querySelector('#paB1').value).split('').sort().join('');
         const b=norm(el.querySelector('#paB2').value).split('').sort().join('');
         const out=el.querySelector('#paOut2');
         if(!a||!b){ out.textContent='Enter both words.'; return; }
         out.textContent = a===b ? 'Yes — these are anagrams.' : 'No — not anagrams.';
       });
     }},
{slug:"text-reverser",name:"Text Reverser",icon:"swap",cats:["text"],desc:"Reverse the characters or the word order of any text instantly.",lib:"",html:"<textarea id=\"trInput\" placeholder=\"Text to reverse…\"></textarea><div class=\"row\"><button class=\"act\" data-m=\"chars\">Reverse characters</button><button class=\"act\" data-m=\"words\">Reverse word order</button></div>",init(el){ const ta=el.querySelector('#trInput');
       el.querySelectorAll('button[data-m]').forEach(b=>b.addEventListener('click',()=>{
         ta.value = b.dataset.m==='chars' ? ta.value.split('').reverse().join('') : ta.value.split(/\s+/).reverse().join(' ');
       })); }},
{slug:"text-sorter",name:"Text Sorter",icon:"text",cats:["text"],desc:"Sort lines of text alphabetically from A to Z, Z to A, or by length.",lib:"",html:"<textarea id=\"tsInput\" placeholder=\"One item per line…\"></textarea><div class=\"row\"><button class=\"act\" data-m=\"az\">A → Z</button><button class=\"act\" data-m=\"za\">Z → A</button><button class=\"act\" data-m=\"len\">By length</button></div>",init(el){ const ta=el.querySelector('#tsInput');
       el.querySelectorAll('button[data-m]').forEach(b=>b.addEventListener('click',()=>{
         let lines=ta.value.split('\n');
         if(b.dataset.m==='az') lines.sort((a,c)=>a.localeCompare(c));
         else if(b.dataset.m==='za') lines.sort((a,c)=>c.localeCompare(a));
         else lines.sort((a,c)=>a.length-c.length);
         ta.value=lines.join('\n');
       })); }},
{slug:"remove-extra-spaces",name:"Remove Extra Spaces and Line Breaks",icon:"text",cats:["text"],desc:"Clean messy text by removing extra spaces, tabs and unwanted line breaks.",lib:"",html:"<textarea id=\"resInput\" placeholder=\"Messy   text with   gaps…\"></textarea><div class=\"row\"><button class=\"act\" data-m=\"spaces\">Remove extra spaces</button><button class=\"act\" data-m=\"breaks\">Remove line breaks</button></div>",init(el){ const ta=el.querySelector('#resInput');
       el.querySelectorAll('button[data-m]').forEach(b=>b.addEventListener('click',()=>{
         ta.value = b.dataset.m==='spaces' ? ta.value.replace(/[ \t]+/g,' ').split('\n').map(l=>l.trim()).join('\n') : ta.value.replace(/\n+/g,' ').replace(/\s+/g,' ').trim();
       })); }},
{slug:"text-repeater",name:"Text Repeater",icon:"copy",cats:["text"],desc:"Repeat any word or sentence up to 500 times with an optional separator.",lib:"",html:"<textarea id=\"trpInput\" placeholder=\"Text to repeat…\"></textarea><div class=\"row\"><input type=\"number\" id=\"trpCount\" value=\"3\" min=\"1\" max=\"500\" style=\"width:80px;\"><input type=\"text\" id=\"trpSep\" placeholder=\"Separator (optional)\" style=\"width:150px;\"><button class=\"act\" id=\"trpBtn\">Repeat</button></div><pre id=\"trpOut\"></pre>",init(el){ el.querySelector('#trpBtn').addEventListener('click',()=>{
       const t=el.querySelector('#trpInput').value, n=Math.min(500,parseInt(el.querySelector('#trpCount').value)||1), sep=el.querySelector('#trpSep').value||'';
       el.querySelector('#trpOut').textContent = Array(n).fill(t).join(sep);
     }); }},
{slug:"slug-generator",name:"URL Slug Generator",icon:"link",cats:["text", "seo"],desc:"Turn any title into a clean, SEO-friendly URL slug as you type.",lib:"",html:"<input type=\"text\" id=\"sgInput\" placeholder=\"My Blog Post Title!\" style=\"width:100%;\"><div class=\"status ok\" id=\"sgOut\" style=\"margin-top:8px;\"></div>",init(el){ el.querySelector('#sgInput').addEventListener('input',()=>{
       const slug=el.querySelector('#sgInput').value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-');
       el.querySelector('#sgOut').textContent = slug || '(type something above)';
     }); }},
{slug:"text-diff-checker",name:"Text Diff Checker",icon:"text",cats:["text", "developer"],desc:"Compare two texts line by line and see exactly what changed.",lib:"",html:"<div class=\"row\"><textarea id=\"tdA\" placeholder=\"Original text…\" style=\"width:48%;\"></textarea><textarea id=\"tdB\" placeholder=\"Changed text…\" style=\"width:48%;\"></textarea></div><div class=\"row\"><button class=\"act\" id=\"tdBtn\">Compare</button></div><pre id=\"tdOut\"></pre>",init(el){ el.querySelector('#tdBtn').addEventListener('click',()=>{
       const a=el.querySelector('#tdA').value.split('\n'), b=el.querySelector('#tdB').value.split('\n'), out=el.querySelector('#tdOut');
       const max=Math.max(a.length,b.length), diffs=[];
       for(let i=0;i<max;i++){ if((a[i]||'')!==(b[i]||'')) diffs.push(`Line ${i+1}:\n  - ${a[i]||'(missing)'}\n  + ${b[i]||'(missing)'}`); }
       out.textContent = diffs.length ? diffs.join('\n\n') : 'No differences — lines are identical.';
     }); }},
{slug:"email-extractor",name:"Email Extractor",icon:"mail",cats:["text"],desc:"Extract every unique email address from a block of text.",lib:"",html:"<textarea id=\"eeInput\" placeholder=\"Paste text containing email addresses…\"></textarea><div class=\"row\"><button class=\"act\" id=\"eeBtn\">Extract</button></div><pre id=\"eeOut\"></pre>",init(el){ el.querySelector('#eeBtn').addEventListener('click',()=>{
       const matches=[...new Set(el.querySelector('#eeInput').value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[])];
       el.querySelector('#eeOut').textContent = matches.length ? matches.join('\n') : 'No email addresses found.';
     }); }},
{slug:"url-extractor",name:"URL Extractor",icon:"link",cats:["text", "seo"],desc:"Pull all unique links and URLs out of any text.",lib:"",html:"<textarea id=\"ueInput\" placeholder=\"Paste text containing URLs…\"></textarea><div class=\"row\"><button class=\"act\" id=\"ueBtn\">Extract</button></div><pre id=\"ueOut\"></pre>",init(el){ el.querySelector('#ueBtn').addEventListener('click',()=>{
       const matches=[...new Set(el.querySelector('#ueInput').value.match(/https?:\/\/[^\s"'<>]+/g)||[])];
       el.querySelector('#ueOut').textContent = matches.length ? matches.join('\n') : 'No URLs found.';
     }); }},
{slug:"text-to-speech",name:"Text to Speech",icon:"message",cats:["text", "productivity"],desc:"Listen to any text read aloud using your browser’s built-in voices.",lib:"",html:"<textarea id=\"ttsInput\" placeholder=\"Text to read aloud…\"></textarea><div class=\"row\"><select id=\"ttsVoice\"></select><button class=\"act\" id=\"ttsPlay\">Play</button><button class=\"act\" id=\"ttsStop\">Stop</button></div>",init(el){
       const sel=el.querySelector('#ttsVoice');
       function loadVoices(){ sel.innerHTML=speechSynthesis.getVoices().map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join(''); }
       loadVoices(); speechSynthesis.onvoiceschanged=loadVoices;
       el.querySelector('#ttsPlay').addEventListener('click',()=>{
         const u=new SpeechSynthesisUtterance(el.querySelector('#ttsInput').value);
         const voices=speechSynthesis.getVoices(); if(voices[sel.value]) u.voice=voices[sel.value];
         speechSynthesis.cancel(); speechSynthesis.speak(u);
       });
       el.querySelector('#ttsStop').addEventListener('click',()=>speechSynthesis.cancel());
     }},
{slug:"meta-tag-generator",name:"Meta Tag Generator",icon:"code",cats:["seo"],desc:"Generate title, description and Open Graph meta tags ready to paste into your page.",lib:"",html:"<input type=\"text\" id=\"metaTitle\" placeholder=\"Page title\" style=\"width:100%;margin-bottom:8px;\">\n       <textarea id=\"metaDesc\" placeholder=\"Meta description\"></textarea>\n       <div class=\"row\"><button class=\"act\" id=\"metaBtn\">Generate</button></div>\n       <pre id=\"metaOut\"></pre>",init(el){ el.querySelector('#metaBtn').addEventListener('click',()=>{
       const title=el.querySelector('#metaTitle').value||'Page title', desc=el.querySelector('#metaDesc').value||'Page description';
       el.querySelector('#metaOut').textContent=`<title>${title}</title>\n<meta name="description" content="${desc}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">`;
     }); }},
{slug:"keyword-density-checker",name:"Keyword Density Checker",icon:"search",cats:["seo", "text"],desc:"Find the most-used keywords in your content and their density percentages.",lib:"",html:"<textarea id=\"kdInput\" placeholder=\"Paste your page copy…\"></textarea>\n       <div class=\"row\"><button class=\"act\" id=\"kdBtn\">Analyze</button></div>\n       <pre id=\"kdOut\"></pre>",init(el){ el.querySelector('#kdBtn').addEventListener('click',()=>{
       const t=el.querySelector('#kdInput').value.toLowerCase().replace(/[^a-z0-9\s]/g,' ');
       const words=t.split(/\s+/).filter(w=>w.length>2);
       const freq={}; words.forEach(w=>freq[w]=(freq[w]||0)+1);
       const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,10);
       el.querySelector('#kdOut').textContent = top.length? top.map(([w,c])=>`${w} — ${c} (${(c/words.length*100).toFixed(1)}%)`).join('\n') : 'Paste some text first.';
     }); }},
{slug:"robots-txt-generator",name:"Robots.txt Generator",icon:"settings",cats:["seo"],desc:"Create a robots.txt file with disallow rules and your sitemap URL.",lib:"",html:"<div class=\"row\"><label style=\"font-size:13px;\"><input type=\"checkbox\" id=\"rtAllowAll\" checked> Allow all crawlers</label></div>\n       <textarea id=\"rtDisallow\" placeholder=\"Paths to disallow, one per line, e.g. /admin&#10;/cart\"></textarea>\n       <input type=\"text\" id=\"rtSitemap\" placeholder=\"Sitemap URL (optional), e.g. https://example.com/sitemap.xml\" style=\"width:100%;margin-top:8px;\">\n       <div class=\"row\"><button class=\"act\" id=\"rtBtn\">Generate</button></div>\n       <pre id=\"rtOut\"></pre>",init(el){ el.querySelector('#rtBtn').addEventListener('click',()=>{
       const allowAll=el.querySelector('#rtAllowAll').checked;
       const paths=el.querySelector('#rtDisallow').value.split('\n').map(s=>s.trim()).filter(Boolean);
       const sitemap=el.querySelector('#rtSitemap').value.trim();
       let lines=['User-agent: *'];
       if(!allowAll){ lines.push('Disallow: /'); }
       else if(paths.length){ paths.forEach(p=>lines.push('Disallow: '+(p.startsWith('/')?p:'/'+p))); }
       else { lines.push('Disallow:'); }
       if(sitemap) lines.push('', 'Sitemap: '+sitemap);
       el.querySelector('#rtOut').textContent=lines.join('\n');
     }); }},
{slug:"keyword-research-tool",name:"Keyword Research Tool",icon:"search",cats:["seo"],desc:"Generate long-tail keyword ideas, questions and modifiers from a seed keyword.",lib:"",html:"<input type=\"text\" id=\"krSeed\" placeholder=\"Seed keyword, e.g. running shoes\" style=\"width:100%;\">\n       <div class=\"row\"><button class=\"act\" id=\"krBtn\">Generate ideas</button></div>\n       <div class=\"status\" id=\"krNote\" style=\"margin-bottom:6px;\">Generates long-tail variations from your seed — for real search volume, cross-check in Google Search Console or Keyword Planner.</div>\n       <pre id=\"krOut\"></pre>",init(el){ el.querySelector('#krBtn').addEventListener('click',()=>{
       const seed=el.querySelector('#krSeed').value.trim(), out=el.querySelector('#krOut');
       if(!seed){ out.textContent='Enter a seed keyword first.'; return; }
       const questions=['what','how','why','when','where','which','who','can','does'];
       const preps=['for','with','without','near me','like','vs','under','best','cheap','top'];
       const suffixes=['reviews','guide','2026','for beginners','comparison','alternatives'];
       const groups=[
         ['Questions', questions.map(q=>`${q} ${seed}`)],
         ['Modifiers', preps.map(p=>`${p} ${seed}`)],
         ['Suffixes', suffixes.map(s=>`${seed} ${s}`)]
       ];
       out.textContent = groups.map(([label,list])=>`${label}:\n`+list.map(x=>'  '+x).join('\n')).join('\n\n');
     }); }},
{slug:"title-description-length-checker",name:"Title and Description Length Checker",icon:"hash",cats:["seo"],desc:"Check your page title and meta description length against search result limits.",lib:"",html:"<input type=\"text\" id=\"tlTitle\" placeholder=\"Page title\" style=\"width:100%;margin-bottom:8px;\"><div class=\"status\" id=\"tlTitleOut\">0 / 60 characters</div>\n       <textarea id=\"tlDesc\" placeholder=\"Meta description\" style=\"margin-top:10px;\"></textarea><div class=\"status\" id=\"tlDescOut\">0 / 155 characters</div>",init(el){
       const t=el.querySelector('#tlTitle'), d=el.querySelector('#tlDesc'), to=el.querySelector('#tlTitleOut'), do_=el.querySelector('#tlDescOut');
       function mark(el2,n,max){ el2.textContent=`${n} / ${max} characters`; el2.className='status '+(n>max?'':'ok'); }
       t.addEventListener('input',()=>mark(to,t.value.length,60));
       d.addEventListener('input',()=>mark(do_,d.value.length,155));
     }},
{slug:"open-graph-preview",name:"Open Graph Preview",icon:"share",cats:["seo", "social"],desc:"Preview how your page will look when it is shared on social media.",lib:"",html:"<input type=\"text\" id=\"ogTitle\" placeholder=\"Title\" style=\"width:100%;margin-bottom:8px;\">\n       <textarea id=\"ogDesc\" placeholder=\"Description\"></textarea>\n       <input type=\"text\" id=\"ogSite\" placeholder=\"Site name, e.g. example.com\" style=\"width:100%;margin:8px 0;\">\n       <input type=\"text\" id=\"ogImg\" placeholder=\"Image URL (optional)\" style=\"width:100%;\">\n       <div class=\"row\"><button class=\"act\" id=\"ogBtn\">Preview</button></div>\n       <div id=\"ogCard\" style=\"border:1px solid var(--line);max-width:360px;margin-top:10px;overflow:hidden;display:none;\">\n         <div id=\"ogImgWrap\" style=\"background:var(--paper);height:140px;display:flex;align-items:center;justify-content:center;overflow:hidden;\"></div>\n         <div style=\"padding:10px;\">\n           <div id=\"ogCardSite\" style=\"font-size:11px;color:var(--muted);text-transform:uppercase;\"></div>\n           <div id=\"ogCardTitle\" style=\"font-family:'Space Grotesk',sans-serif;font-size:15px;margin:4px 0;\"></div>\n           <div id=\"ogCardDesc\" style=\"font-size:12px;color:var(--muted);\"></div>\n         </div>\n       </div>",init(el){ el.querySelector('#ogBtn').addEventListener('click',()=>{
       const title=el.querySelector('#ogTitle').value||'Page title', desc=el.querySelector('#ogDesc').value||'Page description', site=el.querySelector('#ogSite').value||'example.com', img=el.querySelector('#ogImg').value;
       el.querySelector('#ogCardSite').textContent=site;
       el.querySelector('#ogCardTitle').textContent=title;
       el.querySelector('#ogCardDesc').textContent=desc;
       el.querySelector('#ogImgWrap').innerHTML = img ? `<img alt="Image preview" src="${img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='Image failed to load'">` : '<span style="color:var(--muted);font-size:12px;">No image</span>';
       el.querySelector('#ogCard').style.display='block';
     }); }},
{slug:"meta-tag-analyzer",name:"Meta Tag Analyzer",icon:"search",cats:["seo"],desc:"Paste page HTML to audit its title, description, canonical, H1 and Open Graph tags.",lib:"",html:"<textarea id=\"maInput\" placeholder=\"Paste a page's <head> HTML…\"></textarea><div class=\"row\"><button class=\"act\" id=\"maBtn\">Analyze</button></div><pre id=\"maOut\"></pre>",init(el){ el.querySelector('#maBtn').addEventListener('click',()=>{
       const html=el.querySelector('#maInput').value, out=el.querySelector('#maOut');
       if(!html.trim()){ out.textContent='Paste some HTML first.'; return; }
       const doc=new DOMParser().parseFromString(html,'text/html');
       const title=doc.querySelector('title')?.textContent||'(missing)';
       const desc=doc.querySelector('meta[name="description"]')?.content||'(missing)';
       const canonical=doc.querySelector('link[rel="canonical"]')?.href||'(missing)';
       const og=[...doc.querySelectorAll('meta[property^="og:"]')].map(m=>`  ${m.getAttribute('property')}: ${m.content}`).join('\n')||'  (none)';
       const h1s=[...doc.querySelectorAll('h1')].length;
       out.textContent=`Title (${title.length} chars): ${title}\nDescription (${desc.length} chars): ${desc}\nCanonical: ${canonical}\nH1 tags found: ${h1s}\nOpen Graph tags:\n${og}`;
     }); }},
{slug:"xml-sitemap-generator",name:"XML Sitemap Generator",icon:"grid",cats:["seo"],desc:"Build a valid XML sitemap from a list of URLs.",lib:"",html:"<textarea id=\"xsInput\" placeholder=\"One URL per line…\"></textarea><div class=\"row\"><button class=\"act\" id=\"xsBtn\">Generate</button></div><pre id=\"xsOut\"></pre>",init(el){ el.querySelector('#xsBtn').addEventListener('click',()=>{
       const urls=el.querySelector('#xsInput').value.split('\n').map(s=>s.trim()).filter(Boolean), out=el.querySelector('#xsOut');
       if(!urls.length){ out.textContent='Enter at least one URL.'; return; }
       const body=urls.map(u=>`  <url>\n    <loc>${u}</loc>\n  </url>`).join('\n');
       out.textContent=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
     }); }},
{slug:"twitter-card-generator",name:"Twitter Card Generator",icon:"twitter",cats:["seo", "social"],desc:"Create Twitter (X) card meta tags for rich link previews.",lib:"",html:"<input type=\"text\" id=\"twTitle\" placeholder=\"Title\" style=\"width:100%;margin-bottom:8px;\"><textarea id=\"twDesc\" placeholder=\"Description\"></textarea><input type=\"text\" id=\"twImg\" placeholder=\"Image URL\" style=\"width:100%;margin-top:8px;\"><div class=\"row\"><select id=\"twType\"><option value=\"summary\">summary</option><option value=\"summary_large_image\">summary_large_image</option></select><button class=\"act\" id=\"twBtn\">Generate</button></div><pre id=\"twOut\"></pre>",init(el){ el.querySelector('#twBtn').addEventListener('click',()=>{
       const title=el.querySelector('#twTitle').value||'Title', desc=el.querySelector('#twDesc').value||'Description', img=el.querySelector('#twImg').value, type=el.querySelector('#twType').value;
       el.querySelector('#twOut').textContent=`<meta name="twitter:card" content="${type}">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${desc}">`+(img?`\n<meta name="twitter:image" content="${img}">`:'');
     }); }},
{slug:"serp-preview-tool",name:"SERP Preview Tool",icon:"search",cats:["seo"],desc:"See how your title, URL and description may appear in Google search results.",lib:"",html:"<input type=\"text\" id=\"srUrl\" placeholder=\"https://example.com/page\" style=\"width:100%;margin-bottom:8px;\"><input type=\"text\" id=\"srTitle\" placeholder=\"Title\" style=\"width:100%;margin-bottom:8px;\"><textarea id=\"srDesc\" placeholder=\"Meta description\"></textarea><div class=\"row\"><button class=\"act\" id=\"srBtn\">Preview</button></div>\n       <div id=\"srCard\" style=\"max-width:500px;margin-top:10px;display:none;font-family:arial,sans-serif;\">\n         <div id=\"srCardUrl\" style=\"color:#202124;font-size:13px;\"></div>\n         <div id=\"srCardTitle\" style=\"color:#1a0dab;font-size:18px;margin:2px 0;\"></div>\n         <div id=\"srCardDesc\" style=\"color:#4d5156;font-size:13px;\"></div>\n       </div>",init(el){ el.querySelector('#srBtn').addEventListener('click',()=>{
       el.querySelector('#srCardUrl').textContent=el.querySelector('#srUrl').value||'https://example.com';
       el.querySelector('#srCardTitle').textContent=(el.querySelector('#srTitle').value||'Page title').slice(0,60);
       el.querySelector('#srCardDesc').textContent=(el.querySelector('#srDesc').value||'Meta description').slice(0,160);
       el.querySelector('#srCard').style.display='block';
     }); }},
{slug:"sitemap-url-extractor",name:"Sitemap URL Extractor",icon:"link",cats:["seo"],desc:"Extract every page URL from sitemap XML in one click.",lib:"",html:"<textarea id=\"suInput\" placeholder=\"Paste sitemap XML…\"></textarea><div class=\"row\"><button class=\"act\" id=\"suBtn\">Extract URLs</button></div><pre id=\"suOut\"></pre>",init(el){ el.querySelector('#suBtn').addEventListener('click',()=>{
       const xml=el.querySelector('#suInput').value, out=el.querySelector('#suOut');
       const matches=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
       out.textContent = matches.length ? matches.join('\n') : 'No <loc> URLs found — paste valid sitemap XML.';
     }); }},
{slug:"canonical-tag-generator",name:"Canonical Tag Generator",icon:"link",cats:["seo"],desc:"Generate a canonical link tag to prevent duplicate content issues.",lib:"",html:"<input type=\"text\" id=\"ctUrl\" placeholder=\"https://example.com/canonical-page\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ctBtn\">Generate</button></div><pre id=\"ctOut\"></pre>",init(el){ el.querySelector('#ctBtn').addEventListener('click',()=>{
       const url=el.querySelector('#ctUrl').value.trim(), out=el.querySelector('#ctOut');
       out.textContent = url ? `<link rel="canonical" href="${url}">` : 'Enter a URL first.';
     }); }},
{slug:"sip-calculator",name:"SIP Calculator",icon:"finance",cats:["finance", "calculators"],desc:"Estimate the future value of monthly SIP investments with compound growth.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"sipAmt\" placeholder=\"Monthly investment\" style=\"width:150px;\"><input type=\"number\" id=\"sipRate\" placeholder=\"Expected return % p.a.\" style=\"width:150px;\"><input type=\"number\" id=\"sipYears\" placeholder=\"Years\" style=\"width:90px;\"><button class=\"act\" id=\"sipBtn\">Calculate</button></div><div class=\"status ok\" id=\"sipOut\"></div>",init(el){ el.querySelector('#sipBtn').addEventListener('click',()=>{
       const p=parseFloat(el.querySelector('#sipAmt').value), r=parseFloat(el.querySelector('#sipRate').value), y=parseFloat(el.querySelector('#sipYears').value), out=el.querySelector('#sipOut');
       if(!p||!r||!y){ out.textContent='Enter monthly investment, expected return, and years.'; return; }
       const n=y*12, i=r/1200;
       const fv = p*((Math.pow(1+i,n)-1)/i)*(1+i);
       const invested=p*n, gain=fv-invested;
       out.textContent=`Future value: ${fv.toFixed(2)}\nTotal invested: ${invested.toFixed(2)}\nEstimated gain: ${gain.toFixed(2)}`;
     }); }},
{slug:"loan-interest-calculator",name:"Loan Interest Calculator",icon:"percent",cats:["finance", "calculators"],desc:"Calculate simple or compound interest on a loan for any compounding frequency.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"liP\" placeholder=\"Principal\" style=\"width:120px;\"><input type=\"number\" id=\"liR\" placeholder=\"Rate % p.a.\" style=\"width:110px;\"><input type=\"number\" id=\"liT\" placeholder=\"Time (years)\" style=\"width:110px;\"><select id=\"liFreq\"><option value=\"1\">Compounds yearly</option><option value=\"2\">Compounds half-yearly</option><option value=\"4\">Compounds quarterly</option><option value=\"12\">Compounds monthly</option></select></div>\n       <div class=\"row\"><button class=\"act\" id=\"liSimple\">Simple interest</button><button class=\"act\" id=\"liCompound\">Compound interest</button></div>\n       <div class=\"status ok\" id=\"liOut\"></div>",init(el){
       function vals(){ return {p:parseFloat(el.querySelector('#liP').value), r:parseFloat(el.querySelector('#liR').value), t:parseFloat(el.querySelector('#liT').value)}; }
       el.querySelector('#liSimple').addEventListener('click',()=>{
         const {p,r,t}=vals(), out=el.querySelector('#liOut');
         if(!p||!r||!t){ out.textContent='Enter principal, rate, and time.'; return; }
         const interest=p*r*t/100, total=p+interest;
         out.textContent=`Simple interest: ${interest.toFixed(2)}\nTotal payable: ${total.toFixed(2)}`;
       });
       el.querySelector('#liCompound').addEventListener('click',()=>{
         const {p,r,t}=vals(), out=el.querySelector('#liOut'), n=parseFloat(el.querySelector('#liFreq').value);
         if(!p||!r||!t){ out.textContent='Enter principal, rate, and time.'; return; }
         const total=p*Math.pow(1+(r/100)/n, n*t), interest=total-p;
         out.textContent=`Compound interest: ${interest.toFixed(2)}\nTotal payable: ${total.toFixed(2)}`;
       });
     }},
{slug:"discount-calculator",name:"Discount Calculator",icon:"tag",cats:["calculators", "finance"],desc:"Find the final price and how much you save after a percentage discount.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"dcPrice\" placeholder=\"Original price\" style=\"width:130px;\"><input type=\"number\" id=\"dcPct\" placeholder=\"Discount %\" style=\"width:110px;\"><button class=\"act\" id=\"dcBtn\">Calculate</button></div><div class=\"status ok\" id=\"dcOut\"></div>",init(el){ el.querySelector('#dcBtn').addEventListener('click',()=>{
       const price=parseFloat(el.querySelector('#dcPrice').value), pct=parseFloat(el.querySelector('#dcPct').value), out=el.querySelector('#dcOut');
       if(!price||!pct){ out.textContent='Enter price and discount %.'; return; }
       const saved=price*pct/100, final=price-saved;
       out.textContent=`You save: ${saved.toFixed(2)}\nFinal price: ${final.toFixed(2)}`;
     }); }},
{slug:"date-calculator",name:"Date Calculator",icon:"calendar",cats:["calculators"],desc:"Count the days between two dates or add and subtract days from a date.",lib:"",html:"<div class=\"row\"><input type=\"date\" id=\"dtA\"><input type=\"date\" id=\"dtB\"><button class=\"act\" id=\"dtDiffBtn\">Difference</button></div>\n       <div class=\"row\"><input type=\"date\" id=\"dtC\"><input type=\"number\" id=\"dtDays\" placeholder=\"Days\" style=\"width:90px;\"><button class=\"act\" id=\"dtAddBtn\">Add days</button><button class=\"act\" id=\"dtSubBtn\">Subtract days</button></div>\n       <div class=\"status ok\" id=\"dtOut\"></div>",init(el){
       el.querySelector('#dtDiffBtn').addEventListener('click',()=>{
         const a=el.querySelector('#dtA').value, b=el.querySelector('#dtB').value, out=el.querySelector('#dtOut');
         if(!a||!b){ out.textContent='Pick both dates.'; return; }
         const days=Math.round(Math.abs(new Date(b)-new Date(a))/86400000);
         out.textContent=`${days.toLocaleString()} days apart (${(days/7).toFixed(1)} weeks)`;
       });
       function addDays(sign){
         const c=el.querySelector('#dtC').value, n=parseInt(el.querySelector('#dtDays').value), out=el.querySelector('#dtOut');
         if(!c||!n){ out.textContent='Pick a date and enter days.'; return; }
         const d=new Date(c); d.setDate(d.getDate()+sign*n);
         out.textContent=`Result: ${d.toISOString().slice(0,10)}`;
       }
       el.querySelector('#dtAddBtn').addEventListener('click',()=>addDays(1));
       el.querySelector('#dtSubBtn').addEventListener('click',()=>addDays(-1));
     }},
{slug:"time-calculator",name:"Time Calculator",icon:"clock",cats:["calculators"],desc:"Find the duration between two times, or add and subtract hours and minutes.",lib:"",html:"<div class=\"row\"><input type=\"time\" id=\"tmStart\"><input type=\"time\" id=\"tmEnd\"><button class=\"act\" id=\"tmDiffBtn\">Duration</button></div>\n       <div class=\"row\"><input type=\"text\" id=\"tmA\" placeholder=\"HH:MM, e.g. 02:30\" style=\"width:130px;\"><input type=\"text\" id=\"tmB\" placeholder=\"HH:MM, e.g. 01:15\" style=\"width:130px;\"><button class=\"act\" id=\"tmAddBtn\">Add</button><button class=\"act\" id=\"tmSubBtn\">Subtract</button></div>\n       <div class=\"status ok\" id=\"tmOut\"></div>",init(el){
       function toMin(s){ const m=s.match(/^(\d+):(\d+)$/); return m? (+m[1])*60+(+m[2]) : NaN; }
       function fmt(mins){ const sign=mins<0?'-':''; mins=Math.abs(mins); return `${sign}${Math.floor(mins/60)}h ${mins%60}m`; }
       el.querySelector('#tmDiffBtn').addEventListener('click',()=>{
         const s=el.querySelector('#tmStart').value, e=el.querySelector('#tmEnd').value, out=el.querySelector('#tmOut');
         if(!s||!e){ out.textContent='Pick both times.'; return; }
         let diff=toMin(e)-toMin(s); if(diff<0) diff+=1440;
         out.textContent=`Duration: ${fmt(diff)}`;
       });
       el.querySelector('#tmAddBtn').addEventListener('click',()=>{
         const a=toMin(el.querySelector('#tmA').value), b=toMin(el.querySelector('#tmB').value), out=el.querySelector('#tmOut');
         if(isNaN(a)||isNaN(b)){ out.textContent='Enter both durations as HH:MM.'; return; }
         out.textContent=`Sum: ${fmt(a+b)}`;
       });
       el.querySelector('#tmSubBtn').addEventListener('click',()=>{
         const a=toMin(el.querySelector('#tmA').value), b=toMin(el.querySelector('#tmB').value), out=el.querySelector('#tmOut');
         if(isNaN(a)||isNaN(b)){ out.textContent='Enter both durations as HH:MM.'; return; }
         out.textContent=`Difference: ${fmt(a-b)}`;
       });
     }},
{slug:"countdown-timer",name:"Countdown Timer",icon:"clock",cats:["productivity", "calculators"],desc:"Count down the days, hours, minutes and seconds to any date and time.",lib:"",html:"<div class=\"row\"><input type=\"datetime-local\" id=\"cdTarget\"><button class=\"act\" id=\"cdStart\">Start</button><button class=\"act\" id=\"cdStop\">Stop</button></div><div class=\"status ok\" id=\"cdOut\" style=\"font-size:20px;\"></div>",init(el){
       let iv=null;
       function tick(){ const target=new Date(el.querySelector('#cdTarget').value), diff=target-new Date(), out=el.querySelector('#cdOut');
         if(diff<=0){ out.textContent='Time reached.'; clearInterval(iv); return; }
         const d=Math.floor(diff/86400000), h=Math.floor(diff/3600000)%24, m=Math.floor(diff/60000)%60, s=Math.floor(diff/1000)%60;
         out.textContent=`${d}d ${h}h ${m}m ${s}s`;
       }
       el.querySelector('#cdStart').addEventListener('click',()=>{ if(!el.querySelector('#cdTarget').value) return; clearInterval(iv); tick(); iv=setInterval(tick,1000); });
       el.querySelector('#cdStop').addEventListener('click',()=>clearInterval(iv));
     }},
{slug:"online-stopwatch",name:"Online Stopwatch",icon:"clock",cats:["productivity"],desc:"A precise online stopwatch with start, stop and reset controls.",lib:"",html:"<div class=\"status ok\" id=\"swOut\" style=\"font-size:24px;\">00:00:00.0</div><div class=\"row\"><button class=\"act\" id=\"swStart\">Start</button><button class=\"act\" id=\"swStop\">Stop</button><button class=\"act\" id=\"swReset\">Reset</button></div>",init(el){
       let startTime=0, elapsed=0, iv=null;
       function fmt(ms){ const cs=Math.floor(ms/100)%10, s=Math.floor(ms/1000)%60, m=Math.floor(ms/60000)%60, h=Math.floor(ms/3600000);
         return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${cs}`; }
       el.querySelector('#swStart').addEventListener('click',()=>{ if(iv) return; startTime=Date.now()-elapsed; iv=setInterval(()=>{ elapsed=Date.now()-startTime; el.querySelector('#swOut').textContent=fmt(elapsed); },100); });
       el.querySelector('#swStop').addEventListener('click',()=>{ clearInterval(iv); iv=null; });
       el.querySelector('#swReset').addEventListener('click',()=>{ clearInterval(iv); iv=null; elapsed=0; el.querySelector('#swOut').textContent='00:00:00.0'; });
     }},
{slug:"world-clock",name:"World Clock",icon:"globe",cats:["productivity", "utility"],desc:"See the current time in cities around the world and add your own time zones.",lib:"",html:"<div class=\"row\" id=\"wcZones\"></div><div class=\"row\"><input type=\"text\" id=\"wcAdd\" placeholder=\"IANA zone, e.g. Asia/Tokyo\" style=\"width:220px;\"><button class=\"act\" id=\"wcAddBtn\">Add city</button></div>",init(el){
       let zones=['Asia/Kolkata','America/New_York','Europe/London','Asia/Tokyo'];
       function render(){
         el.querySelector('#wcZones').innerHTML = zones.map(z=>{
           let t; try{ t=new Date().toLocaleString('en-GB',{timeZone:z,hour:'2-digit',minute:'2-digit',weekday:'short'}); }catch(e){ t='invalid zone'; }
           return `<div class="panel" style="padding:10px;min-width:140px;"><div style="font-size:11px;color:var(--muted);">${z}</div><div style="font-family:'Space Grotesk',sans-serif;font-size:16px;">${t}</div></div>`;
         }).join('');
       }
       render(); setInterval(render,30000);
       el.querySelector('#wcAddBtn').addEventListener('click',()=>{
         const z=el.querySelector('#wcAdd').value.trim(); if(!z) return;
         try{ new Date().toLocaleString('en-GB',{timeZone:z}); zones.push(z); render(); }catch(e){ alert('Unknown IANA time zone name.'); }
       });
     }},
{slug:"time-zone-converter",name:"Time Zone Converter",icon:"globe",cats:["converters", "calculators"],desc:"Convert a date and time from one time zone to another.",lib:"",html:"<div class=\"row\"><input type=\"datetime-local\" id=\"tzIn\"><input type=\"text\" id=\"tzFrom\" placeholder=\"From zone, e.g. Asia/Kolkata\" style=\"width:180px;\"><input type=\"text\" id=\"tzTo\" placeholder=\"To zone, e.g. America/New_York\" style=\"width:200px;\"><button class=\"act\" id=\"tzBtn\">Convert</button></div><div class=\"status ok\" id=\"tzOut\"></div>",init(el){ el.querySelector('#tzBtn').addEventListener('click',()=>{
       const val=el.querySelector('#tzIn').value, from=el.querySelector('#tzFrom').value.trim(), to=el.querySelector('#tzTo').value.trim(), out=el.querySelector('#tzOut');
       if(!val||!from||!to){ out.textContent='Fill in date/time and both zones.'; return; }
       try{
         const localStr=new Date(val).toLocaleString('en-US',{timeZone:'UTC'});
         const asUTC=new Date(new Date(val).toLocaleString('en-US',{timeZone:from})); // approximate
         const utcMs = new Date(val).getTime() - (new Date(new Date(val).toLocaleString('en-US',{timeZone:from})).getTime() - new Date(val).getTime());
         const result=new Date(val).toLocaleString('en-GB',{timeZone:to,dateStyle:'medium',timeStyle:'short'});
         out.textContent=`In ${to}: ${result}\n(Note: assumes the picked time is already in ${from}'s local clock.)`;
       }catch(e){ out.textContent='Enter valid IANA zone names, e.g. Asia/Kolkata.'; }
     }); }},
{slug:"week-number-calculator",name:"Week Number Calculator",icon:"calendar",cats:["calculators"],desc:"Find the ISO week number for any date.",lib:"",html:"<div class=\"row\"><input type=\"date\" id=\"wnDate\"><button class=\"act\" id=\"wnBtn\">Get week number</button></div><div class=\"status ok\" id=\"wnOut\"></div>",init(el){ el.querySelector('#wnBtn').addEventListener('click',()=>{
       const val=el.querySelector('#wnDate').value, out=el.querySelector('#wnOut');
       if(!val){ out.textContent='Pick a date.'; return; }
       const d=new Date(val); d.setHours(0,0,0,0); d.setDate(d.getDate()+3-(d.getDay()+6)%7);
       const week1=new Date(d.getFullYear(),0,4);
       const weekNo=1+Math.round(((d-week1)/86400000-3+(week1.getDay()+6)%7)/7);
       out.textContent=`ISO week ${weekNo}, ${d.getFullYear()}`;
     }); }},
{slug:"profit-margin-calculator",name:"Profit Margin Calculator",icon:"finance",cats:["finance", "calculators"],desc:"Calculate profit, margin and markup from cost and selling price.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"pmCost\" placeholder=\"Cost price\" style=\"width:130px;\"><input type=\"number\" id=\"pmSell\" placeholder=\"Selling price\" style=\"width:130px;\"><button class=\"act\" id=\"pmBtn\">Calculate</button></div><div class=\"status ok\" id=\"pmOut\"></div>",init(el){ el.querySelector('#pmBtn').addEventListener('click',()=>{
       const cost=parseFloat(el.querySelector('#pmCost').value), sell=parseFloat(el.querySelector('#pmSell').value), out=el.querySelector('#pmOut');
       if(!cost||!sell){ out.textContent='Enter cost and selling price.'; return; }
       const profit=sell-cost, margin=profit/sell*100, markup=profit/cost*100;
       out.textContent=`Profit: ${profit.toFixed(2)}\nMargin: ${margin.toFixed(2)}%\nMarkup: ${markup.toFixed(2)}%`;
     }); }},
{slug:"ratio-calculator",name:"Ratio Calculator",icon:"calc",cats:["calculators"],desc:"Solve proportions like A:B = C:D for the missing value.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"raA\" placeholder=\"A\" style=\"width:80px;\"><span>:</span><input type=\"number\" id=\"raB\" placeholder=\"B\" style=\"width:80px;\"><span>=</span><input type=\"number\" id=\"raC\" placeholder=\"C\" style=\"width:80px;\"><span>:</span><input type=\"number\" id=\"raD\" placeholder=\"? (leave blank)\" style=\"width:120px;\"><button class=\"act\" id=\"raBtn\">Solve</button></div><div class=\"status ok\" id=\"raOut\"></div>",init(el){ el.querySelector('#raBtn').addEventListener('click',()=>{
       const a=parseFloat(el.querySelector('#raA').value), b=parseFloat(el.querySelector('#raB').value), c=parseFloat(el.querySelector('#raC').value), out=el.querySelector('#raOut');
       if(!a||!b||!c){ out.textContent='Enter A, B, and C to solve for D.'; return; }
       out.textContent=`D = ${(b*c/a).toFixed(4)}  (so ${a}:${b} = ${c}:${(b*c/a).toFixed(4)})`;
     }); }},
{slug:"average-calculator",name:"Average Calculator",icon:"calc",cats:["calculators"],desc:"Find the average, median, sum, minimum and maximum of a list of numbers.",lib:"",html:"<textarea id=\"avInput\" placeholder=\"Numbers, separated by commas or new lines\"></textarea><div class=\"row\"><button class=\"act\" id=\"avBtn\">Calculate</button></div><pre id=\"avOut\"></pre>",init(el){ el.querySelector('#avBtn').addEventListener('click',()=>{
       const nums=el.querySelector('#avInput').value.split(/[,\n]+/).map(s=>parseFloat(s.trim())).filter(n=>!isNaN(n)), out=el.querySelector('#avOut');
       if(!nums.length){ out.textContent='Enter some numbers.'; return; }
       const sum=nums.reduce((a,b)=>a+b,0), avg=sum/nums.length, sorted=[...nums].sort((a,b)=>a-b);
       const mid=Math.floor(sorted.length/2), median=sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
       out.textContent=`Count: ${nums.length}\nSum: ${sum}\nAverage: ${avg.toFixed(4)}\nMedian: ${median}\nMin: ${Math.min(...nums)}\nMax: ${Math.max(...nums)}`;
     }); }},
{slug:"fraction-calculator",name:"Fraction Calculator",icon:"calc",cats:["calculators"],desc:"Add, subtract, multiply and divide fractions with simplified results.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"frA1\" placeholder=\"a\" style=\"width:60px;\"><span>/</span><input type=\"number\" id=\"frA2\" placeholder=\"b\" style=\"width:60px;\"><select id=\"frOp\"><option value=\"+\">+</option><option value=\"-\">−</option><option value=\"*\">×</option><option value=\"/\">÷</option></select><input type=\"number\" id=\"frB1\" placeholder=\"c\" style=\"width:60px;\"><span>/</span><input type=\"number\" id=\"frB2\" placeholder=\"d\" style=\"width:60px;\"><button class=\"act\" id=\"frBtn\">Calculate</button></div><div class=\"status ok\" id=\"frOut\"></div>",init(el){ function gcd(a,b){ a=Math.abs(a);b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
       el.querySelector('#frBtn').addEventListener('click',()=>{
         const a=parseFloat(el.querySelector('#frA1').value), b=parseFloat(el.querySelector('#frA2').value), op=el.querySelector('#frOp').value, c=parseFloat(el.querySelector('#frB1').value), d=parseFloat(el.querySelector('#frB2').value), out=el.querySelector('#frOut');
         if(!a||!b||!c||!d){ out.textContent='Fill in all four numbers.'; return; }
         let n,den;
         if(op==='+'){ n=a*d+c*b; den=b*d; } else if(op==='-'){ n=a*d-c*b; den=b*d; } else if(op==='*'){ n=a*c; den=b*d; } else { n=a*d; den=b*c; }
         const g=gcd(n,den); const sign=den<0?-1:1; n=n/g*sign; den=Math.abs(den)/g;
         out.textContent=`Result: ${n}/${den}  (= ${(n/den).toFixed(4)})`;
       }); }},
{slug:"aspect-ratio-calculator",name:"Aspect Ratio Calculator",icon:"image",cats:["calculators", "image"],desc:"Simplify an aspect ratio and calculate the missing width or height.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"arW1\" placeholder=\"Width\" style=\"width:100px;\"><input type=\"number\" id=\"arH1\" placeholder=\"Height\" style=\"width:100px;\"><span>→</span><input type=\"number\" id=\"arW2\" placeholder=\"New width\" style=\"width:110px;\"><input type=\"number\" id=\"arH2\" placeholder=\"New height\" style=\"width:110px;\"><button class=\"act\" id=\"arBtn\">Calculate</button></div><div class=\"status ok\" id=\"arOut\"></div>",init(el){
       function gcd(a,b){ a=Math.abs(a);b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a||1; }
       el.querySelector('#arBtn').addEventListener('click',()=>{
         const w1=parseFloat(el.querySelector('#arW1').value), h1=parseFloat(el.querySelector('#arH1').value), w2=el.querySelector('#arW2').value, h2=el.querySelector('#arH2').value, out=el.querySelector('#arOut');
         if(!w1||!h1){ out.textContent='Enter the original width and height.'; return; }
         const g=gcd(w1,h1), ratioText=`${w1/g}:${h1/g}`;
         if(w2){ out.textContent=`Ratio: ${ratioText}\nHeight for width ${w2}: ${(w2*h1/w1).toFixed(2)}`; }
         else if(h2){ out.textContent=`Ratio: ${ratioText}\nWidth for height ${h2}: ${(h2*w1/h1).toFixed(2)}`; }
         else { out.textContent=`Ratio: ${ratioText}`; }
       });
     }},
{slug:"number-to-words",name:"Number to Words Converter",icon:"text",cats:["converters", "text"],desc:"Convert numbers into English words, up to the hundreds of billions.",lib:"",html:"<input type=\"number\" id=\"nwInput\" placeholder=\"e.g. 45210\" style=\"width:200px;\"><div class=\"row\"><button class=\"act\" id=\"nwBtn\">Convert</button></div><div class=\"status ok\" id=\"nwOut\"></div>",init(el){
       const ones=['','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
       const tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
       function chunk(n){ let s=''; if(n>=100){ s+=ones[Math.floor(n/100)]+' hundred '; n%=100; } if(n>=20){ s+=tens[Math.floor(n/20)*2 > 19 ? Math.floor(n/10) : 0]; }
         if(n<20) s+=ones[n]; else { s+=tens[Math.floor(n/10)]+(n%10?'-'+ones[n%10]:''); } return s.trim(); }
       function toWords(n){
         if(n===0) return 'zero';
         const groups=['','thousand','million','billion']; let parts=[]; let i=0;
         while(n>0){ const c=n%1000; if(c) parts.unshift(chunk(c)+(groups[i]?' '+groups[i]:'')); n=Math.floor(n/1000); i++; }
         return parts.join(', ');
       }
       el.querySelector('#nwBtn').addEventListener('click',()=>{
         const n=parseInt(el.querySelector('#nwInput').value), out=el.querySelector('#nwOut');
         if(isNaN(n)||n<0||n>999999999999){ out.textContent='Enter a whole number (0 to 999,999,999,999).'; return; }
         out.textContent=toWords(n);
       });
     }},
{slug:"roman-numeral-converter",name:"Roman Numeral Converter",icon:"hash",cats:["converters"],desc:"Convert numbers to Roman numerals and Roman numerals back to numbers.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"rnNum\" placeholder=\"1994\" min=\"1\" max=\"3999\" style=\"width:130px;\"><button class=\"act\" id=\"rnToRoman\">→ Roman</button></div>\n       <div class=\"row\"><input type=\"text\" id=\"rnRoman\" placeholder=\"MCMXCIV\" style=\"width:130px;\"><button class=\"act\" id=\"rnToNum\">→ Number</button></div>\n       <div class=\"status ok\" id=\"rnOut\"></div>",init(el){
       const vals=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
       const map={M:1000,D:500,C:100,L:50,X:10,V:5,I:1};
       el.querySelector('#rnToRoman').addEventListener('click',()=>{
         let n=parseInt(el.querySelector('#rnNum').value), out=el.querySelector('#rnOut'), r='';
         if(!n||n<1||n>3999){ out.textContent='Enter a number from 1 to 3999.'; return; }
         for(const [v,s] of vals){ while(n>=v){ r+=s; n-=v; } }
         out.textContent=r;
       });
       el.querySelector('#rnToNum').addEventListener('click',()=>{
         const s=el.querySelector('#rnRoman').value.toUpperCase().trim(), out=el.querySelector('#rnOut');
         let n=0; for(let i=0;i<s.length;i++){ const cur=map[s[i]], next=map[s[i+1]]; if(!cur){ out.textContent='Not a valid Roman numeral.'; return; }
           if(next && cur<next) n-=cur; else n+=cur; }
         out.textContent=n;
       });
     }},
{slug:"number-base-converter",name:"Number Base Converter",icon:"code",cats:["converters", "developer"],desc:"Convert numbers between binary, octal, decimal and hexadecimal.",lib:"",html:"<div class=\"row\"><input type=\"text\" id=\"bcInput\" placeholder=\"Value\" style=\"width:160px;\"><select id=\"bcFrom\"><option value=\"2\">Binary</option><option value=\"8\">Octal</option><option value=\"10\" selected>Decimal</option><option value=\"16\">Hex</option></select><span>→</span><select id=\"bcTo\"><option value=\"2\">Binary</option><option value=\"8\">Octal</option><option value=\"16\" selected>Hex</option><option value=\"10\">Decimal</option></select><button class=\"act\" id=\"bcBtn\">Convert</button></div><div class=\"status ok\" id=\"bcOut\"></div>",init(el){ el.querySelector('#bcBtn').addEventListener('click',()=>{
       const v=el.querySelector('#bcInput').value.trim(), from=parseInt(el.querySelector('#bcFrom').value), to=parseInt(el.querySelector('#bcTo').value), out=el.querySelector('#bcOut');
       const n=parseInt(v, from);
       if(isNaN(n)){ out.textContent='Enter a value valid for the selected base.'; return; }
       out.textContent = n.toString(to).toUpperCase();
     }); }},
{slug:"json-formatter",name:"JSON Formatter and Validator",icon:"braces",cats:["developer"],desc:"Format, validate and minify JSON with clear error messages.",lib:"",html:"<textarea id=\"jsonInput\" placeholder='{\"key\":\"value\"}'></textarea><div class=\"row\"><button class=\"act\" id=\"jsonBtn\">Format</button><button class=\"act\" id=\"jsonMinBtn\">Minify</button></div><pre id=\"jsonOut\"></pre>",init(el){ el.querySelector('#jsonBtn').addEventListener('click',()=>{
       const out=el.querySelector('#jsonOut');
       try{ out.textContent=JSON.stringify(JSON.parse(el.querySelector('#jsonInput').value),null,2); }
       catch(e){ out.textContent='Invalid JSON: '+e.message; }
     });
     el.querySelector('#jsonMinBtn').addEventListener('click',()=>{
       const out=el.querySelector('#jsonOut');
       try{ out.textContent=JSON.stringify(JSON.parse(el.querySelector('#jsonInput').value)); }
       catch(e){ out.textContent='Invalid JSON: '+e.message; }
     }); }},
{slug:"json-to-xml-converter",name:"JSON to XML Converter",icon:"swap",cats:["developer", "converters"],desc:"Convert JSON to XML and XML back to JSON.",lib:"",html:"<textarea id=\"jxInput\" placeholder='{\"root\":{\"item\":\"value\"}} or <root><item>value</item></root>'></textarea><div class=\"row\"><button class=\"act\" id=\"jxToXml\">JSON → XML</button><button class=\"act\" id=\"jxToJson\">XML → JSON</button></div><pre id=\"jxOut\"></pre>",init(el){
       function jsonToXml(obj,tag){
         if(obj===null||typeof obj!=='object') return `<${tag}>${obj}</${tag}>`;
         if(Array.isArray(obj)) return obj.map(v=>jsonToXml(v,tag)).join('');
         return `<${tag}>`+Object.entries(obj).map(([k,v])=>jsonToXml(v,k)).join('')+`</${tag}>`;
       }
       function xmlToJson(node){
         const children=[...node.children];
         if(!children.length) return node.textContent;
         const obj={};
         children.forEach(c=>{ const v=xmlToJson(c); obj[c.tagName] = obj[c.tagName]!==undefined ? [].concat(obj[c.tagName],v) : v; });
         return obj;
       }
       el.querySelector('#jxToXml').addEventListener('click',()=>{
         const out=el.querySelector('#jxOut');
         try{ const obj=JSON.parse(el.querySelector('#jxInput').value); out.textContent=jsonToXml(obj,'root'); }
         catch(e){ out.textContent='Invalid JSON: '+e.message; }
       });
       el.querySelector('#jxToJson').addEventListener('click',()=>{
         const out=el.querySelector('#jxOut');
         try{ const doc=new DOMParser().parseFromString(el.querySelector('#jxInput').value,'text/xml');
           if(doc.querySelector('parsererror')) throw new Error('malformed XML');
           out.textContent=JSON.stringify(xmlToJson(doc.documentElement),null,2);
         }catch(e){ out.textContent='Invalid XML: '+e.message; }
       });
     }},
{slug:"md5-hash-generator",name:"MD5 Hash Generator",icon:"lock",cats:["developer", "network"],desc:"Generate the MD5 hash of any text.",lib:"",html:"<textarea id=\"md5Input\" placeholder=\"Text to hash…\"></textarea><div class=\"row\"><button class=\"act\" id=\"md5Btn\">Generate</button></div><pre id=\"md5Out\"></pre>",init(el){
       function md5(str){
         function rl(n,c){return (n<<c)|(n>>>(32-c));}
         function ad(a,b){const l=(a&0xFFFF)+(b&0xFFFF);return (((a>>16)+(b>>16)+(l>>16))<<16)|(l&0xFFFF);}
         function cmn(q,a,b,x,s,t){return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
         function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t);}
         function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t);}
         function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
         function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}
         function toWords(s){ const n=s.length, words=[]; for(let i=0;i<n*8;i+=8) words[i>>5]|=(s.charCodeAt(i/8)&0xff)<<(i%32); return words; }
         const utf8=unescape(encodeURIComponent(str));
         let x=toWords(utf8); const len=utf8.length*8;
         x[len>>5]|=0x80<<(len%32); x[(((len+64)>>>9)<<4)+14]=len;
         let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
         for(let i=0;i<x.length;i+=16){
           const oa=a,ob=b,oc=c,od=d;
           a=ff(a,b,c,d,x[i+0]||0,7,-680876936); d=ff(d,a,b,c,x[i+1]||0,12,-389564586); c=ff(c,d,a,b,x[i+2]||0,17,606105819); b=ff(b,c,d,a,x[i+3]||0,22,-1044525330);
           a=ff(a,b,c,d,x[i+4]||0,7,-176418897); d=ff(d,a,b,c,x[i+5]||0,12,1200080426); c=ff(c,d,a,b,x[i+6]||0,17,-1473231341); b=ff(b,c,d,a,x[i+7]||0,22,-45705983);
           a=ff(a,b,c,d,x[i+8]||0,7,1770035416); d=ff(d,a,b,c,x[i+9]||0,12,-1958414417); c=ff(c,d,a,b,x[i+10]||0,17,-42063); b=ff(b,c,d,a,x[i+11]||0,22,-1990404162);
           a=ff(a,b,c,d,x[i+12]||0,7,1804603682); d=ff(d,a,b,c,x[i+13]||0,12,-40341101); c=ff(c,d,a,b,x[i+14]||0,17,-1502002290); b=ff(b,c,d,a,x[i+15]||0,22,1236535329);
           a=gg(a,b,c,d,x[i+1]||0,5,-165796510); d=gg(d,a,b,c,x[i+6]||0,9,-1069501632); c=gg(c,d,a,b,x[i+11]||0,14,643717713); b=gg(b,c,d,a,x[i+0]||0,20,-373897302);
           a=gg(a,b,c,d,x[i+5]||0,5,-701558691); d=gg(d,a,b,c,x[i+10]||0,9,38016083); c=gg(c,d,a,b,x[i+15]||0,14,-660478335); b=gg(b,c,d,a,x[i+4]||0,20,-405537848);
           a=gg(a,b,c,d,x[i+9]||0,5,568446438); d=gg(d,a,b,c,x[i+14]||0,9,-1019803690); c=gg(c,d,a,b,x[i+3]||0,14,-187363961); b=gg(b,c,d,a,x[i+8]||0,20,1163531501);
           a=gg(a,b,c,d,x[i+13]||0,5,-1444681467); d=gg(d,a,b,c,x[i+2]||0,9,-51403784); c=gg(c,d,a,b,x[i+7]||0,14,1735328473); b=gg(b,c,d,a,x[i+12]||0,20,-1926607734);
           a=hh(a,b,c,d,x[i+5]||0,4,-378558); d=hh(d,a,b,c,x[i+8]||0,11,-2022574463); c=hh(c,d,a,b,x[i+11]||0,16,1839030562); b=hh(b,c,d,a,x[i+14]||0,23,-35309556);
           a=hh(a,b,c,d,x[i+1]||0,4,-1530992060); d=hh(d,a,b,c,x[i+4]||0,11,1272893353); c=hh(c,d,a,b,x[i+7]||0,16,-155497632); b=hh(b,c,d,a,x[i+10]||0,23,-1094730640);
           a=hh(a,b,c,d,x[i+13]||0,4,681279174); d=hh(d,a,b,c,x[i+0]||0,11,-358537222); c=hh(c,d,a,b,x[i+3]||0,16,-722521979); b=hh(b,c,d,a,x[i+6]||0,23,76029189);
           a=hh(a,b,c,d,x[i+9]||0,4,-640364487); d=hh(d,a,b,c,x[i+12]||0,11,-421815835); c=hh(c,d,a,b,x[i+15]||0,16,530742520); b=hh(b,c,d,a,x[i+2]||0,23,-995338651);
           a=ii(a,b,c,d,x[i+0]||0,6,-198630844); d=ii(d,a,b,c,x[i+7]||0,10,1126891415); c=ii(c,d,a,b,x[i+14]||0,15,-1416354905); b=ii(b,c,d,a,x[i+5]||0,21,-57434055);
           a=ii(a,b,c,d,x[i+12]||0,6,1700485571); d=ii(d,a,b,c,x[i+3]||0,10,-1894986606); c=ii(c,d,a,b,x[i+10]||0,15,-1051523); b=ii(b,c,d,a,x[i+1]||0,21,-2054922799);
           a=ii(a,b,c,d,x[i+8]||0,6,1873313359); d=ii(d,a,b,c,x[i+15]||0,10,-30611744); c=ii(c,d,a,b,x[i+6]||0,15,-1560198380); b=ii(b,c,d,a,x[i+13]||0,21,1309151649);
           a=ii(a,b,c,d,x[i+4]||0,6,-145523070); d=ii(d,a,b,c,x[i+11]||0,10,-1120210379); c=ii(c,d,a,b,x[i+2]||0,15,718787259); b=ii(b,c,d,a,x[i+9]||0,21,-343485551);
           a=ad(a,oa); b=ad(b,ob); c=ad(c,oc); d=ad(d,od);
         }
         function toHex(n){ let s=''; for(let i=0;i<4;i++) s+=((n>>(i*8))&0xff).toString(16).padStart(2,'0'); return s; }
         return [a,b,c,d].map(toHex).join('');
       }
       el.querySelector('#md5Btn').addEventListener('click',()=>{
         const t=el.querySelector('#md5Input').value, out=el.querySelector('#md5Out');
         out.textContent = t ? md5(t) : 'Enter some text first.';
       });
     }},
{slug:"csv-to-json-converter",name:"CSV to JSON Converter",icon:"swap",cats:["developer", "converters"],desc:"Convert CSV to JSON and JSON arrays back to CSV.",lib:"",html:"<textarea id=\"cjInput\" placeholder='name,age&#10;Alice,30&#10;Bob,25  — or —  [{\"name\":\"Alice\",\"age\":30}]'></textarea><div class=\"row\"><button class=\"act\" id=\"cjToJson\">CSV → JSON</button><button class=\"act\" id=\"cjToCsv\">JSON → CSV</button></div><pre id=\"cjOut\"></pre>",init(el){
       function parseCsv(text){
         const rows=text.trim().split('\n').map(r=>r.split(','));
         const headers=rows[0];
         return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h.trim(), (r[i]||'').trim()])));
       }
       el.querySelector('#cjToJson').addEventListener('click',()=>{
         const out=el.querySelector('#cjOut');
         try{ out.textContent=JSON.stringify(parseCsv(el.querySelector('#cjInput').value),null,2); }
         catch(e){ out.textContent='Could not parse as CSV.'; }
       });
       el.querySelector('#cjToCsv').addEventListener('click',()=>{
         const out=el.querySelector('#cjOut');
         try{
           const arr=JSON.parse(el.querySelector('#cjInput').value);
           if(!Array.isArray(arr)||!arr.length) throw new Error();
           const headers=Object.keys(arr[0]);
           const rows=arr.map(o=>headers.map(h=>o[h]).join(','));
           out.textContent=[headers.join(','),...rows].join('\n');
         }catch(e){ out.textContent='Enter a valid JSON array of objects.'; }
       });
     }},
{slug:"markdown-to-html-converter",name:"Markdown to HTML Converter",icon:"code",cats:["developer", "converters"],desc:"Convert Markdown to HTML and HTML back to Markdown.",lib:"",html:"<textarea id=\"mhInput\" placeholder=\"# Heading&#10;**bold** and _italic_&#10;- item one&#10;- item two&#10;[link](https://example.com)\"></textarea><div class=\"row\"><button class=\"act\" id=\"mhToHtml\">Markdown → HTML</button><button class=\"act\" id=\"mhToMd\">HTML → Markdown</button></div><pre id=\"mhOut\"></pre>",init(el){
       function mdToHtml(md){
         let html=md
           .replace(/^### (.*)$/gm,'<h3>$1</h3>')
           .replace(/^## (.*)$/gm,'<h2>$1</h2>')
           .replace(/^# (.*)$/gm,'<h1>$1</h1>')
           .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
           .replace(/_(.*?)_/g,'<em>$1</em>')
           .replace(/\[(.*?)\]\((.*?)\)/g,'<a href="$2">$1</a>')
           .replace(/^- (.*)$/gm,'<li>$1</li>');
         html=html.replace(/(<li>.*<\/li>\n?)+/g, m=>'<ul>\n'+m+'</ul>\n');
         return html.split('\n\n').map(p=>p.match(/^<(h\d|ul|li)/) ? p : `<p>${p}</p>`).join('\n');
       }
       function htmlToMd(html){
         return html
           .replace(/<h1>(.*?)<\/h1>/g,'# $1')
           .replace(/<h2>(.*?)<\/h2>/g,'## $1')
           .replace(/<h3>(.*?)<\/h3>/g,'### $1')
           .replace(/<strong>(.*?)<\/strong>/g,'**$1**')
           .replace(/<em>(.*?)<\/em>/g,'_$1_')
           .replace(/<a href="(.*?)">(.*?)<\/a>/g,'[$2]($1)')
           .replace(/<\/?ul>/g,'').replace(/<li>(.*?)<\/li>/g,'- $1')
           .replace(/<\/?p>/g,'').trim();
       }
       el.querySelector('#mhToHtml').addEventListener('click',()=>{ el.querySelector('#mhOut').textContent=mdToHtml(el.querySelector('#mhInput').value); });
       el.querySelector('#mhToMd').addEventListener('click',()=>{ el.querySelector('#mhOut').textContent=htmlToMd(el.querySelector('#mhInput').value); });
     }},
{slug:"case-style-converter",name:"Case Style Converter",icon:"case",cats:["developer", "text"],desc:"Convert names to camelCase, snake_case, kebab-case or PascalCase.",lib:"",html:"<input type=\"text\" id=\"csInput\" placeholder=\"my variable name\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" data-c=\"camel\">camelCase</button><button class=\"act\" data-c=\"snake\">snake_case</button><button class=\"act\" data-c=\"kebab\">kebab-case</button><button class=\"act\" data-c=\"pascal\">PascalCase</button></div><pre id=\"csOut\"></pre>",init(el){
       function words(s){ return s.trim().replace(/([a-z])([A-Z])/g,'$1 $2').split(/[\s_-]+/).filter(Boolean).map(w=>w.toLowerCase()); }
       el.querySelectorAll('button[data-c]').forEach(b=>b.addEventListener('click',()=>{
         const w=words(el.querySelector('#csInput').value), out=el.querySelector('#csOut');
         if(!w.length){ out.textContent='Enter some text first.'; return; }
         const c=b.dataset.c;
         if(c==='camel') out.textContent=w[0]+w.slice(1).map(x=>x[0].toUpperCase()+x.slice(1)).join('');
         else if(c==='snake') out.textContent=w.join('_');
         else if(c==='kebab') out.textContent=w.join('-');
         else out.textContent=w.map(x=>x[0].toUpperCase()+x.slice(1)).join('');
       })); }},
{slug:"sha-hash-generator",name:"SHA Hash Generator",icon:"lock",cats:["developer", "network"],desc:"Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text.",lib:"",html:"<textarea id=\"hashInput\" placeholder=\"Text to hash…\"></textarea>\n       <div class=\"row\"><select id=\"hashAlgo\"><option value=\"SHA-1\">SHA-1</option><option value=\"SHA-256\" selected>SHA-256</option><option value=\"SHA-384\">SHA-384</option><option value=\"SHA-512\">SHA-512</option></select><button class=\"act\" id=\"hashBtn\">Generate</button></div>\n       <pre id=\"hashOut\"></pre>",init(el){ el.querySelector('#hashBtn').addEventListener('click', async ()=>{
       const text=el.querySelector('#hashInput').value, algo=el.querySelector('#hashAlgo').value, out=el.querySelector('#hashOut');
       if(!text){ out.textContent='Enter some text first.'; return; }
       const buf=await crypto.subtle.digest(algo, new TextEncoder().encode(text));
       out.textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
     }); }},
{slug:"url-encoder-decoder",name:"URL Encoder and Decoder",icon:"link",cats:["developer", "converters"],desc:"Encode or decode URL components safely.",lib:"",html:"<textarea id=\"urlInput\" placeholder=\"Text or URL…\"></textarea><div class=\"row\"><button class=\"act\" data-m=\"encode\">Encode</button><button class=\"act\" data-m=\"decode\">Decode</button></div><pre id=\"urlOut\"></pre>",init(el){ el.querySelectorAll('button[data-m]').forEach(b=>b.addEventListener('click',()=>{
       const v=el.querySelector('#urlInput').value, out=el.querySelector('#urlOut');
       try{ out.textContent = b.dataset.m==='encode' ? encodeURIComponent(v) : decodeURIComponent(v); }
       catch(e){ out.textContent='Error: could not '+b.dataset.m+' this input.'; }
     })); }},
{slug:"uuid-generator",name:"UUID Generator",icon:"hash",cats:["developer"],desc:"Generate random version 4 UUIDs, up to 20 at a time.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"uuidCount\" min=\"1\" max=\"20\" value=\"1\" style=\"width:70px;\"><button class=\"act\" id=\"uuidBtn\">Generate</button></div><pre id=\"uuidOut\"></pre>",init(el){ el.querySelector('#uuidBtn').addEventListener('click',()=>{
       const n=Math.min(20, Math.max(1, parseInt(el.querySelector('#uuidCount').value)||1));
       const ids=Array.from({length:n},()=>crypto.randomUUID());
       el.querySelector('#uuidOut').textContent=ids.join('\n');
     }); }},
{slug:"regex-tester",name:"Regex Tester",icon:"code",cats:["developer"],desc:"Test regular expressions with flags and see every match with its position.",lib:"",html:"<input type=\"text\" id=\"reInput\" placeholder=\"Pattern, e.g. \\d+\" style=\"width:100%;margin-bottom:8px;\">\n       <div class=\"row\"><label style=\"font-size:13px;\"><input type=\"checkbox\" id=\"reG\" checked> g</label><label style=\"font-size:13px;\"><input type=\"checkbox\" id=\"reI\"> i</label><label style=\"font-size:13px;\"><input type=\"checkbox\" id=\"reM\"> m</label></div>\n       <textarea id=\"reTest\" placeholder=\"Text to test against…\"></textarea>\n       <div class=\"row\"><button class=\"act\" id=\"reBtn\">Test</button></div>\n       <pre id=\"reOut\"></pre>",init(el){ el.querySelector('#reBtn').addEventListener('click',()=>{
       const out=el.querySelector('#reOut');
       let flags=''; if(el.querySelector('#reG').checked) flags+='g'; if(el.querySelector('#reI').checked) flags+='i'; if(el.querySelector('#reM').checked) flags+='m';
       try{
         const re=new RegExp(el.querySelector('#reInput').value, flags);
         const text=el.querySelector('#reTest').value;
         const matches=[...text.matchAll(new RegExp(re, flags.includes('g')?flags:flags+'g'))];
         out.textContent = matches.length ? `${matches.length} match(es):\n` + matches.map(m=>`"${m[0]}" at index ${m.index}`).join('\n') : 'No matches.';
       }catch(e){ out.textContent='Invalid pattern: '+e.message; }
     }); }},
{slug:"jwt-decoder",name:"JWT Decoder",icon:"lock",cats:["developer", "network"],desc:"Decode a JSON Web Token to inspect its header and payload.",lib:"",html:"<textarea id=\"jwtInput\" placeholder=\"Paste a JWT…\"></textarea><div class=\"row\"><button class=\"act\" id=\"jwtBtn\">Decode</button></div><pre id=\"jwtOut\"></pre>",init(el){ el.querySelector('#jwtBtn').addEventListener('click',()=>{
       const out=el.querySelector('#jwtOut');
       const parts=el.querySelector('#jwtInput').value.trim().split('.');
       if(parts.length<2){ out.textContent='That does not look like a JWT (expected header.payload.signature).'; return; }
       try{
         const dec=s=>JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))),null,2);
         out.textContent = `HEADER:\n${dec(parts[0])}\n\nPAYLOAD:\n${dec(parts[1])}` + (parts[2]?`\n\nSIGNATURE (not verified):\n${parts[2]}`:'');
       }catch(e){ out.textContent='Could not decode: '+e.message; }
     }); }},
{slug:"unix-timestamp-converter",name:"Unix Timestamp Converter",icon:"clock",cats:["developer", "converters"],desc:"Convert Unix timestamps to readable dates and dates back to timestamps.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"tsUnix\" placeholder=\"Unix timestamp (seconds)\" style=\"width:200px;\"><button class=\"act\" id=\"tsToDate\">→ Date</button></div>\n       <div class=\"row\"><input type=\"datetime-local\" id=\"tsDate\"><button class=\"act\" id=\"tsToUnix\">→ Unix</button></div>\n       <div class=\"status ok\" id=\"tsOut\"></div>",init(el){
       el.querySelector('#tsToDate').addEventListener('click',()=>{
         const v=parseInt(el.querySelector('#tsUnix').value), out=el.querySelector('#tsOut');
         if(!v){ out.textContent='Enter a Unix timestamp.'; return; }
         out.textContent=new Date(v*1000).toString();
       });
       el.querySelector('#tsToUnix').addEventListener('click',()=>{
         const v=el.querySelector('#tsDate').value, out=el.querySelector('#tsOut');
         if(!v){ out.textContent='Pick a date and time.'; return; }
         out.textContent=`Unix: ${Math.floor(new Date(v).getTime()/1000)}`;
       });
       el.querySelector('#tsUnix').value=Math.floor(Date.now()/1000);
     }},
{slug:"html-entity-encoder-decoder",name:"HTML Entity Encoder and Decoder",icon:"code",cats:["developer"],desc:"Encode special characters as HTML entities or decode them back.",lib:"",html:"<textarea id=\"heInput\" placeholder=\"Text or &amp;lt;markup&amp;gt;…\"></textarea><div class=\"row\"><button class=\"act\" data-m=\"encode\">Encode</button><button class=\"act\" data-m=\"decode\">Decode</button></div><pre id=\"heOut\"></pre>",init(el){ el.querySelectorAll('button[data-m]').forEach(b=>b.addEventListener('click',()=>{
       const v=el.querySelector('#heInput').value, out=el.querySelector('#heOut');
       if(b.dataset.m==='encode'){ const d=document.createElement('div'); d.textContent=v; out.textContent=d.innerHTML; }
       else { const d=document.createElement('textarea'); d.innerHTML=v; out.textContent=d.value; }
     })); }},
{slug:"cron-expression-explainer",name:"Cron Expression Explainer",icon:"clock",cats:["developer"],desc:"Translate cron schedule expressions into plain English.",lib:"",html:"<input type=\"text\" id=\"cronInput\" placeholder=\"e.g. */15 9-17 * * 1-5\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"cronBtn\">Explain</button></div><div class=\"status ok\" id=\"cronOut\"></div>",init(el){ el.querySelector('#cronBtn').addEventListener('click',()=>{
       const parts=el.querySelector('#cronInput').value.trim().split(/\s+/), out=el.querySelector('#cronOut');
       if(parts.length!==5){ out.textContent='Enter 5 fields: minute hour day-of-month month day-of-week.'; return; }
       const [min,hr,dom,mon,dow]=parts;
       const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
       function desc(field,unit,names){
         if(field==='*') return 'every '+unit;
         if(field.startsWith('*/')) return `every ${field.slice(2)} ${unit}(s)`;
         if(field.includes('-')){ const [a,b]=field.split('-'); return names? `${names[a]}–${names[b]}` : `${unit}s ${a}-${b}`; }
         if(field.includes(',')) return (names? field.split(',').map(x=>names[x]).join(', ') : field.split(',').join(', '))+` (specific ${unit}s)`;
         return names? names[field] : `${unit} ${field}`;
       }
       out.textContent = `Minute: ${desc(min,'minute')}\nHour: ${desc(hr,'hour')}\nDay of month: ${desc(dom,'day')}\nMonth: ${desc(mon,'month')}\nDay of week: ${desc(dow,'day',days)}`;
     }); }},
{slug:"image-resizer",name:"Image Resizer",icon:"image",cats:["image"],desc:"Resize images to exact pixel dimensions with an aspect-ratio lock.",lib:"",html:"<input type=\"file\" id=\"rsFile\" accept=\"image/*\">\n       <div class=\"row\"><input type=\"number\" id=\"rsW\" placeholder=\"Width (px)\" style=\"width:120px;\"><input type=\"number\" id=\"rsH\" placeholder=\"Height (px)\" style=\"width:120px;\"><label style=\"font-size:13px;\"><input type=\"checkbox\" id=\"rsLock\" checked> lock ratio</label></div>\n       <div class=\"row\"><button class=\"act\" id=\"rsBtn\">Resize</button></div>\n       <div class=\"status\" id=\"rsStatus\"></div><div class=\"preview\" id=\"rsPreview\"></div>",init(el){
       let ratio=null;
       el.querySelector('#rsFile').addEventListener('change', e=>{
         const f=e.target.files[0]; if(!f) return;
         const img=new Image(); const reader=new FileReader();
         reader.onload=ev=>{ img.onload=()=>{ ratio=img.width/img.height; el.querySelector('#rsW').value=img.width; el.querySelector('#rsH').value=img.height; }; img.src=ev.target.result; };
         reader.readAsDataURL(f);
       });
       el.querySelector('#rsW').addEventListener('input',()=>{ if(ratio && el.querySelector('#rsLock').checked) el.querySelector('#rsH').value=Math.round(el.querySelector('#rsW').value/ratio); });
       el.querySelector('#rsH').addEventListener('input',()=>{ if(ratio && el.querySelector('#rsLock').checked) el.querySelector('#rsW').value=Math.round(el.querySelector('#rsH').value*ratio); });
       el.querySelector('#rsBtn').addEventListener('click',()=>{
         const f=el.querySelector('#rsFile').files[0], statusEl=el.querySelector('#rsStatus');
         const w=parseInt(el.querySelector('#rsW').value), h=parseInt(el.querySelector('#rsH').value);
         if(!f||!w||!h){ statusEl.textContent='Choose an image and set width & height.'; return; }
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
             canvas.getContext('2d').drawImage(img,0,0,w,h);
             canvas.toBlob(blob=>{
               const url=URL.createObjectURL(blob);
               statusEl.className='status ok'; statusEl.textContent=`Resized to ${w}×${h}px.`;
               el.querySelector('#rsPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="resized.png">Download ↓</a></div>`;
             }, 'image/png');
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"image-cropper",name:"Image Cropper",icon:"image",cats:["image"],desc:"Crop images by dragging a selection box, then download the result.",lib:"",html:"<input type=\"file\" id=\"cropFile\" accept=\"image/*\">\n       <div class=\"status\" id=\"cropHint\" style=\"margin:8px 0;\">Choose an image, then drag on it to select the area to keep.</div>\n       <div style=\"max-width:100%;overflow:auto;\"><canvas id=\"cropCanvas\" style=\"border:1px solid var(--line);max-width:100%;cursor:crosshair;\"></canvas></div>\n       <div class=\"row\"><button class=\"act\" id=\"cropBtn\">Crop & download</button></div>\n       <div class=\"status\" id=\"cropStatus\"></div><div class=\"preview\" id=\"cropPreview\"></div>",init(el){
       const canvas=el.querySelector('#cropCanvas'), ctx=canvas.getContext('2d');
       let img=null, scale=1, sel=null, dragging=false, start=null;
       function draw(){
         ctx.clearRect(0,0,canvas.width,canvas.height);
         ctx.drawImage(img,0,0,canvas.width,canvas.height);
         if(sel){ ctx.strokeStyle='#E8622C'; ctx.lineWidth=2; ctx.strokeRect(sel.x,sel.y,sel.w,sel.h); ctx.fillStyle='rgba(232,98,44,0.15)'; ctx.fillRect(sel.x,sel.y,sel.w,sel.h); }
       }
       function pos(e){ const r=canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*(canvas.width/r.width), y:(e.clientY-r.top)*(canvas.height/r.height)}; }
       canvas.addEventListener('mousedown', e=>{ if(!img) return; dragging=true; start=pos(e); sel={x:start.x,y:start.y,w:0,h:0}; });
       canvas.addEventListener('mousemove', e=>{ if(!dragging) return; const p=pos(e); sel={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)}; draw(); });
       window.addEventListener('mouseup', ()=>{ dragging=false; });
       el.querySelector('#cropFile').addEventListener('change', e=>{
         const f=e.target.files[0]; if(!f) return;
         const reader=new FileReader();
         reader.onload=ev=>{
           img=new Image();
           img.onload=()=>{
             const maxW=420; scale=img.width>maxW? img.width/maxW : 1;
             canvas.width=img.width/scale; canvas.height=img.height/scale;
             sel=null; draw();
           };
           img.src=ev.target.result;
         };
         reader.readAsDataURL(f);
       });
       el.querySelector('#cropBtn').addEventListener('click',()=>{
         const statusEl=el.querySelector('#cropStatus');
         if(!img||!sel||sel.w<2||sel.h<2){ statusEl.textContent='Drag a selection on the image first.'; return; }
         const out=document.createElement('canvas');
         out.width=Math.round(sel.w*scale); out.height=Math.round(sel.h*scale);
         out.getContext('2d').drawImage(img, sel.x*scale, sel.y*scale, sel.w*scale, sel.h*scale, 0,0, out.width, out.height);
         out.toBlob(blob=>{
           const url=URL.createObjectURL(blob);
           statusEl.className='status ok'; statusEl.textContent=`Cropped to ${out.width}×${out.height}px.`;
           el.querySelector('#cropPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="cropped.png">Download ↓</a></div>`;
         }, 'image/png');
       });
     }},
{slug:"image-watermark",name:"Image Watermark",icon:"image",cats:["image"],desc:"Add a text watermark to images with custom position, size and opacity.",lib:"",html:"<input type=\"file\" id=\"wmFile\" accept=\"image/*\">\n       <div class=\"row\"><input type=\"text\" id=\"wmText\" placeholder=\"Watermark text\" style=\"width:180px;\"><input type=\"number\" id=\"wmSize\" placeholder=\"Size px\" value=\"32\" style=\"width:90px;\"></div>\n       <div class=\"row\"><select id=\"wmPos\"><option value=\"br\">Bottom right</option><option value=\"bl\">Bottom left</option><option value=\"tr\">Top right</option><option value=\"tl\">Top left</option><option value=\"center\">Center</option></select><label style=\"font-size:13px;\">Opacity <input type=\"range\" id=\"wmOpacity\" min=\"0.1\" max=\"1\" step=\"0.05\" value=\"0.5\" style=\"width:90px;\"></label><button class=\"act\" id=\"wmBtn\">Apply</button></div>\n       <div class=\"status\" id=\"wmStatus\"></div><div class=\"preview\" id=\"wmPreview\"></div>",init(el){
       el.querySelector('#wmBtn').addEventListener('click',()=>{
         const f=el.querySelector('#wmFile').files[0], statusEl=el.querySelector('#wmStatus');
         const text=el.querySelector('#wmText').value;
         if(!f||!text){ statusEl.textContent='Choose an image and enter watermark text.'; return; }
         const size=parseInt(el.querySelector('#wmSize').value)||32, opacity=parseFloat(el.querySelector('#wmOpacity').value), pos=el.querySelector('#wmPos').value;
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
             const ctx=canvas.getContext('2d');
             ctx.drawImage(img,0,0);
             ctx.font=`${size}px sans-serif`; ctx.fillStyle=`rgba(255,255,255,${opacity})`; ctx.strokeStyle=`rgba(0,0,0,${opacity})`; ctx.lineWidth=Math.max(1,size/16);
             const tw=ctx.measureText(text).width, pad=size*0.6;
             let x,y;
             if(pos==='br'){ x=canvas.width-tw-pad; y=canvas.height-pad; }
             else if(pos==='bl'){ x=pad; y=canvas.height-pad; }
             else if(pos==='tr'){ x=canvas.width-tw-pad; y=pad+size; }
             else if(pos==='tl'){ x=pad; y=pad+size; }
             else { x=(canvas.width-tw)/2; y=(canvas.height+size)/2; }
             ctx.strokeText(text,x,y); ctx.fillText(text,x,y);
             canvas.toBlob(blob=>{
               const url=URL.createObjectURL(blob);
               statusEl.className='status ok'; statusEl.textContent='Watermark applied.';
               el.querySelector('#wmPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="watermarked.png">Download ↓</a></div>`;
             }, 'image/png');
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"rotate-flip-image",name:"Rotate and Flip Image",icon:"reset",cats:["image"],desc:"Rotate images 90 degrees or flip them horizontally and vertically.",lib:"",html:"<input type=\"file\" id=\"rfFile\" accept=\"image/*\">\n       <div class=\"row\"><button class=\"act\" data-op=\"rotL\">⟲ Rotate left</button><button class=\"act\" data-op=\"rotR\">⟳ Rotate right</button><button class=\"act\" data-op=\"flipH\">⇋ Flip horizontal</button><button class=\"act\" data-op=\"flipV\">⇅ Flip vertical</button></div>\n       <div class=\"status\" id=\"rfStatus\"></div><div class=\"preview\" id=\"rfPreview\"></div>",init(el){
       let baseImg=null;
       el.querySelector('#rfFile').addEventListener('change', e=>{
         const f=e.target.files[0]; if(!f) return;
         const reader=new FileReader();
         reader.onload=ev=>{ baseImg=new Image(); baseImg.onload=()=>{ el.querySelector('#rfStatus').textContent='Image loaded — pick an action.'; }; baseImg.src=ev.target.result; };
         reader.readAsDataURL(f);
       });
       el.querySelectorAll('button[data-op]').forEach(b=>b.addEventListener('click',()=>{
         const statusEl=el.querySelector('#rfStatus'), op=b.dataset.op;
         if(!baseImg){ statusEl.textContent='Choose an image first.'; return; }
         const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d');
         const swap = op==='rotL'||op==='rotR';
         canvas.width = swap? baseImg.height : baseImg.width;
         canvas.height = swap? baseImg.width : baseImg.height;
         ctx.save();
         if(op==='rotL'){ ctx.translate(0,canvas.height); ctx.rotate(-Math.PI/2); }
         else if(op==='rotR'){ ctx.translate(canvas.width,0); ctx.rotate(Math.PI/2); }
         else if(op==='flipH'){ ctx.translate(canvas.width,0); ctx.scale(-1,1); }
         else if(op==='flipV'){ ctx.translate(0,canvas.height); ctx.scale(1,-1); }
         ctx.drawImage(baseImg,0,0);
         ctx.restore();
         canvas.toBlob(blob=>{
           const url=URL.createObjectURL(blob);
           statusEl.className='status ok'; statusEl.textContent='Done.';
           el.querySelector('#rfPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="edited.png">Download ↓</a></div>`;
         }, 'image/png');
       }));
     }},
{slug:"image-format-converter",name:"Image Format Converter",icon:"swap",cats:["image", "converters"],desc:"Convert images between JPG, PNG and WebP formats.",lib:"",html:"<input type=\"file\" id=\"fcFile\" accept=\"image/*\">\n       <div class=\"row\"><label style=\"font-size:13px;\">Convert to</label><select id=\"fcFormat\"><option value=\"image/png\">PNG</option><option value=\"image/jpeg\">JPG</option><option value=\"image/webp\">WEBP</option></select><button class=\"act\" id=\"fcBtn\">Convert</button></div>\n       <div class=\"status\" id=\"fcStatus\"></div><div class=\"preview\" id=\"fcPreview\"></div>",init(el){
       el.querySelector('#fcBtn').addEventListener('click',()=>{
         const f=el.querySelector('#fcFile').files[0], statusEl=el.querySelector('#fcStatus');
         if(!f){ statusEl.textContent='Choose an image first.'; return; }
         const format=el.querySelector('#fcFormat').value;
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
             const ctx=canvas.getContext('2d');
             if(format==='image/jpeg'){ ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); }
             ctx.drawImage(img,0,0);
             canvas.toBlob(blob=>{
               if(!blob){ statusEl.textContent='This browser could not produce that format.'; return; }
               const url=URL.createObjectURL(blob);
               const ext = format==='image/png'?'png':format==='image/webp'?'webp':'jpg';
               const fromExt=(f.name.split('.').pop()||'file').toUpperCase();
               statusEl.className='status ok'; statusEl.textContent=`Converted ${fromExt} → ${ext.toUpperCase()}.`;
               el.querySelector('#fcPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="converted.${ext}">Download ↓</a></div>`;
             }, format, 0.92);
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"image-filters",name:"Image Filters",icon:"color",cats:["image"],desc:"Apply grayscale, sepia, blur and brightness filters to your images.",lib:"",html:"<input type=\"file\" id=\"fxFile\" accept=\"image/*\">\n       <div class=\"row\"><label style=\"font-size:13px;\">Filter</label><select id=\"fxType\"><option value=\"grayscale\">Grayscale</option><option value=\"sepia\">Sepia</option><option value=\"blur\">Blur</option><option value=\"brightness\">Brightness</option></select><label style=\"font-size:13px;\">Amount <input type=\"range\" id=\"fxAmt\" min=\"0\" max=\"100\" value=\"60\" style=\"width:100px;\"></label><button class=\"act\" id=\"fxBtn\">Apply</button></div>\n       <div class=\"status\" id=\"fxStatus\"></div><div class=\"preview\" id=\"fxPreview\"></div>",init(el){
       el.querySelector('#fxBtn').addEventListener('click',()=>{
         const f=el.querySelector('#fxFile').files[0], statusEl=el.querySelector('#fxStatus');
         if(!f){ statusEl.textContent='Choose an image first.'; return; }
         const type=el.querySelector('#fxType').value, amt=parseInt(el.querySelector('#fxAmt').value);
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
             const ctx=canvas.getContext('2d');
             const filters={
               grayscale:`grayscale(${amt}%)`,
               sepia:`sepia(${amt}%)`,
               blur:`blur(${(amt/100*10).toFixed(1)}px)`,
               brightness:`brightness(${50+amt}%)`
             };
             ctx.filter=filters[type];
             ctx.drawImage(img,0,0);
             canvas.toBlob(blob=>{
               const url=URL.createObjectURL(blob);
               statusEl.className='status ok'; statusEl.textContent='Filter applied.';
               el.querySelector('#fxPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="filtered.png">Download ↓</a></div>`;
             }, 'image/png');
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"image-border",name:"Add Border to Image",icon:"image",cats:["image"],desc:"Add a colored border or frame around any image.",lib:"",html:"<input type=\"file\" id=\"bdFile\" accept=\"image/*\">\n       <div class=\"row\"><input type=\"number\" id=\"bdWidth\" placeholder=\"Border width px\" value=\"20\" style=\"width:150px;\"><input type=\"color\" id=\"bdColor\" value=\"#0f1b2b\"><button class=\"act\" id=\"bdBtn\">Apply</button></div>\n       <div class=\"status\" id=\"bdStatus\"></div><div class=\"preview\" id=\"bdPreview\"></div>",init(el){
       el.querySelector('#bdBtn').addEventListener('click',()=>{
         const f=el.querySelector('#bdFile').files[0], statusEl=el.querySelector('#bdStatus');
         if(!f){ statusEl.textContent='Choose an image first.'; return; }
         const bw=parseInt(el.querySelector('#bdWidth').value)||0, color=el.querySelector('#bdColor').value;
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); canvas.width=img.width+bw*2; canvas.height=img.height+bw*2;
             const ctx=canvas.getContext('2d');
             ctx.fillStyle=color; ctx.fillRect(0,0,canvas.width,canvas.height);
             ctx.drawImage(img,bw,bw);
             canvas.toBlob(blob=>{
               const url=URL.createObjectURL(blob);
               statusEl.className='status ok'; statusEl.textContent='Border applied.';
               el.querySelector('#bdPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="bordered.png">Download ↓</a></div>`;
             }, 'image/png');
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"dominant-color-extractor",name:"Dominant Color Extractor",icon:"color",cats:["image", "color"],desc:"Find the five most dominant colors in any image.",lib:"",html:"<input type=\"file\" id=\"dcpFile\" accept=\"image/*\"><div class=\"row\"><button class=\"act\" id=\"dcpBtn\">Extract colors</button></div><div class=\"status\" id=\"dcpStatus\"></div><div class=\"row\" id=\"dcpSwatches\"></div>",init(el){
       el.querySelector('#dcpBtn').addEventListener('click',()=>{
         const f=el.querySelector('#dcpFile').files[0], statusEl=el.querySelector('#dcpStatus');
         if(!f){ statusEl.textContent='Choose an image first.'; return; }
         const img=new Image(); const reader=new FileReader();
         reader.onload=e=>{
           img.onload=()=>{
             const canvas=document.createElement('canvas'); const size=60; canvas.width=size; canvas.height=size;
             const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,size,size);
             const data=ctx.getImageData(0,0,size,size).data;
             const buckets={};
             for(let i=0;i<data.length;i+=4){
               const r=Math.round(data[i]/32)*32, g=Math.round(data[i+1]/32)*32, b=Math.round(data[i+2]/32)*32;
               const key=`${r},${g},${b}`; buckets[key]=(buckets[key]||0)+1;
             }
             const top=Object.entries(buckets).sort((a,b)=>b[1]-a[1]).slice(0,5);
             statusEl.className='status ok'; statusEl.textContent=`Top ${top.length} colors:`;
             el.querySelector('#dcpSwatches').innerHTML = top.map(([rgb])=>{
               const [r,g,b]=rgb.split(',').map(Number); const hex='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
               return `<div style="text-align:center;font-size:11px;"><div style="width:48px;height:48px;background:${hex};border:1px solid var(--line);"></div>${hex}</div>`;
             }).join('');
           };
           img.src=e.target.result;
         };
         reader.readAsDataURL(f);
       });
     }},
{slug:"image-to-base64",name:"Image to Base64 Converter",icon:"braces",cats:["image", "developer", "converters"],desc:"Convert images to Base64 data URIs and decode them back to images.",lib:"",html:"<input type=\"file\" id=\"ibFile\" accept=\"image/*\"><div class=\"row\"><button class=\"act\" id=\"ibBtn\">Image → Base64</button></div><pre id=\"ibOut\" style=\"max-height:120px;overflow:auto;\"></pre>\n       <div class=\"row\" style=\"margin-top:10px;\"><textarea id=\"ibInput\" placeholder=\"Paste a data:image/... Base64 string…\" style=\"min-height:60px;\"></textarea></div>\n       <div class=\"row\"><button class=\"act\" id=\"ibDecodeBtn\">Base64 → Image</button></div><div class=\"preview\" id=\"ibPreview\"></div>",init(el){
       el.querySelector('#ibBtn').addEventListener('click',()=>{
         const f=el.querySelector('#ibFile').files[0], out=el.querySelector('#ibOut');
         if(!f){ out.textContent='Choose an image first.'; return; }
         const reader=new FileReader(); reader.onload=e=>{ out.textContent=e.target.result; }; reader.readAsDataURL(f);
       });
       el.querySelector('#ibDecodeBtn').addEventListener('click',()=>{
         const v=el.querySelector('#ibInput').value.trim(), prev=el.querySelector('#ibPreview');
         if(!v.startsWith('data:image')){ prev.innerHTML='<div class="status">Paste a valid data:image/... string.</div>'; return; }
         prev.innerHTML=`<img src="${v}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${v}" download="decoded.png">Download ↓</a></div>`;
       });
     }},
{slug:"image-metadata-viewer",name:"Image Metadata Viewer",icon:"info",cats:["image"],desc:"View an image’s dimensions, file size, type and last-modified date.",lib:"",html:"<input type=\"file\" id=\"imFile\" accept=\"image/*\"><pre id=\"imOut\"></pre>",init(el){ el.querySelector('#imFile').addEventListener('change', e=>{
       const f=e.target.files[0], out=el.querySelector('#imOut'); if(!f) return;
       const img=new Image(); const reader=new FileReader();
       reader.onload=ev=>{ img.onload=()=>{
         out.textContent=`Name: ${f.name}\nType: ${f.type}\nSize: ${(f.size/1024).toFixed(1)} KB\nDimensions: ${img.width} × ${img.height}px\nLast modified: ${new Date(f.lastModified).toLocaleString()}`;
       }; img.src=ev.target.result; };
       reader.readAsDataURL(f);
     }); }},
{slug:"favicon-generator",name:"Favicon Generator",icon:"star",cats:["image", "developer"],desc:"Create favicon PNGs in 16, 32, 48 and 180 pixel sizes from any image.",lib:"",html:"<input type=\"file\" id=\"fvFile\" accept=\"image/*\"><div class=\"row\"><button class=\"act\" id=\"fvBtn\">Generate sizes</button></div><div class=\"preview\" id=\"fvOut\"></div>",init(el){ el.querySelector('#fvBtn').addEventListener('click',()=>{
       const f=el.querySelector('#fvFile').files[0], out=el.querySelector('#fvOut');
       if(!f){ out.innerHTML='<div class="status">Choose an image first.</div>'; return; }
       const sizes=[16,32,48,180];
       const img=new Image(); const reader=new FileReader();
       reader.onload=e=>{ img.onload=()=>{
         out.innerHTML='';
         sizes.forEach(s=>{
           const canvas=document.createElement('canvas'); canvas.width=s; canvas.height=s;
           canvas.getContext('2d').drawImage(img,0,0,s,s);
           canvas.toBlob(blob=>{
             const url=URL.createObjectURL(blob);
             out.innerHTML += `<div style="text-align:center;font-size:11px;"><img alt="Generated image preview" src="${url}" style="width:${Math.min(s,64)}px;height:${Math.min(s,64)}px;border:1px solid var(--line);"><div><a href="${url}" download="favicon-${s}.png">${s}×${s} ↓</a></div></div>`;
           }, 'image/png');
         });
       }; img.src=e.target.result; };
       reader.readAsDataURL(f);
     }); }},
{slug:"pdf-metadata-viewer",name:"PDF Metadata Viewer",icon:"info",cats:["pdf"],desc:"View a PDF’s title, author, page count and creation and modified dates.",lib:"pdf",html:"<input type=\"file\" id=\"mdFile\" accept=\"application/pdf\"><div class=\"row\"><button class=\"act\" id=\"mdBtn\">Read metadata</button></div><pre id=\"mdOut\"></pre>",init(el){
       el.querySelector('#mdBtn').addEventListener('click', async ()=>{
         const f=el.querySelector('#mdFile').files[0], out=el.querySelector('#mdOut');
         if(!f){ out.textContent='Choose a PDF first.'; return; }
         try{
           const { PDFDocument } = PDFLib;
           const doc = await PDFDocument.load(await f.arrayBuffer());
           const lines=[
             `File: ${f.name}`,
             `Pages: ${doc.getPageCount()}`,
             `Title: ${doc.getTitle()||'—'}`,
             `Author: ${doc.getAuthor()||'—'}`,
             `Subject: ${doc.getSubject()||'—'}`,
             `Creator: ${doc.getCreator()||'—'}`,
             `Producer: ${doc.getProducer()||'—'}`,
             `Created: ${doc.getCreationDate()?doc.getCreationDate().toString():'—'}`,
             `Modified: ${doc.getModificationDate()?doc.getModificationDate().toString():'—'}`
           ];
           out.textContent=lines.join('\n');
         }catch(err){ out.textContent='Error: '+err.message; }
       });
     }},
{slug:"edit-pdf-metadata",name:"Edit PDF Metadata",icon:"pdf",cats:["pdf"],desc:"Change the title and author saved inside a PDF file.",lib:"pdf",html:"<input type=\"file\" id=\"emFile\" accept=\"application/pdf\"><div class=\"row\"><input type=\"text\" id=\"emTitle\" placeholder=\"New title\" style=\"width:200px;\"><input type=\"text\" id=\"emAuthor\" placeholder=\"New author\" style=\"width:200px;\"><button class=\"act\" id=\"emBtn\">Save & download</button></div><div class=\"status\" id=\"emStatus\"></div>",init(el){ el.querySelector('#emBtn').addEventListener('click', async ()=>{
       const f=el.querySelector('#emFile').files[0], statusEl=el.querySelector('#emStatus');
       if(!f){ statusEl.textContent='Choose a PDF first.'; return; }
       try{
         const { PDFDocument } = PDFLib;
         const doc = await PDFDocument.load(await f.arrayBuffer());
         const title=el.querySelector('#emTitle').value, author=el.querySelector('#emAuthor').value;
         if(title) doc.setTitle(title);
         if(author) doc.setAuthor(author);
         const outBytes = await doc.save();
         const url = URL.createObjectURL(new Blob([outBytes], {type:'application/pdf'}));
         statusEl.className='status ok';
         statusEl.innerHTML = `Metadata updated. <a href="${url}" download="updated.pdf">Download ↓</a>`;
       }catch(err){ statusEl.textContent='Error: '+err.message; }
     }); }},
{slug:"sign-pdf",name:"Sign PDF",icon:"pdf",cats:["pdf"],desc:"Stamp your name as a visual signature on any page of a PDF.",lib:"pdf",html:"<input type=\"file\" id=\"spFile\" accept=\"application/pdf\"><div class=\"row\"><input type=\"text\" id=\"spText\" placeholder=\"Your name / signature text\" style=\"width:220px;\"><input type=\"number\" id=\"spPage\" placeholder=\"Page #\" value=\"1\" style=\"width:90px;\"><button class=\"act\" id=\"spBtn\">Sign & download</button></div><div class=\"status\" id=\"spStatus\"></div>",init(el){ el.querySelector('#spBtn').addEventListener('click', async ()=>{
       const f=el.querySelector('#spFile').files[0], statusEl=el.querySelector('#spStatus'), text=el.querySelector('#spText').value;
       if(!f||!text){ statusEl.textContent='Choose a PDF and enter signature text.'; return; }
       const pageNum=parseInt(el.querySelector('#spPage').value)-1;
       try{
         const { PDFDocument, StandardFonts, rgb } = PDFLib;
         const doc = await PDFDocument.load(await f.arrayBuffer());
         const pages=doc.getPages();
         if(pageNum<0||pageNum>=pages.length){ statusEl.textContent=`Enter a page between 1 and ${pages.length}.`; return; }
         const font = await doc.embedFont(StandardFonts.HelveticaOblique);
         const page=pages[pageNum];
         page.drawText(text, { x:40, y:40, size:20, font, color:rgb(0.1,0.2,0.5) });
         page.drawLine({ start:{x:40,y:36}, end:{x:40+text.length*11,y:36}, thickness:1, color:rgb(0.1,0.2,0.5) });
         const outBytes = await doc.save();
         const url = URL.createObjectURL(new Blob([outBytes], {type:'application/pdf'}));
         statusEl.className='status ok';
         statusEl.innerHTML = `Signed page ${pageNum+1}. <a href="${url}" download="signed.pdf">Download ↓</a> (a visual stamp, not a cryptographic signature)`;
       }catch(err){ statusEl.textContent='Error: '+err.message; }
     }); }},
{slug:"invoice-generator",name:"Invoice Generator",icon:"pdf",cats:["pdf", "finance"],desc:"Create a professional PDF invoice with line items and totals.",lib:"pdf",html:"<div class=\"row\"><input type=\"text\" id=\"ivFrom\" placeholder=\"From (your business)\" style=\"width:220px;\"><input type=\"text\" id=\"ivTo\" placeholder=\"Bill to\" style=\"width:220px;\"></div>\n       <div class=\"row\"><input type=\"text\" id=\"ivNum\" placeholder=\"Invoice #\" style=\"width:130px;\"><input type=\"date\" id=\"ivDate\"></div>\n       <textarea id=\"ivItems\" placeholder=\"One item per line: description, qty, price&#10;e.g. Web design, 1, 500&#10;Hosting, 3, 20\"></textarea>\n       <div class=\"row\"><button class=\"act\" id=\"ivBtn\">Generate PDF</button></div><div class=\"status\" id=\"ivStatus\"></div>",init(el){ el.querySelector('#ivBtn').addEventListener('click', async ()=>{
       const from=el.querySelector('#ivFrom').value||'Your Business', to=el.querySelector('#ivTo').value||'Client', num=el.querySelector('#ivNum').value||'001', date=el.querySelector('#ivDate').value||new Date().toISOString().slice(0,10);
       const lines=el.querySelector('#ivItems').value.split('\n').map(l=>l.split(',').map(s=>s.trim())).filter(l=>l.length>=3);
       const statusEl=el.querySelector('#ivStatus');
       if(!lines.length){ statusEl.textContent='Add at least one item line (description, qty, price).'; return; }
       try{
         const { PDFDocument, StandardFonts, rgb } = PDFLib;
         const doc = await PDFDocument.create();
         const page = doc.addPage([595,842]);
         const font = await doc.embedFont(StandardFonts.Helvetica);
         const bold = await doc.embedFont(StandardFonts.HelveticaBold);
         let y=800;
         page.drawText('INVOICE', { x:40, y, size:22, font:bold }); y-=30;
         page.drawText(`From: ${from}`, { x:40, y, size:11, font }); y-=16;
         page.drawText(`To: ${to}`, { x:40, y, size:11, font }); y-=16;
         page.drawText(`Invoice #: ${num}    Date: ${date}`, { x:40, y, size:11, font }); y-=30;
         page.drawText('Description', { x:40, y, size:11, font:bold });
         page.drawText('Qty', { x:340, y, size:11, font:bold });
         page.drawText('Price', { x:400, y, size:11, font:bold });
         page.drawText('Total', { x:480, y, size:11, font:bold }); y-=6;
         page.drawLine({ start:{x:40,y}, end:{x:555,y}, thickness:1, color:rgb(0.7,0.7,0.7) }); y-=18;
         let grandTotal=0;
         lines.forEach(([desc,qty,price])=>{
           const q=parseFloat(qty)||0, p=parseFloat(price)||0, t=q*p; grandTotal+=t;
           page.drawText(desc, { x:40, y, size:10, font });
           page.drawText(String(q), { x:340, y, size:10, font });
           page.drawText(p.toFixed(2), { x:400, y, size:10, font });
           page.drawText(t.toFixed(2), { x:480, y, size:10, font });
           y-=18;
         });
         y-=10; page.drawLine({ start:{x:340,y:y+14}, end:{x:555,y:y+14}, thickness:1, color:rgb(0.7,0.7,0.7) });
         page.drawText('Total:', { x:400, y, size:12, font:bold });
         page.drawText(grandTotal.toFixed(2), { x:480, y, size:12, font:bold });
         const outBytes = await doc.save();
         const url = URL.createObjectURL(new Blob([outBytes], {type:'application/pdf'}));
         statusEl.className='status ok';
         statusEl.innerHTML = `Invoice ready. <a href="${url}" download="invoice-${num}.pdf">Download ↓</a>`;
       }catch(err){ statusEl.textContent='Error: '+err.message; }
     }); }},
{slug:"resume-builder",name:"Resume and CV Builder",icon:"user",cats:["pdf", "productivity"],desc:"Build a clean one-page resume and download it as a PDF.",lib:"pdf",html:"<div class=\"row\"><input type=\"text\" id=\"rvName\" placeholder=\"Full name\" style=\"width:220px;\"><input type=\"text\" id=\"rvTitle\" placeholder=\"Title, e.g. Product Designer\" style=\"width:220px;\"></div>\n       <div class=\"row\"><input type=\"text\" id=\"rvContact\" placeholder=\"Email · Phone · Location\" style=\"width:100%;\"></div>\n       <textarea id=\"rvSummary\" placeholder=\"Short summary / objective…\"></textarea>\n       <textarea id=\"rvExp\" placeholder=\"Experience — one entry per line:&#10;Job Title, Company, Years, short description\"></textarea>\n       <textarea id=\"rvSkills\" placeholder=\"Skills, comma separated\"></textarea>\n       <div class=\"row\"><button class=\"act\" id=\"rvBtn\">Generate PDF</button></div><div class=\"status\" id=\"rvStatus\"></div>",init(el){ el.querySelector('#rvBtn').addEventListener('click', async ()=>{
       const name=el.querySelector('#rvName').value||'Your Name', title=el.querySelector('#rvTitle').value||'', contact=el.querySelector('#rvContact').value||'';
       const summary=el.querySelector('#rvSummary').value, exp=el.querySelector('#rvExp').value.split('\n').filter(Boolean), skills=el.querySelector('#rvSkills').value;
       const statusEl=el.querySelector('#rvStatus');
       try{
         const { PDFDocument, StandardFonts, rgb } = PDFLib;
         const doc = await PDFDocument.create();
         let page = doc.addPage([595,842]);
         const font = await doc.embedFont(StandardFonts.Helvetica);
         const bold = await doc.embedFont(StandardFonts.HelveticaBold);
         let y=800;
         function wrap(text,size,maxW,f){ const words=text.split(' '); let lines=[],cur='';
           words.forEach(w=>{ const test=cur?cur+' '+w:w; if(f.widthOfTextAtSize(test,size)>maxW){ lines.push(cur); cur=w; } else cur=test; }); if(cur) lines.push(cur); return lines; }
         page.drawText(name, { x:40, y, size:22, font:bold }); y-=24;
         if(title){ page.drawText(title, { x:40, y, size:13, font, color:rgb(0.3,0.3,0.3) }); y-=18; }
         if(contact){ page.drawText(contact, { x:40, y, size:10, font, color:rgb(0.4,0.4,0.4) }); y-=24; }
         if(summary){ wrap(summary,10,515,font).forEach(l=>{ page.drawText(l,{x:40,y,size:10,font}); y-=14; }); y-=10; }
         if(exp.length){ page.drawText('Experience', { x:40, y, size:13, font:bold }); y-=18;
           exp.forEach(line=>{ const [jt,co,yr,desc]=line.split(',').map(s=>s.trim());
             page.drawText(`${jt||''} — ${co||''} (${yr||''})`, { x:40, y, size:10, font:bold }); y-=14;
             if(desc) wrap(desc,9,515,font).forEach(l=>{ page.drawText(l,{x:40,y,size:9,font,color:rgb(0.3,0.3,0.3)}); y-=12; });
             y-=8;
           }); y-=6;
         }
         if(skills.trim()){ page.drawText('Skills', { x:40, y, size:13, font:bold }); y-=18;
           wrap(skills,10,515,font).forEach(l=>{ page.drawText(l,{x:40,y,size:10,font}); y-=14; });
         }
         const outBytes = await doc.save();
         const url = URL.createObjectURL(new Blob([outBytes], {type:'application/pdf'}));
         statusEl.className='status ok';
         statusEl.innerHTML = `Resume ready. <a href="${url}" download="resume.pdf">Download ↓</a>`;
       }catch(err){ statusEl.textContent='Error: '+err.message; }
     }); }},
{slug:"tip-calculator",name:"Tip Calculator",icon:"currency",cats:["finance", "calculators"],desc:"Calculate the tip and split the bill between any number of people.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"tpBill\" placeholder=\"Bill amount\" style=\"width:130px;\"><input type=\"number\" id=\"tpPct\" placeholder=\"Tip %\" value=\"10\" style=\"width:90px;\"><input type=\"number\" id=\"tpPeople\" placeholder=\"Split between\" value=\"1\" style=\"width:110px;\"><button class=\"act\" id=\"tpBtn\">Calculate</button></div><div class=\"status ok\" id=\"tpOut\"></div>",init(el){ el.querySelector('#tpBtn').addEventListener('click',()=>{
       const bill=parseFloat(el.querySelector('#tpBill').value), pct=parseFloat(el.querySelector('#tpPct').value)||0, people=parseInt(el.querySelector('#tpPeople').value)||1, out=el.querySelector('#tpOut');
       if(!bill){ out.textContent='Enter the bill amount.'; return; }
       const tip=bill*pct/100, total=bill+tip;
       out.textContent=`Tip: ${tip.toFixed(2)}\nTotal: ${total.toFixed(2)}\nPer person: ${(total/people).toFixed(2)}`;
     }); }},
{slug:"salary-calculator",name:"Salary Calculator",icon:"finance",cats:["finance", "calculators"],desc:"Convert an annual salary into monthly, weekly and hourly pay.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"scAnnual\" placeholder=\"Annual salary\" style=\"width:150px;\"><input type=\"number\" id=\"scHours\" placeholder=\"Hours/week\" value=\"40\" style=\"width:120px;\"><button class=\"act\" id=\"scBtn\">Convert</button></div><div class=\"status ok\" id=\"scOut\"></div>",init(el){ el.querySelector('#scBtn').addEventListener('click',()=>{
       const annual=parseFloat(el.querySelector('#scAnnual').value), hrs=parseFloat(el.querySelector('#scHours').value)||40, out=el.querySelector('#scOut');
       if(!annual){ out.textContent='Enter an annual salary.'; return; }
       const monthly=annual/12, weekly=annual/52, hourly=weekly/hrs;
       out.textContent=`Monthly: ${monthly.toFixed(2)}\nWeekly: ${weekly.toFixed(2)}\nHourly: ${hourly.toFixed(2)}`;
     }); }},
{slug:"color-contrast-checker",name:"Color Contrast Checker",icon:"color",cats:["color", "developer"],desc:"Check the WCAG contrast ratio between two colors for accessible design.",lib:"",html:"<div class=\"row\"><input type=\"color\" id=\"ccA\" value=\"#0f1b2b\"><input type=\"color\" id=\"ccB\" value=\"#eef2f6\"><button class=\"act\" id=\"ccBtn\">Check</button></div><div class=\"status ok\" id=\"ccOut\"></div>",init(el){ el.querySelector('#ccBtn').addEventListener('click',()=>{
       function lum(hex){ const h=hex.replace('#',''); const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4));
         return 0.2126*r+0.7152*g+0.0722*b; }
       const l1=lum(el.querySelector('#ccA').value), l2=lum(el.querySelector('#ccB').value);
       const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05), out=el.querySelector('#ccOut');
       const passAA=ratio>=4.5, passAAA=ratio>=7;
       out.textContent=`Contrast ratio: ${ratio.toFixed(2)}:1 — AA ${passAA?'pass':'fail'}, AAA ${passAAA?'pass':'fail'} (normal text)`;
     }); }},
{slug:"url-parser",name:"URL Parser",icon:"link",cats:["network", "developer"],desc:"Break a URL into protocol, host, port, path, query parameters and hash.",lib:"",html:"<input type=\"text\" id=\"upInput\" placeholder=\"https://example.com/path?query=1\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"upBtn\">Parse</button></div><pre id=\"upOut\"></pre>",init(el){ el.querySelector('#upBtn').addEventListener('click',()=>{
       const out=el.querySelector('#upOut');
       try{
         const u=new URL(el.querySelector('#upInput').value);
         const params=[...u.searchParams.entries()].map(([k,v])=>`  ${k} = ${v}`).join('\n')||'  (none)';
         out.textContent=`Protocol: ${u.protocol}\nHost: ${u.hostname}\nPort: ${u.port||'(default)'}\nPath: ${u.pathname}\nQuery params:\n${params}\nHash: ${u.hash||'(none)'}`;
       }catch(e){ out.textContent='Enter a valid, complete URL (including https://).'; }
     }); }},
{slug:"subnet-calculator",name:"Subnet Calculator",icon:"globe",cats:["network", "developer"],desc:"Calculate network, broadcast, subnet mask and usable hosts from CIDR notation.",lib:"",html:"<input type=\"text\" id=\"snInput\" placeholder=\"e.g. 192.168.1.0/24\" style=\"width:220px;\"><div class=\"row\"><button class=\"act\" id=\"snBtn\">Calculate</button></div><div class=\"status ok\" id=\"snOut\"></div>",init(el){ el.querySelector('#snBtn').addEventListener('click',()=>{
       const out=el.querySelector('#snOut'), m=el.querySelector('#snInput').value.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
       if(!m){ out.textContent='Enter a valid CIDR, e.g. 192.168.1.0/24.'; return; }
       const ip=[1,2,3,4].map(i=>+m[i]), bits=+m[5];
       if(bits<0||bits>32){ out.textContent='Prefix must be 0–32.'; return; }
       const ipNum=(ip[0]<<24)+(ip[1]<<16)+(ip[2]<<8)+ip[3];
       const mask = bits===0?0:(~0 << (32-bits));
       const network=ipNum & mask, broadcast=network | (~mask & 0xFFFFFFFF);
       const toIp=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
       const hostCount=Math.max(0, Math.pow(2,32-bits)-2);
       out.textContent=`Network: ${toIp(network>>>0)}\nBroadcast: ${toIp(broadcast>>>0)}\nSubnet mask: ${toIp(mask>>>0)}\nUsable hosts: ${hostCount.toLocaleString()}`;
     }); }},
{slug:"user-agent-checker",name:"User Agent Checker",icon:"globe",cats:["network"],desc:"See your browser, operating system, language, screen size and full user agent.",lib:"",html:"<div class=\"row\"><button class=\"act\" id=\"uaBtn\">Check my browser</button></div><pre id=\"uaOut\"></pre>",init(el){ el.querySelector('#uaBtn').addEventListener('click',()=>{
       const ua=navigator.userAgent;
       let browser='Unknown'; if(ua.includes('Edg/')) browser='Edge'; else if(ua.includes('Chrome/')) browser='Chrome'; else if(ua.includes('Firefox/')) browser='Firefox'; else if(ua.includes('Safari/')) browser='Safari';
       let os='Unknown'; if(ua.includes('Windows')) os='Windows'; else if(ua.includes('Mac OS')) os='macOS'; else if(ua.includes('Android')) os='Android'; else if(ua.includes('iPhone')||ua.includes('iPad')) os='iOS'; else if(ua.includes('Linux')) os='Linux';
       el.querySelector('#uaOut').textContent=`Browser: ${browser}\nOS: ${os}\nLanguage: ${navigator.language}\nScreen: ${screen.width}×${screen.height}\nFull user agent:\n${ua}`;
     }); }},
{slug:"password-strength-checker",name:"Password Strength Checker",icon:"lock",cats:["network"],desc:"Check how strong a password is based on length and character variety.",lib:"",html:"<input type=\"text\" id=\"psInput\" placeholder=\"Type a password to check…\" style=\"width:100%;\"><div class=\"status ok\" id=\"psOut\" style=\"margin-top:8px;\"></div>",init(el){ el.querySelector('#psInput').addEventListener('input',()=>{
       const p=el.querySelector('#psInput').value, out=el.querySelector('#psOut');
       if(!p){ out.textContent=''; return; }
       let score=0; if(p.length>=8) score++; if(p.length>=12) score++; if(/[a-z]/.test(p)&&/[A-Z]/.test(p)) score++; if(/\d/.test(p)) score++; if(/[^A-Za-z0-9]/.test(p)) score++;
       const labels=['Very weak','Weak','Fair','Good','Strong','Very strong'];
       out.textContent=`${labels[score]} (${p.length} characters)`;
     }); }},
{slug:"random-string-generator",name:"Random String Generator",icon:"lock",cats:["network", "developer"],desc:"Generate secure random strings of letters, numbers or hex.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"rsLen\" value=\"12\" min=\"1\" max=\"256\" style=\"width:90px;\"><select id=\"rsType\"><option value=\"alnum\">Letters + numbers</option><option value=\"alpha\">Letters only</option><option value=\"num\">Numbers only</option><option value=\"hex\">Hex</option></select><button class=\"act\" id=\"rsBtn\">Generate</button></div><pre id=\"rsOut\"></pre>",init(el){ el.querySelector('#rsBtn').addEventListener('click',()=>{
       const len=Math.min(256,parseInt(el.querySelector('#rsLen').value)||12), type=el.querySelector('#rsType').value, out=el.querySelector('#rsOut');
       const sets={alnum:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', alpha:'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', num:'0123456789', hex:'0123456789abcdef'};
       const chars=sets[type]; const arr=new Uint32Array(len); crypto.getRandomValues(arr);
       out.textContent=[...arr].map(n=>chars[n%chars.length]).join('');
     }); }},
{slug:"file-checksum-calculator",name:"File Checksum Calculator",icon:"shield",cats:["network", "developer"],desc:"Calculate SHA-1, SHA-256, SHA-384 or SHA-512 checksums of any file.",lib:"",html:"<input type=\"file\" id=\"fcFile2\"><div class=\"row\"><select id=\"fcAlgo\"><option value=\"SHA-256\">SHA-256</option><option value=\"SHA-1\">SHA-1</option><option value=\"SHA-384\">SHA-384</option><option value=\"SHA-512\">SHA-512</option></select><button class=\"act\" id=\"fcBtn2\">Calculate</button></div><pre id=\"fcOut2\"></pre>",init(el){ el.querySelector('#fcBtn2').addEventListener('click', async ()=>{
       const f=el.querySelector('#fcFile2').files[0], out=el.querySelector('#fcOut2'), algo=el.querySelector('#fcAlgo').value;
       if(!f){ out.textContent='Choose a file first.'; return; }
       out.textContent='Calculating…';
       const buf=await crypto.subtle.digest(algo, await f.arrayBuffer());
       out.textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
     }); }},
{slug:"privacy-policy-generator",name:"Privacy Policy Generator",icon:"shield",cats:["network", "seo"],desc:"Generate a basic privacy policy template for your website.",lib:"",html:"<input type=\"text\" id=\"ppSite\" placeholder=\"Site / company name\" style=\"width:100%;margin-bottom:8px;\"><input type=\"text\" id=\"ppEmail\" placeholder=\"Contact email\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ppBtn\">Generate</button></div><pre id=\"ppOut\"></pre>",init(el){ el.querySelector('#ppBtn').addEventListener('click',()=>{
       const site=el.querySelector('#ppSite').value||'[Your Site]', email=el.querySelector('#ppEmail').value||'[contact email]', out=el.querySelector('#ppOut');
       out.textContent=`Privacy Policy for ${site}\n\nWe collect information you provide directly to us, such as when you create an account or contact us. We may also collect usage data automatically, such as pages visited and browser type.\n\nWe use this information to operate and improve ${site}, communicate with you, and comply with legal obligations. We do not sell your personal information to third parties.\n\nYou may request access to, correction of, or deletion of your data by contacting us at ${email}.\n\nThis is a basic starting template — have it reviewed by a legal professional before publishing.`;
     }); }},
{slug:"terms-and-conditions-generator",name:"Terms and Conditions Generator",icon:"blog",cats:["network", "seo"],desc:"Generate a basic terms and conditions template for your website.",lib:"",html:"<input type=\"text\" id=\"tcSite\" placeholder=\"Site / company name\" style=\"width:100%;margin-bottom:8px;\"><input type=\"text\" id=\"tcEmail\" placeholder=\"Contact email\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"tcBtn2\">Generate</button></div><pre id=\"tcOut2\"></pre>",init(el){ el.querySelector('#tcBtn2').addEventListener('click',()=>{
       const site=el.querySelector('#tcSite').value||'[Your Site]', email=el.querySelector('#tcEmail').value||'[contact email]', out=el.querySelector('#tcOut2');
       out.textContent=`Terms & Conditions for ${site}\n\nBy accessing or using ${site}, you agree to be bound by these terms. If you disagree with any part, you may not access the service.\n\nAll content on ${site}, unless otherwise stated, is our property and protected by copyright law. You may not reproduce it without permission.\n\nWe reserve the right to modify these terms at any time. Continued use of ${site} after changes constitutes acceptance of the new terms.\n\nQuestions can be directed to ${email}.\n\nThis is a basic starting template — have it reviewed by a legal professional before publishing.`;
     }); }},
{slug:"youtube-thumbnail-downloader",name:"YouTube Thumbnail Downloader",icon:"youtube",cats:["social", "image"],desc:"Get every thumbnail size of a YouTube video from its link.",lib:"",html:"<input type=\"text\" id=\"ytInput\" placeholder=\"YouTube URL or video ID\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ytBtn\">Get thumbnails</button></div><div class=\"row\" id=\"ytOut\"></div>",init(el){ el.querySelector('#ytBtn').addEventListener('click',()=>{
       const raw=el.querySelector('#ytInput').value.trim();
       const m=raw.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/) || raw.match(/^([A-Za-z0-9_-]{11})$/);
       const out=el.querySelector('#ytOut');
       if(!m){ out.innerHTML='<div class="status">Could not find a video ID in that input.</div>'; return; }
       const id=m[1];
       const sizes=[['default',''],['medium','mq'],['high','hq'],['max res','maxres']];
       out.innerHTML = sizes.map(([label,pre])=>`<div style="text-align:center;font-size:11px;"><img alt="YouTube thumbnail" src="https://img.youtube.com/vi/${id}/${pre?pre+'default':'default'}.jpg" style="max-width:140px;border:1px solid var(--line);display:block;"><a href="https://img.youtube.com/vi/${id}/${pre?pre+'default':'default'}.jpg" download>${label} ↓</a></div>`).join('');
     }); }},
{slug:"youtube-title-generator",name:"YouTube Title Generator",icon:"youtube",cats:["social"],desc:"Generate catchy YouTube video title ideas from your topic.",lib:"",html:"<input type=\"text\" id=\"ytTitleTopic\" placeholder=\"Video topic\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ytTitleBtn\">Generate</button></div><pre id=\"ytTitleOut\"></pre>",init(el){ el.querySelector('#ytTitleBtn').addEventListener('click',()=>{
       const topic=el.querySelector('#ytTitleTopic').value.trim(), out=el.querySelector('#ytTitleOut');
       if(!topic){ out.textContent='Enter a video topic first.'; return; }
       out.textContent=[`${topic} — Everything You Need to Know`,`How I Do ${topic} (Step by Step)`,`${topic}: The Complete Guide`,`Why ${topic} Matters (And How to Get Started)`].join('\n');
     }); }},
{slug:"youtube-description-generator",name:"YouTube Description Generator",icon:"youtube",cats:["social"],desc:"Create a ready-to-edit YouTube video description with timestamps.",lib:"",html:"<input type=\"text\" id=\"ytDescTopic\" placeholder=\"Video topic\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ytDescBtn\">Generate</button></div><pre id=\"ytDescOut\"></pre>",init(el){ el.querySelector('#ytDescBtn').addEventListener('click',()=>{
       const topic=el.querySelector('#ytDescTopic').value.trim(), out=el.querySelector('#ytDescOut');
       if(!topic){ out.textContent='Enter a video topic first.'; return; }
       out.textContent=`In this video, we dive into ${topic}. Whether you're just getting started or looking to level up, this covers what you need to know.\n\n⏱ Timestamps:\n0:00 Intro\n\n🔔 Subscribe for more content like this!`;
     }); }},
{slug:"youtube-tags-generator",name:"YouTube Tags Generator",icon:"youtube",cats:["social", "seo"],desc:"Generate relevant YouTube tags from your video topic.",lib:"",html:"<input type=\"text\" id=\"ytTagsTopic\" placeholder=\"Video topic\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ytTagsBtn\">Generate</button></div><pre id=\"ytTagsOut\"></pre>",init(el){ el.querySelector('#ytTagsBtn').addEventListener('click',()=>{
       const topic=el.querySelector('#ytTagsTopic').value.trim(), out=el.querySelector('#ytTagsOut');
       if(!topic){ out.textContent='Enter a video topic first.'; return; }
       out.textContent=[topic, topic.split(' ')[0], `${topic} guide`, `${topic} tutorial`, `${topic} tips`, `how to ${topic}`, `${topic} 2026`, `best ${topic}`].join(', ');
     }); }},
{slug:"hashtag-generator",name:"Hashtag Generator",icon:"hash",cats:["social"],desc:"Generate relevant hashtags for Instagram, TikTok and X from any topic.",lib:"",html:"<input type=\"text\" id=\"hgInput\" placeholder=\"Topic, e.g. morning coffee\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"hgBtn\">Generate</button></div><pre id=\"hgOut\"></pre>",init(el){ el.querySelector('#hgBtn').addEventListener('click',()=>{
       const topic=el.querySelector('#hgInput').value.trim(), out=el.querySelector('#hgOut');
       if(!topic){ out.textContent='Enter a topic first.'; return; }
       const words=topic.split(/\s+/), base=words.join('');
       const variants=[base, words.join('_'), 'the'+words[0], words[0]+'life', words[0]+'lover', words[0]+'daily', 'best'+base, base+'community', base+'addict', base+'gram'];
       out.textContent=[...new Set(variants)].map(v=>'#'+v.toLowerCase()).join(' ');
     }); }},
{slug:"instagram-bio-generator",name:"Instagram Bio Generator",icon:"instagram",cats:["social"],desc:"Create Instagram bio ideas from your name, role and link.",lib:"",html:"<input type=\"text\" id=\"ibName\" placeholder=\"Name / brand\" style=\"width:100%;margin-bottom:8px;\"><input type=\"text\" id=\"ibRole\" placeholder=\"What you do, e.g. photographer\" style=\"width:100%;margin-bottom:8px;\"><input type=\"text\" id=\"ibLink\" placeholder=\"Link (optional)\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"ibBtn2\">Generate</button></div><pre id=\"ibOut2\"></pre>",init(el){ el.querySelector('#ibBtn2').addEventListener('click',()=>{
       const name=el.querySelector('#ibName').value||'Your Name', role=el.querySelector('#ibRole').value||'what you do', link=el.querySelector('#ibLink').value, out=el.querySelector('#ibOut2');
       const templates=[
         `${name} ✨\n${role}\n📍 based somewhere great\n${link?'🔗 '+link:''}`,
         `${role} | ${name}\nSharing the journey, one post at a time\n${link?'👇 '+link:''}`,
         `${name}\n${role}\nTurning ideas into reality\n${link?link:''}`
       ];
       out.textContent=templates.join('\n\n---\n\n');
     }); }},
{slug:"instagram-caption-generator",name:"Instagram Caption Generator",icon:"instagram",cats:["social"],desc:"Generate Instagram caption ideas for any post topic.",lib:"",html:"<input type=\"text\" id=\"icTopic\" placeholder=\"What's the post about?\" style=\"width:100%;\"><div class=\"row\"><button class=\"act\" id=\"icBtn\">Generate</button></div><pre id=\"icOut\"></pre>",init(el){ el.querySelector('#icBtn').addEventListener('click',()=>{
       const t=el.querySelector('#icTopic').value.trim()||'this moment', out=el.querySelector('#icOut');
       const templates=[
         `Just living for ${t} 🌟`,
         `${t.charAt(0).toUpperCase()+t.slice(1)} hits different lately.`,
         `Can't stop thinking about ${t}. Anyone else?`,
         `A little reminder to enjoy ${t} while it lasts.`
       ];
       out.textContent=templates.join('\n\n');
     }); }},
{slug:"social-media-image-resizer",name:"Social Media Image Resizer",icon:"image",cats:["social", "image"],desc:"Resize images for Instagram, Facebook, X and YouTube in one click.",lib:"",html:"<input type=\"file\" id=\"smFile\" accept=\"image/*\"><div class=\"row\"><select id=\"smPreset\">\n       <option value=\"1080,1080\">Instagram post (1080×1080)</option>\n       <option value=\"1080,1350\">Instagram portrait (1080×1350)</option>\n       <option value=\"1080,1920\">Instagram/FB story (1080×1920)</option>\n       <option value=\"1200,675\">Twitter/X post (1200×675)</option>\n       <option value=\"1200,630\">Facebook post (1200×630)</option>\n       <option value=\"2560,1440\">YouTube thumbnail (2560×1440)</option>\n       </select><button class=\"act\" id=\"smBtn\">Resize & download</button></div><div class=\"status\" id=\"smStatus\"></div><div class=\"preview\" id=\"smPreview\"></div>",init(el){ el.querySelector('#smBtn').addEventListener('click',()=>{
       const f=el.querySelector('#smFile').files[0], statusEl=el.querySelector('#smStatus');
       if(!f){ statusEl.textContent='Choose an image first.'; return; }
       const [w,h]=el.querySelector('#smPreset').value.split(',').map(Number);
       const img=new Image(); const reader=new FileReader();
       reader.onload=e=>{ img.onload=()=>{
         const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
         const ctx=canvas.getContext('2d');
         const scale=Math.max(w/img.width,h/img.height), sw=img.width*scale, sh=img.height*scale;
         ctx.drawImage(img,(w-sw)/2,(h-sh)/2,sw,sh);
         canvas.toBlob(blob=>{
           const url=URL.createObjectURL(blob);
           statusEl.className='status ok'; statusEl.textContent=`Resized to ${w}×${h}px (cropped to fill).`;
           el.querySelector('#smPreview').innerHTML=`<img src="${url}" alt="preview"><div><a class="act" style="display:inline-block;text-decoration:none;" href="${url}" download="social.png">Download ↓</a></div>`;
         }, 'image/png');
       }; img.src=e.target.result; };
       reader.readAsDataURL(f);
     }); }},
{slug:"facebook-post-formatter",name:"Facebook Post Formatter",icon:"facebook",cats:["social"],desc:"Check your Facebook post length and get tips before publishing.",lib:"",html:"<textarea id=\"fpInput\" placeholder=\"Write your Facebook post…\"></textarea><div class=\"status ok\" id=\"fpOut\"></div>",init(el){ el.querySelector('#fpInput').addEventListener('input',()=>{
       const t=el.querySelector('#fpInput').value, n=t.length, out=el.querySelector('#fpOut');
       const lines=t.split('\n').length;
       let note = n>63206 ? "Over Facebook's hard limit — it will be rejected." : n>80 ? 'Longer posts get less reach on average, but full text is fine.' : 'Short posts like this often get the best engagement.';
       out.textContent=`${n} / 63,206 characters · ${lines} line(s)\n${note}`;
     }); }},
{slug:"twitter-character-counter",name:"Twitter (X) Character Counter",icon:"twitter",cats:["social", "text"],desc:"Count characters in your post against the 280-character limit.",lib:"",html:"<textarea id=\"xcInput\" placeholder=\"What's happening?\"></textarea><div class=\"status ok\" id=\"xcOut\">0 / 280</div>",init(el){ el.querySelector('#xcInput').addEventListener('input',()=>{
       const n=el.querySelector('#xcInput').value.length, out=el.querySelector('#xcOut');
       out.textContent=`${n} / 280`; out.className='status '+(n>280?'':'ok');
     }); }},
{slug:"barcode-generator",name:"Barcode Generator",icon:"grid",cats:["productivity", "utility"],desc:"Create CODE128, EAN-13 and UPC barcodes for products and labels.",lib:"https://cdnjs.cloudflare.com/ajax/libs/JsBarcode/3.11.5/JsBarcode.all.min.js",html:"<input type=\"text\" id=\"bcInput2\" placeholder=\"Value to encode, e.g. 123456789012\" style=\"width:100%;\"><div class=\"row\"><select id=\"bcFormat\"><option value=\"CODE128\">CODE128</option><option value=\"EAN13\">EAN13</option><option value=\"UPC\">UPC</option></select><button class=\"act\" id=\"bcBtn2\">Generate</button></div><svg id=\"bcSvg\" style=\"margin-top:10px;\"></svg>",init(el){ el.querySelector('#bcBtn2').addEventListener('click',()=>{
       const v=el.querySelector('#bcInput2').value.trim(), fmt=el.querySelector('#bcFormat').value;
       if(!v) return;
       try{ JsBarcode(el.querySelector('#bcSvg'), v, { format:fmt }); }
       catch(e){ el.querySelector('#bcSvg').outerHTML='<div class="status" id="bcSvg">Invalid value for that barcode format.</div>'; }
     }); }},
{slug:"coin-flip",name:"Coin Flip",icon:"dice",cats:["productivity", "utility"],desc:"Flip a virtual coin to get heads or tails instantly.",lib:"",html:"<div class=\"row\"><button class=\"act\" id=\"cfBtn\">Flip</button></div><div class=\"status ok\" id=\"cfOut\" style=\"font-size:22px;\"></div>",init(el){ el.querySelector('#cfBtn').addEventListener('click',()=>{ el.querySelector('#cfOut').textContent = Math.random()<0.5?'Heads':'Tails'; }); }},
{slug:"dice-roller",name:"Dice Roller",icon:"dice",cats:["productivity", "utility"],desc:"Roll up to 10 dice with 4, 6, 8, 10, 12 or 20 sides.",lib:"",html:"<div class=\"row\"><input type=\"number\" id=\"drCount\" value=\"2\" min=\"1\" max=\"10\" style=\"width:80px;\"><select id=\"drSides\"><option value=\"6\">d6</option><option value=\"4\">d4</option><option value=\"8\">d8</option><option value=\"10\">d10</option><option value=\"12\">d12</option><option value=\"20\">d20</option></select><button class=\"act\" id=\"drBtn\">Roll</button></div><div class=\"status ok\" id=\"drOut\" style=\"font-size:20px;\"></div>",init(el){ el.querySelector('#drBtn').addEventListener('click',()=>{
       const n=Math.min(10,parseInt(el.querySelector('#drCount').value)||1), sides=parseInt(el.querySelector('#drSides').value), out=el.querySelector('#drOut');
       const rolls=Array.from({length:n},()=>1+Math.floor(Math.random()*sides));
       out.textContent=`${rolls.join(' + ')} = ${rolls.reduce((a,b)=>a+b,0)}`;
     }); }},
{slug:"css-gradient-generator",name:"CSS Gradient Generator",icon:"color",cats:["color", "developer", "productivity"],desc:"Create CSS linear gradients with a live preview and copyable code.",lib:"",html:"<div class=\"row\"><input type=\"color\" id=\"grA\" value=\"#1f5fa8\"><input type=\"color\" id=\"grB\" value=\"#e8622c\"><select id=\"grDir\"><option value=\"to right\">→</option><option value=\"to bottom\">↓</option><option value=\"45deg\">↘</option></select><button class=\"act\" id=\"grBtn\">Generate</button></div>\n       <div id=\"grPreview\" style=\"height:100px;border:1px solid var(--line);margin-top:10px;\"></div><pre id=\"grOut\"></pre>",init(el){ el.querySelector('#grBtn').addEventListener('click',()=>{
       const a=el.querySelector('#grA').value, b=el.querySelector('#grB').value, dir=el.querySelector('#grDir').value;
       const css=`linear-gradient(${dir}, ${a}, ${b})`;
       el.querySelector('#grPreview').style.background=css;
       el.querySelector('#grOut').textContent=`background: ${css};`;
     }); }},
{slug:"online-notepad",name:"Online Notepad",icon:"blog",cats:["productivity"],desc:"Jot down quick notes that stay saved in this browser tab.",lib:"",html:"<textarea id=\"npInput\" placeholder=\"Type notes here — cleared when you leave this page…\" style=\"min-height:160px;\"></textarea><div class=\"status\" id=\"npStatus\"></div>",init(el){ const ta=el.querySelector('#npInput'), st=el.querySelector('#npStatus');
       try{ const saved=sessionStorage.getItem('draftbench-notes'); if(saved) ta.value=saved; }catch(e){}
       ta.addEventListener('input',()=>{ try{ sessionStorage.setItem('draftbench-notes', ta.value); st.textContent='Saved for this browser tab.'; }catch(e){ st.textContent='Could not save (private browsing?).'; } });
     }},
{slug:"qr-code-scanner",name:"QR Code Scanner",icon:"qr",cats:["productivity", "utility"],desc:"Read the content of a QR code from an uploaded image.",lib:"https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js",html:"<input type=\"file\" id=\"qsFile\" accept=\"image/*\"><div class=\"status ok\" id=\"qsOut\" style=\"margin-top:8px;\"></div>",init(el){ el.querySelector('#qsFile').addEventListener('change', e=>{
       const f=e.target.files[0], out=el.querySelector('#qsOut'); if(!f) return;
       out.textContent='Scanning…';
       const img=new Image(); const reader=new FileReader();
       reader.onload=ev=>{ img.onload=()=>{
         const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
         const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
         const data=ctx.getImageData(0,0,canvas.width,canvas.height);
         const result=jsQR(data.data, data.width, data.height);
         out.textContent = result ? result.data : 'No QR code found in that image.';
       }; img.src=ev.target.result; };
       reader.readAsDataURL(f);
     }); }},
{slug:"to-do-list",name:"To-Do List",icon:"check",cats:["productivity"],desc:"A simple to-do list to add, tick off and delete tasks.",lib:"",html:"<div class=\"row\"><input type=\"text\" id=\"tdNew\" placeholder=\"Add a task…\" style=\"width:220px;\"><button class=\"act\" id=\"tdAdd\">Add</button></div><div id=\"tdList\" style=\"margin-top:10px;\"></div>",init(el){
       let items=[]; try{ items=JSON.parse(sessionStorage.getItem('draftbench-todos')||'[]'); }catch(e){}
       function save(){ try{ sessionStorage.setItem('draftbench-todos', JSON.stringify(items)); }catch(e){} }
       function render(){
         el.querySelector('#tdList').innerHTML = items.length ? items.map((it,i)=>
           `<div class="row" style="margin:4px 0;"><input type="checkbox" ${it.done?'checked':''} data-i="${i}" class="tdCheck"><span style="${it.done?'text-decoration:line-through;color:var(--muted);':''}">${it.text}</span><button class="act" data-del="${i}" style="padding:3px 8px;font-size:11px;margin-left:auto;">✕</button></div>`
         ).join('') : '<div class="status">No tasks yet.</div>';
         el.querySelectorAll('.tdCheck').forEach(cb=>cb.addEventListener('change',()=>{ items[+cb.dataset.i].done=cb.checked; save(); render(); }));
         el.querySelectorAll('button[data-del]').forEach(b=>b.addEventListener('click',()=>{ items.splice(+b.dataset.del,1); save(); render(); }));
       }
       el.querySelector('#tdAdd').addEventListener('click',()=>{
         const v=el.querySelector('#tdNew').value.trim(); if(!v) return;
         items.push({text:v,done:false}); el.querySelector('#tdNew').value=''; save(); render();
       });
       render();
     }},
{slug:"pomodoro-timer",name:"Pomodoro Timer",icon:"clock",cats:["productivity"],desc:"Stay focused with 25-minute work sessions and short and long breaks.",lib:"",html:"<div class=\"status ok\" id=\"pmOut2\" style=\"font-size:32px;\">25:00</div><div class=\"row\"><button class=\"act\" id=\"pmStart\">Start</button><button class=\"act\" id=\"pmPause\">Pause</button><button class=\"act\" id=\"pmReset\">Reset</button><select id=\"pmMode\"><option value=\"1500\">Focus (25m)</option><option value=\"300\">Short break (5m)</option><option value=\"900\">Long break (15m)</option></select></div>",init(el){
       let remaining=1500, iv=null;
       function render(){ const m=Math.floor(remaining/60), s=remaining%60; el.querySelector('#pmOut2').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
       el.querySelector('#pmMode').addEventListener('change', e=>{ clearInterval(iv); iv=null; remaining=parseInt(e.target.value); render(); });
       el.querySelector('#pmStart').addEventListener('click',()=>{ if(iv) return; iv=setInterval(()=>{ if(remaining<=0){ clearInterval(iv); iv=null; return; } remaining--; render(); },1000); });
       el.querySelector('#pmPause').addEventListener('click',()=>{ clearInterval(iv); iv=null; });
       el.querySelector('#pmReset').addEventListener('click',()=>{ clearInterval(iv); iv=null; remaining=parseInt(el.querySelector('#pmMode').value); render(); });
       render();
     }}
].map(dbTool));

function toolBySlug(s){for(var i=0;i<TOOLS.length;i++)if(TOOLS[i].slug===s)return TOOLS[i];return null}
function toolIcon(t){return (S.toolIcons&&S.toolIcons[t.slug])||t.icon}
function toolsIn(cat){return TOOLS.filter(function(t){return t.cats.indexOf(cat)>-1})}
function byAdded(list){return list.slice().sort(function(a,b){return a.added<b.added?1:-1})}
function isNew(t){return byAdded(TOOLS).slice(0,4).indexOf(t)>-1}

/* ---------- 6. LINKS, FAVORITES, USAGE ---------- */
var FAV=store('fuh-fav')||[],CURRENT=null,HOME_META=null;
/* Tools WITHOUT a Blogger page yet (remove a slug once its /p/ page exists). Category/policy pages listed in PAGED_CATS / PAGED_PAGES once created. */
var NO_PAGE_TOOLS=[],PAGED_CATS=['calculators','finance','text','image','developer','color','converters','pdf','productivity','utility','seo','network','social'],PAGED_PAGES=['about','contact','privacy-policy','disclaimer','dmca','cookie-policy','terms','sitemap'],PAGE_ALIAS={'robotstxt-generator':'robots-txt-generator'},PAGE_ALIAS_REV={'robots-txt-generator':'robotstxt-generator'};
var PAGE_SLUGS=['about','contact','privacy-policy','disclaimer','dmca','cookie-policy','terms','sitemap'];
function href(type,id){if(S.usePageUrls){if(type==='tool'&&NO_PAGE_TOOLS.indexOf(id)<0)return '/p/'+(PAGE_ALIAS_REV[id]||id)+'.html';if(type==='category'&&PAGED_CATS.indexOf(id)>-1)return '/p/category-'+id+'.html';if(type==='page'&&PAGED_PAGES.indexOf(id)>-1)return '/p/'+id+'.html'}if(type==='page'&&(PG.useBloggerPagesFor||[]).indexOf(id)>-1)return '/p/'+id+'.html';return '/?'+type+'='+encodeURIComponent(id)}
function isFav(s){return FAV.indexOf(s)>-1}
function toggleFav(s){var i=FAV.indexOf(s);if(i>-1){FAV.splice(i,1);toast('Removed from favorites')}else{FAV.unshift(s);toast('Saved to favorites','ok')}store('fuh-fav',FAV);$$('[data-fav="'+s+'"]').forEach(function(b){b.classList.toggle('on',isFav(s));b.setAttribute('aria-pressed',String(isFav(s)))})}
function track(s){var u=store('fuh-usage')||{};u[s]=(u[s]||0)+1;store('fuh-usage',u);var r=(store('fuh-recent')||[]).filter(function(x){return x!==s});r.unshift(s);store('fuh-recent',r.slice(0,8))}
function dateStr(d){try{return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}catch(e){return ''}}

/* ---------- 7. CARD TEMPLATES ---------- */
function catLabel(t){var c=catById(t.cats[0]);return c?c.name:''}
function toolCard(t){var badge=isNew(t)?'<span class="badge new">New</span>':(S.trendingTools.indexOf(t.slug)>-1?'<span class="badge hot">Trending</span>':'');
return '<div class="card tool-card reveal">'+badge+'<button type="button" class="fav-btn'+(isFav(t.slug)?' on':'')+'" data-fav="'+t.slug+'" aria-pressed="'+isFav(t.slug)+'" aria-label="Save '+esc(t.name)+' to favorites">'+ico('heart')+'</button><a class="tc-link" href="'+esc(href('tool',t.slug))+'" data-spa="1"><div class="tc-icon">'+ico(toolIcon(t))+'</div><h3>'+esc(t.name)+'</h3><p>'+esc(t.desc)+'</p><div class="tc-meta"><span>'+esc(catLabel(t))+'</span><span class="tc-go">Open '+ico('arrow-right')+'</span></div></a></div>'}
function miniCard(t){return '<a class="card mini-card reveal" href="'+esc(href('tool',t.slug))+'" data-spa="1" data-name="'+esc((t.name+' '+t.desc+' '+t.cats.join(' ')).toLowerCase())+'" data-cats="'+t.cats.join(' ')+'"><span class="tc-icon sm">'+ico(toolIcon(t))+'</span><span>'+esc(t.name)+'<small>'+esc(catLabel(t))+'</small></span></a>'}
function catCard(c){var n=toolsIn(c.id).length;return '<a class="card cat-card reveal" href="'+esc(href('category',c.id))+'" data-spa="1"><span class="tc-icon">'+ico(catIcon(c))+'</span><span><h3>'+esc(c.name)+'</h3><small>'+(n?n+' tool'+(n>1?'s':''):'Coming soon')+'</small></span><span class="tc-go">'+ico('arrow-right')+'</span></a>'}
function relLink(t){return '<a href="'+esc(href('tool',t.slug))+'" data-spa="1"><span class="tc-icon sm">'+ico(toolIcon(t))+'</span>'+esc(t.name)+'</a>'}
function li(x){return '<li>'+ico('check')+'<span>'+esc(x)+'</span></li>'}
function faqHtml(list){return list.map(function(f,i){return '<div class="faq-item'+(i===0?' open':'')+'"><button type="button" class="faq-q" aria-expanded="'+(i===0)+'"><span>'+esc(f[0])+'</span><span class="pm">'+ico('plus','ico-sm')+'</span></button><div class="faq-a"><div><p>'+esc(f[1])+'</p></div></div></div>'}).join('')}
function crumbs(items){return '<nav class="crumbs" aria-label="Breadcrumb"><a href="'+HOME+'">Home</a>'+items.map(function(it){return '<span aria-hidden="true">›</span>'+(it[1]?'<a href="'+esc(it[1])+'" data-spa="1">'+esc(it[0])+'</a>':'<span aria-current="page">'+esc(it[0])+'</span>')}).join('')+'</nav>'}
function shareLinks(url,title){var u=encodeURIComponent(url),t=encodeURIComponent(title);return [['facebook','Facebook','https://www.facebook.com/sharer/sharer.php?u='+u],['twitter','X (Twitter)','https://twitter.com/intent/tweet?url='+u+'&text='+t],['whatsapp','WhatsApp','https://api.whatsapp.com/send?text='+t+'%20'+u],['telegram','Telegram','https://t.me/share/url?url='+u+'&text='+t],['linkedin','LinkedIn','https://www.linkedin.com/sharing/share-offsite/?url='+u],['pinterest','Pinterest','https://pinterest.com/pin/create/button/?url='+u+'&description='+t],['reddit','Reddit','https://www.reddit.com/submit?url='+u+'&title='+t],['threads','Threads','https://www.threads.net/intent/post?text='+t+'%20'+u],['mail','Email','mailto:?subject='+t+'&body='+u]]}
function shareRow(url,title,labeled){return '<div class="share-row'+(labeled?' labeled':'')+'">'+shareLinks(url,title).map(function(s){return '<a class="sbtn s-'+s[0]+'" href="'+esc(s[2])+'" target="_blank" rel="noopener nofollow" aria-label="Share on '+s[1]+'" title="Share on '+s[1]+'">'+ico(s[0])+'<span class="sl">'+s[1]+'</span></a>'}).join('')+'<button type="button" class="sbtn s-share" data-share-url="'+esc(url)+'" data-share-title="'+esc(title)+'" aria-label="More sharing options" title="More options">'+ico('share')+'<span class="sl">More</span></button><button type="button" class="sbtn s-link" data-copy-url="'+esc(url)+'" aria-label="Copy link" title="Copy link">'+ico('link')+'<span class="sl">Copy link</span></button></div>'}
function sharePage(title,text,url){url=url||location.href;if(navigator.share){navigator.share({title:title,text:text||title,url:url}).catch(function(){})}else copyText(url,'Link copied to clipboard')}
var SOC_NAMES={facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',twitter:'X (Twitter)',linkedin:'LinkedIn',github:'GitHub',pinterest:'Pinterest',telegram:'Telegram'};
function socialIcons(){return Object.keys(SOC_NAMES).filter(function(k){return safeUrl(S.social[k])}).map(function(k){return '<a class="sbtn s-'+k+'" href="'+esc(safeUrl(S.social[k]))+'" target="_blank" rel="noopener me" aria-label="Follow us on '+SOC_NAMES[k]+'" title="'+SOC_NAMES[k]+'">'+ico(k)+'<span class="sl">'+SOC_NAMES[k]+'</span></a>'}).join('')}

/* ---------- 8. SEO HELPERS ---------- */
window.__ouhSrv=window.__ouhSrv||{t:document.title,d:((document.querySelector('meta[name="description"]')||{}).content||'')};
function metaTag(attr,key,value){var m=$('meta['+attr+'="'+key+'"]');if(!m){m=D.createElement('meta');m.setAttribute(attr,key);D.head.appendChild(m)}m.setAttribute('content',value)}
function setMeta(title,desc,url){D.title=title+' | '+S.siteName;metaTag('name','description',desc);metaTag('property','og:title',title);metaTag('property','og:description',desc);metaTag('property','og:url',url);metaTag('name','twitter:title',title);metaTag('name','twitter:description',desc);var l=$('link[rel="canonical"]');if(!l){l=D.createElement('link');l.rel='canonical';D.head.appendChild(l)}l.href=url}
function ld(obj,key){var id='ld-'+key,s=byId(id);if(!s){s=D.createElement('script');s.type='application/ld+json';s.id=id;D.head.appendChild(s)}s.textContent=JSON.stringify(obj)}
function crumbLD(items){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[['Home',HOME]].concat(items).map(function(it,i){return {'@type':'ListItem',position:i+1,name:it[0],item:it[1]||location.href}})}}
function faqLD(list){return {'@context':'https://schema.org','@type':'FAQPage',mainEntity:list.map(function(f){return {'@type':'Question',name:f[0],acceptedAnswer:{'@type':'Answer',text:f[1]}}})}}

/* ---------- 9. BLOG FEED HELPERS ---------- */
var feedCache={};
function getFeed(path){if(!feedCache[path])feedCache[path]=fetch(path,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw new Error('feed '+r.status);return r.json()});return feedCache[path]}
function entryInfo(e){var link=(e.link||[]).filter(function(l){return l.rel==='alternate'})[0],html=(e.content&&e.content.$t)||(e.summary&&e.summary.$t)||'',img='';
if(e.media$thumbnail&&e.media$thumbnail.url)img=e.media$thumbnail.url.replace(/\/s72(-c)?\//,'/w640-h360-p-k-no-nu/').replace(/=s72(-c)?$/,'=w640-h360-p-k-no-nu');
else{var m=html.match(/<im[g][^>]+src="([^"]+)"/i);if(m)img=m[1]}
var text=html.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(),wc=text?text.split(' ').length:0;
return {title:(e.title&&e.title.$t)||'Untitled',url:safeUrl(link?link.href:'')||'#',img:/^https?:\/\//.test(img)?img:'',snip:text.slice(0,150)+(text.length>150?'…':''),date:new Date(e.published.$t),updated:new Date(e.updated.$t),labels:(e.category||[]).map(function(c){return c.term}),mins:Math.max(1,Math.round(wc/200))}}
function postCard(p){return '<article class="card post-card reveal"><a class="thumb'+(p.img?'':' noimg')+'" href="'+esc(p.url)+'" tabindex="-1" aria-hidden="true">'+(p.img?'<img loading="lazy" decoding="async" alt="'+esc(p.title)+'" src="'+esc(p.img)+'" width="640" height="360">':ico('blog','ico-lg'))+'</a><div class="pc-body">'+(p.labels[0]?'<span class="badge" style="align-self:flex-start">'+esc(p.labels[0])+'</span>':'')+'<h3><a href="'+esc(p.url)+'">'+esc(p.title)+'</a></h3><p>'+esc(p.snip)+'</p><div class="pc-meta"><span>'+ico('calendar','ico-sm')+' '+esc(dateStr(p.date))+'</span><span>'+ico('clock','ico-sm')+' '+p.mins+' min read</span></div></div></article>'}
function skeletons(n){var s='';for(var i=0;i<n;i++)s+='<div class="card post-card flat" aria-hidden="true"><div class="thumb skel" style="border-radius:0"></div><div class="pc-body"><div class="skel" style="height:14px;width:30%"></div><div class="skel" style="height:20px;width:92%"></div><div class="skel" style="height:14px;width:100%"></div><div class="skel" style="height:14px;width:70%"></div></div></div>';return s}
function emptyPosts(){return '<div class="card flat empty-state" style="grid-column:1/-1"><div class="tc-icon">'+ico('blog')+'</div><b>Articles are on the way</b><p class="muted" style="margin:6px 0 0">New guides and tips will appear here as soon as they are published.</p></div>'}
function loadPosts(el,n,label,exclude){if(!el)return Promise.resolve([]);el.innerHTML=skeletons(Math.min(n,6));var path='/feeds/posts/default'+(label?'/-/'+encodeURIComponent(label):'')+'?alt=json&max-results='+(n+(exclude?1:0));
return getFeed(path).then(function(j){var list=((j.feed&&j.feed.entry)||[]).map(entryInfo).filter(function(p){return p.url!==exclude}).slice(0,n);el.innerHTML=list.length?list.map(postCard).join(''):emptyPosts();observeReveal(el);return list}).catch(function(){el.innerHTML=emptyPosts();return []})}

/* ---------- 10. TOOL PAGE ---------- */
function renderTool(view,t,userBody){
track(t.slug);
var url=location.origin+href('tool',t.slug),cats=t.cats.map(catById).filter(Boolean),c0=cats[0];
var related=TOOLS.filter(function(x){return x!==t&&x.cats.indexOf(t.cats[0])>-1}).concat(TOOLS.filter(function(x){return x!==t&&x.cats.indexOf(t.cats[0])<0&&x.cats.some(function(c){return t.cats.indexOf(c)>-1})}));
TOOLS.forEach(function(x){if(related.length<6&&x!==t&&related.indexOf(x)<0)related.push(x)});related=related.slice(0,6);
var recent=(store('fuh-recent')||[]).filter(function(s){return s!==t.slug}).map(toolBySlug).filter(Boolean).slice(0,4);
var benefits=['Private: runs 100% in your browser, nothing is uploaded','Free forever with no account or sign-up','Works on phones, tablets and desktops','Copy, download, print or share results instantly'];
var steps=['Enter your values, paste your text or choose a file in the '+t.name+' above.','Watch the result update instantly as you change the inputs.','Use Copy, Download, Print or Share to save or send your result.'];
var btn=function(act,ic,label){return '<button type="button" class="btn btn-ghost btn-sm" data-tool="'+act+'" aria-label="'+label+'">'+ico(ic)+'<span>'+label+'</span></button>'};
view.innerHTML='<section class="page-hero"><div class="container">'+crumbs([[c0.name,href('category',c0.id)],[t.name]])+'<div class="tc-icon reveal">'+ico(toolIcon(t),'ico-lg')+'</div><h1 class="reveal">'+esc(t.name)+'</h1><p class="reveal">'+esc(t.desc)+'</p><div class="chips reveal" style="justify-content:center;margin-top:16px">'+cats.map(function(c){return '<a class="chip" data-spa="1" href="'+esc(href('category',c.id))+'">'+ico(catIcon(c))+esc(c.name)+'</a>'}).join('')+'<span class="chip">'+ico('shield')+'No upload</span><span class="chip">'+ico('zap')+'Instant results</span></div></div></section>'+
'<div class="container"><div class="tool-wrap"><div style="min-width:0">'+
'<div class="workbench" id="workbench"><div class="wb-head"><strong>'+ico(toolIcon(t))+esc(t.name)+'</strong><button type="button" class="fav-btn'+(isFav(t.slug)?' on':'')+'" data-fav="'+t.slug+'" aria-pressed="'+isFav(t.slug)+'" aria-label="Save to favorites">'+ico('heart')+'</button></div><div class="wb-body" id="tool-body"></div>'+
'<div class="wb-actions">'+btn('reset','reset','Reset')+btn('copy','copy','Copy')+btn('download','download','Download')+btn('share','share','Share')+btn('print','print','Print')+btn('feedback','message','Feedback')+'</div></div>'+
'<div class="ad-slot tool-extra" id="ad-tool-slot"></div>'+
'<div class="info-grid tool-extra"><div class="card flat reveal"><h2>'+ico('check')+'Features</h2><ul class="feat-list">'+t.features.map(li).join('')+'</ul></div><div class="card flat reveal"><h2>'+ico('star')+'Benefits</h2><ul class="feat-list">'+benefits.map(li).join('')+'</ul></div></div>'+
'<div class="card flat seo-block tool-extra reveal"><div class="prose"><h2>About the '+esc(t.name)+'</h2><p>'+esc(t.about)+'</p>'+((userBody&&userBody.indexOf('tool-steps')>-1)?'':'<h3>How to use the '+esc(t.name)+'</h3><ol class="steps">'+steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol>')+(userBody?'<div class="user-content">'+userBody+'</div>':'')+'</div></div>'+
'<div class="tool-extra" style="margin-top:28px"><h2 style="font-size:1.35rem">'+esc(t.name)+' FAQ</h2><div class="faq" style="margin:0">'+faqHtml(t.faq)+'</div></div>'+
'<div class="card flat tool-extra" style="margin-top:24px" id="tool-comments"><h2 style="font-size:1.2rem">Comments and feedback</h2><p class="muted">Questions or ideas for this tool? Send us a note and we will get back to you.</p><div class="btn-row" style="margin:0"><button type="button" class="btn btn-primary btn-sm" data-act="feedback">'+ico('message')+'Send feedback</button><a class="btn btn-ghost btn-sm" data-spa="1" href="'+esc(href('page','contact'))+'">Contact us</a></div></div>'+
'</div><aside class="side-col tool-extra"><div class="card flat"><h3>Share this tool</h3>'+shareRow(url,t.name+' – free online tool')+'</div><div class="card flat"><h3>Related tools</h3><div class="rel-list">'+related.map(relLink).join('')+'</div></div>'+(recent.length?'<div class="card flat"><h3>Recently viewed</h3><div class="rel-list">'+recent.map(relLink).join('')+'</div></div>':'')+'<div class="card flat"><h3>'+esc(S.newsletter.title)+'</h3><p class="muted" style="font-size:.88rem">'+esc(S.newsletter.text)+'</p><form class="nl-mini" data-nl="1" novalidate><input aria-label="Email address" type="email" placeholder="you@example.com"><button class="btn btn-primary btn-sm" type="submit">'+esc(S.newsletter.button)+'</button></form></div></aside></div>'+
'<section class="sec tool-extra" style="padding-top:10px"><div class="sec-head"><h2>More free tools you might like</h2></div><div class="grid g4">'+related.slice(0,4).map(toolCard).join('')+'</div></section></div>';
var body=byId('tool-body');CURRENT={tool:t,api:t.render(body)||{}};
placeAd('ad-tool-slot');
setMeta(t.name+' – Free Online Tool',t.desc,url);
var ouhS=window.__ouhSrv;if(ouhS&&ouhS.t&&ouhS.t!==t.name+' | '+S.siteName&&location.pathname.indexOf('/p/'+t.slug+'.html')>-1){D.title=ouhS.t;if(ouhS.d){metaTag('name','description',ouhS.d);metaTag('property','og:description',ouhS.d)}metaTag('property','og:title',ouhS.t)}
ld({'@context':'https://schema.org','@type':'WebApplication',name:t.name,url:url,description:t.desc,applicationCategory:'UtilitiesApplication',operatingSystem:'Any (web browser)',browserRequirements:'Requires JavaScript',isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},featureList:t.features.join(', '),publisher:{'@type':'Organization',name:S.siteName}},'page');
ld(crumbLD([[c0.name,location.origin+href('category',c0.id)],[t.name,url]]),'crumbs');
ld(faqLD(t.faq),'faq');
}
function toolAction(act){if(!CURRENT)return;var t=CURRENT.tool,out=byId('t-out'),txt=CURRENT.api.text?CURRENT.api.text():(out&&!out.classList.contains('empty')&&!out.classList.contains('err')?out.innerText.trim():'');
if(act==='reset'){CURRENT.api=t.render(byId('tool-body'))||{};toast('Tool reset');return}
if(act==='copy'){copyText(txt,'Result copied');return}
if(act==='download'){if(CURRENT.api.download&&CURRENT.api.download()!==false)return;if(!txt){toast('Nothing to download yet','warn');return}downloadBlob(new Blob([t.name+'\n'+location.href+'\n\n'+txt+'\n'],{type:'text/plain;charset=utf-8'}),t.slug+'-result.txt');return}
if(act==='share'){sharePage(t.name,txt?t.name+': '+txt.slice(0,140):t.desc);return}
if(act==='print'){W.print();return}
if(act==='feedback'){openFeedback();return}}

/* ---------- 11. CATEGORY PAGE ---------- */
function renderCategory(view,c){
var list=toolsIn(c.id),url=location.origin+href('category',c.id);
var pop=list.filter(function(t){return S.featuredTools.indexOf(t.slug)>-1||S.trendingTools.indexOf(t.slug)>-1}).slice(0,4);if(!pop.length)pop=list.slice(0,4);
var latest=byAdded(list).slice(0,4),others=CATS.filter(function(x){return x!==c});
view.innerHTML='<section class="page-hero"><div class="container">'+crumbs([['Categories',href('page','tools')],[c.name]])+'</div></section><div class="container">'+
'<div class="banner cat-banner reveal"><div class="banner-row"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><span class="tc-icon" style="background:rgba(255,255,255,.2);width:70px;height:70px;border-radius:22px">'+ico(catIcon(c),'ico-lg')+'</span><div><span class="eyebrow">Category</span><h1 style="color:#fff;font-size:clamp(1.7rem,1.2rem + 2vw,2.6rem);margin:0">'+esc(c.name)+'</h1><p style="margin:6px 0 0">'+esc(c.desc)+'</p></div></div><span class="badge" style="background:rgba(255,255,255,.2);color:#fff;font-size:.85rem;padding:8px 16px">'+(list.length?list.length+' free tool'+(list.length>1?'s':''):'Coming soon')+'</span></div></div>'+
(list.length?'<section class="sec" style="padding-top:36px"><div class="sec-head row"><div><span class="eyebrow">All '+esc(c.name)+'</span><h2>Every tool in this category</h2></div></div><div class="grid g4">'+list.map(toolCard).join('')+'</div></section>'+
'<section class="sec alt" style="padding-top:36px"><div class="grid g2"><div><div class="sec-head row"><div><span class="eyebrow">'+ico('zap','ico-sm')+'Popular</span><h2 style="font-size:1.4rem">Popular '+esc(c.name)+'</h2></div></div><div class="grid" style="gap:12px">'+pop.map(miniCard).join('')+'</div></div><div><div class="sec-head row"><div><span class="eyebrow">'+ico('plus','ico-sm')+'Latest</span><h2 style="font-size:1.4rem">Latest additions</h2></div></div><div class="grid" style="gap:12px">'+latest.map(miniCard).join('')+'</div></div></div></section>'
:'<section class="sec"><div class="card flat empty-state"><div class="tc-icon">'+ico(catIcon(c))+'</div><h2 style="font-size:1.4rem">'+esc(c.name)+' are coming soon</h2><p class="muted" style="max-width:520px;margin:0 auto 18px">We are building fast, private '+esc(c.name.toLowerCase())+' that run entirely in your browser. Subscribe to hear the moment they launch.</p><form class="nl-mini" data-nl="1" novalidate style="max-width:420px;margin:0 auto"><input aria-label="Email address" type="email" placeholder="you@example.com"><button class="btn btn-primary btn-sm" type="submit">Notify me</button></form></div><div class="sec-head" style="margin-top:40px"><h2 style="font-size:1.4rem">Try these popular tools meanwhile</h2></div><div class="grid g4">'+TOOLS.filter(function(t){return S.featuredTools.indexOf(t.slug)>-1}).slice(0,4).map(toolCard).join('')+'</div></section>')+
'<section class="sec"><div class="sec-head"><h2 style="font-size:1.4rem">Explore other categories</h2></div><div class="grid g3">'+others.map(catCard).join('')+'</div></section></div>';
setMeta(c.name+' – Free Online '+c.name,c.desc,url);
ld({'@context':'https://schema.org','@type':'CollectionPage',name:c.name,url:url,description:c.desc,mainEntity:{'@type':'ItemList',itemListElement:list.map(function(t,i){return {'@type':'ListItem',position:i+1,url:location.origin+href('tool',t.slug),name:t.name}})}},'page');
ld(crumbLD([[c.name,url]]),'crumbs');var f=byId('ld-faq');if(f)f.remove();
}

/* ---------- 12. STATIC PAGES ---------- */
function P(t){return '<p>'+t+'</p>'}
function H2(t){return '<h2>'+t+'</h2>'}
function UL(a){return '<ul>'+a.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul>'}
function pageShell(view,id,title,sub,html,wide){var url=location.origin+href('page',id);
view.innerHTML='<section class="page-hero"><div class="container">'+crumbs([[title]])+'<h1 class="reveal">'+esc(title)+'</h1>'+(sub?'<p class="reveal">'+esc(sub)+'</p>':'')+'</div></section><div class="container">'+(wide?html:'<div class="doc reveal"><div class="prose">'+html+'</div></div>')+'</div>';
setMeta(title,sub||title+' – '+S.siteName,url);ld({'@context':'https://schema.org','@type':'WebPage',name:title,url:url,description:sub||title},'page');ld(crumbLD([[title,url]]),'crumbs');var f=byId('ld-faq');if(f)f.remove()}
var SN=function(){return esc(S.siteName)},EM=function(){var e=esc(S.contact.email);return '<a href="mailto:'+e+'">'+e+'</a>'},UPD=function(){return '<p><em>Last updated: '+esc(S.legalUpdated)+'</em></p>'};
var PAGE_RENDER={
about:function(v){var A=PG.about,st=statsList(),T=function(x){return esc(tpl(x))};
var team=(A.team||[]).map(function(m){var ph=safeUrl(m.photo),ln=safeUrl(m.link);return '<div class="card flat reveal">'+(ph?'<div class="avatar"><img alt="'+T(m.name)+'" src="'+esc(ph)+'" loading="lazy"></div>':'<div class="avatar">'+esc(String(m.name||'?').split(' ').map(function(x){return x.charAt(0)}).join('').slice(0,2))+'</div>')+'<b>'+T(m.name)+'</b><div class="muted" style="font-size:.85rem">'+T(m.role)+'</div>'+(m.bio?'<p class="muted" style="font-size:.85rem;margin:8px 0 0">'+T(m.bio)+'</p>':'')+(ln?'<a class="chip" style="margin-top:10px" href="'+esc(ln)+'" target="_blank" rel="noopener">'+ico('link')+'Profile</a>':'')+'</div>'}).join('');
pageShell(v,'about',tpl(A.title),tpl(A.subtitle),'<div class="info-grid" style="margin-top:0"><div class="card flat reveal"><h2>'+ico('rocket')+T(A.missionTitle)+'</h2><p class="muted">'+T(A.mission)+'</p></div><div class="card flat reveal"><h2>'+ico('globe')+T(A.visionTitle)+'</h2><p class="muted">'+T(A.vision)+'</p></div></div>'+
'<div class="doc reveal" style="margin-top:24px"><div class="prose">'+H2(T(A.storyTitle))+(A.story||[]).map(function(p){return P(T(p))}).join('')+H2(T(A.timelineTitle))+'<ul class="timeline">'+(A.timeline||[]).map(function(t){return '<li><b>'+T(t.title)+'</b><span class="muted">'+T(t.text)+'</span></li>'}).join('')+'</ul>'+H2(T(A.featuresTitle))+UL((A.features||[]).map(T))+'</div></div>'+
'<section class="sec" style="padding-bottom:20px"><div class="sec-head"><span class="eyebrow">'+T(A.achievementsEyebrow)+'</span><h2>'+T(A.achievementsTitle)+'</h2></div><div class="stats">'+st.map(statCard).join('')+'</div></section>'+
(team?'<section class="sec" style="padding-top:20px"><div class="sec-head"><span class="eyebrow">'+T(A.teamEyebrow)+'</span><h2>'+T(A.teamTitle)+'</h2>'+(A.teamText?'<p>'+T(A.teamText)+'</p>':'')+'</div><div class="team">'+team+'</div></section>':''),true);animateCounters(v)},
contact:function(v){var c=S.contact,map=/^https:\/\/www\.google\.com\/maps\/embed/.test(c.mapEmbed||'')?'<iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="'+esc(c.mapEmbed)+'"></iframe>':ico('map','ico-lg')+'<b>Map placeholder</b><small>Add a Google Maps embed URL in Site Settings (contact.mapEmbed).</small>';
pageShell(v,'contact',tpl(PG.contact.title),tpl(PG.contact.subtitle),'<div class="contact-grid" style="padding-bottom:50px"><div class="card flat reveal"><h2 style="font-size:1.3rem">'+esc(tpl(PG.contact.formTitle))+'</h2><form id="contact-form" novalidate>'+ROW(F('Name','cf-name',I('cf-name','text','autocomplete="name" maxlength="80" required'))+'<div class="err-msg" id="cf-name-e"></div>',F('Email','cf-email',I('cf-email','email','autocomplete="email" maxlength="120" required'))+'<div class="err-msg" id="cf-email-e"></div>')+F('Subject','cf-subject',I('cf-subject','text','maxlength="120" required'))+'<div class="err-msg" id="cf-subject-e"></div>'+F('Message','cf-msg','<textarea class="inp" id="cf-msg" rows="6" maxlength="4000" required></textarea>')+'<div class="err-msg" id="cf-msg-e"></div><button class="btn btn-primary" type="submit">'+ico('mail')+esc(tpl(PG.contact.button))+'</button><p class="muted" style="font-size:.8rem;margin:10px 0 0">'+esc(tpl(PG.contact.formNote))+'</p></form></div>'+
'<div style="display:grid;gap:16px"><div class="card flat reveal"><h3>'+esc(tpl(PG.contact.infoTitle))+'</h3><ul class="feat-list"><li>'+ico('mail')+'<span>'+EM()+'</span></li>'+(c.businessEmail?'<li>'+ico('users')+'<span>Business: <a href="mailto:'+esc(c.businessEmail)+'">'+esc(c.businessEmail)+'</a></span></li>':'')+(c.phone?'<li>'+ico('phone')+'<span>'+esc(c.phone)+'</span></li>':'')+(c.address?'<li>'+ico('map')+'<span>'+esc(c.address)+'</span></li>':'')+(c.hours?'<li>'+ico('clock')+'<span>'+esc(c.hours)+'</span></li>':'')+'</ul><div class="social-row labeled" style="margin-top:14px">'+socialIcons()+'</div></div><div class="map-ph reveal">'+map+'</div></div></div>',true);
byId('contact-form').addEventListener('submit',function(e){e.preventDefault();var ok=true;function chk(id,cond,msg){var bad=!cond;flag(id,bad);byId(id+'-e').textContent=bad?msg:'';if(bad&&ok){byId(id).focus();ok=false}}
chk('cf-name',val('cf-name').trim().length>=2,'Please enter your name.');chk('cf-email',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('cf-email').trim()),'Please enter a valid email address.');chk('cf-subject',val('cf-subject').trim().length>=3,'Please add a short subject.');chk('cf-msg',val('cf-msg').trim().length>=10,'Your message should be at least 10 characters.');
if(!ok){toast('Please fix the highlighted fields','err');return}
var body='Name: '+val('cf-name').trim()+'\nEmail: '+val('cf-email').trim()+'\n\n'+val('cf-msg').trim();W.location.href='mailto:'+encodeURIComponent(S.contact.email)+'?subject='+encodeURIComponent(val('cf-subject').trim())+'&body='+encodeURIComponent(body);
openModal('Message ready to send','Your email app has opened with your message. Press send there and we will reply as soon as possible.');this.reset()})},
'privacy-policy':function(v){pageShell(v,'privacy-policy','Privacy Policy','How '+S.siteName+' handles your information.',UPD()+P('Your privacy matters to us. This policy explains what information '+SN()+' ("we", "us") collects, how it is used and the choices you have.')+H2('Information processed by our tools')+P('Our tools run inside your web browser. Text, numbers, images and files you enter into a tool are processed on your own device and are <b>not uploaded to our servers</b>.')+H2('Information stored on your device')+P('We use your browser\u2019s local storage to remember preferences such as dark mode, favorite tools, recently viewed tools, cookie choices and custom currency rates. This data stays on your device and you can clear it at any time from your browser settings.')+H2('Information you send us')+P('If you contact us by email or through our contact form, we receive the information you choose to share, such as your name, email address and message, and use it only to respond to you.')+H2('Analytics and hosting')+P('This site is hosted on Google Blogger. Google may collect standard server logs (such as IP address, browser type and pages visited) to operate and secure the service, as described in Google\u2019s privacy policy.')+H2('Advertising')+P('We may display ads served by Google AdSense and its partners. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google\u2019s use of advertising cookies enables it and its partners to serve ads based on your visits to sites on the Internet.')+P('You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google Ads Settings</a>. Learn more about <a href="https://policies.google.com/technologies/ads" rel="noopener" target="_blank">how Google uses information from sites that use its services</a>.')+H2('Children\u2019s privacy')+P('Our services are not directed to children under 13, and we do not knowingly collect personal information from children.')+H2('Your rights')+P('Depending on where you live, you may have rights to access, correct or delete personal information we hold about you. Contact us at '+EM()+' to make a request.')+H2('Changes to this policy')+P('We may update this policy from time to time. The "last updated" date above shows when it was last changed.')+H2('Contact')+P('Questions about this policy? Email '+EM()+'.'))},
terms:function(v){pageShell(v,'terms','Terms and Conditions','The rules for using '+S.siteName+'.',UPD()+P('By accessing or using '+SN()+', you agree to these Terms and Conditions. If you do not agree, please do not use the site.')+H2('Use of the tools')+P('Our tools are provided free of charge for personal and commercial use. You agree not to misuse the site, attempt to disrupt it, or use it for any unlawful purpose.')+H2('Your content')+P('You keep all rights to the text, images and files you process with our tools. Because processing happens in your browser, we do not receive or store that content.')+H2('Accuracy and no warranty')+P('We work hard to keep results accurate, but all tools and content are provided "as is" without warranties of any kind. Always verify important results independently.')+H2('Limitation of liability')+P('To the fullest extent permitted by law, '+SN()+' is not liable for any loss or damage arising from your use of, or inability to use, the site or its tools.')+H2('Intellectual property')+P('The site design, code, text and graphics are owned by '+SN()+' unless stated otherwise, and may not be copied without permission.')+H2('Third-party links and ads')+P('The site may contain links and advertisements from third parties. We are not responsible for their content, products or practices.')+H2('Changes')+P('We may modify these terms or the tools at any time. Continued use of the site means you accept the updated terms.')+H2('Contact')+P('Questions about these terms? Email '+EM()+'.'))},
disclaimer:function(v){pageShell(v,'disclaimer','Disclaimer','Please read before relying on any result.',UPD()+P('The information and tools on '+SN()+' are provided for general informational and convenience purposes only.')+H2('Not professional advice')+P('Calculators such as the EMI, GST, BMI, percentage and currency tools use standard formulas but are <b>not</b> financial, tax, legal or medical advice. Consult a qualified professional before making decisions based on any result.')+H2('Currency rates')+P('The currency converter uses editable sample rates, not live market data. Update the rates from a trusted source before relying on conversions.')+H2('Accuracy')+P('We make reasonable efforts to keep tools accurate and up to date, but we make no guarantees about completeness, reliability or suitability for any purpose.')+H2('External links')+P('Links to other websites are provided for convenience. We do not endorse and are not responsible for external content.')+H2('Affiliate and advertising')+P('Some pages may display advertising. Ads help keep the tools free and do not influence tool results.'))},
dmca:function(v){pageShell(v,'dmca','DMCA Policy','How to report copyright infringement.',UPD()+P(SN()+' respects the intellectual property rights of others and responds to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA).')+H2('Filing a notice')+P('If you believe content on this site infringes your copyright, send a written notice to '+EM()+' that includes:')+UL(['Your physical or electronic signature','Identification of the copyrighted work you claim is infringed','The URL of the material you want removed','Your name, address, telephone number and email address','A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent or the law','A statement, under penalty of perjury, that the information in your notice is accurate and that you are the owner or authorized to act on the owner\u2019s behalf'])+H2('What happens next')+P('We review every valid notice and, where appropriate, remove or disable access to the material and notify the person who posted it.')+H2('Counter-notice')+P('If you believe material was removed by mistake, you may send a counter-notice with the details required by the DMCA to the same email address.'))},
'cookie-policy':function(v){pageShell(v,'cookie-policy','Cookie Policy','What cookies and local storage we use, and why.',UPD()+P('This Cookie Policy explains how '+SN()+' uses cookies and similar technologies such as local storage.')+H2('What are cookies?')+P('Cookies are small text files stored by your browser. Local storage is a similar browser feature that lets websites remember information on your device.')+H2('How we use them')+UL(['<b>Essential preferences:</b> dark mode, cookie consent choice and dismissed banners.','<b>Convenience:</b> favorite tools, recently viewed tools, tool usage counts and custom currency rates.','<b>Hosting:</b> Google Blogger may set cookies needed to deliver and secure the site.','<b>Advertising (if enabled):</b> Google AdSense and partners may use cookies to show and measure ads, including personalized ads.'])+H2('Managing cookies')+P('You can accept or decline non-essential cookies using our cookie banner, and you can delete cookies and local storage at any time in your browser settings. Blocking some storage may reset your preferences.')+P('To control personalized advertising, visit <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google Ads Settings</a>.')+H2('Contact')+P('Questions? Email '+EM()+'.'))},
sitemap:function(v){pageShell(v,'sitemap','Sitemap','Every page, category and tool on '+S.siteName+'.','<div class="info-grid" style="margin-top:0;padding-bottom:50px"><div class="card flat"><h2>'+ico('blog')+'Pages</h2><ul class="feat-list">'+[['About Us','about'],['Contact Us','contact'],['Privacy Policy','privacy-policy'],['Terms and Conditions','terms'],['Disclaimer','disclaimer'],['DMCA Policy','dmca'],['Cookie Policy','cookie-policy'],['All Tools','tools'],['Blog Topics','labels']].map(function(p){return '<li>'+ico('arrow-right')+'<a data-spa="1" href="'+esc(href('page',p[1]))+'">'+p[0]+'</a></li>'}).join('')+'</ul></div><div class="card flat"><h2>'+ico('grid')+'Categories</h2><ul class="feat-list">'+CATS.map(function(c){return '<li>'+ico(catIcon(c))+'<a data-spa="1" href="'+esc(href('category',c.id))+'">'+esc(c.name)+'</a></li>'}).join('')+'</ul></div><div class="card flat"><h2>'+ico('zap')+'Tools</h2><ul class="feat-list">'+TOOLS.map(function(t){return '<li>'+ico(toolIcon(t))+'<a data-spa="1" href="'+esc(href('tool',t.slug))+'">'+esc(t.name)+'</a></li>'}).join('')+'</ul></div><div class="card flat"><h2>'+ico('blog')+'Blog posts</h2><ul class="feat-list" id="sm-posts"><li class="muted">Loading articles...</li></ul></div></div>',true);
getFeed('/feeds/posts/summary?alt=json&max-results=150').then(function(j){var l=((j.feed&&j.feed.entry)||[]).map(entryInfo);byId('sm-posts').innerHTML=l.length?l.map(function(p){return '<li>'+ico('arrow-right')+'<a href="'+esc(p.url)+'">'+esc(p.title)+'</a></li>'}).join(''):'<li class="muted">No articles published yet.</li>'}).catch(function(){byId('sm-posts').innerHTML='<li class="muted">No articles published yet.</li>'})},
labels:function(v){pageShell(v,'labels','Blog Topics','Browse articles by topic.','<div class="doc"><div class="chips" id="lbl-list"><span class="muted">Loading topics...</span></div></div><section class="sec" style="padding-top:10px"><div class="sec-head"><h2 style="font-size:1.4rem">Latest articles</h2></div><div class="grid g3" id="lbl-posts"></div></section>',true);
getFeed('/feeds/posts/summary?alt=json&max-results=0').then(function(j){var c=(j.feed&&j.feed.category)||[];byId('lbl-list').innerHTML=c.length?c.map(function(x){return '<a class="chip" href="/search/label/'+encodeURIComponent(x.term)+'">'+ico('tag')+esc(x.term)+'</a>'}).join(''):'<span class="muted">No topics yet.</span>'}).catch(function(){byId('lbl-list').innerHTML='<span class="muted">No topics yet.</span>'});loadPosts(byId('lbl-posts'),6)},
author:function(v){var a=S.author,av=safeUrl(a.avatar);pageShell(v,'author',a.name,a.role,'<div class="doc reveal" style="text-align:center"><div class="avatar" style="width:96px;height:96px;margin:0 auto 14px;font-size:1.8rem">'+(av?'<img alt="'+esc(a.name)+'" src="'+esc(av)+'">':esc(a.name.split(' ').map(function(x){return x[0]}).join('').slice(0,2)))+'</div><h2 style="margin:0">'+esc(a.name)+'</h2><p class="muted">'+esc(a.role)+'</p><p style="max-width:560px;margin:0 auto 16px">'+esc(a.bio)+'</p><div class="social-row labeled" style="justify-content:center">'+socialIcons()+'</div></div><section class="sec" style="padding-top:10px"><div class="sec-head"><h2 style="font-size:1.4rem">Articles by '+esc(a.name)+'</h2></div><div class="grid g3" id="au-posts"></div></section>',true);loadPosts(byId('au-posts'),9);
ld({'@context':'https://schema.org','@type':'ProfilePage',mainEntity:{'@type':'Person',name:a.name,description:a.bio,jobTitle:a.role}},'page')},
favorites:function(v){var fav=FAV.map(toolBySlug).filter(Boolean),rec=(store('fuh-recent')||[]).map(toolBySlug).filter(Boolean);
pageShell(v,'favorites','Your Saved Tools','Favorites and recently viewed tools, saved privately on this device.','<section class="sec" style="padding-top:10px"><div class="sec-head row"><div><span class="eyebrow">'+ico('heart','ico-sm')+'Favorites</span><h2 style="font-size:1.4rem">Favorite tools</h2></div></div>'+(fav.length?'<div class="grid g4">'+fav.map(toolCard).join('')+'</div>':'<div class="card flat empty-state"><div class="tc-icon">'+ico('heart')+'</div><b>No favorites yet</b><p class="muted" style="margin:6px 0 0">Tap the heart on any tool to save it here.</p></div>')+'</section>'+(rec.length?'<section class="sec" style="padding-top:0"><div class="sec-head row"><div><span class="eyebrow">'+ico('clock','ico-sm')+'Recent</span><h2 style="font-size:1.4rem">Recently viewed</h2></div><button type="button" class="btn btn-ghost btn-sm" data-act="clear-recent">Clear history</button></div><div class="grid gmini">'+rec.map(miniCard).join('')+'</div></section>':''),true)},
tools:function(v){pageShell(v,'tools','All Free Online Tools',TOOLS.length+' fast, private tools that run in your browser.','<div class="hero-search" style="margin:0 auto 18px;cursor:auto"><svg class="ico" aria-hidden="true"><use href="#i-search"></use></svg><input aria-label="Filter tools" id="all-filter" placeholder="Filter tools..." type="search"></div><div class="chips" id="all-chips" style="justify-content:center;margin-bottom:26px"></div><div class="grid g4" id="all-grid" style="padding-bottom:40px">'+TOOLS.map(toolCard).join('')+'</div>',true);
filterWire('all-filter','all-chips','all-grid','.tool-card')}
};

/* ---------- 13. SHARED UI HELPERS ---------- */
function statsList(){return (Array.isArray(S.stats)?S.stats:[]).map(function(s){return {value:s.value==='auto'?TOOLS.length:Number(s.value)||0,suffix:s.suffix||'',label:s.label||''}})}
function statCard(s){return '<div class="card stat reveal"><b class="grad-text" data-count="'+s.value+'" data-suffix="'+esc(s.suffix)+'">0</b><span>'+esc(s.label)+'</span></div>'}
function shortNum(n){return n>=1e6?(n/1e6).toFixed(n%1e6?1:0)+'M':n>=1e4?(n/1e3).toFixed(n%1e3?1:0)+'K':Math.round(n).toLocaleString()}
function animateCounters(root){var els=$$('[data-count]',root);if(!('IntersectionObserver' in W)){els.forEach(function(e){e.textContent=shortNum(+e.getAttribute('data-count'))+(e.getAttribute('data-suffix')||'')});return}
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);var el=x.target,target=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',t0=null;function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/1600),e=1-Math.pow(1-p,3);el.textContent=shortNum(target*e)+suf;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)})},{threshold:.4});els.forEach(function(e){io.observe(e)})}
var revealIO=('IntersectionObserver' in W)?new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');revealIO.unobserve(x.target)}})},{threshold:.08,rootMargin:'0px 0px -30px 0px'}):null;
function observeReveal(root){$$('.reveal:not(.in)',root).forEach(function(e,i){if(revealIO){e.style.transitionDelay=Math.min(i%6,5)*60+'ms';revealIO.observe(e)}else e.classList.add('in')})}
function filterWire(inputId,chipsId,gridId,sel){var cat='all',inp=byId(inputId),chips=byId(chipsId),grid=byId(gridId);if(!grid)return;
if(chips)chips.innerHTML='<button type="button" class="chip active" data-cat="all">All</button>'+CATS.filter(function(c){return toolsIn(c.id).length}).map(function(c){return '<button type="button" class="chip" data-cat="'+c.id+'">'+ico(catIcon(c))+esc(c.name)+'</button>'}).join('');
function apply(){var q=(inp?inp.value:'').toLowerCase().trim(),shown=0;$$(sel,grid).forEach(function(el){var fb=el.querySelector('[data-fav]'),t=fb?toolBySlug(fb.getAttribute('data-fav')):null,name=t?(t.name+' '+t.desc+' '+t.cats.join(' ')).toLowerCase():(el.getAttribute('data-name')||''),cats=t?t.cats.join(' '):(el.getAttribute('data-cats')||'');var ok=(!q||q.split(/\s+/).every(function(w){return name.indexOf(w)>-1}))&&(cat==='all'||(' '+cats+' ').indexOf(' '+cat+' ')>-1);el.style.display=ok?'':'none';if(ok){shown++;el.classList.add('in')}});
var em=grid.querySelector('.filter-empty');if(!shown&&!em){grid.insertAdjacentHTML('beforeend','<div class="card flat empty-state filter-empty" style="grid-column:1/-1">'+NO_RESULTS_SVG+'<b>No tools match your search</b><p class="muted" style="margin:6px 0 0">Try a different word or pick another category.</p></div>')}else if(shown&&em)em.remove()}
if(inp)inp.addEventListener('input',apply);if(chips)chips.addEventListener('click',function(e){var b=e.target.closest('[data-cat]');if(!b)return;cat=b.getAttribute('data-cat');$$('.chip',chips).forEach(function(c){c.classList.toggle('active',c===b)});apply()})}
var NO_RESULTS_SVG='<svg viewBox="0 0 160 110" width="130" aria-hidden="true" style="display:block;margin:0 auto 10px"><defs><linearGradient id="nrg" x1="0" x2="1"><stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs><ellipse cx="80" cy="100" rx="56" ry="6" fill="rgba(100,116,139,.15)"/><circle cx="70" cy="48" r="30" fill="none" stroke="url(#nrg)" stroke-width="8"/><path d="M92 70l24 24" stroke="url(#nrg)" stroke-width="10" stroke-linecap="round"/><path d="M60 40l20 16M80 40L60 56" stroke="#94A3B8" stroke-width="5" stroke-linecap="round"/></svg>';
function adShown(w){return (S.features.ads&&w.classList.contains('ad-live'))||(w.classList.contains('ad-placeholder')&&!w.classList.contains('ad-empty'))}
function placeAd(slotId){var slot=byId(slotId);if(!slot)return;$$('.ad-widget[data-origin="ad-between"]').forEach(function(w){if(adShown(w))slot.appendChild(w)})}
function openModalEl(id){var m=byId(id);if(!m)return;m.classList.add('open');D.body.classList.add('no-scroll');var f=m.querySelector('textarea,input,button');if(f)setTimeout(function(){f.focus()},60)}
function closeModals(){$$('.modal.open').forEach(function(m){m.classList.remove('open')});if(!byId('drawer').classList.contains('open')&&!byId('search-pop').classList.contains('open'))D.body.classList.remove('no-scroll')}
function openModal(title,text,btn){byId('gm-title').textContent=title;byId('gm-text').textContent=text;byId('gm-btn').textContent=btn||'OK';openModalEl('generic-modal')}
var fbRating=0;
function openFeedback(){fbRating=0;byId('fb-rate').innerHTML=[1,2,3,4,5].map(function(n){return '<button type="button" data-rate="'+n+'" aria-label="'+n+' star'+(n>1?'s':'')+'">'+ico('star')+'</button>'}).join('');byId('fb-text').value='';openModalEl('feedback-modal')}

/* ---------- 14. ROUTER ---------- */
var PAGES_ALL=['about','contact','privacy-policy','disclaimer','dmca','cookie-policy','terms','sitemap','labels','author','favorites','tools'];
function getRoute(){var q=new URLSearchParams(location.search);if(q.get('tool'))return {type:'tool',id:q.get('tool')};if(q.get('category'))return {type:'category',id:q.get('category')};if(q.get('page'))return {type:'page',id:q.get('page')};
var m=location.pathname.match(/^\/p\/([a-z0-9-]+)\.html$/i);if(m){var s=m[1].toLowerCase();s=PAGE_ALIAS[s]||s;if(toolBySlug(s))return {type:'tool',id:s,blog:true};if(s.indexOf('category-')===0&&catById(s.slice(9)))return {type:'category',id:s.slice(9),blog:true};if(PAGES_ALL.indexOf(s)>-1)return {type:'page',id:s,blog:true}}return null}
function renderRoute(r,fromPop){var view=byId('app-view');if(!r||!view)return false;var userBody=null,pb=$('.is-page .post-body');
if(r.blog&&pb){var len=pb.textContent.trim().length;if(r.type==='page'&&len>80)return false;if(len>20)userBody=pb.innerHTML}
var ok=false;CURRENT=null;
if(r.type==='tool'){var t=toolBySlug(r.id);if(t){renderTool(view,t,userBody);ok=true}}
else if(r.type==='category'){var c=catById(r.id);if(c){renderCategory(view,c);ok=true}}
else if(r.type==='page'&&PAGE_RENDER[r.id]){PAGE_RENDER[r.id](view);ok=true}
if(!ok)return false;
D.body.classList.add('routed');demoteHero(true);
if(r.blog){var com=byId('comments'),slot=byId('tool-comments');if(com&&slot)slot.appendChild(com)}
observeReveal(view);if(!fromPop)W.scrollTo(0,0);setBottomNav(r);
return true}
function demoteHero(on){try{var h=byId('hero-title');if(h&&h.tagName!==(on?'DIV':'H1'))swapTag(h,on?'div':'h1');if(on)$$('#Blog1 .post-title').forEach(function(t){if(t.tagName==='H1')swapTag(t,'h2')})}catch(e){}}
function goHome(){D.body.classList.remove('routed');demoteHero(false);byId('app-view').innerHTML='';CURRENT=null;if(HOME_META){D.title=HOME_META.title;metaTag('name','description',HOME_META.desc);var l=$('link[rel="canonical"]');if(l)l.href=HOME}['ld-page','ld-crumbs','ld-faq'].forEach(function(id){var e=byId(id);if(e)e.remove()});if(D.body.classList.contains('is-home'))renderHomeFAQSchema();setBottomNav(null);refreshHomeDynamic()}
function wireRouteLinks(root){$$('[data-route]',root).forEach(function(a){var p=a.getAttribute('data-route').split(':');a.setAttribute('href',href(p[0],p[1]));a.setAttribute('data-spa','1')})}
function setBottomNav(r){$$('#bottom-nav [data-bn]').forEach(function(b){var k=b.getAttribute('data-bn'),on=r?(r.type==='page'&&(r.id===k)):(k==='home'&&D.body.classList.contains('is-home'));if(r&&r.type!=='page'&&k==='tools')on=true;b.classList.toggle('on',!!on)})}

/* ---------- 15. HOMEPAGE ---------- */
function sectionToggles(){Object.keys(S.sections||{}).forEach(function(k){if(S.sections[k]===false)$$('[data-sec="'+k+'"]').forEach(function(s){s.classList.add('hide')})})}
function renderHome(){if(!byId('home'))return;HOME_META={title:D.title,desc:($('meta[name="description"]')||{}).content||S.tagline};
sectionToggles();
byId('hero-badge').textContent=S.heroBadge;byId('hero-title').innerHTML='<span class="l1">'+esc(S.heroHeading)+'</span><span class="l2"><span class="grad-text">'+esc(S.heroHighlight)+'</span></span>';byId('hero-sub').textContent=S.heroSubtitle;
$$('.js-search-ph').forEach(function(i){i.placeholder=S.searchPlaceholder});
var c1=byId('cta-1');if(c1)c1.querySelector('span').textContent=S.ctaPrimaryText;var c2=byId('cta-2');if(c2){c2.textContent=S.ctaSecondaryText;c2.href=safeUrl(S.ctaSecondaryUrl)||'/search'}
if(safeUrl(S.heroImage))byId('hero-img-wrap').innerHTML='<img class="hero-img reveal" alt="'+esc(S.siteName)+'" src="'+esc(S.heroImage)+'" loading="lazy" decoding="async">';
byId('hero-popular').innerHTML='<span>Popular:</span>'+(S.popularSearches||[]).map(function(p){return '<button type="button" class="chip" data-search="'+esc(p)+'">'+esc(p)+'</button>'}).join('');
var st=statsList();byId('hero-counters').innerHTML=[{value:TOOLS.length,suffix:'',label:'Working Tools'}].concat(st.filter(function(s){return /user/i.test(s.label)}).slice(0,1)).concat(st.filter(function(s){return /countr/i.test(s.label)}).slice(0,1)).map(function(s){return '<div class="hc"><b class="grad-text" data-count="'+s.value+'" data-suffix="'+esc(s.suffix)+'">0</b><span>'+esc(s.label)+'</span></div>'}).join('');
byId('quick-grid').innerHTML=TOOLS.map(miniCard).join('');filterWire('quick-filter','quick-chips','quick-grid','.mini-card');
byId('featured-grid').innerHTML=S.featuredTools.map(toolBySlug).filter(Boolean).map(toolCard).join('');
byId('cat-grid').innerHTML=CATS.map(catCard).join('');
byId('recent-grid').innerHTML=byAdded(TOOLS).slice(0,4).map(toolCard).join('');
byId('trending-grid').innerHTML=S.trendingTools.map(toolBySlug).filter(Boolean).slice(0,8).map(toolCard).join('');
refreshHomeDynamic();
var COLL=[['Student Essentials','text','Everything for assignments and study sessions.',['word-counter','character-counter','case-converter','find-and-replace','percentage-calculator']],['Money Planner','finance','Plan loans, taxes and conversions with clarity.',['emi-calculator','gst-calculator','currency-converter','percentage-calculator']],['Creator Kit','image','Prepare visuals and links for social media.',['image-compressor','webp-to-jpg','jpg-to-png','qr-code-generator','color-palette-generator']],['Developer Toolbox','code','Quick encoders and generators for builders.',['base64-encoder','base64-decoder','password-generator','random-number-generator','unit-converter']],['PDF Toolkit','pdf','Everything you need to edit and convert PDFs.',['merge-pdf','split-pdf','jpg-to-pdf','pdf-to-jpg','pdf-to-text']]];
if(Array.isArray(HJ.collectionCards)&&HJ.collectionCards.length)COLL=HJ.collectionCards.map(function(c){return [tpl(c.name),/^[a-z-]+$/.test(c.icon||'')?c.icon:'grid',tpl(c.text),Array.isArray(c.tools)?c.tools:[]]});
byId('collections-grid').innerHTML=COLL.map(function(c){return '<div class="card coll-card reveal"><div class="tc-icon">'+ico(c[1])+'</div><h3 style="margin:14px 0 4px;font-size:1.08rem">'+esc(c[0])+'</h3><p class="muted" style="font-size:.88rem;margin:0">'+esc(c[2])+'</p><ul>'+c[3].map(toolBySlug).filter(Boolean).map(function(t){return '<li><a data-spa="1" href="'+esc(href('tool',t.slug))+'">'+ico(toolIcon(t))+esc(t.name)+'</a></li>'}).join('')+'</ul></div>'}).join('');
byId('stats-grid').innerHTML=st.map(statCard).join('');
renderTestimonials();
byId('home-faq').innerHTML=faqHtml(FAQS.map(function(f){return [f.q,f.a]}));renderHomeFAQSchema();
loadPosts(byId('home-posts'),6);
byId('phone-mock').innerHTML='<div style="font-family:var(--fh);font-weight:700;font-size:.85rem;margin-bottom:12px" class="grad-text">'+esc(S.siteName)+'</div>'+S.featuredTools.slice(0,6).map(toolBySlug).filter(Boolean).map(function(t){return '<div class="ph-row"><span class="tc-icon">'+ico(toolIcon(t))+'</span>'+esc(t.name)+'</div>'}).join('');
var COMM=[['telegram','tg','Telegram channel','Instant updates when new tools launch.',S.telegramUrl||S.social.telegram],['whatsapp','wa','WhatsApp community','Tips and tool requests from other users.',S.whatsappNumber?'https://wa.me/'+String(S.whatsappNumber).replace(/\D/g,''):S.social.whatsapp],['github','gh','GitHub','Browse our code, report issues and suggest new tools.',S.social.github],['youtube','yt','YouTube tutorials','Short videos showing tools in action.',S.social.youtube]];
byId('community-grid').innerHTML=COMM.map(function(c){var u=safeUrl(c[4]);return '<div class="card comm-card reveal"><span class="tc-icon '+c[1]+'">'+ico(c[0])+'</span><h3 style="font-size:1.05rem;margin:4px 0 0">'+esc(c[2])+'</h3><p class="muted" style="font-size:.88rem;margin:0">'+esc(c[3])+'</p>'+(u?'<a class="btn btn-ghost btn-sm" href="'+esc(u)+'" target="_blank" rel="noopener">Join now'+ico('arrow-right')+'</a>':'<span class="badge">Coming soon</span>')+'</div>'}).join('');
placeAd('ad-between-slot');
applyHomeContent();
}
function applyHomeContent(){var H=HJ,T=function(x){return tpl(x)};
function sec(k){return $('[data-sec="'+k+'"]')}
function head(k,o){var s=sec(k);if(!s||!o)return;var h=$('.sec-head',s)||s;if(o.eyebrow!=null){var e=$('.eyebrow',h);if(e){var svg=e.querySelector('svg');e.textContent=T(o.eyebrow);if(svg)e.insertBefore(svg,e.firstChild)}}if(o.title!=null){var t=$('h2',h);if(t)t.textContent=T(o.title)}if(o.text!=null){var p=$('p',h);if(p)p.textContent=T(o.text)}}
['search','featured','categories','recent','trending','collections','why','stats','testimonials','faq','blog','community'].forEach(function(k){head(k,H[k])});
['productivity','app','cta'].forEach(function(k){var o=H[k],s=sec(k);if(!o||!s)return;if(o.eyebrow!=null){var e=$('.eyebrow',s);if(e){var svg=e.querySelector('svg');e.textContent=T(o.eyebrow);if(svg)e.insertBefore(svg,e.firstChild)}}if(o.title!=null){var t=$('h2',s);if(t)t.textContent=T(o.title)}if(o.text!=null){var p=$('p',s);if(p)p.textContent=T(o.text)}var bt=$$('a.btn',s);[['button','link'],['button2','link2']].forEach(function(pr,n){var b=bt[n];if(!b)return;if(o[pr[0]]!=null)b.textContent=T(o[pr[0]]);var u=safeUrl(o[pr[1]]);if(u){b.setAttribute('href',u);b.removeAttribute('data-route')}})});
if(Array.isArray(H.whyCards)&&H.whyCards.length){var g=$('[data-sec="why"] .grid');if(g){g.innerHTML=H.whyCards.map(function(c){return '<div class="card why-card reveal"><div class="tc-icon">'+ico(/^[a-z-]+$/.test(c.icon||'')?c.icon:'star')+'</div><h3>'+esc(T(c.title))+'</h3><p>'+esc(T(c.text))+'</p></div>'}).join('');observeReveal(g)}}}
function refreshHomeDynamic(){var g=byId('mostused-grid');if(!g)return;var u=store('fuh-usage')||{},keys=Object.keys(u).filter(toolBySlug).sort(function(a,b){return u[b]-u[a]}).slice(0,4);
if(keys.length){byId('mostused-title').textContent='Your most used tools';byId('mostused-note').textContent='Based on how often you open each tool. Saved privately on this device.';g.innerHTML=keys.map(toolBySlug).map(toolCard).join('')}
else{byId('mostused-title').textContent='Most used by our visitors';byId('mostused-note').textContent='Open a few tools and your personal favorites will show up here, saved only on this device.';g.innerHTML=['bmi-calculator','word-counter','password-generator','percentage-calculator'].map(toolBySlug).filter(Boolean).map(toolCard).join('')}
var rec=(store('fuh-recent')||[]).map(toolBySlug).filter(Boolean).slice(0,6);byId('recent-strip').innerHTML=rec.length?'<span class="muted" style="font-size:.85rem;align-self:center">Recently viewed:</span>'+rec.map(function(t){return '<a class="chip" data-spa="1" href="'+esc(href('tool',t.slug))+'">'+ico(toolIcon(t))+esc(t.name)+'</a>'}).join(''):'';observeReveal(byId('home'))}
function renderHomeFAQSchema(){if(FAQS.length&&S.sections.faq!==false)ld(faqLD(FAQS.map(function(f){return [f.q,f.a]})),'faq')}
var tIdx=0,tTimer=null;
function renderTestimonials(){var tr=byId('t-track');if(!tr)return;if(!TESTI.length){var s=byId('s-testimonials');if(s)s.classList.add('hide');return}
tr.innerHTML=TESTI.map(function(t){var r=Math.max(0,Math.min(5,parseInt(t.rating,10)||5)),av=safeUrl(t.avatar);return '<div class="t-slide"><figure class="card t-card" style="margin:0"><div class="stars" aria-label="'+r+' out of 5 stars">'+[1,2,3,4,5].map(function(n){return '<span class="'+(n>r?'off':'')+'">'+ico('star')+'</span>'}).join('')+'</div><blockquote style="margin:0"><p>\u201C'+esc(t.text)+'\u201D</p></blockquote><figcaption class="t-person"><span class="avatar">'+(av?'<img alt="'+esc(t.name||'User')+'" src="'+esc(av)+'" loading="lazy">':esc(String(t.name||'?').split(' ').map(function(x){return x.charAt(0)}).join('').slice(0,2)))+'</span><span><b>'+esc(t.name)+'</b><small>'+esc(t.role||'')+(t.country?' · '+esc(t.country):'')+'</small></span></figcaption></figure></div>'}).join('');
function per(){return W.innerWidth<=600?1:W.innerWidth<=900?2:3}
function pages(){return Math.max(1,TESTI.length-per()+1)}
function go(i){var n=pages();tIdx=(i+n)%n;tr.style.transform='translateX(-'+(tIdx*100/per())+'%)';byId('t-dots').innerHTML=Array.apply(null,{length:n}).map(function(_,k){return '<button type="button" aria-label="Go to slide '+(k+1)+'" class="'+(k===tIdx?'on':'')+'" data-slide="'+k+'"></button>'}).join('')}
W.FUH_T={go:go,next:function(){go(tIdx+1)},prev:function(){go(tIdx-1)}};
byId('t-dots').addEventListener('click',function(e){var b=e.target.closest('[data-slide]');if(b){go(+b.getAttribute('data-slide'));restart()}});
function restart(){clearInterval(tTimer);if(!W.matchMedia('(prefers-reduced-motion: reduce)').matches)tTimer=setInterval(function(){go(tIdx+1)},5500)}
var sl=byId('t-slider');sl.addEventListener('mouseenter',function(){clearInterval(tTimer)});sl.addEventListener('mouseleave',restart);
var sx=0;sl.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});sl.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){go(tIdx+(dx<0?1:-1));restart()}});
W.addEventListener('resize',debounce(function(){go(tIdx)},200));go(0);restart()}

/* ---------- 16. MENUS, FOOTER, SOCIAL ---------- */
function renderMenus(){
var sec=function(title,icon,links){return '<div><h4>'+ico(icon)+esc(title)+'</h4>'+(links.length?links.join(''):'<div class="soon">Coming soon</div>')+'</div>'};
var tl=function(t){return '<a role="menuitem" data-spa="1" href="'+esc(href('tool',t.slug))+'">'+ico(toolIcon(t))+esc(t.name)+'</a>'};
var order=['calculators','converters','image','text','developer','finance','pdf','seo','social','network','productivity','color'];
byId('mega-cats').innerHTML=order.map(function(id){var c=catById(id);return sec(c.name,catIcon(c),toolsIn(id).slice(0,5).map(tl).concat(toolsIn(id).length?['<a role="menuitem" data-spa="1" href="'+esc(href('category',id))+'" style="color:var(--primary);font-weight:600">View all '+ico('arrow-right')+'</a>']:[]))}).join('')+sec('Popular Tools','zap',S.featuredTools.slice(0,5).map(toolBySlug).filter(Boolean).map(tl))+sec('Latest Tools','plus',byAdded(TOOLS).slice(0,5).map(tl));
byId('mega-tools').innerHTML=['calculators','finance','text','image','pdf','developer','seo','social'].map(function(id){var c=catById(id);return sec(c.name,catIcon(c),toolsIn(id).slice(0,4).map(tl))}).join('');
var db='<a href="'+HOME+'">'+ico('home')+'Home</a><a data-spa="1" href="'+esc(href('page','tools'))+'">'+ico('grid')+'All Tools</a>'+CATS.map(function(c){var l=toolsIn(c.id);return '<div class="acc"><button type="button" aria-expanded="false">'+ico(catIcon(c))+esc(c.name)+'<svg class="ico chev" aria-hidden="true"><use href="#i-chev"></use></svg></button><div class="acc-body">'+(l.length?l.map(function(t){return '<a data-spa="1" href="'+esc(href('tool',t.slug))+'">'+esc(t.name)+'</a>'}).join('')+'<a data-spa="1" href="'+esc(href('category',c.id))+'" style="color:var(--primary)">View category</a>':'<a data-spa="1" href="'+esc(href('category',c.id))+'">Coming soon</a>')+'</div></div>'}).join('')+'<a href="/search?max-results=9">'+ico('blog')+'Blog</a><a data-spa="1" href="'+esc(href('page','favorites'))+'">'+ico('heart')+'Saved Tools</a><a data-spa="1" href="'+esc(href('page','about'))+'">'+ico('info')+'About</a><a data-spa="1" href="'+esc(href('page','contact'))+'">'+ico('mail')+'Contact</a>';
byId('drawer-body').innerHTML=db;
var soc=socialIcons();byId('hdr-social').innerHTML=socialIcons().split('</a>').slice(0,4).join('</a>')+(soc?'</a>':'');byId('drawer-social').innerHTML=soc;$$('.js-social').forEach(function(e){e.innerHTML=soc});
byId('ftr-cats').innerHTML=CATS.slice(0,13).map(function(c){return '<li><a data-spa="1" href="'+esc(href('category',c.id))+'">'+esc(c.name)+'</a></li>'}).join('');
byId('ftr-tools').innerHTML=S.featuredTools.slice(0,7).map(toolBySlug).filter(Boolean).map(function(t){return '<li><a data-spa="1" href="'+esc(href('tool',t.slug))+'">'+esc(t.name)+'</a></li>'}).join('');
getFeed('/feeds/posts/summary?alt=json&max-results=5').then(function(j){var l=((j.feed&&j.feed.entry)||[]).map(entryInfo);byId('ftr-posts').innerHTML=l.length?l.map(function(p){return '<li><a href="'+esc(p.url)+'">'+esc(p.title)+'</a></li>'}).join(''):'<li class="muted">Articles coming soon</li>'}).catch(function(){byId('ftr-posts').innerHTML='<li class="muted">Articles coming soon</li>'});
$$('.js-side-popular').forEach(function(e){e.innerHTML=S.featuredTools.slice(0,6).map(toolBySlug).filter(Boolean).map(relLink).join('')});
$$('.js-side-trending').forEach(function(e){e.innerHTML=S.trendingTools.slice(0,5).map(toolBySlug).filter(Boolean).map(relLink).join('')});
$$('.js-site-name').forEach(function(e){e.textContent=S.siteName});$$('.js-logo-text').forEach(function(e){e.textContent=S.logoText});
$$('.js-nl-title').forEach(function(e){e.textContent=S.newsletter.title});$$('.js-nl-text').forEach(function(e){e.textContent=S.newsletter.text});$$('.js-nl-btn').forEach(function(e){if(e.textContent.length>4)e.textContent=S.newsletter.button});
if(S.footerAbout)byId('ftr-about').textContent=S.footerAbout;byId('yr').textContent=new Date().getFullYear();
if($('.brand-sec img'))$$('.hdr .brand-logo').forEach(function(e){e.classList.add('hide')});
var bsec=$('.brand-sec');if(bsec&&!bsec.textContent.trim()&&!$('.brand-sec img'))bsec.innerHTML='<a class="brand-name" href="'+HOME+'">'+esc(S.siteName)+'</a>';
var lu=safeUrl(S.logoUrl);if(lu&&/^https?:\/\//.test(lu))D.documentElement.style.setProperty('--logo','url("'+lu.replace(/["\\\n]/g,'')+'")');
}

/* ---------- 17. LIVE SEARCH ---------- */
var SEARCH={items:null,posts:false,active:-1};
function searchIndex(){if(SEARCH.items)return SEARCH.items;var it=[];
TOOLS.forEach(function(t){it.push({g:'Tools',t:t.name,s:t.desc,k:t.cats.join(' ')+' '+t.slug,u:href('tool',t.slug),i:toolIcon(t)})});
CATS.forEach(function(c){it.push({g:'Categories',t:c.name,s:c.desc,k:c.id,u:href('category',c.id),i:catIcon(c)})});
[['About Us','about','info'],['Contact Us','contact','mail'],['Privacy Policy','privacy-policy','shield'],['Terms and Conditions','terms','blog'],['Disclaimer','disclaimer','alert'],['DMCA Policy','dmca','blog'],['Cookie Policy','cookie-policy','settings'],['Sitemap','sitemap','grid'],['Saved Tools','favorites','heart']].forEach(function(p){it.push({g:'Pages',t:p[0],s:S.siteName,k:p[1],u:href('page',p[1]),i:p[2]})});
return SEARCH.items=it}
function loadSearchPosts(){if(SEARCH.posts)return;SEARCH.posts=true;getFeed('/feeds/posts/summary?alt=json&max-results=150').then(function(j){((j.feed&&j.feed.entry)||[]).map(entryInfo).forEach(function(p){searchIndex().push({g:'Articles',t:p.title,s:p.snip,k:p.labels.join(' '),u:p.url,i:'blog',ext:1})});if(byId('search-pop').classList.contains('open'))runSearch()}).catch(function(){})}
function hl(text,q){var lt=text.toLowerCase(),i=q?lt.indexOf(q):-1;if(i<0)return esc(text);return esc(text.slice(0,i))+'<mark>'+esc(text.slice(i,i+q.length))+'</mark>'+esc(text.slice(i+q.length))}
function srItem(x,q){return '<a class="sr-item" href="'+esc(x.u)+'"'+(x.ext?'':' data-spa="1"')+'><span class="tc-icon">'+ico(x.i)+'</span><span><b>'+hl(x.t,q)+'</b><small>'+hl(x.s.length>90?x.s.slice(0,90)+'…':x.s,q)+'</small></span></a>'}
function runSearch(){var box=byId('search-results'),raw=byId('search-input').value.trim(),q=raw.toLowerCase();SEARCH.active=-1;
if(!q){var rec=store('fuh-rs')||[];box.innerHTML=(rec.length?'<div class="sr-group"><h5>Recent searches</h5><div class="chips" style="padding:0 10px">'+rec.map(function(r){return '<button type="button" class="chip" data-search="'+esc(r)+'">'+ico('clock')+esc(r)+'</button>'}).join('')+'<button type="button" class="chip" data-act="clear-rs">'+ico('x')+'Clear</button></div></div>':'')+'<div class="sr-group"><h5>Popular searches</h5><div class="chips" style="padding:0 10px">'+(S.popularSearches||[]).map(function(p){return '<button type="button" class="chip" data-search="'+esc(p)+'">'+ico('zap')+esc(p)+'</button>'}).join('')+'</div></div><div class="sr-group"><h5>Suggested tools</h5>'+S.featuredTools.slice(0,5).map(toolBySlug).filter(Boolean).map(function(t){return srItem({t:t.name,s:t.desc,u:href('tool',t.slug),i:toolIcon(t)},'')}).join('')+'</div>';return}
var words=q.split(/\s+/),res=searchIndex().map(function(x){var hay=(x.t+' '+x.s+' '+x.k).toLowerCase(),tl=x.t.toLowerCase();if(!words.every(function(w){return hay.indexOf(w)>-1}))return null;var sc=tl.indexOf(q)===0?5:tl.indexOf(q)>-1?4:words.every(function(w){return tl.indexOf(w)>-1})?3:1;if(x.g==='Tools')sc+=0.5;return {x:x,s:sc}}).filter(Boolean).sort(function(a,b){return b.s-a.s});
if(!res.length){box.innerHTML='<div class="sr-empty">'+NO_RESULTS_SVG+'<b>No results for \u201C'+esc(raw)+'\u201D</b><p style="margin:6px 0 0">Try another keyword like \u201Ccalculator\u201D, \u201Cimage\u201D or \u201Ctext\u201D.</p></div>';return}
var groups={};res.slice(0,24).forEach(function(r){(groups[r.x.g]=groups[r.x.g]||[]).push(r.x)});
box.innerHTML=['Tools','Categories','Articles','Pages'].filter(function(g){return groups[g]}).map(function(g){return '<div class="sr-group"><h5>'+g+'</h5>'+groups[g].slice(0,8).map(function(x){return srItem(x,q)}).join('')+'</div>'}).join('')}
function saveSearch(q){q=String(q||'').trim();if(q.length<2)return;var r=(store('fuh-rs')||[]).filter(function(x){return x.toLowerCase()!==q.toLowerCase()});r.unshift(q);store('fuh-rs',r.slice(0,6))}
function openSearch(q){var p=byId('search-pop'),inp=byId('search-input');p.classList.add('open');D.body.classList.add('no-scroll');inp.placeholder=S.searchPlaceholder;inp.value=q||'';runSearch();loadSearchPosts();setTimeout(function(){inp.focus()},40)}
function closeSearch(){byId('search-pop').classList.remove('open');if(!$('.modal.open')&&!byId('drawer').classList.contains('open'))D.body.classList.remove('no-scroll')}

/* ---------- 18. BLOG ENHANCER (Blogger posts and lists) ---------- */
function enhanceList(){var wrap=$('#Blog1 .blog-posts'),cl=D.body.classList;if(!wrap||cl.contains('is-home')||cl.contains('is-item')||!cl.contains('is-list'))return;
var path=location.pathname,q=new URLSearchParams(location.search),head=byId('list-head'),title='Latest articles',sub='Guides, tips and updates from '+S.siteName+'.';
var lm=path.match(/\/search\/label\/([^\/?]+)/);if(lm){title=decodeURIComponent(lm[1]).replace(/\+/g,' ');sub='Articles filed under this topic.'}else if(q.get('q')){title='Search results for \u201C'+q.get('q')+'\u201D';sub='Matching articles from the blog.'}else{var am=path.match(/^\/(\d{4})(?:\/(\d{2}))?\/?$/);if(am){title='Archive: '+(am[2]?new Date(+am[1],+am[2]-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'}):am[1]);sub='Articles published in this period.'}}
head.innerHTML=crumbs([['Blog','/search?max-results=9']].concat(title!=='Latest articles'?[[title]]:[]))+'<h1>'+esc(title)+'</h1><p class="muted">'+esc(sub)+'</p>';head.classList.remove('hide');head.querySelector('.crumbs').style.justifyContent='flex-start';
wrap.classList.add('post-grid');cardify(wrap);
if(S.features.infiniteScroll)infinite(wrap)}
function cardify(wrap){$$('.post-outer-container,.post-outer',wrap).forEach(function(po){if(po.getAttribute('data-card')||po.closest('[data-card]'))return;var post=po.querySelector('.post');if(!post)return;po.setAttribute('data-card','1');
var a=post.querySelector('.post-title a')||post.querySelector('a.timestamp-link'),url=a?a.href:'#',ti=post.querySelector('.post-title'),title=ti?ti.textContent.trim():'Untitled';
var body=post.querySelector('.post-body,.snippet-item,.post-snippet'),img=post.querySelector('.post-body img,img'),txt=body?body.textContent.replace(/\s+/g,' ').trim():'',tm=post.querySelector('time.published,abbr.published,.published'),lab=post.querySelector('.post-labels a');
var src=img?(img.getAttribute('src')||'').replace(/\/s\d+(-c)?\//,'/w640-h360-p-k-no-nu/'):'';
po.innerHTML=postCard({title:title,url:safeUrl(url)||'#',img:/^https?:\/\//.test(src)?src:'',snip:txt.slice(0,150)+(txt.length>150?'…':''),date:tm&&tm.getAttribute('datetime')?new Date(tm.getAttribute('datetime')):new Date(NaN),labels:lab?[lab.textContent.trim()]:[],mins:Math.max(1,Math.round(txt.split(' ').length/200))}).replace(/<span>[^<]*<svg[^>]*><use href="#i-calendar"><\/use><\/svg> Invalid Date<\/span>/,'')});observeReveal(wrap)}
function infinite(wrap){var older=$('#blog-pager-older-link a,a.blog-pager-older-link');if(!older||!('IntersectionObserver' in W))return;var busy=false,pager=older.closest('.blog-pager')||older;
var io=new IntersectionObserver(function(en){if(!en[0].isIntersecting||busy)return;var link=$('#blog-pager-older-link a,a.blog-pager-older-link');if(!link){io.disconnect();return}busy=true;pager.insertAdjacentHTML('beforebegin','<div class="empty-state" id="inf-load">Loading more articles...</div>');
fetch(link.href,{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(html){var doc=new DOMParser().parseFromString(html,'text/html'),posts=doc.querySelectorAll('#Blog1 .post-outer-container'),nl=doc.querySelector('#blog-pager-older-link a,a.blog-pager-older-link');Array.prototype.forEach.call(posts,function(p){wrap.appendChild(D.importNode(p,true))});cardify(wrap);if(nl)link.href=nl.href;else{link.remove();io.disconnect()}}).catch(function(){io.disconnect()}).then(function(){busy=false;var l=byId('inf-load');if(l)l.remove()})},{rootMargin:'400px'});io.observe(pager)}
function highlightCode(code){var src=code.textContent,out='',re=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(\d+(?:\.\d+)?)\b|\b(function|return|var|let|const|if|else|for|while|class|import|from|export|new|this|true|false|null|def|print|public|private|static|void|int|string)\b/g,last=0,m;
while((m=re.exec(src))){out+=esc(src.slice(last,m.index));var cls=m[1]?'tk-c':m[2]?'tk-s':m[3]?'tk-n':'tk-k';out+='<span class="'+cls+'">'+esc(m[0])+'</span>';last=re.lastIndex}code.innerHTML=out+esc(src.slice(last))}
function enhancePost(){if(!D.body.classList.contains('is-post'))return;var post=$('#Blog1 .post'),body=post&&post.querySelector('.post-body');if(!body)return;
var title=post.querySelector('.post-title'),tText=title?title.textContent.trim():D.title,labels=$$('.post-labels a',post).map(function(a){return {n:a.textContent.trim(),u:a.href}});
var words=(body.textContent||'').trim().split(/\s+/).length,mins=Math.max(1,Math.round(words/200)),tm=post.querySelector('time.published,abbr.published,.published'),pub=tm&&(tm.getAttribute('datetime')||tm.getAttribute('title'));
var crumbItems=[['Blog','/search?max-results=9']];if(labels[0])crumbItems.push([labels[0].n,labels[0].u]);crumbItems.push([tText]);
var cb=D.createElement('div');cb.innerHTML=crumbs(crumbItems);var cn=cb.firstChild;cn.style.justifyContent='flex-start';post.insertBefore(cn,post.firstChild);
var meta=D.createElement('div');meta.className='post-meta-x';meta.innerHTML=(labels[0]?'<a class="badge" href="'+esc(labels[0].u)+'">'+esc(labels[0].n)+'</a>':'')+'<span>'+ico('user')+esc(S.author.name)+'</span>'+(pub?'<span>'+ico('calendar')+'Published '+esc(dateStr(new Date(pub)))+'</span>':'')+'<span id="pm-upd" class="hide"></span><span>'+ico('clock')+mins+' min read</span>';
if(title&&title.nextSibling)title.parentNode.insertBefore(meta,title.nextSibling);else body.parentNode.insertBefore(meta,body);
var feedLink=$('link[rel="alternate"][type="application/atom+xml"]');var pid=(post.closest('[data-id]')||post).getAttribute('data-id')||((post.querySelector('a[name]')||{}).name);
if(pid&&/^\d+$/.test(pid))getFeed('/feeds/posts/summary/'+pid+'?alt=json').then(function(j){var up=j.entry&&j.entry.updated&&new Date(j.entry.updated.$t);if(up&&pub&&Math.abs(up-new Date(pub))>864e5){var e=byId('pm-upd');e.innerHTML=ico('reset')+'Updated '+esc(dateStr(up));e.classList.remove('hide')}}).catch(function(){});
var hs=$$('h2,h3',body).filter(function(h){return h.textContent.trim()});
if(hs.length>=2){var used={},items=hs.map(function(h,i){var id=h.id||slugify(h.textContent)||'section-'+i;while(used[id])id+='-'+i;used[id]=1;h.id=id;return '<li class="'+(h.tagName==='H3'?'lv3':'')+'"><a href="#'+id+'">'+esc(h.textContent.trim())+'</a></li>'}).join('');
var toc=D.createElement('details');toc.className='toc';toc.open=true;toc.innerHTML='<summary>'+ico('blog')+'Table of contents</summary><ol>'+items+'</ol>';hs[0].parentNode.insertBefore(toc,hs[0]);
var st=byId('side-toc');if(st){st.innerHTML='<h3 class="title" style="font-size:1rem">On this page</h3><ol>'+items+'</ol>';st.classList.remove('hide')}
if('IntersectionObserver' in W){var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)$$('.toc a,.sticky-toc a').forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})})},{rootMargin:'-80px 0px -70% 0px'});hs.forEach(function(h){io.observe(h)})}}
$$('pre',body).forEach(function(pre){var c=pre.querySelector('code')||pre;highlightCode(c);var b=D.createElement('button');b.type='button';b.className='code-copy';b.textContent='Copy';b.addEventListener('click',function(){copyText(c.textContent,'Code copied')});pre.appendChild(b)});
$$('img',body).forEach(function(im){im.loading='lazy';im.decoding='async';if(!im.alt)im.alt=tText;var a=im.closest('a');im.addEventListener('click',function(e){var src=a&&/\.(jpe?g|png|gif|webp)|googleusercontent|bp\.blogspot/i.test(a.href)?a.href:im.src;e.preventDefault();byId('lightbox-img').src=src;byId('lightbox-img').alt=im.alt;byId('lightbox').classList.add('open')})});
$$('iframe',body).forEach(function(f){if(/youtube|vimeo|dailymotion/.test(f.src)&&!f.parentNode.classList.contains('video-wrap')){var w=D.createElement('div');w.className='video-wrap';f.parentNode.insertBefore(w,f);w.appendChild(f);f.loading='lazy'}});
var ads=$$('.ad-widget[data-origin="ad-content"]').filter(adShown);if(ads.length){var ps=$$(':scope > p, :scope > div',body);var target=ps[2]||ps[ps.length-1];if(target){var slot=D.createElement('div');slot.className='ad-slot';slot.innerHTML='<span class="ad-label">Advertisement</span>';ads.forEach(function(w){slot.appendChild(w)});target.parentNode.insertBefore(slot,target.nextSibling)}}
var url=location.href.split('#')[0].split('?')[0],extra=D.createElement('div');extra.className='post-extra';
extra.innerHTML='<div><h3 style="font-size:1.05rem">Share this article</h3>'+shareRow(url,tText,true)+'</div><div class="author-box"><span class="avatar">'+(safeUrl(S.author.avatar)?'<img alt="'+esc(S.author.name)+'" src="'+esc(S.author.avatar)+'">':esc(S.author.name.split(' ').map(function(x){return x.charAt(0)}).join('').slice(0,2)))+'</span><div><b>'+esc(S.author.name)+'</b><div class="muted" style="font-size:.88rem">'+esc(S.author.bio)+'</div></div></div><div class="banner" style="padding:28px"><h3 style="font-size:1.25rem">'+esc(S.newsletter.title)+'</h3><p>'+esc(S.newsletter.text)+'</p><form class="nl-form" data-nl="1" novalidate><input aria-label="Email address" type="email" placeholder="you@example.com"><button class="btn btn-white" type="submit">'+esc(S.newsletter.button)+'</button></form></div>'+(labels.length?'<div><h3 style="font-size:1.1rem">Related articles</h3><div class="grid g2" id="rel-posts"></div></div>':'')+'<div><h3 style="font-size:1.1rem">Free tools you might like</h3><div class="grid gmini">'+S.featuredTools.slice(0,4).map(toolBySlug).filter(Boolean).map(miniCard).join('')+'</div></div>';
body.parentNode.insertBefore(extra,body.nextSibling);if(labels.length)loadPosts(byId('rel-posts'),4,labels[0].n,url);observeReveal(extra);
var fi=body.querySelector('img');ld({'@context':'https://schema.org','@type':'BlogPosting',headline:tText.slice(0,110),image:fi?[fi.src]:undefined,datePublished:pub||undefined,author:{'@type':'Person',name:S.author.name},publisher:{'@type':'Organization',name:S.siteName},mainEntityOfPage:url,wordCount:words,keywords:labels.map(function(l){return l.n}).join(', ')},'article');
ld(crumbLD(crumbItems.slice(0,-1).map(function(c){return [c[0],new URL(c[1],location.href).href]}).concat([[tText,url]])),'crumbs')}
function enhanceError(){if(!D.body.classList.contains('is-error')||D.body.classList.contains('routed'))return;byId('nf-title').textContent=S.notFound.title;byId('nf-text').textContent=S.notFound.text;byId('nf-tools').innerHTML=S.featuredTools.slice(0,4).map(toolBySlug).filter(Boolean).map(toolCard).join('');observeReveal(byId('nf'))}

/* ---------- 19. GLOBAL UI: THEME, FONTS, BARS, ADS, FLOATING ---------- */
function applyThemeIcons(){var dark=D.documentElement.getAttribute('data-theme')==='dark';$$('.theme-toggle use').forEach(function(u){u.setAttribute('href',dark?'#i-sun':'#i-moon')});$$('.theme-toggle-text').forEach(function(b){b.textContent=dark?'Switch to Light Mode':'Switch to Dark Mode'});metaTag('name','theme-color',dark?'#0B1220':'#2563EB')}
function setTheme(t,save){var h=D.documentElement;h.classList.add('theme-anim');h.setAttribute('data-theme',t);if(save)try{localStorage.setItem('fuh-theme',t)}catch(e){}applyThemeIcons();setTimeout(function(){h.classList.remove('theme-anim')},420)}
function toggleTheme(){setTheme(D.documentElement.getAttribute('data-theme')==='dark'?'light':'dark',true)}
function initTheme(){if(S.features.darkMode===false){setTheme('light',false);$$('.theme-toggle,.theme-toggle-text').forEach(function(b){b.classList.add('hide')});return}
applyThemeIcons();if(W.matchMedia){var mq=W.matchMedia('(prefers-color-scheme: dark)'),fn=function(e){var saved=null;try{saved=localStorage.getItem('fuh-theme')}catch(x){}if(!saved)setTheme(e.matches?'dark':'light',false)};if(mq.addEventListener)mq.addEventListener('change',fn);else if(mq.addListener)mq.addListener(fn)}}
function applyFonts(){var f=S.fonts||{},have=['Poppins','Inter','Manrope','Outfit'],need=[];[['heading','--fh'],['body','--fb']].forEach(function(p){var n=String(f[p[0]]||'').replace(/[^A-Za-z0-9 ]/g,'').trim();if(!n)return;D.documentElement.style.setProperty(p[1],"'"+n+"',system-ui,sans-serif");if(have.indexOf(n)<0&&need.indexOf(n)<0)need.push(n)});
if(need.length){var l=D.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?'+need.map(function(n){return 'family='+n.replace(/ /g,'+')+':wght@400;500;600;700;800'}).join('&')+'&display=swap';D.head.appendChild(l)}}
function initBars(){var dismissed=store('fuh-bars')||[];
function bar(id,cfg,key){var el=byId(id);if(!el||!cfg||!cfg.enabled||!cfg.text)return;var k=key+':'+cfg.text;if(dismissed.indexOf(k)>-1)return;var u=safeUrl(cfg.url);el.innerHTML='<span>'+esc(cfg.text)+'</span>'+(u&&cfg.linkText?'<a href="'+esc(u)+'">'+esc(cfg.linkText)+'</a>':'')+'<button type="button" class="bar-x" aria-label="Dismiss">'+ico('x','ico-sm')+'</button>';el.classList.remove('hide');el.querySelector('.bar-x').addEventListener('click',function(){el.classList.add('hide');dismissed.push(k);store('fuh-bars',dismissed.slice(-10))})}
bar('holiday',S.holiday,'h');bar('announce',S.announcement,'a')}
function adPh(a){var sz=a.getAttribute('data-size')||'',m=sz.match(/^(\d+)x(\d+)$/),w=m?+m[1]:0,h=m?+m[2]:110,net=esc(a.getAttribute('data-net')||'Ad'),dim=m?m[1]+'×'+m[2]:(sz==='responsive'?'Responsive':'Native banner'),t=esc(a.getAttribute('data-title')||'the ad widget');
return '<div class="ad-ph'+(h<80?' sm':'')+'" style="max-width:'+(w?w+'px':'100%')+';height:'+h+'px" title="Paste your code in Layout → '+t+'"><b>AD SPACE</b><span>'+net+' · '+dim+'</span>'+(h<80?'':'<small>Blogger → Layout → '+t+'</small>')+'</div>'}
function initAds(){var on=!!S.features.ads,ph=S.features.adPlaceholders!==false;D.body.classList.add(on?'ads-on':'ads-off');if(ph)D.body.classList.add('ads-ph');
$$('.ad-inner').forEach(function(a){var w=a.closest('.widget');if(!w)return;w.classList.add('ad-widget');var sec=w.closest('.section');if(sec)w.setAttribute('data-origin',sec.id);
if(a.innerHTML.trim())w.classList.add('ad-live');else if(ph&&a.getAttribute('data-ph')==='1'){w.classList.add('ad-placeholder');a.innerHTML=adPh(a)}else w.classList.add('ad-empty')});
$$('.ad-placeholder').forEach(function(w){var sec=w.parentNode;if(on&&sec&&sec.querySelector('.ad-live'))w.classList.add('ad-empty')});
(function(){var st=$$('#ad-sticky .ad-placeholder:not(.ad-empty)');st.slice(1).forEach(function(w){w.classList.add('ad-empty')})})();
$$('.section.ad-slot').forEach(function(sec){if(!$$('.ad-widget',sec).some(adShown))sec.classList.add('hide')});
var sticky=byId('ad-sticky'),box=byId('sticky-ad'),closed=false;try{closed=sessionStorage.getItem('fuh-sticky-ad')==='1'}catch(e){}
if(sticky&&box&&!closed&&$$('.ad-widget',sticky).some(adShown)){box.classList.add('has');D.body.classList.add('body-sticky-ad')}
if(!on)return;var cl=String(S.adsenseClient||'').trim();if(/^ca-pub-\d+$/.test(cl)&&!$('script[src*="adsbygoogle.js"]')){var s=D.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+cl;D.head.appendChild(s)}
}
function initFloating(){var f=S.features;
if(f.floatingShare!==false)byId('fab-share').classList.remove('hide');
var tg=safeUrl(S.telegramUrl);if(f.telegram!==false&&tg&&tg!=='https://t.me/'){var a=byId('fab-tg');a.href=tg;a.classList.remove('hide')}
var wa=String(S.whatsappNumber||'').replace(/\D/g,'');if(f.whatsapp!==false&&wa){var b=byId('fab-wa');b.href='https://wa.me/'+wa+'?text='+encodeURIComponent('Hi! I found you on '+S.siteName+': '+location.href);b.classList.remove('hide')}
if(f.backToTop===false){byId('fab-top').classList.add('hide');$$('.ftr-bottom [data-act="top"]').forEach(function(x){x.classList.add('hide')})}
if(f.bottomNav!==false)D.body.classList.add('has-bnav');else byId('bottom-nav').classList.add('hide');
if(f.cookieBanner!==false&&!store('fuh-cookie')){byId('cookie-text').textContent=S.cookieText;setTimeout(function(){byId('cookie').classList.add('show')},1200)}
if(f.popup){var seen=false;try{seen=sessionStorage.getItem('fuh-popup')==='1'}catch(e){}if(!seen)setTimeout(function(){if($('.modal.open')||byId('search-pop').classList.contains('open'))return;try{sessionStorage.setItem('fuh-popup','1')}catch(e){}openModal(S.popup.title,S.popup.text,S.popup.button)},8000)}}
function onScroll(){var y=W.scrollY||D.documentElement.scrollTop,h=byId('hdr');if(h)h.classList.toggle('scrolled',y>10);byId('fab-top').classList.toggle('show',y>500);
var p=byId('progress');if(!p)return;var target=S.features.readingProgress!==false&&D.body.classList.contains('is-post')&&!D.body.classList.contains('routed')?$('#Blog1 .post'):null,pct;
if(target){var r=target.getBoundingClientRect(),tot=r.height-W.innerHeight;pct=tot>0?Math.min(100,Math.max(0,-r.top/tot*100)):100}else{var dh=D.documentElement.scrollHeight-W.innerHeight;pct=dh>0?y/dh*100:0}p.style.width=pct.toFixed(2)+'%'}
function hideLoader(){var l=byId('loader');if(l)l.classList.add('hide-l')}

/* ---------- 20. EVENTS ---------- */
function closeDrawer(){var d=byId('drawer');d.classList.remove('open');d.setAttribute('aria-hidden','true');$$('[data-act="menu"]').forEach(function(b){b.setAttribute('aria-expanded','false')});if(!$('.modal.open')&&!byId('search-pop').classList.contains('open'))D.body.classList.remove('no-scroll')}
function openDrawer(){var d=byId('drawer');d.classList.add('open');d.setAttribute('aria-hidden','false');D.body.classList.add('no-scroll');$$('[data-act="menu"]').forEach(function(b){b.setAttribute('aria-expanded','true')});var f=d.querySelector('.drawer-body a');if(f)setTimeout(function(){f.focus()},80)}
function closeDropdowns(except){$$('.dd.open').forEach(function(d){if(d!==except){d.classList.remove('open');var b=d.querySelector('button');if(b)b.setAttribute('aria-expanded','false')}})}
function closeAll(){closeDrawer();closeSearch();closeModals();closeDropdowns();byId('lightbox').classList.remove('open')}
function bindEvents(){
D.addEventListener('click',function(e){var t=e.target;
var spa=t.closest('a[data-spa]');if(spa&&!e.defaultPrevented&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&e.button===0&&!spa.target){if(t.closest('.sr-item'))saveSearch(byId('search-input').value);if(D.body.classList.contains('is-home')){var u=new URL(spa.href,location.href);if(u.origin===location.origin&&u.pathname==='/'&&(u.search===''||/^\?(tool|category|page)=/.test(u.search))){e.preventDefault();closeAll();if(u.href===location.href&&!u.search){W.scrollTo({top:0,behavior:'smooth'});return}history.pushState({},'',u.href);if(!u.search)goHome();else if(!renderRoute(getRoute()))location.href=u.href;return}}closeAll();return}
if(t.closest('.sr-item')){saveSearch(byId('search-input').value);return}
var fav=t.closest('[data-fav]');if(fav){e.preventDefault();e.stopPropagation();toggleFav(fav.getAttribute('data-fav'));return}
var tb=t.closest('[data-tool]');if(tb){toolAction(tb.getAttribute('data-tool'));return}
var sq=t.closest('[data-search]');if(sq){openSearch(sq.getAttribute('data-search'));return}
var fq=t.closest('.faq-q');if(fq){var it=fq.parentNode,open=!it.classList.contains('open');it.classList.toggle('open',open);fq.setAttribute('aria-expanded',String(open));return}
var ac=t.closest('.acc>button');if(ac){var ai=ac.parentNode;ai.classList.toggle('open');ac.setAttribute('aria-expanded',String(ai.classList.contains('open')));return}
var su=t.closest('[data-share-url]');if(su){sharePage(su.getAttribute('data-share-title'),'',su.getAttribute('data-share-url'));return}
var cu=t.closest('[data-copy-url]');if(cu){copyText(cu.getAttribute('data-copy-url'),'Link copied to clipboard');return}
var rt=t.closest('[data-rate]');if(rt){fbRating=+rt.getAttribute('data-rate');$$('#fb-rate button').forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-rate')<=fbRating)});return}
var ddb=t.closest('.dd>button');if(ddb){var dd=ddb.parentNode,o=!dd.classList.contains('open');closeDropdowns(dd);dd.classList.toggle('open',o);ddb.setAttribute('aria-expanded',String(o));return}
if(!t.closest('.dd'))closeDropdowns();
var a=t.closest('[data-act]');if(!a)return;var act=a.getAttribute('data-act');
if(act==='close-lightbox'&&t.closest('#lightbox img'))return;
switch(act){
case 'search':openSearch('');break;case 'close-search':closeSearch();break;case 'theme':toggleTheme();break;
case 'menu':openDrawer();break;case 'close-drawer':closeDrawer();break;case 'close-modal':closeModals();break;
case 'feedback':openFeedback();break;
case 'send-feedback':var msg=byId('fb-text').value.trim();if(!fbRating&&!msg){toast('Add a rating or a comment first','warn');return}W.location.href='mailto:'+encodeURIComponent(S.contact.email)+'?subject='+encodeURIComponent('Feedback: '+(CURRENT?CURRENT.tool.name:D.title))+'&body='+encodeURIComponent('Rating: '+(fbRating?fbRating+'/5':'n/a')+'\nPage: '+location.href+'\n\n'+msg);closeModals();toast('Thanks for your feedback!','ok');break;
case 'top':W.scrollTo({top:0,behavior:'smooth'});break;
case 'share-page':sharePage(D.title,'',location.href);break;
case 'cookie-accept':store('fuh-cookie','accepted');byId('cookie').classList.remove('show');toast('Preferences saved','ok');break;
case 'cookie-decline':store('fuh-cookie','declined');byId('cookie').classList.remove('show');toast('Only essential storage will be used');break;
case 'close-lightbox':byId('lightbox').classList.remove('open');break;
case 'close-sticky-ad':byId('sticky-ad').classList.remove('has');D.body.classList.remove('body-sticky-ad');try{sessionStorage.setItem('fuh-sticky-ad','1')}catch(x){}break;
case 't-prev':if(W.FUH_T)W.FUH_T.prev();break;case 't-next':if(W.FUH_T)W.FUH_T.next();break;
case 'clear-recent':store('fuh-recent',[]);store('fuh-usage',{});toast('History cleared');renderRoute(getRoute(),true);break;
case 'clear-rs':store('fuh-rs',[]);runSearch();break}});
D.addEventListener('submit',function(e){var f=e.target;if(!f.matches||!f.matches('[data-nl]'))return;e.preventDefault();var inp=f.querySelector('input[type=email]'),v=(inp&&inp.value||'').trim();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){if(inp){inp.classList.add('bad');inp.focus()}toast('Please enter a valid email address','err');return}inp.classList.remove('bad');
var act=safeUrl(S.newsletter.action);if(/^https:\/\//.test(act)){var form=D.createElement('form');form.method='POST';form.action=act;form.target='_blank';var h=D.createElement('input');h.type='hidden';h.name=String(S.newsletter.field||'EMAIL');h.value=v;form.appendChild(h);D.body.appendChild(form);form.submit();form.remove();toast('Thanks for subscribing!','ok')}else toast('Thanks! Newsletter sign-ups open soon.','ok');f.reset()});
D.addEventListener('keydown',function(e){var tag=(e.target.tagName||'').toLowerCase(),typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
if((e.key==='k'||e.key==='K')&&(e.ctrlKey||e.metaKey)){e.preventDefault();openSearch('');return}
if(e.key==='/'&&!typing){e.preventDefault();openSearch('');return}
if(e.key==='Escape'){closeAll();return}
if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.hero-search[role=button]')){e.preventDefault();openSearch('');return}
if(e.target.id==='search-input'){var items=$$('#search-results .sr-item');if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;SEARCH.active=(SEARCH.active+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach(function(x,i){x.classList.toggle('active',i===SEARCH.active)});items[SEARCH.active].scrollIntoView({block:'nearest'})}
else if(e.key==='Enter'){var go=items[SEARCH.active]||items[0];saveSearch(e.target.value);if(go){e.preventDefault();go.click()}else if(e.target.value.trim()){location.href='/search?q='+encodeURIComponent(e.target.value.trim())}}}});
byId('search-input').addEventListener('input',debounce(runSearch,90));
byId('search-pop').addEventListener('click',function(e){if(e.target===this)closeSearch()});
$$('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)closeModals()})});
D.addEventListener('pointerdown',function(e){var b=e.target.closest('.btn,.icon-btn,.keypad button,.fab');if(!b||W.matchMedia('(prefers-reduced-motion: reduce)').matches)return;var r=b.getBoundingClientRect(),s=Math.max(r.width,r.height),sp=D.createElement('span');sp.className='ripple';sp.style.width=sp.style.height=s+'px';sp.style.left=(e.clientX-r.left-s/2)+'px';sp.style.top=(e.clientY-r.top-s/2)+'px';b.appendChild(sp);setTimeout(function(){sp.remove()},650)});
var ticking=false;W.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(function(){onScroll();ticking=false})}},{passive:true});
W.addEventListener('popstate',function(){if(!D.body.classList.contains('is-home'))return;var r=getRoute();if(r){if(!renderRoute(r,true))location.reload()}else goHome()});
}

/* ---------- 20b. HEADINGS: exactly one H1 per page (SEO) ---------- */
function swapTag(el,tag){var n=D.createElement(tag);Array.prototype.forEach.call(el.attributes,function(a){n.setAttribute(a.name,a.value)});n.innerHTML=el.innerHTML;el.parentNode.replaceChild(n,el);return n}
function fixHeadings(){
$$('.brand-sec h1,.brand-sec h2').forEach(function(h){var d=swapTag(h,'div');d.classList.add('title')});
if(D.body.classList.contains('is-item')){var t=$('#Blog1 .post-title');if(t&&t.tagName!=='H1')swapTag(t,'h1')}
$$('#Blog1 .post-body h1').forEach(function(h){swapTag(h,'h2')});
}
/* ---------- 21. INIT ---------- */
function init(){
try{fixHeadings()}catch(e){}
try{
if(S.layout&&S.layout.sidebar==='left')D.body.classList.add('sb-left');else if(S.layout&&S.layout.sidebar==='none')D.body.classList.add('sb-none');
applyFonts();initTheme();initBars();initAds();wireRouteLinks(D);renderMenus();
if(D.body.classList.contains('is-home'))HOME_META={title:D.title,desc:($('meta[name="description"]')||{}).content||S.tagline};
if(byId('home'))renderHome();
if(S.usePageUrls&&location.pathname==='/'&&location.search){var q0=new URLSearchParams(location.search),t0=q0.get('tool'),c0=q0.get('category'),p0=q0.get('page'),d0=t0?href('tool',t0):c0?href('category',c0):p0?href('page',p0):'';if(d0&&d0.indexOf('/p/')===0){location.replace(d0);return}}
var r=getRoute(),routed=r?renderRoute(r,true):false;
if(!routed){enhanceList();enhancePost();enhanceError();setBottomNav(null)}
bindEvents();initFloating();observeReveal(D);animateCounters(D);onScroll();
}catch(err){if(W.console)console.error('FUH init error',err)}
if(S.features.loader===false)hideLoader();else if(D.readyState==='complete')setTimeout(hideLoader,150);else W.addEventListener('load',function(){setTimeout(hideLoader,150)});setTimeout(hideLoader,2500);
W.FUH={version:'1.0.0',settings:S,tools:TOOLS,categories:CATS,toast:toast,openSearch:openSearch};
}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init);else init();
})();
