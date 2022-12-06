import fetch from 'node-fetch';
import JSON5 from "json5";
import {logger} from "../logger";
import waitOn from "wait-on";
import ms from "ms";
import {formatAsFields} from "../helpers";

export default class ApiClient {
    name: string;
    baseUrl: string;

    apiRoot: string;
    authKey: string;

    dryRun: boolean;

    constructor(name: string, baseUrl: string, apiRoot: string, authKey: string, dryRun: boolean = false) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.apiRoot = apiRoot;
        this.authKey = authKey;
        this.dryRun = dryRun;
    }

    createRootFolder(path: string) {
        return this.createResource('rootFolder', {
            path
        })
    }

    createTag(tag: string) {
        return this.createResource('tag', {
            label: tag,
        })
    }

    async createResource(url: string, body: any) {
        if (this.dryRun) {
            logger.debug(`DryRun, create ${url} = ${JSON.stringify(body, null, 2)}`);
            return {};
        }
        const resp = await fetch(`${this.baseUrl}${this.apiRoot}/${url}`, {
            method: "POST",
            headers: {
                'X-Api-Key': this.authKey,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const json = await resp.json();

        if (resp.status < 300) {
            logger.success(`[${this.name}] Resource ${url} ${body.name ?? 'unknown name'} succeeded with code ${resp.status} ${resp.statusText}`);
        } else {
            try {
                if (json[0].errorMessage === 'Should be unique' && json[0].propertyName === 'Name') {
                    logger.warn(`Resource ${url} ${body.name ?? 'unknown name'} already exists in ${this.name}`);
                }else if (json[0].errorMessage === 'Path is already configured as a root folder' && json[0].propertyName === 'Path') {
                    logger.warn(`Resource ${url} ${body.path} already exists in ${this.name}`);
                }  else {
                    logger.error(json);
                }
            } catch (e) {
                logger.error(e);
            }
        }

        return json;
    }

    async createTransmissionClient(name: string, host: string, port: number = 443) {
        const body = {
            name,
            enable: true,
            protocol: 'torrent',
            implementation: 'Transmission',
            configContract: 'TransmissionSettings',
            fields: [
                {
                    name: 'host',
                    value: host,
                },
                {
                    name: 'port',
                    value: port
                },
                {
                    name: 'useSsl',
                    value: port === 443,
                }
            ]
        };

        return this.createResource('downloadclient', body);
    }

    async createQbittorrentClient(name: string, host: string, port: number = 443, username: string = 'admin', password: string = 'adminadmin') {
        logger.info('createQbittorrentClient');
        const body = {
            name,
            enable: true,
            protocol: 'torrent',
            implementation: 'QBittorrent',
            configContract: 'QBittorrentSettings',
            fields: formatAsFields({
                host,
                port: port.toString(),
                useSsl: port === 443,
                username,
                password,
            })
        };

        return this.createResource('downloadclient', body);
    }

    static async initializeHack(name: string, baseURL: string, dryRun: boolean = false) {

        // logger.await(`Waiting for ${name}`);
        const url = `${baseURL}`;

        if (dryRun) {
            return new ApiClient(name, baseURL, "/api", "123", true);
        }

        await waitOn({
            resources: [
                url
                    .replace('https://','https-get://')
                    .replace('http://','http-get://')
            ],
            interval: ms('1s'),
            timeout: ms('5m'),
        });

        const initializeFile = await fetch(`${baseURL}/initialize.js`).then((r) => r.text());

        const split = initializeFile.split("=")
        const data = split[1].trim().slice(0, -1);

        const parsed = JSON5.parse(data);

        return new ApiClient(name, baseURL, parsed.apiRoot, parsed.apiKey);

    }
}