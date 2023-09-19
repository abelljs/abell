import React from 'react?server';

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
