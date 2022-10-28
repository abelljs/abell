import { defineConfig } from "abell";
import vitePluginMdToHTML from "vite-plugin-md-to-html";
import { abellHighlighter } from "./utils/abell-syntax-highlighter";

export default defineConfig({
  plugins: [vitePluginMdToHTML({
    syntaxHighlighting: true,
    highlightJs: {
      register: {
        'abell': abellHighlighter,
      }
    }
  })]
})