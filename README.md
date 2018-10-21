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

## Exploring the Centralized Store Service API

The store itself is an observable that we can subscribe to it and combine it with other observables as well. The multiple values emitted by the store observable are instances of application state. Therefore, the store is an observable of application state.
The store is a centralized Singleton service that acts as an in-memory database.
It is going to contain all our application state meaning both the data of the application and any other user interface state that we want to keep on a centralized place.
Because the store is an observable, we should not directly modify the data that it's emitting. Instead, if we want to modify the data that is available inside the store let's say that for example we would like to load the list of courses, for that we need to dispatch an action to the store. The store is then going to react to the action which is essentially an event and it's going in response to that produce a new version of the application state.

# NgRx Effects

The LoginAction already adds a user credentials to the in-memory state of the store. If a logged-in user reloads the page, his authentication state is lost because the state was kept only in-memory of the store. To make the session survive page refreshes, we can save credentials into the local storage of the browser as a side effect produced in response to the LoginAction using NgRx Effect.

To generate a side effect to the Login class (LoginAction), we need to define a login$ observable based on the actions$ observable. Witin the pipe we specify the parametric type <Login> and pass in the LoginAction using the ngrx ofType operator. Then we write/save the user data contained in the LoginAction into local storage using the tap operator by calling setItem on local localStorage passing in a key "user" and the data in a stringified format. Finally, we need to identify the login$ observable as a source of side effect by applying on it the Effect decorator where we can configure some options. Since in our case, the login$ side effect does not produce actions as a result which could be true for other cases, we need to inform NgRx Effects of that using the dispatch false option.

We can use similar logic to implement the logout side effect where we can clear the data from local storage. Additionally, as a side effect we also want to redirect the user to the login page by injecting the router into the constructor and use it to navigate to that page.