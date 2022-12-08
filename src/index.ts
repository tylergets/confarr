import { config } from './config'
import { logger } from './logger'
import * as fs from 'fs'
import ApiClient from './api/client'
import { formatAsFields } from './helpers'

class ConfarrApp {
  async run() {
    logger.info('Starting Confarr')

    const dryRun = config.get('dryRun')
    if (dryRun) {
      logger.success('Dry run, not making any requests!')
    }

    const configPath = config.get('configFile')
    logger.success('Loading config from ' + configPath)
    if (fs.existsSync(configPath)) {
      config.loadFile(configPath)
      logger.debug(`Loaded configuration file from ${configPath}`)
    }

    const services = config.get<any>('services') ?? []
    logger.debug(`Loaded ${services.length} services`)

    for (const service of services) {
      const apiClient = await ApiClient.initializeHack(service.id, service.host, service.port ?? 80, service.https ?? false, dryRun)
      service.apiClient = apiClient
      service.apiKey = apiClient.authKey

      logger.success(`Connected to ${service.host}`)
    }

    const downloaders = config.get<any>('downloaders')

    for (const service of services) {
      await this.createDownloadClients(service, downloaders)

      if (service.type !== 'prowlarr') {
        await this.linkAsApplication(service, services)
      }

      if (service.type !== 'prowlarr' && service.type !== 'readarr') {
        for (const path of service.paths ?? []) {
          await service.apiClient.createRootFolder(path)
        }
      }
    }

    logger.success('Finished!')
  }

  private async createDownloadClients(target: any, downloaders: any[]) {
    for (const downloadClient of downloaders) {
      if (downloadClient.type === 'transmission') {
        await target.apiClient.createTransmissionClient(downloadClient.id, downloadClient.host)
      } else if (downloadClient.type === 'qbittorrent') {
        await target.apiClient.createQbittorrentClient(
          downloadClient.id,
          downloadClient.host,
          downloadClient.port,
          downloadClient.username,
          downloadClient.password,
        )
      }
      if (downloadClient.type === 'sabnzbd') {
        await target.apiClient.createSabnzbdClient(downloadClient.id, downloadClient.host, downloadClient.port, downloadClient.apiKey)
      }
    }
  }

  private async linkAsApplication(target: any, services: any[]) {
    for (const service of services) {
      if (service.type === 'prowlarr') {
        const name = target.type.charAt(0).toUpperCase() + target.type.slice(1)

        const tags: number[] = []

        target.tags ??= []
        target.tags.push(target.type)

        for (const tag of target.tags ?? []) {
          const tagId = await service.apiClient.createTag(tag).then((r: any) => r.id)
          tags.push(tagId)
        }

        await service.apiClient.createResource('applications', {
          name: target.id,
          syncLevel: 'addOnly',
          implementation: name,
          configContract: `${name}Settings`,
          tags,
          fields: formatAsFields({
            baseUrl: target.host,
            apiKey: target.apiKey,
            prowlarrUrl: service.host,
          }),
        })
      }
    }
  }
}

const app = new ConfarrApp()
app.run().catch((err) => {
  logger.error(err)
  throw err
})
