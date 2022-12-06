import convict from "convict";

export const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    },
    configFile: {
        doc: 'Config file path',
        format: String,
        default: 'config.json',
        env: 'CONFIG_FILE'
    },
    dryRun: {
        doc: "Dry run",
        format: Boolean,
        default: true,
        env: 'DRY_RUN'
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
    }
});
