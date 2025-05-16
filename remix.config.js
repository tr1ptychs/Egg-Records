/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
  // Asset configuration
  assetsBuildDirectory: "/build/client/assets",
  publicPath: "/build/",
  // Development server
  // Enable CSS handling
  postcss: true,
  tailwind: false 
};
