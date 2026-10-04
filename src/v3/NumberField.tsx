import {useEffect,useId,useState} from 'react';
import './factory.css';

export interface NumberFieldProps {
 label:string; value:number; onChange:(value:number)=>void;
 min?:number; max?:number; step?:number; sliderMax?:number;
 disabled?:boolean; suffix?:string; hint?:string; decimals?:number;
}

/** A slider is a convenient range, never an implicit limit on typed values. */
export function NumberField({label,value,onChange,min=0,max,step=1,sliderMax,disabled=false,suffix,hint,decimals}:NumberFieldProps){
 const id=useId(),[draft,setDraft]=useState(String(value)),[error,setError]=useState('');
 useEffect(()=>{setDraft(String(value));setError('')},[value]);
 const precision=decimals??Math.min(8,Math.max(0,(String(step).split('.')[1]||'').length));
 const normalize=(n:number)=>Number(n.toFixed(precision));
 const validate=(raw:string)=>{
  const n=Number(raw);
  if(!raw.trim()||!Number.isFinite(n))return 'Enter a finite number.';
  if(n<min)return `Enter ${min} or more${suffix?` ${suffix}`:''}.`;
  if(max!==undefined&&n>max)return `The limit is ${max}${suffix?` ${suffix}`:''}.`;
  if(Math.abs(n-normalize(n))>0.000001)return precision===0?'Enter a whole number.':`Use up to ${precision} decimal places.`;
  return '';
 };
 const commit=(raw:string)=>{const issue=validate(raw);setError(issue);if(!issue){const n=normalize(Number(raw));setDraft(String(n));if(n!==value)onChange(n)}};
 const adjust=(direction:number)=>{const n=normalize(Math.max(min,Math.min(max??Number.MAX_SAFE_INTEGER,value+direction*step)));commit(String(n))};
 const upper=Math.max(min+step,Math.min(max??Number.MAX_SAFE_INTEGER,Math.max(value,sliderMax??max??Math.max(100,value*1.5))));
 return <div className={`num3-field${error?' num3-invalid':''}`}>
  <div className="num3-label"><label htmlFor={id}>{label}</label>{suffix&&<span>{suffix}</span>}</div>
  <div className="num3-stepper">
   <button type="button" disabled={disabled||value<=min} aria-label={`Decrease ${label}`} onClick={()=>adjust(-1)}>−</button>
   <input id={id} type="text" inputMode={precision?'decimal':'numeric'} value={draft} disabled={disabled} aria-invalid={!!error} aria-describedby={error?`${id}-error`:hint?`${id}-hint`:undefined} onChange={e=>{setDraft(e.target.value);if(error)setError(validate(e.target.value))}} onBlur={()=>commit(draft)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commit(draft)}if(e.key==='Escape'){setDraft(String(value));setError('')}}}/>
   <button type="button" disabled={disabled||max!==undefined&&value>=max} aria-label={`Increase ${label}`} onClick={()=>adjust(1)}>+</button>
  </div>
  <input className="num3-slider" type="range" aria-label={`${label} slider`} min={min} max={upper} step={step} value={Math.max(min,Math.min(upper,value))} disabled={disabled||max!==undefined&&max<=min} onChange={e=>commit(e.target.value)}/>
  {error?<p className="num3-error" id={`${id}-error`} role="alert">{error} Your saved value is {value}.</p>:hint?<p className="num3-hint" id={`${id}-hint`}>{hint}</p>:null}
 </div>;
}
export default NumberField;
