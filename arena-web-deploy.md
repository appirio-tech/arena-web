# Arena-web TC Deploy

### Prerequisites

- Node 10

### Config

Config env are definied in `config/tc-dev`, pay attention to following values: 

| Env Variable     | Description                                                  | Dev deploy                              | Prod deploy                         |
| ---------------- | ------------------------------------------------------------ | --------------------------------------- | ----------------------------------- |
| STATIC_FILE_HOST | This is url where the arena-web exposed to external.         | https://arena.topcoder-dev.com          | https://arena.topcoder.com          |
| TC_AUTH_URL      | TC auth url                                                  | https://accounts-auth0.topcoder-dev.com | https://accounts-auth0.topcoder.com |
| WEB_SOCKET_URL   | Arena WebSocket url. This should map to 5016 port of arena-app docker, e.g by using load balancer. | https://arenaws.topcoder-dev.com        | https://arenaws.topcoder.com        |
| API_DOMAIN       | Endpoint to TC api service.                                  | https://api.topcoder-dev.com/v2         | https://api.topcoder.com/v2         |
| TC_HOSTNAME      | TC host                                                      | https://www.topcoder-dev.com            | https://www.topcoder.com            |

### Build

```bash
# Install dependencies
npm install -g bower
npm install -g grunt-cli
npm install

# Build
source config/tc-dev.sh
grunt

# Generate build.zip
grunt deploy-compress
```

### Start

You can either use `npm start` to start a http server at 3000 port, then use load balancer to map to that port;

Or simply upload the `build.zip` to CDN.