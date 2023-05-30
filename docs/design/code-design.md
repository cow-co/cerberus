# Code Design

High-level structure of the application codebase.

## Backend

### Controllers

There will be a controller for each type of resource, basically (beacon, active implant, task, ...). These will provide the code for receiving the requests, handing things off to the services, and constructing response bodies.

### Services

There will be a service for each type of resource. These will provide a light layer of abstraction between the data layer (repositories) and the controller layer; allowing us to swap out backends a little more easily. The services will also contain most of the business logic, around validation and so on. In comparison, the controllers and repositories will be fairly "dumb".

### Repositories

There will be a repository for each database-backed resource. These will interface with the database itself, and therefore we will need a new set if we choose to change database system.

### Entities

These represent database-backed resources.

### Data Transfer Objects (DTOs)

These are the forms of object that will be sent around over the network. These may often differ from their equivalent entity, by addition or omission of certain fields, formatting of certain fields, or simply because there is no corresponding entity (in the case of the `beacon` for example).