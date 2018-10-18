## Key Points of the Store Architecture

The data is not tied to any particular component, the components no longer fetch the data directly. Instead, the data belongs inside a centralized service which is independent of any component which is the store.

If the components want some data they are going to subscribe to that store service which is an observable by the way.

Whenever the components need to modify the data they don't modify it directly. The data is immutable, only the store can modify the data.

In order to have the data modified, the components need to report an event back to the store under the form of an action. That's an event and not a command.

So, it's the store that is going to decide how to react to that event either by calling the backend maybe via an effect service. The store might choose to modify the data directly in memory via a reducer function. The store is then going to emit a new version of the data to any of the interested components.

## Setting Up ngrx Store with ngrx Schematics

Make sure to initialized ngrx schematics by setting a property at the level of the angular CLI:

    ng config cli.defaultCollection @ngrx/schematics

Now the angular CLI will be able to scaffold ngrx constructs such as for example reducers or actions.

Scaffold the initial state configuration of our application by generating the initial configuration for a store:

    ng generate store AppState --root --module app.module.ts

AppState is going to contain both our application data such as the courses and lessons but also any UI data that we want to keep in a central place such as for example what is the user that is currently logged-in to the application.

AppState is an interface type that defines the data content of the store. In other words, it defines the data structure of the data that is being contained inside the store.

The store is going to be emitting new versions of the application state to the multiple components.
