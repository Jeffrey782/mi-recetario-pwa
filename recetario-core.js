/* Funciones puras: cantidades, compras y reloj. */
(function(root){
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
 const units={g:['mass',1],kg:['mass',1000],ml:['volume',1],l:['volume',1000],unidad:['count',1],taza:['cup',1],cucharada:['tbsp',1],cucharadita:['tsp',1]};
 const round=n=>Math.round((n+Number.EPSILON)*1000000)/1000000;
 function convert(q,from,to){if(!units[from]||!units[to]||units[from][0]!==units[to][0])return null;return round(q*units[from][1]/units[to][1])}
 function needs(items,inventory){const grouped=[];items.forEach(i=>{const old=grouped.find(x=>norm(x.name)===norm(i.name)&&convert(i.qty,i.unit,x.unit)!==null);if(old)old.qty=round(old.qty+convert(i.qty,i.unit,old.unit));else grouped.push({...i})});return grouped.map(i=>{const stock=inventory.filter(s=>norm(s.name)===norm(i.name));const have=stock.reduce((n,s)=>n+(convert(s.qty,s.unit,i.unit)??0),0);return {...i,have,missing:round(Math.max(0,i.qty-have)),incompatible:stock.some(s=>convert(s.qty,s.unit,i.unit)===null)}})}
 function addStock(inventory,i){const s=inventory.find(s=>norm(s.name)===norm(i.name)&&convert(i.qty,i.unit,s.unit)!==null);if(s)s.qty=round(s.qty+convert(i.qty,i.unit,s.unit));else inventory.push({id:i.id,name:i.name,qty:i.qty,unit:i.unit})}
 function consume(inventory,items){if(needs(items,inventory).some(i=>i.missing>0))throw Error('No hay suficientes ingredientes.');const copy=inventory.map(i=>({...i}));items.forEach(i=>{let remaining=i.qty;for(const s of copy){if(norm(s.name)!==norm(i.name))continue;const available=convert(s.qty,s.unit,i.unit);if(available===null)continue;const take=Math.min(remaining,available);s.qty=round(s.qty-convert(take,i.unit,s.unit));remaining=round(remaining-take);if(remaining<=0)break}});return copy}
 function total(cart){return cart.reduce((n,i)=>n+Math.round(i.price*100)*i.packs,0)/100}
 function remaining(t,now=Date.now()){return t.end?Math.max(0,Math.ceil((t.end-now)/1000)):t.left}
 const api={norm,units,round,convert,needs,addStock,consume,total,remaining};root.RecetarioCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
