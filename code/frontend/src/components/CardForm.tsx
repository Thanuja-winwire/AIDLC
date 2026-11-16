import { Field } from "./ui";
import type { Card } from "../types";
import type { Errors } from "../lib/validation";

export const emptyCard: Card = { number: "", expiry: "", cvc: "", name: "" };

interface Props {
  value: Card;
  onChange: (c: Card) => void;
  errors?: Errors<"number" | "expiry" | "cvc">;
  disabled?: boolean;
}

/** Controlled card fields. Validation lives in lib/validation.ts and is run by the parent on submit. */
export default function CardForm({ value, onChange, errors = {}, disabled }: Props) {
  const set = (k: keyof Card) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });
  return (
    <div className="space-y-3" data-testid="card-form">
      <Field label="Name on card" htmlFor="card-name">
        <input id="card-name" data-testid="card-name" className="input" autoComplete="cc-name" value={value.name ?? ""} onChange={set("name")} disabled={disabled} />
      </Field>
      <Field label="Card number" htmlFor="card-number" error={errors.number}>
        <input id="card-number" data-testid="card-number" className="input" inputMode="numeric" autoComplete="cc-number"
          placeholder="4242 4242 4242 4242" value={value.number} onChange={set("number")} disabled={disabled} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Expiry (MM/YY)" htmlFor="card-expiry" error={errors.expiry}>
          <input id="card-expiry" data-testid="card-expiry" className="input" autoComplete="cc-exp" placeholder="08/29"
            value={value.expiry} onChange={set("expiry")} disabled={disabled} />
        </Field>
        <Field label="CVC" htmlFor="card-cvc" error={errors.cvc}>
          <input id="card-cvc" data-testid="card-cvc" className="input" inputMode="numeric" autoComplete="cc-csc" placeholder="123"
            value={value.cvc} onChange={set("cvc")} disabled={disabled} />
        </Field>
      </div>
      <p className="text-xs text-slate-500">Simulated gateway: use any valid test card. 4000 0000 0000 0002 is declined.</p>
    </div>
  );
}
