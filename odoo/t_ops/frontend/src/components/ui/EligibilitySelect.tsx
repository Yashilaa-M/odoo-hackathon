/**
 * Usage:
 * <EligibilitySelect options={drivers} value={driverId} onChange={setDriverId} isEligible={(driver) => driver.available} />
 */
import React, { useMemo } from 'react';
import * as Select from '@radix-ui/react-select';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Check, ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface EligibilitySelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
}

export interface EligibilitySelectProps<TOption extends EligibilitySelectOption = EligibilitySelectOption> {
  options: TOption[];
  value?: TOption['value'];
  onChange?: (value: TOption['value']) => void;
  renderOption?: (option: TOption) => React.ReactNode;
  isEligible?: (option: TOption) => boolean;
  reasonIfIneligible?: (option: TOption) => string | undefined;
  placeholder?: string;
  className?: string;
}

export function EligibilitySelect<TOption extends EligibilitySelectOption>({
  options,
  value,
  onChange,
  renderOption,
  isEligible = () => true,
  reasonIfIneligible,
  placeholder = 'Select an option',
  className,
}: EligibilitySelectProps<TOption>) {
  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);

  return (
    <Tooltip.Provider delayDuration={150}>
      <Select.Root value={value} onValueChange={(nextValue) => onChange?.(nextValue as TOption['value'])}>
        <div className={cn('relative', className)}>
          <Select.Trigger
            aria-label={placeholder}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-transit-surface2 px-4 py-3 text-left text-sm text-foreground shadow-sm transition hover:border-cyan-300/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            <Select.Value placeholder={selected?.label ?? placeholder} />
            <Select.Icon asChild>
              <ChevronDown className="h-4 w-4 text-transit-text-secondary" />
            </Select.Icon>
          </Select.Trigger>
        </div>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={8}
            className="z-[130] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-border bg-transit-surface3 p-2 text-foreground shadow-glass backdrop-blur-xl"
          >
            <Select.Viewport>
          {options.map((option) => {
            const eligible = isEligible(option);
            const disabledReason = eligible ? undefined : reasonIfIneligible?.(option);
            const active = value === option.value;
            const optionBody = (
              <div className="flex w-full items-start justify-between gap-3">
                <div className="min-w-0">
                  <Select.ItemText>
                    <span className="font-medium text-foreground">{renderOption ? renderOption(option) : option.label}</span>
                  </Select.ItemText>
                  {option.description ? <div className="mt-1 text-xs text-transit-text-secondary">{option.description}</div> : null}
                  {disabledReason ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-transit-text-secondary">
                      <HelpCircle className="h-3 w-3" />
                      {disabledReason}
                    </div>
                  ) : null}
                </div>
                <Select.ItemIndicator>
                  <Check className="mt-0.5 h-4 w-4 text-cyan-300" />
                </Select.ItemIndicator>
              </div>
            );

            return (
              <Tooltip.Root key={option.value}>
                <Tooltip.Trigger asChild>
                  <Select.Item
                key={option.value}
                disabled={!eligible}
                value={option.value}
                className={cn(
                  'relative flex w-full cursor-pointer select-none rounded-xl px-3 py-3 text-left text-sm outline-none transition focus:bg-white/5 data-[disabled]:pointer-events-auto data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                  active && 'bg-white/5',
                )}
              >
                    {optionBody}
                  </Select.Item>
                </Tooltip.Trigger>
                {disabledReason ? (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      align="center"
                      className="z-[140] max-w-xs rounded-xl border border-border bg-transit-surface1 px-3 py-2 text-xs text-transit-text-secondary shadow-glass"
                    >
                      {disabledReason}
                      <Tooltip.Arrow className="fill-[var(--bg-surface-1)]" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                ) : null}
              </Tooltip.Root>
            );
          })}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </Tooltip.Provider>
  );
}
