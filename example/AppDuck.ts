import { Action } from 'redux'
import Base from '@core/Base'
import { Observable } from 'rxjs'
import { StreamerMethod } from '@decorator/method'
import { filterAction } from '@operator/index'
import { Route } from '@duck/route/Route.duck'
import { PayloadAction } from '@core/type'

enum Type {
  INCREMENT,
  DECREMENT,
}
export default class AppDuck extends Base {
  get quickDucks() {
    return {
      ...super.quickDucks,
      route: Route,
    }
  }
  get quickTypes() {
    return {
      ...super.quickTypes,
      ...Type,
    }
  }
  get reducers() {
    const types = this.types
    return {
      name: (state: string) => 'init name',
      timestamp: (state: number) => Date.now(),
      count: (state = 0, action) => {
        switch (action.type) {
          case types.INCREMENT:
            return state + 1
          case types.DECREMENT:
            return state - 1
          default:
            return state
        }
      },
    }
  }
  get creators() {
    const types = this.types
    return {
      ...super.creators,
      increment: () => ({ type: types.INCREMENT }),
      decrement: () => ({ type: types.DECREMENT }),
    }
  }

  @StreamerMethod()
  incrementStreamer(action$: Observable<Action>) {
    const duck = this
    return action$.pipe(filterAction(duck.types.INCREMENT)).subscribe((action) => {
      const state = duck.getState()
    })
  }

  @StreamerMethod()
  preform(action$: Observable<PayloadAction<string>>) {
    const duck = this
    const { types, ducks, dispatch } = duck
    return action$.pipe(filterAction([types.INCREMENT])).subscribe((action) => {
      dispatch({
        type: ducks.route.types.PUSH,
        payload: {
          sub: Math.random().toString().substring(3, 8),
        },
      })
    })
  }
}
