import * as React from "react";
import { Store as ReduxStore, Middleware } from "redux";
import { StreamMiddleware } from 'redux-observable-action';
import { ConnectedProps, DuckState, DuckType, PayloadAction } from "..";
import Base from "./Base";
export interface DuckRuntimeOptions {
    prefix?: string;
    middlewares?: Middleware[];
}
export default class Runtime<TDuck extends Base = Base> implements Disposable {
    static create<T extends Base>(Duck: DuckType<T>, options?: DuckRuntimeOptions): Runtime<T>;
    duck: TDuck;
    protected redux: ReduxStore;
    protected middleware: StreamMiddleware<PayloadAction, DuckState<TDuck>>;
    protected constructor(Duck: DuckType<TDuck>, options?: DuckRuntimeOptions);
    protected initReduxStore(extraMiddlewares?: Middleware[]): void;
    connect<OriginProps>(Component: React.FunctionComponent<OriginProps & ConnectedProps<TDuck>>): React.FunctionComponent<OriginProps>;
    [Symbol.dispose](): void;
}
