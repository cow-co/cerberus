# Code Design

High-level structure of the application codebase.

## Backend

### Controllers

There will be a controller for each type of resource, basically (beacon, active implant, task, ...). These will provide the code for receiving the requests, handing things off to the services, and constructing response bodies.

### Services

There will be a service for each type of resource. These will provide a light layer of abstraction between the data layer (mongoose Models) and the controller layer; allowing us to swap out backends a little more easily. These will have pretty shallow interfaces, but I think they are useful to ensure the controllers etc. don't need to directly touch the database models. Example of one of the shallow interfaces is the `acg-service`, which I still implement as a service in order to have that level of abstration, as well as to keep ACGs consistent with the other database entity types.

### Models

These represent database-backed resources, and are implemented as Mongoose `Model`s

## Testing

Tests will be written to cover the backend. These tests will aim to cover everything that is non-trivial and of consequence (excpetion paths, error paths, happy paths). Coverage will not be used as a thresholding metric, but will be used as an indicator for where to focus attention on.

Frontend tests will not be written, since I do not think the tradeoff of time vs benefit is worth it.

## Redux/React State

We will tend to keep frontend state local to the components, as long as that state is only used in a single direct component chain (eg in a List and its list-items). When the state needs to be used across multiple chains in the DOM (eg. in a list, its list-items, and a confirmation dialogue), we extract it out to a Redux state, to provide easier sharing across components where we can't easily pass it around via props etc. This makes the Redux store a central repository for stuff that is app-wide: things like lists of implants, tasks, groups, etc.