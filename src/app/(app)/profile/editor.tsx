"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ensemble {
  name: string;
  startYear?: number | null;
  notes?: string | null;
}
interface Lesson {
  teacher: string;
  focus?: string | null;
}
interface Achievement {
  title: string;
  year?: number | null;
  detail?: string | null;
}

interface Initial {
  bio: string;
  mentorAvailable: boolean;
  mentorSkills: string[];
  outsideEnsembles: Ensemble[];
  privateLessons: Lesson[];
  achievements: Achievement[];
}

const initialState: ProfileFormState = {};

export function ProfileEditor({
  initial,
  mentorSkillOptions,
}: {
  initial: Initial;
  mentorSkillOptions: string[];
}) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  const [mentorAvailable, setMentorAvailable] = useState(initial.mentorAvailable);
  const [mentorSkills, setMentorSkills] = useState<string[]>(initial.mentorSkills);
  const [ensembles, setEnsembles] = useState<Ensemble[]>(
    initial.outsideEnsembles.length ? initial.outsideEnsembles : []
  );
  const [lessons, setLessons] = useState<Lesson[]>(initial.privateLessons.length ? initial.privateLessons : []);
  const [achievements, setAchievements] = useState<Achievement[]>(
    initial.achievements.length ? initial.achievements : []
  );

  const toggleSkill = (s: string) =>
    setMentorSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <form action={action} className="flex flex-col gap-8">
      {/* Bio */}
      <Field label="Bio" htmlFor="bio" hint="A few lines about what you're working on and where you're trying to go.">
        <Textarea id="bio" name="bio" defaultValue={initial.bio} rows={5} maxLength={1200} />
      </Field>

      {/* Mentor availability */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Mentor availability</h3>
            <p className="text-sm text-muted-foreground">
              Turn on if you&apos;re willing to help others in skills you know. Your availability shows on your profile.
            </p>
          </div>
          <Switch checked={mentorAvailable} onCheckedChange={setMentorAvailable} name="mentorAvailable" />
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

      {/* Outside ensembles */}
      <DynamicList<Ensemble>
        title="Outside ensembles"
        hint="SAYWE, UIW Orchestra, community bands, DCI corps, honor ensembles."
        items={ensembles}
        onChange={setEnsembles}
        empty={{ name: "", startYear: null, notes: "" }}
        render={(e, i, update) => (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
            <Input
              placeholder="Ensemble name (e.g. SAYWE)"
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

      {/* Private lessons */}
      <DynamicList<Lesson>
        title="Private lessons"
        hint="Teachers you study with. Skip if you'd rather not share."
        items={lessons}
        onChange={setLessons}
        empty={{ teacher: "", focus: "" }}
        render={(l, i, update) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Teacher name"
              value={l.teacher}
              onChange={(ev) => update({ ...l, teacher: ev.target.value })}
            />
            <Input
              placeholder="Focus (e.g. flute, jazz improv)"
              value={l.focus ?? ""}
              onChange={(ev) => update({ ...l, focus: ev.target.value })}
            />
          </div>
        )}
      />

      {/* Achievements */}
      <DynamicList<Achievement>
        title="Achievements"
        hint="All-State, All-Region, chair placements, competitions, camps. Don't be humble."
        items={achievements}
        onChange={setAchievements}
        empty={{ title: "", year: null, detail: "" }}
        render={(a, i, update) => (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-2">
            <Input
              placeholder="Title (e.g. TMEA All-Region)"
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

      {/* Hidden JSON blobs for the action */}
      <input type="hidden" name="mentorSkills" value={JSON.stringify(mentorSkills)} />
      <input type="hidden" name="outsideEnsembles" value={JSON.stringify(ensembles.filter((e) => e.name.trim()))} />
      <input type="hidden" name="privateLessons" value={JSON.stringify(lessons.filter((l) => l.teacher.trim()))} />
      <input type="hidden" name="achievements" value={JSON.stringify(achievements.filter((a) => a.title.trim()))} />

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {state.error && <span className="text-sm text-destructive">{state.error}</span>}
        {state.ok && (
          <span className="inline-flex items-center gap-1 text-sm text-[color:var(--color-success)]">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

function DynamicList<T>({
  title,
  hint,
  items,
  onChange,
  empty,
  render,
}: {
  title: string;
  hint?: string;
  items: T[];
  onChange: (next: T[]) => void;
  empty: T;
  render: (item: T, index: number, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="font-medium">
          {title}{" "}
          <Badge variant="outline" className="ml-1">
            {items.length}
          </Badge>
        </h3>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
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
          className="self-start"
          onClick={() => onChange([...items, { ...empty }])}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </div>
  );
}
