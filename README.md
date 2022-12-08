# Confarr

Quickly configure *arr apps using a simple configuration file and relevant APIs.

Currently, it does a few things
 * Add all compatible apps (sonarr, radarr, lidarr, readarr) to prowlarr
   * Add tags to apps, including an automatic one defining its type
 * Add all downloaders (transmission, qbittorrent) to all compatible apps
 * Add media paths to compatible apps (sonarr, radarr, lidarr)

I will be adding more features as requested and needed by myself, feel free to [create an issue or PR!](https://github.com/tylergets/confarr/issues/new)

## Usage
Create a config.json, sample below, in your current directory; then use the following docker command to apply your configuration.

```shell
docker pull ghcr.io/tylergets/confarr:latest

docker run \
  -v $(pwd):/config \
  ghcr.io/tylergets/confarr
```

Check out the logs for details!

### Sample Configuration File

Save as config.json in your local directory.

```json
{
  "services": [
    {
      "id": "radarr",
      "type": "radarr",
      "host": "radarr.example.com",
      "port": 443,
      "https": true,
      "paths": [
        "/mnt/media/movies"
      ],
      "tags": [
        "movies"
      ]
    },
    {
      "id": "sonarr",
      "type": "sonarr",
      "host": "sonarr.example.com",
      "port": 443,
      "https": true,
      "paths": [
        "/mnt/media/tv"
      ],
      "tags": [
        "tv"
      ]
    },
    {
      "id": "prowlarr",
      "type": "prowlarr",
      "host": "prowlarr.example.com",
      "port": 443,
      "https": true
    },
    {
      "id": "readarr",
      "type": "readarr",
      "host": "readarr.example.com",
      "port": 443,
      "https": true,
      "tags": [
        "books"
      ]
    }
  ],
  "downloaders": [
    {
      "id": "transmission",
      "type": "transmission",
      "host": "transmission.example.com",
      "port": 443,
      "https": true
    },
    {
      "id": "transmission-vpn",
      "type": "transmission",
      "host": "transmission-vpn.example.com",
      "port": 443,
      "https": true
    },
     {
        "id": "sabnzbd",
        "type": "sabnzbd",
        "host": "sabnzbd.example.com",
        "port": 8080,
        "https": false,
        "apiKey": "apikey"
     },
     {
      "id": "qbittorrent",
      "type": "qbittorrent",
      "host": "qbittorrent.example.com",
      "port": 443,
      "https": true,
      "username": "admin",
      "password": "adminadmin"
    }
  ]
}
```

JSON is also supported.

#### Development
```shell
docker build -t confarr .

docker run \
  -e DRY_RUN=true \
  -v $(pwd):/config \
  confarr
```

## Alternatives
 * https://github.com/Flemmarr/Flemmarr