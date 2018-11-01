import { Injectable } from "@angular/core";
import { Effect, Actions, ofType } from "@ngrx/effects";
import { mergeMap, map } from "rxjs/operators";

import { CourseActionTypes, CourseRequested, CourseLoaded, AllCoursesRequested, AllCoursesLoaded } from "./course.actions";
import { CoursesService } from "./services/courses.service";

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
        mergeMap(action => this.coursesService.findAllCourses()),
        map(courses => new AllCoursesLoaded({courses}))
      )

  constructor(private actions$: Actions, private coursesService: CoursesService) {
    
  }
}