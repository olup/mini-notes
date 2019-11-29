import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { join, dirname, basename } from "path";

const Container = styled.div<{ open?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 15px;
  transform: translateY(${props => (props.open ? "0" : "100")}%);
  transition: 0.2s;
  z-index: 6;
`;

const Line = styled.div<{ background?: string }>`
  min-height: 35px;
  display: flex;
  align-items: center;
  background-color: ${props => props.background || "#eee"};
`;

const Content = styled.div`
  flex-wrap: wrap;
  padding: 0 10px;
  min-height: 35px;
  align-items: center;
  display: flex;
`;

const Link = styled.div`
  display: inline-block;
  opacity: 0.5;
  height: 35px;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const File = styled(Link)`
  margin-right: 10px;
  white-space: nowrap;
`;

const NameInput = styled.input`
  border: none;
  background-color: transparent;
  font: inherit;
  width: 100%;
  text-align: center;
  outline: none;
`;

const Button = styled.div`
  height: 35px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  color: #ccc;
  background-color: #555;
  cursor: pointer;
  &:hover {
    background-color: #333;
  }
`;

type FileType = {
  Filename: string;
  IsDir: boolean;
};

type Props = {
  suggestedFileName?: string;
  onSelect?: (path: string) => void;
  onCancel?: () => void;
  type: "openFile" | "openDirectory" | "saveFile";
  open?: boolean;
};

export default ({
  type,
  open,
  onSelect,
  suggestedFileName,
  onCancel
}: Props) => {
  const [path, setPath] = useState("");
  const [fileName, setFileName] = useState("");
  const [list, setList] = useState<FileType[]>([]);

  useEffect(() => {
    if (window.getAppPath) window.getAppPath().then(e => setPath(e));
  }, []);

  useEffect(() => {
    setFileName(suggestedFileName ? basename(suggestedFileName) : "");
    setPath(suggestedFileName ? dirname(suggestedFileName) : "");
  }, [suggestedFileName]);

  useEffect(() => {
    if (path)
      window.listFiles(path).then(e =>
        setList(
          e
            .map((f: FileType) => ({
              ...f,
              Filename: f.Filename + (f.IsDir ? "/" : "")
            }))
            .sort((a: FileType, b: FileType) => (b.IsDir ? 1 : -1))
        )
      );
  }, [path]);

  const onFileClick = (file: FileType) => {
    if (file.IsDir) {
      setPath(join(path, file.Filename));
    } else {
      setFileName(file.Filename);
      if (type === "openFile" && onSelect) onSelect(join(path, file.Filename));
    }
  };

  const breadCrumbs = path.split("/").filter(b => !!b);

  const mainButtonLabel = () => {
    switch (type) {
      case "openFile":
        return "Open File";
      case "openDirectory":
        return "Select Directory";
      case "saveFile":
        return "Save";
    }
  };

  const onClickSave = () => {
    let finalPath = "";
    switch (type) {
      case "openFile":
      case "saveFile":
        finalPath = join(path, fileName);
        break;
      case "openDirectory":
        finalPath = path;
        break;
    }
    onSelect && onSelect(finalPath);
  };
  return (
    <Container open={open}>
      <Line background="#ddd">
        <Content>
          {breadCrumbs.map((bread, index) => (
            <Link
              onClick={() => {
                setPath(join("/", ...breadCrumbs.slice(0, index + 1)));
              }}
            >
              /{bread}
            </Link>
          ))}
        </Content>
      </Line>
      <Line>
        <Content>
          {list.map(file => (
            <File onClick={() => onFileClick(file)}>{file.Filename}</File>
          ))}
        </Content>
      </Line>
      <Line background="#ddd">
        <Button onClick={onCancel}>Cancel</Button>
        <div style={{ flex: 1 }}>
          <Content>
            <NameInput
              value={fileName}
              placeholder="file name"
              onChange={e => setFileName(e.target.value)}
            />
          </Content>
        </div>
        <Button onClick={onClickSave}>{mainButtonLabel()}</Button>
      </Line>
    </Container>
  );
};
