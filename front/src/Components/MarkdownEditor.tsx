import React, { useEffect, useState, useRef } from "react";
import styled from "@emotion/styled";
import SimpleMde from "simplemde";
import "simplemde/dist/simplemde.min.css";

const Container = styled.div`
  .CodeMirror {
    padding: 0;
    border: none;
    line-height: 1.8;
    font-size: 20px;
  }
  .CodeMirror-cursor {
    border: none;
    &:before {
      content: "";
      bottom: 0;
      width: 1px;
      background-color: #222;
      position: absolute;
      top: 20%;
      left: 0;
    }
  }
  .CodeMirror,
  .CodeMirror-scroll {
    min-height: 100px;
  }
`;

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  onCursorPositionChange?: (position: number) => void;
};

export default ({ value = "", onChange, onCursorPositionChange }: Props) => {
  const simplemde = useRef<SimpleMde | null>(null);

  useEffect(() => {
    simplemde.current = new SimpleMde({
      element: document.getElementById("markdown-editor") || undefined,
      toolbar: false,
      status: false,
      spellChecker: false,
      initialValue: value,
      autofocus: true,
      placeholder: "Start a new note",
      autoDownloadFontAwesome: false
    });

    simplemde.current.codemirror.options.cursorHeight = 0.85;

    simplemde.current.codemirror.on(
      "change",
      () =>
        onChange &&
        onChange((simplemde.current && simplemde.current.value()) || "")
    );

    simplemde.current.codemirror.on(
      "cursorActivity",
      () =>
        onCursorPositionChange &&
        onCursorPositionChange(
          simplemde.current &&
            simplemde.current.codemirror.cursorCoords(true, "window").top
        )
    );
  }, []);

  useEffect(() => {
    if (simplemde.current && value !== simplemde.current.value()) {
      simplemde.current.value(value);
    }
  }, [value]);

  return (
    <Container>
      <textarea id="markdown-editor" style={{ display: "none" }} />
    </Container>
  );
};
