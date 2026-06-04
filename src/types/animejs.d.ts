declare module "animejs" {
  type AnimeParams = Record<string, unknown>;
  interface AnimeInstance {
    play(): AnimeInstance;
    pause(): AnimeInstance;
    restart(): AnimeInstance;
  }
  function anime(params: AnimeParams): AnimeInstance;

  namespace anime {
    function stagger(
      value: number,
      options?: { start?: number; from?: number; direction?: "normal" | "reverse" | "random"; ease?: string }
    ): (el: unknown, i: number, total: number) => number;
  }

  export default anime;
}
