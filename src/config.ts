import convict from 'convict'

export const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  configFile: {
    doc: 'Config file path',
    format: String,
    default: 'config.json',
    env: 'CONFIG_FILE',
  },
  dryRun: {
    doc: 'Dry run',
    format: Boolean,
    default: false,
    env: 'DRY_RUN',
  },
  waitOn: {
    doc: 'Wait on services before running calls',
    format: Boolean,
    default: false,
    env: 'WAIT_ON',
  },
  services: {
    doc: 'Services array',
    format: Array,
    default: [],
  },
  downloaders: {
    doc: 'Downloaders array',
    format: Array,
    default: [],
  },
})
