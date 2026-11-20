import { z } from 'zod';

export const EraSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  span: z.string().min(1),
  order: z.number().int().nonnegative(),
  desc: z.string().min(1),
});

export const SagaSchema = z.object({
  id: z.string().min(1),
  era: z.string().min(1),
  name: z.string().min(1),
});

export const ConfidenceSchema = z.enum(['exata', 'estimada', 'inferida']);

export const EventSchema = z.object({
  id: z.string().min(1),
  saga: z.string().min(1),
  imp: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  t: z.number(),
  when: z.string().min(1),
  ch: z.number().int().positive().nullable(),
  approx: z.boolean(),
  conf: ConfidenceSchema,
  tags: z.array(z.string()),
  title: z.string().min(1),
  sum: z.string().min(1),
  more: z.string(),
  src: z.string(),
});

/** tags.json é um mapa id -> nome exibido. */
export const TagsSchema = z.record(z.string(), z.string().min(1));

export type Era = z.infer<typeof EraSchema>;
export type Saga = z.infer<typeof SagaSchema>;
export type TimelineEvent = z.infer<typeof EventSchema>;
export type Tags = z.infer<typeof TagsSchema>;

export interface TimelineData {
  eras: Era[];
  sagas: Saga[];
  events: TimelineEvent[];
  tags: Tags;
}

function duplicates(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

/** Valida formato (Zod) e integridade referencial entre os arquivos. Lança erro com todos os problemas. */
export function parseTimelineData(raw: {
  eras: unknown;
  sagas: unknown;
  events: unknown;
  tags: unknown;
}): TimelineData {
  const data: TimelineData = {
    eras: z.array(EraSchema).parse(raw.eras),
    sagas: z.array(SagaSchema).parse(raw.sagas),
    events: z.array(EventSchema).parse(raw.events),
    tags: TagsSchema.parse(raw.tags),
  };

  const problems: string[] = [];
  const eraIds = new Set(data.eras.map((e) => e.id));
  const sagaIds = new Set(data.sagas.map((s) => s.id));

  for (const [label, ids] of [
    ['era', data.eras.map((e) => e.id)],
    ['saga', data.sagas.map((s) => s.id)],
    ['evento', data.events.map((e) => e.id)],
  ] as const) {
    for (const d of duplicates(ids)) problems.push(`id de ${label} duplicado: ${d}`);
  }
  for (const s of data.sagas) {
    if (!eraIds.has(s.era)) problems.push(`saga "${s.id}" aponta para era inexistente "${s.era}"`);
  }
  for (const e of data.events) {
    if (!sagaIds.has(e.saga)) problems.push(`evento "${e.id}" aponta para saga inexistente "${e.saga}"`);
    for (const t of e.tags) {
      if (!(t in data.tags)) problems.push(`evento "${e.id}" usa tag inexistente "${t}"`);
    }
  }

  if (problems.length) {
    throw new Error(`Dados inconsistentes:\n - ${problems.join('\n - ')}`);
  }
  return data;
}
