'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type TimeUnit = 'day' | 'week' | 'month' | 'year';

export interface TimeframeValue {
  amount: number | undefined;
  unit: TimeUnit;
}

interface TimeframePickerProps {
  value?: TimeframeValue;
  onChange?: (value: TimeframeValue) => void;
  className?: string;
  placeholder?: string;
}

const TIME_UNITS: { value: TimeUnit; label: string; pluralLabel: string }[] = [
  { value: 'day', label: 'Day', pluralLabel: 'Days' },
  { value: 'week', label: 'Week', pluralLabel: 'Weeks' },
  { value: 'month', label: 'Month', pluralLabel: 'Months' },
  { value: 'year', label: 'Year', pluralLabel: 'Years' },
];

const normalizeUnit = (unit: string): TimeUnit => {
  const normalized = unit.toLowerCase().replace(/s$/, '') as TimeUnit;
  return ['day', 'week', 'month', 'year'].includes(normalized)
    ? normalized
    : 'month';
};

export function TimeframePicker({
  value,
  onChange,
  className,
  placeholder = 'Enter amount',
}: TimeframePickerProps) {
  const [amount, setAmount] = React.useState<string>(
    value?.amount?.toString() || ''
  );
  const [unit, setUnit] = React.useState<TimeUnit>(value?.unit || 'month');

  React.useEffect(() => {
    if (value) {
      setAmount(value.amount?.toString() || '');
      setUnit(normalizeUnit(value.unit));
    }
  }, [value]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string or valid positive numbers between 1 and 999
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      const numericValue =
        inputValue === '' ? undefined : parseInt(inputValue, 10);

      // Enforce min 1 and max 999
      if (
        numericValue !== undefined &&
        (numericValue < 1 || numericValue > 999)
      ) {
        return;
      }

      setAmount(inputValue);
      onChange?.({
        amount: numericValue,
        unit,
      });
    }
  };

  const handleUnitChange = (newUnit: string) => {
    const normalizedUnit = normalizeUnit(newUnit);
    setUnit(normalizedUnit);

    const numericValue = amount === '' ? undefined : parseInt(amount, 10);
    onChange?.({
      amount: numericValue,
      unit: normalizedUnit,
    });
  };

  const getUnitLabel = (unit: TimeUnit, amount: number | undefined) => {
    const unitConfig = TIME_UNITS.find((u) => u.value === unit);
    if (!unitConfig) return 'Months';

    return amount === 1 ? unitConfig.label : unitConfig.pluralLabel;
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Input
        type="text"
        inputMode="numeric"
        value={amount}
        onChange={handleAmountChange}
        placeholder={placeholder}
        className="h-20! flex-1 px-6! text-xl!"
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="h-20! w-45 px-6! text-xl!">
          <SelectValue>
            {getUnitLabel(
              unit,
              amount === '' ? undefined : parseInt(amount, 10)
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_UNITS.map((timeUnit) => (
            <SelectItem
              key={timeUnit.value}
              value={timeUnit.value}
              className="text-xl!"
            >
              {getUnitLabel(
                timeUnit.value,
                amount === '' ? undefined : parseInt(amount, 10)
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
