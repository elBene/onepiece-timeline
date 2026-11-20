import eras from '../data/eras.json';
import sagas from '../data/sagas.json';
import events from '../data/events.json';
import tags from '../data/tags.json';
import { parseTimelineData } from './schema';

// Executa em build time: se os JSONs estiverem inválidos, o build falha.
export const data = parseTimelineData({ eras, sagas, events, tags });
