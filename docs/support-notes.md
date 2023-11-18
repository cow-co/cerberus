# Notes for Supporters/Maintainers of Deployed CERBERUS Instances

## Logging

- CERBERUS logs to the console, so you may want to wrap this in a command which will redirect `stdout` to a file of your choosing.
- CERBERUS has several log levels, defined as:
  - `FATAL`: Will cause CERBERUS to be unable to run. Will generally result in a crash.
  - `ERROR`: Will cause an individual request to fail, and is caused on the *server* side. For example, a database exception.
  - `WARN`: A *client-caused* issue that will cause a single request to fail. For example, a malformed request.
  - `SECURITY`: An issue that is of  particular relevance to security. For example, a failed login. Should be treated at the same tier as `ERROR`. Will always be logged, regardless of log level configuration.
  - `INFO`: Generally useful information about the running of the application.
  - `DEBUG`: Messages which are useful for developers to track the progress of the application through its various code paths.
- The log level can be configured in `config/general.json`
  - This should probably be set to `INFO` or `WARN` in production.