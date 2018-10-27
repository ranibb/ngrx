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

## NgRx Effects

The LoginAction already adds a user credentials to the in-memory state of the store. If a logged-in user reloads the page, his authentication state is lost because the state was kept only in-memory of the store. To make the session survive page refreshes, we can save credentials into the local storage of the browser as a side effect produced in response to the LoginAction using NgRx Effect.

To generate a side effect to the Login class (LoginAction), we need to define a login$ observable based on the actions$ observable. Witin the pipe we specify the parametric type <Login> and pass in the LoginAction using the ngrx ofType operator. Then we write/save the user data contained in the LoginAction into local storage using the tap operator by calling setItem on local localStorage passing in a key "user" and the data in a stringified format. Finally, we need to identify the login$ observable as a source of side effect by applying on it the Effect decorator where we can configure some options. Since in our case, the login$ side effect does not produce actions as a result which could be true for other cases, we need to inform NgRx Effects of that using the dispatch false option.

We can use similar logic to implement the logout side effect where we can clear the data from local storage. Additionally, as a side effect we also want to redirect the user to the login page by injecting the router into the constructor and use it to navigate to that page.

In order to survive browser refreshes, we need to create an initializations side effect (observable) that reads from localStorgae and dispatch a Login Action to the store whenever the AuthEffects class gets created by using the rxjs defer. Since this side effect is dispatching actions, the dispatch option of the Effect decorator should be true.

So, calling getItem on localStorage passing in the "user" key, we can check, if data is available we dispatch a Login action to the store passing in the user data after parsing it to json. If data is not available (the user has effectively logged out) we dispatch a Logout action to the store. In both cases we need to return these dispatches as observable to ngrx effects using the rxjs of operator.

Finally, we need to register ngrx effects in the root module even though it does not have any side effects. Calling forRoot with empty array is essential otherwise we won't have access to certain services of the ngrx EffectsModule such as for example the action service.

### Summary
when we dispatch a Login action using the store in the LoginComponent, it's typically to report an event something that already has happened. We are reporting something that happened here in LoginComponent. Now whenever this gets dispatched to the store, the store is going to react to it.

The store will execute its reducers in response to the action. But it might also trigger side effects like what happened here. So, in this case as a side effect of the login action we are storing some data on local storage.

The key thing with the store implementation is that when we are dispatching an action we are not giving a command to the store telling the store what it should do with the action. It's the store that is going to react to the action. It's the store that is going to decide what side effect gets triggered in response to the action.

The component dispatching the action is essentially dispatching an event something that has happened in the local scope of the component. The component does not know about other components on the application and what those components are doing with the store information. It simply knows about the store from which it collects the data via selectors and it reports events back to the store using actions.


## Serving the data to the component via the router using a standard router resolver

Right now, we are serving the data to the component via the router using a standard router resolver that is taking an identifier from the URL and using it to retrieve data from the backend using a service.

As we are navigating through the application, we are continuously fetching data from the backend and repeating fetching for the same data again and again. Thus, the user is constantly seeing loading indicators on the screen causing a bad experience. Moreover, these constant HTTP requests put a lot of load on the server unnecessarily.

To improve, refactor the resolver to fetch the data only once, keep it in the store and retrieve it from the in-memory store avoiding having to call again the server.

In case of storing a collection of data, we are going to use the ngrx entity package.

## NgRx Entity

For implementing a ngrx feature, start by writing the actions; create a new actions file and define in it an enum containing action types. Each action has an origin and event.

The first action is courseRequested, dispatched by the origin of the action [View Course Page] in order to report back to the store that we are looking for a given course that we did not find inside the store. The event that is linked to this action is Course Requested. In this case we are triggering an effect that is going to call the backend to retrieve the course with the given course ID. Once that happens, that effect is going to dispatch a new action, this time around the CourseLoaded action. This means that the origin of action is no longer the [View Course Page], the origin of action is the [Courses API] call that we just made. The event that is linked to this action is Course Loaded.

Next, define a class for each action implementing the Action interface and define the read-only property type by pointing to the corresponding element of the enum. Define a constructor for each class. In case of courseRequested constructor, it is going to take a public property called payload containing a property courseId which is of type number that identifies what course was requested. In case of CourseLoaded constructor,the property of the payload is the course itself, the Course data is going to be dispatched to the store and via a reducer, the course is going to be saved in the in-memory store.

Finally, define a union type called courseActions. So, an element of type courseActions is going to be either of type courseRequested or CourseLoaded.

Now that we have defined the actions of a new ngrx feature, go ahead and define the form of the corresponding courses state in the store using ngrx entity. Thus, the Collection of courses (entities) in the store.