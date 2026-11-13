"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { buildSchedule, msUntilNextSecond, phaseAt, plural, remainingUntil, type CountdownPhase } from "./countdown-math";

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** A serif numeral that rolls gently when its value changes. */
function RollingNumber({ value, fast }: { value: string; fast?: boolean }) {
  return (
    <span className="relative block h-[1em] overflow-hidden leading-none" aria-hidden>
      <span className="invisible block">{value}</span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="absolute inset-0 block text-center"
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: fast ? 0.45 : 0.7, ease: EASE }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Unit({ value, label, fast }: { value: string; label: string; fast?: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-1.5 xs:px-3 sm:px-7 lg:px-10">
      <span className="font-serif text-[38px] leading-none font-normal text-dark-walnut [font-variant-numeric:lining-nums_tabular-nums] xs:text-[44px] sm:text-[60px] lg:text-[68px]">
        <RollingNumber value={value} fast={fast} />
      </span>
      <span className="mt-3 font-serif text-[16px] leading-none text-secondary-text italic xs:text-[17px] sm:mt-4 sm:text-[20px]">{label}</span>
    </div>
  );
}

function Hairline() {
  return <span aria-hidden className="mt-1 h-10 w-px shrink-0 self-start bg-gradient-to-b from-transparent via-champagne-gold to-transparent sm:h-16" />;
}

function Units({ target, now }: { target: number; now: number | null }) {
  const r = now === null ? null : remainingUntil(target, now);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dash = "– –";
  return (
    <div className="flex w-full max-w-[720px] items-start justify-center">
      <Unit value={r ? pad(r.days) : dash} label={r ? plural(r.days, "day", "days") : "days"} />
      <Hairline />
      <Unit value={r ? pad(r.hours) : dash} label={r ? plural(r.hours, "hour", "hours") : "hours"} />
      <Hairline />
      <Unit value={r ? pad(r.minutes) : dash} label={r ? plural(r.minutes, "minute", "minutes") : "minutes"} />
      <Hairline />
      <Unit value={r ? pad(r.seconds) : dash} label={r ? plural(r.seconds, "second", "seconds") : "seconds"} fast />
    </div>
  );
}

/**
 * Live wedding countdown in Cormorant Garamond.
 *
 * All instants (ceremony time, start/end of the wedding day) are computed on
 * the server in the wedding's timezone and passed as ISO strings, so every
 * visitor counts down to the same moment regardless of their own timezone.
 * The server renders a neutral “– –” snapshot and live values start after
 * mount — no hydration mismatch. Ticks are aligned to real seconds and resync
 * when the tab becomes visible again.
 */
export function Countdown({
  targetIso,
  dayStartIso,
  dayEndIso,
  timeConfirmed,
  endIso,
  dateLabel,
  headingId,
  className,
}: {
  targetIso: string;
  dayStartIso: string;
  dayEndIso: string;
  timeConfirmed: boolean;
  endIso?: string | null;
  dateLabel?: string | null;
  headingId?: string;
  className?: string;
}) {
  const schedule = useMemo(
    () => buildSchedule({ targetIso, dayStartIso, dayEndIso, timeConfirmed, endIso }),
    [targetIso, dayStartIso, dayEndIso, timeConfirmed, endIso],
  );
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!schedule) return;
    let timer: number | undefined;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, msUntilNextSecond(schedule.target, t));
    };
    tick();
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [schedule]);

  if (!schedule) return null;
  const phase: CountdownPhase = now === null ? "counting" : phaseAt(now, schedule);

  const heading = {
    counting: "Counting down to the wedding",
    today: "The wedding day",
    started: "The wedding day",
    completed: "With gratitude",
  }[phase];

  const date = dateLabel ? (
    <p className="mt-8 text-center font-serif text-[18px] leading-snug text-dark-walnut sm:mt-10 sm:text-[20px]">
      {dateLabel.split(" · ").map((part, i) => (
        <span key={i} className="block sm:inline">
          {i > 0 ? <span className="hidden sm:inline"> · </span> : null}
          <span className={i > 0 ? "text-secondary-text sm:text-dark-walnut" : undefined}>{part}</span>
        </span>
      ))}
    </p>
  ) : null;

  const accessible = (() => {
    if (now === null || phase !== "counting") return undefined;
    const r = remainingUntil(schedule.target, now);
    return `${r.days} ${plural(r.days, "day", "days")}, ${r.hours} ${plural(r.hours, "hour", "hours")} and ${r.minutes} ${plural(r.minutes, "minute", "minutes")} until the wedding`;
  })();

  return (
    <div className={cn("flex w-full flex-col items-center text-center", className)}>
      <h2 id={headingId} className="mb-8 text-meta text-muted-gold sm:mb-10">
        {heading}
      </h2>

      {phase === "counting" ? (
        <div role="timer" aria-label={accessible ?? "Countdown to the wedding"} className="flex w-full justify-center">
          <Units target={schedule.target} now={now} />
        </div>
      ) : (
        <div role="status">
          <p className="font-serif text-[36px] leading-tight text-dark-walnut sm:text-[48px]">
            {phase === "today" ? "Today is the day!" : phase === "started" ? "The celebration has begun!" : "Thank you for celebrating with us"}
          </p>
          <p className="mx-auto mt-3 max-w-[44ch] font-serif text-[19px] text-secondary-text italic sm:text-[21px]">
            {phase === "today"
              ? schedule.timeConfirmed
                ? "The ceremony begins soon."
                : "We can’t wait to celebrate with you."
              : phase === "started"
                ? "Join us in person, or follow along live."
                : "Relive the day through the gallery and replays."}
          </p>
          {phase === "today" && schedule.timeConfirmed && now !== null ? (
            <div className="mt-8 flex justify-center" role="timer" aria-label="Time until the ceremony">
              <Units target={schedule.target} now={now} />
            </div>
          ) : null}
        </div>
      )}

      {phase === "counting" || phase === "today" ? date : null}
    </div>
  );
}
