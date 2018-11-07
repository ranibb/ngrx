import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { mergeMap, map, withLatestFrom, filter, tap, catchError } from "rxjs/operators";

import { CourseActionTypes, CourseRequested, CourseLoaded, AllCoursesRequested, AllCoursesLoaded, LessonsPageRequested, LessonsPageLoaded, LessonsPageCancelled } from "./course.actions";
import { CoursesService } from "./services/courses.service";
import { AppState } from "../reducers";
import { Store, select } from "@ngrx/store";
import { flagAllCoursesLoaded_Selector } from "./course.selectors";
import { of } from "rxjs";

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

  @Effect()
  loadLessonsPage$ = this.actions$
  .pipe(
    ofType<LessonsPageRequested>(CourseActionTypes.LessonsPageRequested),
    mergeMap(({payload}) => this.coursesService.findLessons(payload.courseId, payload.page.pageIndex, payload.page.pageSize).pipe(
      catchError(err => {
        console.log('error loading a lessons page', err);
        this.store.dispatch(new LessonsPageCancelled())
        return of([])
      }),
    )),
    map(lessons => new LessonsPageLoaded({lessons})),
  )

  constructor(
    private actions$: Actions, 
    private coursesService: CoursesService,
    private store: Store<AppState>) {
    
  }
}