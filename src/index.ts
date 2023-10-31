import path from "path";
import { Plugin, ResolveIdResult, ResolvedId } from "rollup";

export default function mapImport(option: {
  excludes: string[];
  includes: Record<string, string[]>;
}): Plugin {
  const { includes } = option;

  const excludes = option.excludes.map((v) =>
    v.split(path.sep).join(path.posix.sep)
  );
  Object.keys(includes).forEach((targetName: string) => {
    includes[targetName] = includes[targetName].map((v) =>
      v.split(path.sep).join(path.posix.sep)
    );
  });

  return {
    name: "mapImport",
    resolveId: {
      order: "pre" as "pre" | "post",
      async handler(
        source: string,
        importer: string | undefined | null,
        options: {
          assertions: Record<string, string>;
          custom?: { [plugin: string]: any };
          isEntry: boolean;
        }
      ): Promise<ResolveIdResult> {
        if (importer && excludes.some((p: string) => source.startsWith(p))) {
          return null;
        }
        if (importer) {
          const abstractPath =
            source.indexOf(path.posix.sep) >= 0
              ? path
                  .resolve(path.dirname(importer), source)
                  .split(path.sep)
                  .join(path.posix.sep)
              : source;

          let t: string | undefined;

          Object.keys(includes).some((targetName: string) =>
            includes[targetName].some((p) => {
              if (p === abstractPath) {
                t = targetName;
                return true;
              }
              return false;
            })
          );
          if (t) {
            let resolution = await this.resolve(t, importer, {
              skipSelf: true,
              ...options,
            });
            if (!resolution) {
              resolution = {
                id: t,
                moduleSideEffects: true,
                external: true,
              } as ResolvedId;
            }
            return resolution;
          }
        }
        return null;
      },
    },
  };
}
