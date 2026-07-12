import { ChevronRight } from 'lucide-react';
import React from 'react';

interface TripStatusStepperProps {
  status: string;
}

export const TripStatusStepper: React.FC<TripStatusStepperProps> = ({ status }) => {
  const steps = ['DRAFT', 'DISPATCHED', 'COMPLETED'];
  const currentIdx = steps.indexOf(status);

  if (status === 'CANCELLED') {
    return (
      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 rounded-full border border-red-200/20">
        CANCELLED
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((st, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;

        return (
          <React.Fragment key={st}>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full tracking-wide text-[9px] uppercase ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isDone
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {st}
            </span>
            {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};
