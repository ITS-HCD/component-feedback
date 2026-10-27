#!/usr/bin/env node
/**
 * Builds `decks/nys-feedback.json`, the starter deck that holds the
 * nys-feedback demo, from the component source and the files in `demo/`.
 *
 * Each slide's JS starts with the whole component, so you can read and edit
 * it in the playground. Run this after you change `component/` or `demo/`.
 * `npm run dev` and `npm run build` run it for you.
 */
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), 'utf8');
}

const component = await read('component/nys-feedback.js');

/** Joins the component and a slide's own script into one module. */
function withComponent(demoJs = '') {
  return demoJs ? `${component}\n${demoJs}` : component;
}

const deck = {
  title: 'nys-feedback',
  description:
    'A feedback prompt for the end of an experience, built with Lit and NYSDS tokens.',
  boilerplate: {baseCss: ''},
  presets: [
    {
      id: 'event-log',
      group: 'nys-feedback',
      title: 'Event log and session cookie',
      description:
        'Choose an answer to fire nys-feedback. A session cookie keeps you to one answer until you clear it.',
      notes:
        'Choose Good or Needs improvement. The log shows the event, then the cookie. ' +
        'Reload the preview to show the cookie holding the answer, then select Clear cookie to reset.',
      html: await read('demo/event-log.html'),
      css: await read('demo/event-log.css'),
      js: withComponent(await read('demo/event-log.js')),
      editors: ['html', 'js'],
    },
    {
      id: 'layouts',
      group: 'nys-feedback',
      title: 'Layouts',
      description:
        'The component follows its container: one row when wide, one centered column when narrow.',
      notes: 'The layout uses a container query, so it adapts inside a sidebar as well as on a phone.',
      html: await read('demo/layouts.html'),
      css: await read('demo/layouts.css'),
      js: withComponent(),
      editors: ['html', 'css'],
    },
  ],
};

await writeFile(
  fileURLToPath(new URL('decks/nys-feedback.json', root)),
  `${JSON.stringify(deck, null, 2)}\n`,
);
console.log('Wrote decks/nys-feedback.json');
