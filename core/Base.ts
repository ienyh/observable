import {
  Dispatch,
  Action,
  StateFromReducersMapObject,
  combineReducers,
  ReducersMapObject,
  Reducer,
} from 'redux'
import { TYPES, Ducks, DuckType, DucksState } from './type'
import { Streamer } from '@middleware/index'
import { Cache, collectStreamers } from '@decorator/method'

export default class Base {
  getState: () => Readonly<StateFromReducersMapObject<this['reducers']>>
  dispatch: Dispatch<Action>
  id = generateUUID()
  actionTypePrefix: string
  constructor(prefix) {
    this.actionTypePrefix = prefix
  }
  init(getState, dispatch: Dispatch<Action>) {
    this.getState = getState
    this.dispatch = dispatch
    const ducks = this.ducks
    const selector = (getState, duck) => {
      return () => getState()[duck]
    }
    Object.keys(ducks).forEach((duck) => {
      ducks[duck].init(selector(getState, duck), dispatch)
    })
  }
  get quickTypes() {
    return {}
  }
  @Cache()
  get types() {
    return makeTypes(this.actionTypePrefix, this.quickTypes) as TYPES<this['quickTypes']>
  }
  get reducers(): ReducersMapObject {
    return {}
  }
  get streamers(): Streamer[] {
    const streamers = []
    function collect(duck) {
      streamers.push(...collectStreamers(duck).map((s) => s.bind(duck)))
      Object.keys(duck.ducks).forEach((key) => {
        const subDuck = duck.ducks[key]
        collect(subDuck)
      })
    }
    collect(this)
    return streamers.reverse()
  }
  get creators() {
    return {}
  }
  get quickDucks() {
    return {}
  }
  @Cache()
  get ducks() {
    return makeDucks<this['quickDucks']>(this.quickDucks, this.actionTypePrefix)
  }
  get combinedReducer() {
    const reducer = {
      ...this.reducers,
    } as any
    const ducks = this.ducks
    Object.keys(ducks).forEach((duck) => {
      reducer[duck] = ducks[duck].combinedReducer
    })
    return combineReducers(reducer) as Reducer<
      StateFromReducersMapObject<this['reducers']> & DucksState<this['ducks']>
    >
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function makeTypes(prefix, typeEnum) {
  let typeList = []
  const types = {}
  if (typeEnum) {
    typeList = typeList.concat(Object.keys(typeEnum))
  }
  typeList.forEach((type) => {
    types[type] = `${prefix}/${type}`
  })
  return types
}

function makeDucks<T extends Record<string, DuckType<Base>>>(ducks: T, prefix: string): Ducks<T> {
  const map = {} as Ducks<T>
  for (const route of Object.keys(ducks)) {
    let Duck = ducks[route]
    map[route as keyof T] = new Duck(`${prefix}/${Duck.name}`) as any
  }
  return map
}
