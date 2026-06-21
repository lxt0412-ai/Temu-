declare namespace JSX {
  type Element = any;

  interface IntrinsicElements {
    [elementName: string]: any;
  }
}

declare module "react" {
  export type ReactNode = any;
  export type ReactElement = any;
  export type SVGProps<T> = Record<string, any> & { ref?: any };
  export type RefAttributes<T> = { ref?: any };
  export type ForwardRefExoticComponent<P> = (props: P) => JSX.Element;

  export interface ReactSVG {
    [elementName: string]: any;
  }

  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }

  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(): [T | undefined, (value: T | undefined | ((previous: T | undefined) => T | undefined)) => void];
  export function useState<T>(initialValue: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];

  export const StrictMode: (props: { children?: ReactNode }) => JSX.Element;
}

declare module "react/jsx-runtime" {
  export const Fragment: (props: { children?: unknown }) => JSX.Element;
  export function jsx(type: unknown, props: unknown, key?: unknown): JSX.Element;
  export function jsxs(type: unknown, props: unknown, key?: unknown): JSX.Element;
}

declare module "react-dom/client" {
  interface Root {
    render(children: unknown): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_IMAGE_GENERATION_PROVIDER?: string;
  readonly VITE_SEGMENTATION_PROVIDER?: string;
  readonly VITE_VISION_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
