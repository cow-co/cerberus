# Notes for Supporters/Maintainers of Deployed CERBERUS Instances

## Logging

- CERBERUS logs to the console, so you may want to wrap this in a command which will redirect `stdout` to a file of your choosing.
- CERBERUS has several log levels, defined as:
  - `FATAL`: Will cause CERBERUS to be unable to run. Will generally result in a crash.
  - `ERROR`: Will cause an individual request to fail, and is caused on the *server* side. For example, a database exception.
  - `WARN`: A *client-caused* issue that will cause a single request to fail. For example, a malformed request.
  - `SECURITY`: An issue that is of  particular relevance to security. For example, a failed login. Should be treated at the same tier as `ERROR`. Will always be logged, regardless of log level configuration.
  - `INFO`: Generally useful information about the running of the application. In particular, `INFO` is used to log calls to particularly sensitive endpoints (deletes, admin endpoints, etc.)
  - `DEBUG`: Messages which are useful for developers to track the progress of the application through its various code paths. Placed at the start of most of the non-trivial functions.
- The log level can be configured in `config/general.json`
  - This should probably be set to `INFO` or `WARN` in production.
- Log message format is:
  
  `{ISO8601 timestamp} {log level} {location of logged message} {Message content}`
  - If you want a grok pattern:
  
    `%{TIMESTAMP_ISO8601:timestamp} \[%{LOGGINGLEVEL:level}\] %{WORD:httpmethod}? %{PATH:location} %{GREEDYDATA:content}`

    where `LOGGINGLEVEL` would be a custom pattern defined as

    `LOGGINGLEVEL (SECURITY|FATAL|ERROR|WARN|INFO|DEBUG)`
    - **No warranty is provided with the above patterns (or indeed with any part of CERBERUS). Always test the code you use.** 
  - Example log message:

    `2023-11-18T21:53:45.006Z [INFO] removeAdmin Deleting admin record for user ID id`
  - The `location` will be either the function name, endpoint path, or `{module}/{function}` if the function name by itself would be ambiguous. 

## Suggested High-Level Architecture

- For now, CERBERUS is designed to be run as a monolithic app
- However, it should be fairly simple to at least split the frontend from the backend
  - Indeed, I may make that the default in the near future
- In production, I recommend the following setup:
  - MongoDB (MANDATORY)
    - Clustered if you can, for resilience
  - CERBERUS (MANDATORY)
    - Obviously
  - A reverse proxy (OPTIONAL)
    - NGinx or Apache or similar
    - Due to [Advisory GHSA-xfrc-qpp5-93fc](https://github.com/cow-co/cerberus/security/advisories/GHSA-xfrc-qpp5-93fc), I suggest using the reverse proxy to rate-limit requests, at least until said advisory is resolved (and probably even after that, too).
  - An Active Directory domain (OPTIONAL)
    - This will make user management much easier
    - Since your organisation probably already has one anyway, this will also allow you to hook into existing business processes for access control.