import React from 'react?server';
import editor from './editor.abell';
import type { EditorConfigObjType } from '../utils/examples.js';

export const Editor = ({
  editorConfig
}: {
  editorConfig: EditorConfigObjType;
}): JSX.Element => {
  return <div dangerouslySetInnerHTML={{ __html: editor(editorConfig) }} />;
};
