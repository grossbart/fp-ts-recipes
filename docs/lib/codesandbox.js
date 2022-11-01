// -----------------------------------------------------------------------------
// Helper functions for CodeSandbox
// @see https://github.com/codesandbox/codesandbox-importers/blob/master/packages/import-utils/src/api/define.ts

(function loadLzString() {
  const el = document.createElement("script");
  el.type = "text/javascript";
  el.src = "//cdn.jsdelivr.net/npm/lz-string";
  const s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(el, s);
})();

function compress(input) {
  return LZString.compressToBase64(input)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``); // Remove ending '='
}

function getParameters(parameters) {
  return compress(JSON.stringify(parameters));
}

// -----------------------------------------------------------------------------
// Styles

(function addStyles() {
  const style = document.createElement("style");
  document.head.append(style);
  style.textContent = `
  .docsify-codesandbox-button {
    cursor: pointer;
    transition: all 0.25s ease;
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    overflow: visible;
    padding: 0.65em 0.8em;
    border: 0;
    border-radius: 0;
    outline: 0;
    font-size: 1em;
    background: #808080;
    background: var(--theme-color, #808080);
    color: #fff;
    opacity: 0;
  }

  .docsify-codesandbox-button:focus,
  pre:hover .docsify-codesandbox-button {
    opacity: 1;
  }
`;
})();

// -----------------------------------------------------------------------------
// Plugin

function docsifyCodesandboxPlugin(hook) {
  const getFiles = (content) =>
    getParameters({
      files: {
        "package.json": {
          content: {
            main: "index.html",
            scripts: {
              start: "parcel index.html --open",
              build: "parcel build index.html",
            },
            dependencies: {
              "fp-ts": "^2.9",
            },
            devDependencies: {
              "parcel-bundler": "^1.6.1",
            },
          },
        },
        "tsconfig.json": {
          content: {
            compilerOptions: {
              module: "commonjs",
              moduleResolution: "node",
              target: "es2015",
              lib: ["es2015", "dom"],

              strict: true,
              noUnusedParameters: true,
              noUnusedLocals: true,
              noUncheckedIndexedAccess: true,
              noImplicitReturns: true,
              noFallthroughCasesInSwitch: true,
            },
          },
        },
        "index.html": {
          content: "<script src='src/index.ts'></script>",
        },
        "src/index.ts": { content },
      },
    });

  hook.doneEach(() => {
    Array.from(document.querySelectorAll("pre[data-lang]")).forEach((el) => {
      const content = el.querySelector("code").textContent;
      el.insertAdjacentHTML(
        "beforeend",
        [
          "<form data-id='docsify-codesandbox-form' action='https://codesandbox.io/api/v1/sandboxes/define' method='POST' target='_blank'>",
          "<input type='hidden' name='query' value='previewwindow=console' />",
          `<input type='hidden' name='parameters' value='${getFiles(content)}' />`,
          "<input type='submit' value='Run in CodeSandbox' class='docsify-codesandbox-button' />",
          "</form>",
        ].join("")
      );
    });
  });
}

window.$docsify = window.$docsify || {};
window.$docsify.plugins = [docsifyCodesandboxPlugin].concat(window.$docsify.plugins || []);
