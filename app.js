(function(){
const S=window.STUDY, NS='http://www.w3.org/2000/svg';
const hm=s=>{const p=s.split(':').map(Number);return p[0]+p[1]/60+(p[2]||0)/3600;};
const fmt=h=>{let s=Math.round(h*3600),H=Math.floor(s/3600),M=Math.floor(s%3600/60),x=s%60;return String(H).padStart(2,'0')+':'+String(M).padStart(2,'0')+(x?':'+String(x).padStart(2,'0'):'');};
function tideAt(g,h){const t=S.curve.t,v=S.curve[g];for(let i=1;i<t.length;i++)if(t[i]>=h){const f=(h-t[i-1])/(t[i]-t[i-1]);return v[i-1]+f*(v[i]-v[i-1]);}return NaN;}
// frames: read clocks + interpolated
const read=S.frames.map(f=>({n:f.n,bst:hm(f.bst),gauge:f.gauge,astro:f.astro,best:f.best,today:f.today,geo:f.geo,interp:false}));
const all=read.slice();
S.extra.forEach(g=>{const lo=read.filter(r=>r.n<g.n).pop(),hi=read.find(r=>r.n>g.n);const b=lo.bst+(hi.bst-lo.bst)*(g.n-lo.n)/(hi.n-lo.n);const gg=g.n<100?'ilf':'ply';const a=tideAt(gg,b);
 all.push({n:g.n,bst:b,gauge:g.n<100?'Ilfracombe':'Devonport',astro:+a.toFixed(2),best:+(a-0.17).toFixed(2),today:+(a+0.20).toFixed(2),geo:g,interp:true});});
all.sort((a,b)=>a.n-b.n);
const label=f=>`Frame ${f.n}: ${f.interp?'≈':''}${fmt(f.bst+1)} German clock (CEST) = ${f.interp?'≈':''}${fmt(f.bst)} BST`;
// map
const map=L.map('map',{zoomControl:true}).setView([51.12,-4.22],13);
const base={
 osm:L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}),
 eox:L.tileLayer('https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg',{maxZoom:17,attribution:'<a href="https://s2maps.eu" target="_blank" rel="noopener noreferrer">Sentinel-2 cloudless 2016 by EOX</a> (CC BY 4.0; contains modified Copernicus Sentinel data 2016)'}),
 s2t:L.layerGroup([L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,opacity:.5,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}),
   L.imageOverlay('img/s2_north.webp',S.s2.north,{attribution:'Contains modified Copernicus Sentinel data 2018'}),L.imageOverlay('img/s2_south.webp',S.s2.south)])};
let cur=base.s2t.addTo(map);
document.querySelectorAll('input[name=base]').forEach(r=>r.onchange=()=>{map.removeLayer(cur);cur=base[r.value].addTo(map);});
map.attributionControl.addAttribution('1940 photos: <a href="https://catalog.archives.gov/id/214920619" target="_blank" rel="noopener noreferrer">U.S. National Archives, RG 373</a> · LiDAR © Environment Agency (OGL)');
map.createPane('p1940').style.zIndex=410;
const pane=map.getPane('p1940');
const photos=all.filter(f=>f.geo).sort((a,b)=>(a.geo.tps?1:0)-(b.geo.tps?1:0)).map(f=>L.imageOverlay('img/f'+f.n+'.webp',f.geo.bounds,{pane:'p1940',opacity:.85}).addTo(map));
document.getElementById('op').oninput=e=>photos.forEach(p=>p.setOpacity(e.target.value/100));
const swEl=document.getElementById('sw');
function clip(){const p=swEl.value/100,nw=map.containerPointToLayerPoint([0,0]),se=map.containerPointToLayerPoint(map.getSize());const x=nw.x+(se.x-nw.x)*p;pane.style.clip=p>=1?'auto':`rect(${nw.y}px, ${x}px, ${se.y}px, ${nw.x}px)`;}
swEl.oninput=clip;map.on('move zoom moveend zoomend',clip);
// footprints
const fpG=L.layerGroup().addTo(map),fpL={};
all.filter(f=>f.geo).forEach(f=>{const pg=L.polygon(f.geo.foot.map(p=>[p[1],p[0]]),{color:'#fff',weight:1.5,dashArray:'4 4',fill:true,fillOpacity:0,interactive:true}).bindTooltip(label(f),{sticky:true,className:'ft'}).on('click',()=>show(f));pg.addTo(fpG);fpL[f.n]=pg;});
document.getElementById('fp').onchange=e=>e.target.checked?fpG.addTo(map):map.removeLayer(fpG);
const go={north:[[51.07,-4.26],[51.19,-4.17]],south:[[50.28,-4.25],[50.40,-4.13]]};
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>map.fitBounds(go[b.dataset.go]));
const q=new URLSearchParams(location.search);if(q.get('v')){const v=q.get('v').split(',').map(Number);map.setView([v[0],v[1]],v[2],{animate:false});}else map.fitBounds(go.north);if(q.get('sw'))swEl.value=q.get('sw');setTimeout(clip,500);
function show(f){document.getElementById('framecard').innerHTML=`<b>${label(f)}</b><br>Gauge model: ${f.gauge}${f.interp?' · time interpolated between neighbouring clock readings':''}<br>
Astronomical tide (1940 sea level): <b>${f.astro.toFixed(2)} m</b><br>Best 1940 estimate incl. −0.17 m surge: <b>${f.best.toFixed(2)} m ODN</b><br>Same tide today (+0.20 m sea level): <b>${f.today.toFixed(2)} m ODN</b>${f.geo?'':'<br><i>Not georeferenced; not on the map.</i>'}
<br><a href="https://catalog.archives.gov/id/214920619" target="_blank" rel="noopener noreferrer">Original at NARA</a>`;
 if(f.geo){map.fitBounds(f.geo.bounds);document.getElementById('map').scrollIntoView({behavior:'smooth',block:'nearest'});Object.values(fpL).forEach(p=>p.setStyle({color:'#fff',weight:1.5}));fpL[f.n].setStyle({color:'#ff7a00',weight:3});}hl(f.n);}
// svg helpers
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;}
function axes(svg,W,H,m,xs,ys,xt,yt,xf,yf,xl,yl){yt.forEach(v=>{el('line',{x1:m.l,x2:W-m.r,y1:ys(v),y2:ys(v),stroke:'#e5e5e5'},svg);el('text',{x:m.l-4,y:ys(v)+3,'text-anchor':'end','font-size':10,fill:'#555'},svg).textContent=yf(v);});
 xt.forEach(v=>{el('text',{x:xs(v),y:H-m.b+13,'text-anchor':'middle','font-size':10,fill:'#555'},svg).textContent=xf(v);});
 el('text',{x:(m.l+W-m.r)/2,y:H-2,'text-anchor':'middle','font-size':10,fill:'#333'},svg).textContent=xl;
 el('text',{x:10,y:(m.t+H-m.b)/2,'text-anchor':'middle','font-size':10,fill:'#333',transform:`rotate(-90 10 ${(m.t+H-m.b)/2})`},svg).textContent=yl;}
// tide chart
let dots={};
(function(){const W=460,H=250,m={l:40,r:10,t:10,b:32},x0=6,x1=18,y0=-3.5,y1=4;const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Tide curves'},document.getElementById('tide'));
 const xs=v=>m.l+(v-x0)/(x1-x0)*(W-m.l-m.r),ys=v=>m.t+(y1-v)/(y1-y0)*(H-m.t-m.b);
 axes(svg,W,H,m,xs,ys,[6,8,10,12,14,16,18],[-3,-2,-1,0,1,2,3,4],v=>String(v).padStart(2,'0')+':00',v=>v,'BST, 31 Aug 1940','m ODN');
 el('rect',{x:xs(12.3),y:m.t,width:xs(13)-xs(12.3),height:H-m.t-m.b,fill:'#fff3d6'},svg);
 [['ilf','#1d6fb8','Ilfracombe (north coast)'],['ply','#2a9d58','Devonport (south coast)']].forEach(([k,c,n],i)=>{let d='';S.curve.t.forEach((t,j)=>{if(t>=x0&&t<=x1)d+=(d?'L':'M')+xs(t).toFixed(1)+','+ys(S.curve[k][j]).toFixed(1);});el('path',{d,fill:'none',stroke:c,'stroke-width':2},svg);
  el('text',{x:W-m.r-4,y:m.t+12+i*13,'text-anchor':'end','font-size':10,fill:c},svg).textContent=n;});
 all.forEach(f=>{const g=f.n<100?'ilf':'ply';const c=el('circle',{cx:xs(f.bst),cy:ys(f.astro),r:4,fill:f.interp?'#fff':'#e3262b',stroke:'#e3262b','stroke-width':1.5,style:'cursor:pointer'},svg);
  el('title',{},c).textContent=label(f)+' · '+f.astro.toFixed(2)+' m';c.onclick=()=>show(f);dots[f.n]=c;});
 el('text',{x:xs(12.65),y:H-m.b-4,'text-anchor':'middle','font-size':9,fill:'#a06b00'},svg).textContent='photos';})();
function hl(n){Object.entries(dots).forEach(([k,c])=>c.setAttribute('r',+k===n?7:4));}
// series chart
(function(){const W=460,H=260,m={l:40,r:10,t:10,b:32},x0=1938,x1=2028,y0=-0.9,y1=0.9;const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':'Waterline timeline'},document.getElementById('series'));
 const xs=v=>m.l+(v-x0)/(x1-x0)*(W-m.l-m.r),ys=v=>m.t+(y1-v)/(y1-y0)*(H-m.t-m.b);
 axes(svg,W,H,m,xs,ys,[1940,1960,1980,2000,2020],[-0.8,-0.4,0,0.4,0.8],String,v=>v.toFixed(1),'Year','waterline − tide (m)');
 el('line',{x1:m.l,x2:W-m.r,y1:ys(0),y2:ys(0),stroke:'#888'},svg);
 const st={'woolacombe|S2':['#1d6fb8','c'],'woolacombe|Landsat':['#1d6fb8','s'],'saunton|S2':['#2a9d58','c'],'saunton|Landsat':['#2a9d58','s']};
 S.series.forEach(r=>{const [c,sh]=st[r.site+'|'+r.kind],x=xs(r.yr),y=ys(r.res);const e=sh==='c'?el('circle',{cx:x,cy:y,r:3,fill:c,'fill-opacity':.7},svg):el('rect',{x:x-2.6,y:y-2.6,width:5.2,height:5.2,fill:'none',stroke:c},svg);
  el('title',{},e).textContent=`${r.site} ${r.kind} ${r.utc} UTC, tide ${r.tide} m, residual ${r.res.toFixed(2)} m`;});
 S.w1940.forEach(v=>{el('text',{x:xs(1940.7),y:ys(v)+4,'text-anchor':'middle','font-size':13,fill:'#e3262b'},svg).textContent='★';});
 [['● Sentinel-2','#333'],['□ Landsat','#333'],['Woolacombe','#1d6fb8'],['Saunton','#2a9d58'],['★ 1940 photo','#e3262b']].forEach(([t,c],i)=>el('text',{x:m.l+6+i*80,y:m.t+10,'font-size':10,fill:c},svg).textContent=t);})();
document.getElementById('stats').innerHTML=`<table><tr><th>Site</th><th>Median (IQR)</th><th>Trend 1985–2026</th></tr>
<tr><td>Woolacombe</td><td>−0.16 (−0.32 to 0.00) m</td><td>−2.4 ± 3.7 mm/yr</td></tr><tr><td>Saunton</td><td>−0.02 (−0.14 to +0.22) m</td><td>−5.1 ± 3.7 mm/yr</td></tr>
<tr><td>Woolacombe 1940 (frame 78, re-fitted)</td><td>−0.19 (−0.41 to +0.15) m</td><td>north end of the beach only</td></tr></table><p class="cap">No measurable trend: a real rise of about 3 mm/yr is swamped by waves, beach changes and 10–30 m pixels.</p>`;
})();
