"use client";

import * as React from "react";
import { useActionState } from "react";
import { completeOnboarding, type OnboardingFormState } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

type Ensemble = { name: string; startYear: number | null; notes: string | null };
type Lesson = { teacher: string; focus: string | null };
type Achievement = { title: string; year: number | null; detail: string | null };

interface Example {
  firstName: string;
  lastName: string;
  grade: number;
  section: string;
  primaryInstrument: string;
  ensembles: Array<{ name: string; startYear?: number | null; notes?: string | null }>;
  lessons: Array<{ teacher: string; focus?: string | null }>;
  achievements: Array<{ title: string; year?: number | null; detail?: string | null }>;
  bio: string | null;
}

const STEPS = [
  "Welcome",
  "Basics",
  "Outside work",
  "Lessons",
  "Achievements",
  "Mentorship",
  "Bio",
  "Preview",
] as const;

const initial: OnboardingFormState = {};

export function OnboardingWizard({
  firstName,
  section,
  grade,
  primaryInstrument,
  marchingInstrument,
  mentorSkillOptions,
  examples,
}: {
  firstName: string;
  section: string;
  grade: number;
  primaryInstrument: string;
  marchingInstrument: string | null;
  mentorSkillOptions: string[];
  examples: Example[];
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [ensembles, setEnsembles] = React.useState<Ensemble[]>([]);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [mentorAvailable, setMentorAvailable] = React.useState(false);
  const [mentorSkills, setMentorSkills] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState("");
  const [exampleOpen, setExampleOpen] = React.useState<"ensembles" | "achievements" | null>(null);
  const [state, action, pending] = useActionState(completeOnboarding, initial);

  React.useEffect(() => {
    if (state.ok) {
      router.push("/directory");
    }
  }, [state.ok, router]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / STEPS.length) * 100;

  const toggleSkill = (s: string) =>
    setMentorSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-3xl sm:text-4xl leading-tight">You&apos;re in, {firstName}.</h1>
            <p className="text-muted-foreground leading-relaxed">
              Let&apos;s build your profile so the rest of Woodshed can actually see you. Seven short steps. Every one
              is skippable, but a filled-in profile is how younger students know what&apos;s possible here.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={next} className="gap-2">
                Start <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-2xl">The basics (confirm)</h2>
            <p className="text-sm text-muted-foreground">
              You gave us these at signup. If anything&apos;s wrong, you can fix it from your profile later.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Grade">
                <Input value={String(grade)} readOnly className="bg-muted" />
              </Field>
              <Field label="Section">
                <Input value={section} readOnly className="bg-muted" />
              </Field>
              <Field label="Primary instrument">
                <Input value={primaryInstrument} readOnly className="bg-muted" />
              </Field>
              <Field label="Marching instrument">
                <Input value={marchingInstrument ?? "—"} readOnly className="bg-muted" />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-2xl">Outside work</h2>
                <p className="text-sm text-muted-foreground">Ensembles, groups, or programs you&apos;re in outside of Pieper.</p>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={() => setExampleOpen("ensembles")} className="gap-1">
                <Info className="h-3.5 w-3.5" /> See how others filled this out
              </Button>
            </div>
            <DynamicList
              items={ensembles}
              onChange={setEnsembles}
              empty={{ name: "", startYear: null, notes: null } as Ensemble}
              render={(e, _i, update) => (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
                  <Input
                    placeholder="SAYWE, community band, church ensemble…"
                    value={e.name}
                    onChange={(ev) => update({ ...e, name: ev.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Since (yr)"
                    value={e.startYear ?? ""}
                    onChange={(ev) => update({ ...e, startYear: ev.target.value ? Number(ev.target.value) : null })}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Notes (optional)"
                    value={e.notes ?? ""}
                    onChange={(ev) => update({ ...e, notes: ev.target.value })}
                  />
                </div>
              )}
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl">Private lessons</h2>
              <p className="text-sm text-muted-foreground">
                Teachers you study with. Knowing who&apos;s teaching the best Pieper musicians helps younger students find the right teacher.
              </p>
            </div>
            <DynamicList
              items={lessons}
              onChange={setLessons}
              empty={{ teacher: "", focus: null } as Lesson}
              render={(l, _i, update) => (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Teacher name"
                    value={l.teacher}
                    onChange={(ev) => update({ ...l, teacher: ev.target.value })}
                  />
                  <Input
                    placeholder="Focus (e.g. oboe, jazz improv)"
                    value={l.focus ?? ""}
                    onChange={(ev) => update({ ...l, focus: ev.target.value })}
                  />
                </div>
              )}
            />
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-2xl">What are you proud of?</h2>
                <p className="text-sm text-muted-foreground">
                  All-State, All-Region, chair placements, camps, competitions. Be specific — future freshmen are reading this.
                </p>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={() => setExampleOpen("achievements")} className="gap-1">
                <Info className="h-3.5 w-3.5" /> See how others filled this out
              </Button>
            </div>
            <DynamicList
              items={achievements}
              onChange={setAchievements}
              empty={{ title: "", year: null, detail: null } as Achievement}
              render={(a, _i, update) => (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-2">
                  <Input
                    placeholder="e.g. TMEA All-Region"
                    value={a.title}
                    onChange={(ev) => update({ ...a, title: ev.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Year"
                    value={a.year ?? ""}
                    onChange={(ev) => update({ ...a, year: ev.target.value ? Number(ev.target.value) : null })}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Detail (optional, e.g. 3rd chair)"
                    value={a.detail ?? ""}
                    onChange={(ev) => update({ ...a, detail: ev.target.value })}
                  />
                </div>
              )}
            />
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl">Mentorship</h2>
              <p className="text-sm text-muted-foreground">
                Willing to help other students with things you&apos;ve already been through? Flip this on and pick a few areas.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 p-4 rounded-md border border-border">
              <div>
                <p className="font-medium">I&apos;m open to mentoring</p>
                <p className="text-sm text-muted-foreground">Your profile will show a Mentor badge in the directory.</p>
              </div>
              <Switch checked={mentorAvailable} onCheckedChange={setMentorAvailable} />
            </div>
            {mentorAvailable && (
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Skills you can mentor in</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentorSkillOptions.map((s) => {
                    const active = mentorSkills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl">Bio</h2>
              <p className="text-sm text-muted-foreground">In 1–2 sentences, what are you working on right now?</p>
            </div>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              maxLength={1200}
              placeholder="Preparing for the Region audition on my oboe and working on Bach's Partita for my college audition tape."
            />
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-display text-2xl">Here&apos;s what everyone else will see.</h2>
              <p className="text-sm text-muted-foreground">Publish when you&apos;re ready, or step back to edit.</p>
            </div>
            <Card className="p-5 bg-primary-soft/40 border-primary/20">
              <p className="font-display text-2xl">
                {firstName}
                <span className="text-muted-foreground text-base ml-2">
                  Grade {grade} · {section} · {primaryInstrument}
                </span>
              </p>
              {bio && <p className="mt-3 text-sm whitespace-pre-line">{bio}</p>}
              {mentorAvailable && mentorSkills.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Mentors in</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mentorSkills.map((s) => (
                      <Badge key={s} variant="primary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Grid title="Outside ensembles" items={ensembles.map((e) => `${e.name}${e.startYear ? ` — since ${e.startYear}` : ""}`)} />
              <Grid title="Private lessons" items={lessons.map((l) => `${l.teacher}${l.focus ? ` — ${l.focus}` : ""}`)} />
              <Grid
                title="Achievements"
                items={achievements.map((a) => `${a.title}${a.year ? ` (${a.year})` : ""}${a.detail ? ` — ${a.detail}` : ""}`)}
              />
            </Card>

            <form action={action} className="flex items-center gap-2">
              <input type="hidden" name="bio" value={bio} />
              <input type="hidden" name="mentorAvailable" value={mentorAvailable ? "on" : ""} />
              <input type="hidden" name="mentorSkills" value={JSON.stringify(mentorSkills)} />
              <input type="hidden" name="outsideEnsembles" value={JSON.stringify(ensembles.filter((e) => e.name.trim()))} />
              <input type="hidden" name="privateLessons" value={JSON.stringify(lessons.filter((l) => l.teacher.trim()))} />
              <input type="hidden" name="achievements" value={JSON.stringify(achievements.filter((a) => a.title.trim()))} />
              <Button type="submit" disabled={pending} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {pending ? "Publishing…" : "Publish"}
              </Button>
              <Button type="button" variant="ghost" onClick={back}>
                Let me edit
              </Button>
            </form>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>
        )}

        {step > 0 && step < 7 && (
          <div className="mt-8 flex items-center justify-between gap-2 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={back} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={next} className="text-xs text-muted-foreground">
                Skip
              </Button>
              <Button onClick={next} className="gap-1">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={!!exampleOpen}
        onOpenChange={(v) => setExampleOpen(v ? exampleOpen : null)}
        title={exampleOpen === "achievements" ? "Achievements — how others fill this out" : "Outside work — how others fill this out"}
        description="Pieper musicians with filled-out profiles. Use the shape, not the content."
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {examples.length === 0 ? (
            <p className="text-sm text-muted-foreground">We&apos;ll fill this once more members are onboarded.</p>
          ) : (
            examples.map((e, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <p className="font-medium">
                  {e.firstName} {e.lastName}{" "}
                  <span className="text-xs text-muted-foreground">
                    Grade {e.grade} · {e.section} · {e.primaryInstrument}
                  </span>
                </p>
                {exampleOpen === "ensembles" &&
                  e.ensembles.map((en, j) => (
                    <p key={j} className="text-sm mt-1">
                      — {en.name}
                      {en.startYear ? ` (since ${en.startYear})` : ""}
                    </p>
                  ))}
                {exampleOpen === "achievements" &&
                  e.achievements.map((a, j) => (
                    <p key={j} className="text-sm mt-1">
                      — {a.title}
                      {a.year ? ` (${a.year})` : ""}
                      {a.detail ? ` — ${a.detail}` : ""}
                    </p>
                  ))}
              </div>
            ))
          )}
        </div>
      </Dialog>
    </div>
  );
}

function Grid({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{title}</p>
      <ul className="text-sm">
        {items.map((it, i) => (
          <li key={i}>— {it}</li>
        ))}
      </ul>
    </div>
  );
}

function DynamicList<T>({
  items,
  onChange,
  empty,
  render,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  empty: T;
  render: (item: T, index: number, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">
            {render(item, i, (next) => {
              const copy = items.slice();
              copy[i] = next;
              onChange(copy);
            })}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start gap-1"
        onClick={() => onChange([...items, { ...(empty as object) } as T])}
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}
