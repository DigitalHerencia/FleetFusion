'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';

import { finalizeReport } from '../lib/iftaActions';

interface IftaReportCardOptimisticProps {
  initialQuarter?: string;
}

const finalize = finalizeReport as unknown as (input: { quarter: string }) => Promise<unknown>;

export function IftaReportCardOptimistic({
  initialQuarter = `${new Date().getUTCFullYear()}-Q${Math.floor(new Date().getUTCMonth() / 3) + 1}`,
}: IftaReportCardOptimisticProps) {
  const router = useRouter();
  const [quarter, setQuarter] = useState(initialQuarter);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setMessage(null);
    startTransition(async () => {
      try {
        await finalize({ quarter });
        setMessage(`${quarter} report generated. Review the totals before filing.`);
        router.refresh();
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : 'Unable to generate the report.');
      }
    });
  }

  return (
    <section aria-labelledby="generate-report-heading" className="rounded-lg border p-5">
      <h2 className="font-semibold" id="generate-report-heading">
        Generate quarterly report
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Aggregates trip mileage and fuel purchases for the selected calendar quarter.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm" htmlFor="report-quarter">
          <span>Quarter</span>
          <input
            className="bg-background h-10 rounded-md border px-3"
            id="report-quarter"
            max={`${new Date().getFullYear()}-Q4`}
            min="2000-Q1"
            onChange={(event) => setQuarter(event.target.value)}
            type="text"
            value={quarter}
            pattern="\d{4}-Q[1-4]"
            aria-describedby="report-quarter-help"
          />
        </label>
        <Button
          disabled={isPending || !/^\d{4}-Q[1-4]$/.test(quarter)}
          onClick={generate}
          type="button"
        >
          {isPending ? 'Generating…' : 'Generate report'}
        </Button>
      </div>
      <p className="text-muted-foreground mt-2 text-xs" id="report-quarter-help">
        Enter a calendar quarter in YYYY-Q1 through YYYY-Q4 format.
      </p>
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
      <p className="text-muted-foreground mt-4 text-xs">
        Generation does not submit a tax return. Check applicable rates and review the result before
        filing.
      </p>
    </section>
  );
}
