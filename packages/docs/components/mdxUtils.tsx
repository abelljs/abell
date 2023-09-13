import React from 'react?server';
import { md } from '../utils/md.js';

export const NoteBlock = ({
  title = 'Note',
  children
}: {
  title: string;
  children: string;
}): JSX.Element => (
  <div className="mdx-utils note-block">
    <strong>{title}</strong>
    {children}
  </div>
);

export const Highlight = ({
  children,
  language = 'js'
}: {
  children: string;
  language: 'js';
}): string => {
  const mdString = '```' + language + '\n' + children + '\n```';
  // @ts-ignore
  return md([mdString]);
};
