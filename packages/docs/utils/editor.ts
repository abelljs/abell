import Editor, { EditorProps } from '../components/Editor.jsx';
import renderJSXComponent from './renderJSXComponent.js';

// Just a wrapper to simplify adding editor in .abell files

const editor = (editorBuilder: EditorProps): string => {
  return renderJSXComponent(Editor, editorBuilder);
};

export default editor;
