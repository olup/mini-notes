import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useDebounce } from "use-debounce";
import { Scrollbars } from "react-custom-scrollbars";
import Settings from "./Components/Settings";
import dayjs from "dayjs";
import FileSelector from "./Components/FileSelector";
import { basename } from "path";
import MarkdownEditor from "./Components/MarkdownEditor";

declare global {
  interface Window {
    writeFile: (path: string, content: string) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    getAppPath: () => Promise<string>;
    listFiles: (path: string) => Promise<any>;
  }
}

const Main = styled.div`
  padding: 50px;
  min-height: 100vh;
  box-sizing: border-box;
  cursor: text;
`;

const Content = styled.div`
  margin: 0 auto;
  max-width: 100%;
  width: 800px;
  margin-bottom: 100px;
`;

const App: React.FC = () => {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [touched, setTouched] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [textToSave] = useDebounce(text, 1000);

  const [showFileSave, setShowFileSave] = useState(false);
  const [showFileOpen, setShowFileOpen] = useState(false);

  let scroller: Scrollbars;

  useEffect(() => {
    if (touched && filename && autoSave) window.writeFile(filename, text);
  }, [textToSave]);

  const adjustScroll = (caretTopRelative: number) => {
    if (!scroller) return;
    const windowScroll = scroller.getScrollTop();
    const windowHeight = scroller.getClientHeight();
    const caretTop = windowScroll + caretTopRelative;

    if (caretTopRelative > (windowHeight / 3) * 2) {
      const shouldBeAt = caretTop - (windowHeight / 3) * 2;
      scroller.scrollTop(shouldBeAt);
    }

    if (caretTopRelative < windowHeight / 8) {
      const shouldBeAt = caretTop - windowHeight / 8;
      scroller.scrollTop(shouldBeAt);
    }
  };

  const onTextChange = (value: string) => {
    setTouched(true);
    setText(value);
  };

  const onSave = (path: string) => {
    setFilename(path);
    window.writeFile(path, text);
    setShowFileSave(false);
    document.title = basename(path);
  };

  const onQuickSave = () => {
    const newPath = filename || dayjs().format("DD-MM-YYYY@hh:mm") + ".txt";
    window.writeFile(newPath, text);
    setFilename(newPath);
    document.title = basename(newPath);
  };

  const onOpen = (path: string) => {
    setTouched(false);
    setFilename(path);
    window.readFile(path).then(fileContent => setText(fileContent));
    setShowFileOpen(false);
    document.title = basename(path);
  };

  return (
    <div className="App">
      <Scrollbars
        autoHide
        id={"scroll"}
        style={{ width: "100vw", height: "100vh" }}
        ref={ref => ref && (scroller = ref)}
      >
        <Main
          onClick={e => {
            const elem = document.getElementById("main-text");
            elem && elem.focus();
          }}
        >
          <Content>
            <MarkdownEditor
              value={text}
              onChange={onTextChange}
              onCursorPositionChange={adjustScroll}
            />
          </Content>
        </Main>
      </Scrollbars>
      <Settings
        words={text.trim().split(" ").length}
        chars={text.trim().length}
        onQuickSave={onQuickSave}
        onSave={() => setShowFileSave(true)}
        onOpen={() => setShowFileOpen(true)}
        autoSave={autoSave}
        onToggleAutoSave={(autoSave: boolean) => setAutoSave(autoSave)}
      />
      <FileSelector
        type="saveFile"
        open={showFileSave}
        onSelect={onSave}
        onCancel={() => setShowFileSave(false)}
        suggestedFileName={
          filename || dayjs().format("DD-MM-YYYY@hh:mm") + ".txt"
        }
      />
      <FileSelector
        type="openFile"
        open={showFileOpen}
        onSelect={onOpen}
        onCancel={() => setShowFileOpen(false)}
      />
    </div>
  );
};

export default App;
