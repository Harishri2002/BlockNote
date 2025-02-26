import type { Project } from "../util";

const template = (project: Project) => ({
  __comment: "AUTO-GENERATED FILE, DO NOT EDIT DIRECTLY",
  compilerOptions: {
    target: "ESNext",
    useDefineForClassFields: true,
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    allowJs: false,
    skipLibCheck: true,
    esModuleInterop: false,
    allowSyntheticDefaultImports: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    module: "ESNext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",
    composite: true,
  },
  include: ["."],
  __ADD_FOR_LOCAL_DEV_references: [
    {
      path: "../../../packages/core/",
    },
    {
      path: "../../../packages/react/",
    },
  ],
});

export default template;
