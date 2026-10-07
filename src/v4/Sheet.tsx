import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export default function Sheet({ title, context, onClose, children, wide = false, pending = false }: {
    pending?: boolean;
    title: string;
    context?: string;
    onClose: () => void;
    children: ReactNode;
    wide?: boolean;
}) { const ref = useRef<HTMLElement>(null), pendingRef = useRef(pending); pendingRef.current = pending; useLayoutEffect(()=>{const body=ref.current?.querySelector<HTMLElement>('.v4-body');if(body)body.scrollTop=0;ref.current?.focus();},[title]); useEffect(() => { const prior = document.activeElement as HTMLElement | null; ref.current?.focus(); const key = (e: KeyboardEvent) => { if (e.key === 'Escape') {
    e.preventDefault();
    if (!pendingRef.current)
        onClose();
} if (e.key === 'Tab') {
    const els = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]');
    if (!els?.length)
        return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault();
        last.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
} }; document.addEventListener('keydown', key); return () => { document.removeEventListener('keydown', key); prior?.focus(); }; }, [onClose]); return <div className="v4-layer"><button disabled={pending} tabIndex={-1} className="v4-scrim" aria-label="Return to world" onClick={onClose}/><section ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className={`v4-sheet ${wide ? 'wide' : ''}`}><header><div><small>{context ?? 'SAN FRANCISCO · YOUR HOUSE'}</small><h2>{title}</h2></div><button disabled={pending} className="v4-icon" aria-label="Close panel" onClick={onClose}><X size={22}/></button></header><div className="v4-body">{children}</div></section></div>; }
