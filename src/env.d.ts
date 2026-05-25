/// <reference path="../.astro/types.d.ts" />

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}
