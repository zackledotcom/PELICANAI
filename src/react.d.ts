import * as React from 'react';

declare module 'react' {
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }): React.ReactElement | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
}
