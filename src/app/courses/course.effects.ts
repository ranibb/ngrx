import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { mergeMap, map, withLatestFrom, filter, tap } from "rxjs/operators";

import { CourseActionTypes, CourseRequested, CourseLoaded, AllCoursesRequested, AllCoursesLoaded } from "./course.actions";
import { CoursesService } from "./services/courses.service";
import { AppState } from "../reducers";
import { Store, select } from "@ngrx/store";
import { flagAllCoursesLoaded_Selector } from "./course.selectors";

@Injectable()
export class CourseEffects {

  @Effect()
  loadCourse$ = this.actions$
    .pipe(
      ofType<CourseRequested>(CourseActionTypes.CourseRequested),
      mergeMap(action => this.coursesService.findCourseById(action.payload.courseId)),
      map(course => new CourseLoaded({course}))
    )

  @Effect()
  loadAllCourse$ = this.actions$
      .pipe(
        ofType<AllCoursesRequested>(CourseActionTypes.AllCoursesRequested),
        withLatestFrom(this.store.pipe(select(flagAllCoursesLoaded_Selector))),
        filter(([action, flagAllCoursesLoaded_Selector]) => !flagAllCoursesLoaded_Selector),
        mergeMap(action => this.coursesService.findAllCourses()),
        map(courses => new AllCoursesLoaded({courses}))
      )

  constructor(
    private actions$: Actions, 
    private coursesService: CoursesService,
    private store: Store<AppState>) {
    
  }
}