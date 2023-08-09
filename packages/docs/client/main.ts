import '@fontsource/inter/400.css';
// import 'virtual:vite-svg-2-webfont.css';
import './global.css';
import '../client/mdxUtils.scss';
import { registerSyntaxHighlighter } from './registerSyntaxHighlighter.js';

const hljs = registerSyntaxHighlighter();

hljs.initHighlightingOnLoad();
