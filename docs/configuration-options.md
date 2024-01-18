# Configuration 

| Option | Location | Description |
|  ---   |    ---   |     ---     |
| `mongo_uri` | `config/dbConfig.js` | Connection string for MongoDB. Set the username and password via `CERBERUS_DB_USER` and `CERBERUS_DB_PASS` environment variables. |
| `taskTypes` | `config/default-task-types.json` | List of task types that are supported from the outset |
| `log-level` | `config/general.json` | The lowest level of log that will actually be output to the console |
| `usePKI` | `config/security-config.json` | Whether to use PKI for authentication |
| `jwtSecret` | `config/security-config.json` | Secret to use for signing JWTs. Set this via the `CERBERUS_JWT_SECRET` environment variable instead. |
| `passwordRequirements` | `config/security-config.json` | Your requirements for user passwords. |
| `initialAdmin` | `config/security-config.json` | Details of the initial administrator account |
| `certType` | `config/security-config.json` | Which type of certificate will the server use |
| `certFile` | `config/security-config.json` | Which certificate file will the server use |
| `certPassword` | `config/security-config.json` | Password for the cert |
| `rateLimit` | `config/security-config.json` | Details of the rate limit |
| `PORT` | environment variable | Which port to run the server on |
| `NODE_ENV` | environment variable | What environment we are running in. Use `production` for a prod environment. |

