import * as k from '../vendor/anatomy/iso-kit.mjs';

export const STYLES = ['stroke', 'two-tone', 'duotone', 'fill', 'color'];
export const PALETTE = {
  neutral: ['#F4F6FA', '#D8E0EC', '#B8C5D8'],
  blue: ['#7BD4FF', '#00A3FF', '#1479C9'],
  purple: ['#D7C6FF', '#A58BEF', '#7861BD'],
  teal: ['#9FE8DA', '#47C5B3', '#269A90'],
  coral: ['#FFC6B4', '#F48C76', '#D4655F'],
  ink: ['#53627A', '#36465E', '#24344D'],
  white: ['#FFFFFF', '#F2F5FA', '#DEE6EF'],
};
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const n = x => Math.round(x * 100) / 100;
const mix = (a,b,t) => {
  const c = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  return '#'+c(a).map((v,i)=>Math.round(v*(1-t)+c(b)[i]*t).toString(16).padStart(2,'0')).join('');
};
function material(name, style) {
  const accent = !['neutral','white','ink'].includes(name);
  if(style === 'stroke') return ['#FFFFFF','#FFFFFF','#FFFFFF'];
  if(style === 'two-tone') return accent ? ['#A8DFFF','#A8DFFF','#A8DFFF'] : ['#FFFFFF','#FFFFFF','#FFFFFF'];
  if(style === 'duotone') return accent ? ['#B9A7F7','#9982E3','#7863BD'] : ['#F2EDFF','#E3DBF7','#C8BAE8'];
  if(style === 'fill') return ({
    neutral:['#53627A','#36465E','#24344D'],
    blue:['#94A3B8','#7E8FA7','#63758F'],
    purple:['#C4CCDA','#A4B1C6','#8496B0'],
    teal:['#DFE4ED','#BEC9D9','#96A7BE'],
    coral:['#B7C3D7','#8EA2BD','#6D839F'],
    ink:['#34445E','#24344D','#142237'],
    white:['#F0F3F8','#D3DCE8','#BBC9DA'],
  })[name] || ['#53627A','#36465E','#24344D'];
  return PALETTE[name] || PALETTE.neutral;
}
function lineColor(name,style) {
  if(style==='stroke'||style==='two-tone') return '#273449';
  if(style==='duotone') return name==='white'?'#FFFFFF':'#59478C';
  if(style==='fill') return name==='white'?'#FFFFFF':'#697C97';
  return name==='ink'?'#33445E':name==='neutral'?'#8899B1':name==='white'?'#FFFFFF':(PALETTE[name]||PALETTE.blue)[2];
}
const outline = style => style==='duotone'?'#59478C':'#273449';
const path = (d,fill='none',stroke='none',width=1.6) => d ? `<path d="${d}" fill="${fill}"${stroke!=='none'?` stroke="${stroke}" stroke-width="${width}"`:''}/>`:'';

/** A small retained scene: geometry is authored once, then exported in every style. */
export class Scene {
  constructor() { this.items=[]; this.points=[]; }
  add(type,data,points) { this.items.push({type,...data}); this.points.push(...points); }
  box(x,y,z,w,d,h,mat='neutral',r=2) {
    const plan={x,y,w,d,r}; this.add('box',{plan,z,h,mat},k.boxCorners(plan,z,z+h));
  }
  cylinder(x,y,z,r,h,mat='neutral') {
    this.add('cylinder',{x,y,z,r,h,mat},k.circleRing(x,y,r,32).flatMap(([a,b])=>[[a,b,z],[a,b,z+h]]));
  }
  line(points,mat='ink',width=1.8,closed=false) { this.add('line',{points,mat,width,closed},points); }
  poly(points,mat='blue') { this.add('poly',{points,mat},points); }
  // Flat, inked emblems retain their silhouette across every material style.
  mark(points,mat='ink') { this.add('mark',{points,mat},points); }
  // Flat material inlays provide clean negative space without extra outlines.
  inlay(points,mat='white') { this.add('inlay',{points,mat},points); }
  logo(logo, origin, u, v) {
    const [x,y,w,h]=logo.viewBox;
    const at=(a,b)=>origin.map((value,i)=>value+u[i]*a+v[i]*b);
    this.add('logo',{logo,origin,u,v},[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([a,b])=>at(a,b)));
  }
  dot(point,r=1.8,mat='blue') { this.add('dot',{point,r,mat},[point]); }
  ring(x,y,z,r,mat='ink',width=1.8) { this.line(k.circleRing(x,y,r,48).map(([a,b])=>[a,b,z]),mat,width,true); }
  panel(x,y,z,w,h,mat='neutral') {
    // A rounded vertical face, extruded backwards by four world units.
    const pts=k.roundedPlan({x,y:z,w,d:h,r:3},6).map(([a,b])=>[a,y,b]);
    this.add('panel',{points:pts,mat},pts.flatMap(p=>[p,[p[0],p[1]-4,p[2]]]));
  }
  render(style='color', label='AI systems icon') {
    if(!STYLES.includes(style)) throw new Error(`Unknown style: ${style}`);
    if(!this.points.length) throw new Error('Empty icon');
    let P=k.fitProjection(this.points,128,128,{pad:17,azimuth:45,elevation:30});
    // Cap magnification so compact objects retain a credible scale.
    if(P.scale>1.18) {
      P={...P,scale:1.18,origin:[0,0]};
      const ps=this.points.map(p=>k.iso(p,P));
      P.origin=[64-(Math.min(...ps.map(p=>p[0]))+Math.max(...ps.map(p=>p[0])))/2,64-(Math.min(...ps.map(p=>p[1]))+Math.max(...ps.map(p=>p[1])))/2];
    }
    const at=p=>k.iso(p,P);
    const d=(pts,closed=false)=>k.pathOf(pts.map(at),closed);
    const solid=(g,mat)=>{
      const [top,mid,dark]=material(mat,style), edge=outline(style);
      let result=path(g.fill,mid);
      g.shades.forEach((shade,i)=>result+=path(shade,mix(dark,mid,i/3)));
      result+=path(g.top,top);
      if(style!=='fill') result+=path(g.crease,'none',edge,1.25)+path(g.outline,'none',edge,1.6);
      return result;
    };
    const body=this.items.map(a=>{
      if(a.type==='box') return solid(k.slabOf(a.plan,a.z,a.h,P,5),a.mat);
      if(a.type==='cylinder') return solid(k.cylinder(a.x,a.y,a.r,a.z,a.h,P,48),a.mat);
      if(a.type==='line') return path(d(a.points,a.closed),'none',lineColor(a.mat,style),a.width);
      if(a.type==='poly') return path(d(a.points,true),material(a.mat,style)[1],style==='fill'?'none':outline(style),1.4);
      if(a.type==='mark') return path(d(a.points,true),lineColor(a.mat,style));
      if(a.type==='inlay') return path(d(a.points,true),material(a.mat,style)[1]);
      if(a.type==='logo') {
        // Preserve source Beziers, winding and proportions on the isometric face.
        const o=at(a.origin), ex=at(a.origin.map((v,i)=>v+a.u[i])), ey=at(a.origin.map((v,i)=>v+a.v[i]));
        const precision=v=>Math.round(v*1e6)/1e6;
        const matrix=[ex[0]-o[0],ex[1]-o[1],ey[0]-o[0],ey[1]-o[1],...o].map(precision).join(' ');
        const paper=material('white',style)[1];
        const ink=style==='duotone'?'#59478C':style==='fill'?'#24344D':'#000000';
        const color=(value,p)=>{
          if(!value||value==='none') return 'none';
          if(style==='color') return value;
          if(p.tone==='paper'||value.toUpperCase()==='#FFFFFF') return paper;
          if(p.monoFill) {
            if(style!=='duotone') return p.monoFill;
            const h=p.monoFill, lum=([1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).reduce((sum,v)=>sum+v,0)/3)/255;
            return mix('#59478C',paper,lum);
          }
          return ink;
        };
        const paths=(style==='color'?a.logo.paths:(a.logo.monoPaths||a.logo.paths));
        return paths.map(p=>`<path d="${esc(p.d)}" transform="matrix(${matrix})${p.transform?' '+esc(p.transform):''}" fill="${color(p.fill??'#000000',p)}"${p.fillRule?` fill-rule="${esc(p.fillRule)}"`:''}${p.stroke&&p.stroke!=='none'?` stroke="${color(p.stroke,p)}" stroke-width="${p.strokeWidth??1}"${p.strokeLinecap?` stroke-linecap="${esc(p.strokeLinecap)}"`:''}${p.strokeLinejoin?` stroke-linejoin="${esc(p.strokeLinejoin)}"`:''}`:''}${p.opacity!==undefined?` opacity="${p.opacity}"`:''}/>`).join('');
      }
      if(a.type==='dot') { const [x,y]=at(a.point); return `<circle cx="${n(x)}" cy="${n(y)}" r="${a.r}" fill="${lineColor(a.mat,style)}"/>`; }
      if(a.type==='panel') {
        const pts=a.points, back=pts.map(p=>[p[0],p[1]-4,p[2]]);
        const [top,mid,dark]=material(a.mat,style);
        let out='';
        // Only top- and right-facing side facets are visible to this camera.
        for(let i=0;i<pts.length;i++) {
          const j=(i+1)%pts.length, dx=pts[j][0]-pts[i][0], dz=pts[j][2]-pts[i][2];
          if(dz*0.612-dx*0.5<=0) continue;
          out+=path(d([pts[i],back[i],back[j],pts[j]],true),dz>0?dark:top);
        }
        out+=path(d(pts,true),mid,style==='fill'?'none':outline(style),1.6);
        // The projected back silhouette follows the same visible half.
        if(style!=='fill') {
          for(let i=0;i<pts.length;i++){
            const j=(i+1)%pts.length,dx=pts[j][0]-pts[i][0],dz=pts[j][2]-pts[i][2];
            if(dz*0.612-dx*0.5>0) out+=path(d([back[i],back[j]]),'none',outline(style),1.6);
            const prev=(i+pts.length-1)%pts.length;
            const pdx=pts[i][0]-pts[prev][0],pdz=pts[i][2]-pts[prev][2];
            if((dz*0.612-dx*.5>0)!==(pdz*.612-pdx*.5>0)) out+=path(d([pts[i],back[i]]),'none',outline(style),1.6);
          }
        }
        return out;
      }
      throw new Error(`Unknown primitive ${a.type}`);
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${esc(label)}">${body}</svg>\n`;
  }
}
