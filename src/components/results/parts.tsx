import type { CSSProperties, ReactNode } from 'react';
import { STOCKS, type StockKey } from '../../lib/stocks';

/** The claim receipt: paper slip with a band printed in the collected item's stock. */
export function Receipt({
  stock,
  label,
  icon,
  serial,
  labelledBy,
  print = true,
  className = '',
  children,
  ...rest
}: {
  stock: StockKey;
  label: string;
  icon?: ReactNode;
  serial?: string;
  labelledBy: string;
  print?: boolean;
  className?: string;
  children: ReactNode;
  [data: `data-${string}`]: string | undefined;
}) {
  const s = STOCKS[stock];
  return (
    <section
      className={`rc ${className}`}
      aria-labelledby={labelledBy}
      data-print={print ? '' : undefined}
      data-receipt={stock}
      style={{ '--rc-stock': s.color, '--rc-on': s.onColor } as CSSProperties}
      {...rest}
    >
      <div className="rc-band">
        <span className="t-label">
          {icon}
          {label}
        </span>
        {serial ? (
          <span className="rc-serial" translate="no">
            No.&nbsp;{serial}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Fields printed like a boarding pass. Pass only values that are actually known. */
export function Specs({ items }: { items: { label: string; value: ReactNode }[] }) {
  const shown = items.filter((i) => i.value !== null && i.value !== undefined && i.value !== '');
  if (!shown.length) return null;
  return (
    <dl className="rc-specs">
      {shown.map((i) => (
        <div key={i.label}>
          <dt>{i.label}</dt>
          <dd>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Dashed perforation with punched notches at both receipt edges. */
export function Perf() {
  return (
    <div className="rc-perf" aria-hidden="true">
      <span />
    </div>
  );
}

/** One extra file the pin carries: format block, name + note, and its action. */
export function LineItem({
  format,
  name,
  note,
  after,
  children,
}: {
  format: string;
  name: string;
  note?: ReactNode;
  /** Optional full-width row under the item (a failure notice for this file). */
  after?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="rc-item">
      <span className="rc-fmt" aria-hidden="true">
        {format}
      </span>
      <div className="min-w-0">
        <p className="rc-item-name">{name}</p>
        {note ? <p className="rc-item-note">{note}</p> : null}
      </div>
      {children}
      {after}
    </li>
  );
}

/** Progress strip along the bottom edge of the collect button. */
export function Fill({ value }: { value: number | null }) {
  return (
    <span
      className="rc-cta-fill"
      aria-hidden="true"
      data-indeterminate={value === null ? 'true' : undefined}
      style={value === null ? undefined : ({ '--p': Math.max(0.02, Math.min(1, value)) } as CSSProperties)}
    />
  );
}
