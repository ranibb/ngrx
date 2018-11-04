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

For implementing a ngrx feature, start by writing the actions. For that, define an enum containing action types. The first action is EntityRequested, dispatched by the origin of the action [View Entity Page] in order to report back to the store that we are looking for a given entity that we did not find inside the store. The event that is linked to this action is 'Entity Requested' in which we are triggering an effect that is going to call the backend to retrieve the entity with the given entity ID. Once that happens, that effect is going to dispatch a new action, this time around the EntityLoaded action. This means that the origin of action now becomes the [Entities API] call that we just made and the event that is linked to this action is 'Entity Loaded'.

After defining an enumeration containing action types where each action has an origin and event, define a class for each action in the enumeration by implementing the Action interface and define the read-only property type by pointing to the corresponding element of the enumeration.

Define a constructor for each class. In case of EntityRequested class, the constructor is going to take a public property called payload containing a property entityId that identifies what entity was requested. In case of EntityLoaded class, the constructor’s payload is the entity itself. 

    Via a resolver, you could use the EntityRequested action to dispatch the identifier to the store, reporting an event. The store might decide to call the backend via an effect which in turn triggers the EntityLoaded action. The entity is saved in the in-memory store via a reducer.

To complete definition of the actions, declare a union type called EntityActions. So, an element of type EntityActions is going to be either of type EntityRequested or EntityLoaded.

Now that we have defined the actions of a new ngrx feature, we will define the form of the corresponding entities state in the store using ngrx entity package.

## Storing a collection of entities in the in-memory store

In a new reducers file, we could be tempted to store the coursesEntities (a collection) in an array which leads to a couple of problems. Looping through a large array looking for a course (entity) with a given ID is potentially inefficient. Operations such as adding a course in the middle of the array, adding a course to the end, deleting only part of the array or even updating a course, generates a lot of boilerplate in our reducers and it's potentially inefficient for a large collection.

Also, what if we have another collection. If we would store this also in an array, we would have to write the same reducer logic for doing the same operations. We would have to implement that per collection that we add to our application. That would mean adding a lot of boilerplate to our application and we want to avoid that.

A better way of storing a collection in memory is to use a map. The map is going to have a key which is going to be the ID of the course (Id of the entity) and the value would be the course (the entity). This way we can do a lookup by ID very quickly. But there is a problem in storing our collection as a map which is we lose the information about in which order the courses (entities) are sorted. Typically, a collection has an order and that is important information for our user interface. To preserve the order of the courses (entities) that we are storing, we can store the courses order (entities order) in an array where each course order (entity order) would be the ID of the given course (entity). This means that in our reducers in certain operations such as adding an entity to the collection, we would have to populate a couple of properties, an entities property and an order property.

And of course, if we would have another collection such as for example the lessonsEntities, we would have to define a similar type for storing the lessons (entities). This would become very repetitive as we would need to define this for every single model of our application and we want to avoid that.

In order to avoid having to define an interface per each collection of entities and in order to avoid having to write that reducer logic over and over again for each collection type, we are going to leverage the ngrx entity package by extending the interface with the EntityState interface with a parametric type Course.

In order to easily generate selectors and implement reducers functions for this entity, we define an entity adapter for this collection type Course by calling the createEntityAdapter function.

One of the methods that this adaptor makes available for us is a method called getSelectors which gives us a series of commonly used selectors such as selecting all the entities in the collection. Also, we have the method getInitialState that helps us to produce the initial state that we need to pass to our reducer.

## Implementing a Router Resolver using NgRx Store

In order to configure the CourseResolver (EntityResolver) to use the store we are going to need a selector for queering the store with a given ID. If the course (entity) already exist, return it immediately. Otherwise, dispatch the CourseRequested action.

In a new selectors file, as usual the first thing that we're going to do is to define a feature selector for the CoursesState. For that declare a constant selectCoursesState and assign to it the createFeatureSelector utility function from ngrx store with a parametric type CoursesState and to the argument of this utility specify the property name “courses” under which we are going to find the state in the ngrx dev tools.

The feature selector will return the complete CoursesState meaning the courses (entities) and the array of IDs that preserves the courses order. So, we are returning the CoursesState interface that we have defined in the reducers file.

Now with this feature selector in place we are ready to define our first selector, selectCourseById.

To create a selector that finds a course (entity) by ID, means that we need a selector with a parameter. Therefore, we cannot define it directly by calling createSelector. Instead we are going to define a function that is going to take the identifier courseId as parameter and return a createSelector function passing in a couple of arguments: The first argument is a list of selectors that we want to apply, in our case we have selectCoursesState. The last argument is a projector function that is going to take the CoursesState selected by the feature selector. So, this is the complete CoursesState containing both the course (entity) and the identifier of this entity.  You can now look inside the entities dictionary with the identifier courseId. 

So, selectCourseById selector is going to return one of two things: It will return undefined If the course with the give identifier is not present in the store or it will return the course (entity) itself If it is already there. 

Now have everything that we need to implement the new version of our course resolver.

So, in our resolver, we are no longer going to do a call each time that we do a route navigation. Instead, the first thing that we're going to do is to query the store to see if the course with the given identifier is already there. For that pipe in the rxjs select operator passing to it the selectCourseById function passing to it the identifier coursed. The result of this call is an observable that it's either going to returns a course (entity) if it is present or undefined.

To handle the case when the course is not present in the store, we will use the rxjs tap operator to dispatch a new CourseRequested action containing the courseId property. Remember: This is not a command to the store saying what it should do. This is reporting to the store an event that has happened.

And with this, the implementation of this course resolver is practically completed but we are missing a couple of small details:

The first thing, what happens if the course is not yet available in the store. If that's the case we don't want the router transition to go through. So, we want to filter out this undefined value. We don't want to send that to the router. Let's then use the rxjs filter operator and filter out the cases when the course is not yet available in the store.

The second thing, for the router transition to go through and considered completed, we need to make sure that this observable terminates only when this observable gets completed. So, whenever we meet our first course we will have this observable completed using the ngrx first operator. If we don't call the rxjs first operator then the router transition is never going to complete and we're going to remain in the source route. We will never reach the target route.

And with this we have finished the implementation of our resolver. We have detected that this course was needed in the store and we have informed the store of that request. The store is then going to decide what to do with this request. In this case we are going to be sending a call to our backend using a ngrx effect.

## Loading Data From the Backend using NgRx Effects

In a new effects file, implement a new ngrx effect that is going to listen for actions of type CourseRequested and in response to that, it’s going to fetch a course from the backend.

Begin with creating a side effects class that we're going to call CourseEffects. This is going to contain all the effects linked to the course entity. Make it an angular service by annotating the class with the injectable decorator and then in the coursesModule declare it as being a ngrx feature module that contains feature side effects. For that use EffectsModule.forFeature method and pass it in the CourseEffects class. And with this our CourseEffects classes is plugged into the framework so let's now implement a side effect called loadCourse$.

Annotate this side effect observable with the Effect decorator and inject the ngrx effects actions$ observable into the class constructor that we are going to be using to derive our loadCourse$ observable. So, actions$ is of type Actions that is imported from the ngrx effects package.

The type of actions we are responding to with the side effect loadCourse$ are of type CourseRequested. So, in order to obtain it from the actions$ observable, we will pipe in the ngrx operator ofType and reach out to it through enum CourseActionTypes. Also add to the ngrx operator ofType a parametric type <CourseRequested>. This is going to return an observable that emits values of type CourseRequested. At this point we are essentially filtering for actions of type CourseRequested.

With this action in hand, switch to a call to the backend using the rxjs mergMap operator and reach out to the findCourseById method available in the CoursesService which is injected to the constructor and pass to this method the courseId that we have in the payload of CourseRequested action. The result of calling mergeMap is going to be an observable that is going to be emitting the course objects coming from the backend.

With the course object in hand, we are going to instantiate a CourseLoaded action from it using the rxjs map operator. And with this, the loadCourse$ side effect is now emitting actions containing the course being sent to the store which in turn will save it in memory via a reducer. After that, the course can be broadcasted to the [view course page].

NgRx entity makes it very simple to write reducers for entities using the adaptor.

*Why using mergeMap and not switchMap?*

Because we don't want any cancellation logic on this request. mergeMap would cause multiple parallel requests in case our CourseRequested action was going to be emitted multiple times.

Some actions that are linked to the clicking of a button might potentially be issued multiple times. That does not happen in the concrete case of this action so we can go ahead and use the mergeMap operator.

## Implementing an NgRx Entity Reducer

As we have just fetched a course from the backend using the loadCourse$ effect and we have dispatched it to the store using the CourseLoaded action. Let's then go ahead and write the reducer logic for the CourseLoaded action that will save the course in-memory to the CoursesState that extends the EntityState from ngrx entity package.

We need to Specify to the EntityState a parametric type of Course, the model of Course data. Notice, the CoursesState is represented in store as an object that will contain the entities map and the ids array. Each entity in the entities map has a key (ID of the course) and a value (course). The array will store the ID of the courses in order. Thus, preserving the information about in which order the entities are sorted.

With that in mind, create a reducer function and name it CoursesReducer. As usual the first argument of a reducer function is the state and the second argument is an action of type CourseActions. So, an element of type CourseActions is going to be either of type CourseRequested or CourseLoaded.  The result of the reducer function is going to be CoursesState. As usual in the implementation of a reducer body, we are going to do a switch on the action type to handle multiple actions.

In case of CourseLoaded action, we want to take the course from the action payload and add it to the CoursesState. In order to create a new copy of the CoursesState which is a ngrx entity, we first need to create an entity adaptor of type EntityAdapter from ngrx entity package. We need to specify to the  EntityAdapter a parametric type of Course, the model of Course data.

The adaptor will provide the addOne method that takes the course we want to add to the store as first argument, and the initial state copy as a second argument. The initial state can be defined using the adaptor’s method getInitialState. So, declare a constant initialCoursesState of type CoursesState and use it as a default value to the state parameter of the coursesReducer.

Last but not least, as usual add the default case clause to handle a case when this reducer does not react to this particular action. So, in this case we don't know what reducer logic to apply to this action so we are going to return the state as it is.

Finally, Register the CoursesReducer in the CoursesModule by passing it to the StoreModule.forFeature method along with the string ‘courses’ name under which this feature state is going to be visible in the dev tools.

Now reload the application and switch to the dev tools. Take a look at our state… We have concluded the implementation of the course resolver using the ngrx store solution instead of making calls to the backend each time.

## Courses List Component - Implementing the Store Solution

After defining the actions that we need for our new ngrx application feature, let's go ahead and refactor the home component. So instead of being responsible for fetching the data that it needs from the backend and storing that data locally in observables that we are defining as member variables, the ngrx store will take this responsibility of fetching and storing the data.

So, If the component needs some data, it is going to query the store by piping in the ngrx select operator which in turn will apply a selector from the selectors file that is selecting the slice of data we need which is a list of courses.

So, in the selectors file, Let’s define this new selector selectAllCourses using createSelector function as usual and apply the feature selector “selectCourseState” that is selecting the complete CoursesState and generate the output of the selector by writing the projector function. 

One way:

To this function we are going to have the argument CoursesState and to the implementation of this function, we could manually write some logic that gets the ids. Then applying object.values to this entities map, we will get a complete list of courses then we will have to sort the courses according to the ids that are defined in the IDs array.

Alternative way:

Instead of doing that manually, it’s much easier to use the adapter that we have created in the reducers file to quickly generate such commonly needed operations. So, following a common ngrx convention, we are going to create our entity selectors at the bottom of our reducers file, by declaring an exportable constant object and equalizing it to the adaptor’s function getsSelectors. The object now would contain a list of very commonly used selectors such as selectAll selector. If you check the signature of the selectAll selector, this is taking a state of type `EntityState<course>` and it's returning an array. So, this array is going to be sorted according to the IDs array that we are storing also in memory in the store.

Back to the selectors file, Let's import everything from the reducers file as fromCourse and apply the selectAll in place of the projector function.

So, now home component is no longer fetching the data directly. It's instead fetching it from the store. But the problem is that the first time this component gets loaded, nothing is present on the store. In order to signal to the store that the courses data is needed, we need to dispatch the AllCoursesRequested action that we have defined in the actions file.

As we can see, the home component will no longer need the CoursesService. It only needs the store in order to fetch its data. With this we have finished the refactoring of our home component. This is a good example of what is known as a Container Component using the ngrx terminology. It's a component that gets the store injected on its constructor and it queries the data that it needs using a selector.

Let's now implement the side effect that is going to load the data and save it in the store.

## A side effect to fetch & dispatch data and a clause in the reducer to save data in the store.

As we have dispatched the AllCoursesRequested action to the store, let's implement the side effect that is going to fetch the data from the backend and dispatch it to the store by instantiating the AllCoursesLoaded action. Then in the reducer, we need to implement a case clause for the instantiated action where we will adapt the data into a new CoursesState and save it to the store using the addAll method provided by the EntityAdapter.

This data will have a life cycle independent of the component. As the component gets destroyed through application navigation, the data will still be available in the store. But notice that whenever the home component gets instantiated this effect will each time fetch the data again from the back end. We have not yet implemented the logic that will conditionally fetch the data only if the data is not yet present.

## NgRx Effects Conditional Data Loading

Instead of continuously hitting the server fetching again and again the same data, we're going to load the data only once, the first time that we need it. From there on, we will keep the data in the store. So, in our effect we want to call the backend conditionally. For that, we need to query the store and see if the CoursesState contains any data or not. But how to determine if the data has been loaded or not? The store just happened to be empty and there were no courses yet in our platform.

The CoursesState would contain an array of IDs and a map of entities. We would like to extend this state feature by adding a flag that is going to be true or false, indecating if data is loaded or not. So, we are extending the EntityState with an extra boolean flag, flagAllCoursesLoaded. As a consequence of this extension, we need to pass this extra property to the adapter’s method getInitialState via a parameter object with an initial value of false. This way, our store will know that we have not fetched the list from the backend. And in that case, we are going to trigger the request.

To query the store for this specific flag state, we need a selector for it. So, create this selector using CreateSelector function passing in a couple of arguments, the feature selector which contains the complete state of the CoursesState and a projector function that will project out the flag state out of the complete state.

Back to the effect, we could use the rxjs withLatestFrom operator to couple the observable that contains the action of type AllCoursesRequested with an new observable that is selecting the flag state with the help of the ngrx select operator. This coupling will produce a tuple variable containing the results from both observables. Passing this tuple to the rxjs filter operator, we can decide if we should proceed to the backend call or not depending on the flag state.

What we need to do now to finish this implementation is to set flagAllCoursesLoaded to true whenever the courses are first loaded. So, in the case clause of AllcoursesLoaded action in our reducer, we modify this flag as we add the courses to the state. This is done by passing in a copy of the state along with the flag property being set to true. So, whenever we dispatched AllcoursesLoaded action to the store, we also set the flag to true and that will prevent the backend from being called again due to the filter condition.