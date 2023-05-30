# Data Design

## The High-Level Core Data Structures

- `Beacon`
  - This is what the implants send to the C2 server
  - These contain basic information about the implant and the host it is running on
  - These are *not* themselves stored in the database.
- `ActiveImplant`
  - This is a database object which represents an implant that has been active (ie. has beaconed to the CERBERUS server)
  - Contains just the core information about the implant
    - ID
    - Beacon interval (so we know if it has missed an interval)
    - Basic host information (as reported from the beacons)
- `Task`
  - This database object represents a task to be sent to an implant (in response to a beacon)
  - Contains the task type, as well as any arguments/parameters that are required

## Schemas

- `Beacon`
  - `implantId`
  - `os`
  - `ipv4`
  - `ipv6`
  - `beaconIntervalSeconds`: So we can ensure the `ActiveImplant` table is up to date
- `ActiveImplant`
  - `implantId`
  - `os`
  - `ipv4`
  - `ipv6`
  - `beaconIntervalSeconds`: So we can keep track of whether any implants have gone dead
- `Task`
  - `taskType`
  - `order`: So that dependent tasks can be executed in the correct order
  - `args`: A simple array of strings to pass to the commadn that the implant runs