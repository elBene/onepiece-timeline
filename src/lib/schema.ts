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
  /** true quando a saga corresponde a um arco de publicação (usada no "Li até"). */
  arc: z.boolean().default(false),
});

export const ConfidenceSchema = z.enum(['exata', 'estimada', 'inferida']);

/** Granularidade da data: quão fino é o que a fonte permite afirmar. */
export const PrecisionSchema = z.enum(['dia', 'mes', 'ano', 'decada', 'seculo', 'milenio']);

/**
 * Quando o evento aconteceu no mundo. A referência é o presente pós-timeskip
 * (Círculo Marítimo 1541 / Era do Céu 4131, SBS vol. 113). Os anos dos dois
 * calendários são DERIVADOS em lib/calendar.ts, nunca digitados.
 */
export const EventDateSchema = z
  .object({
    /** Anos antes do presente. Num intervalo, é o início (o mais antigo). */
    ago: z.number().int().nonnegative(),
    /** Fim do intervalo, em anos antes do presente (menor que `ago`). */
    agoEnd: z.number().int().nonnegative().optional(),
    month: z.number().int().min(1).max(12).optional(),
    day: z.number().int().min(1).max(31).optional(),
    precision: PrecisionSchema,
    conf: ConfidenceSchema,
    /** Desempate entre eventos do mesmo ano (maior = mais tarde). */
    seq: z.number().default(0),
  })
  .refine((d) => d.agoEnd === undefined || d.agoEnd < d.ago, {
    message: 'agoEnd deve ser menor que ago (o fim é mais recente que o início)',
    path: ['agoEnd'],
  })
  .refine((d) => d.day === undefined || d.month !== undefined, {
    message: 'day exige month',
    path: ['day'],
  });

/** Quando o leitor/espectador fica sabendo do evento. É a trava de spoilers. */
export const RevealedSchema = z.object({
  ch: z.number().int().positive().nullable(),
  /** Capítulo vindo de memória ou de fonte fraca, ainda não conferido. */
  approx: z.boolean(),
  ep: z.number().int().positive().nullable(),
});

export const EventKindSchema = z.enum([
  'nascimento',
  'morte',
  'batalha',
  'guerra',
  'fundacao',
  'descoberta',
  'fruta',
  'recompensa',
  'governo',
  'viagem',
  'incidente',
  'outro',
]);

/** Origem do evento na obra. */
export const CanonSchema = z.enum(['manga', 'sbs', 'databook', 'anime-only', 'filler', 'filme', 'novel']);

export const SourceTypeSchema = z.enum([
  'manga',
  'sbs',
  'databook',
  'vivre_card',
  'magazine',
  'cover_story',
  'anime',
  'film',
  'novel',
  'wiki',
  'fan',
]);

/** Fonte estruturada: tipo, referência (capítulo, episódio...), página e URL quando houver. */
export const SourceSchema = z.object({
  type: SourceTypeSchema,
  ref: z.string().min(1),
  page: z.string().min(1).optional(),
  url: z.url().optional(),
  /** Revisão da página do wiki usada (atribuição CC BY-SA). */
  rev: z.number().int().positive().optional(),
});

export const SOURCE_LABEL: Record<z.infer<typeof SourceTypeSchema>, string> = {
  manga: 'Mangá',
  sbs: 'SBS',
  databook: 'Databook',
  vivre_card: 'Vivre Card',
  magazine: 'ONE PIECE Magazine',
  cover_story: 'História de capa',
  anime: 'Anime',
  film: 'Filme',
  novel: 'Novel',
  wiki: 'Wiki',
  fan: 'Fã',
};

export const KIND_LABEL: Record<z.infer<typeof EventKindSchema>, string> = {
  nascimento: 'Nascimento',
  morte: 'Morte',
  batalha: 'Batalha',
  guerra: 'Guerra',
  fundacao: 'Fundação',
  descoberta: 'Descoberta',
  fruta: 'Akuma no Mi',
  recompensa: 'Recompensa',
  governo: 'Governo',
  viagem: 'Viagem',
  incidente: 'Incidente',
  outro: 'Outro',
};

export const CANON_LABEL: Record<z.infer<typeof CanonSchema>, string> = {
  manga: 'Mangá',
  sbs: 'SBS',
  databook: 'Databook',
  'anime-only': 'Só no anime',
  filler: 'Filler',
  filme: 'Filme',
  novel: 'Novel',
};

/** Divergência entre fontes, registrada em vez de escondida. */
export const ConflictSchema = z.object({
  note: z.string().min(1),
  src: z.array(SourceTypeSchema).min(1),
});

export const EventSchema = z.object({
  id: z.string().min(1),
  saga: z.string().min(1),
  imp: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  kind: EventKindSchema,
  canon: CanonSchema,
  date: EventDateSchema,
  revealed: RevealedSchema,
  tags: z.array(z.string()),
  title: z.string().min(1),
  sum: z.string().min(1),
  more: z.string(),
  src: z.array(SourceSchema).min(1),
  conflicts: z.array(ConflictSchema).default([]),
  /** Só eventos verificados saem do modo rascunho. Ausente = false. */
  verified: z.boolean().default(false),
});

/** tags.json é um mapa id -> nome exibido. */
export const TagsSchema = z.record(z.string(), z.string().min(1));

export type Era = z.infer<typeof EraSchema>;
export type Saga = z.infer<typeof SagaSchema>;
export type TimelineEvent = z.infer<typeof EventSchema>;
export type EventDate = z.infer<typeof EventDateSchema>;
export type Revealed = z.infer<typeof RevealedSchema>;
export type Source = z.infer<typeof SourceSchema>;
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
