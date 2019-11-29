import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import useMouse from "@rooks/use-mouse";

const SettingBar = styled.div<{ open: boolean }>`
  background-color: #eee;
  color: #222;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  transform: translateY(${props => (props.open ? 0 : 100)}%);
  transition: 0.2s;
  z-index: 5;
`;

const Link = styled.div<{ selected?: boolean }>`
  font-family: inherit;
  font-size: 15px;
  display: inline-block;
  cursor: pointer;
  margin-right: 10px;
  opacity: ${props => (props.selected ? 1 : 0.5)};
  transition: 0.2;
  &:hover {
    opacity: 1;
  }
`;

export default ({
  words = 0,
  chars = 0,
  autoSave = false,
  onToggleAutoSave = (autoSave: boolean) => {},
  onSave = () => {},
  onQuickSave = () => {},
  onOpen = () => {}
}) => {
  const mouse = useMouse();
  const [open, setOpen] = useState(false);
  const [stick, setStick] = useState(false);

  const mouseY = mouse.pageY || 0;

  useEffect(() => {
    if (!open && mouseY > window.innerHeight - 50) {
      setOpen(true);
    }
    if (open && mouseY < window.innerHeight - 50) {
      setOpen(false);
    }
  }, [mouseY]);

  return (
    <SettingBar open={stick || open}>
      <Link selected={stick} onClick={() => setStick(!stick)}>
        Stick
      </Link>
      <Link>|</Link>
      <Link onClick={onOpen}>Open</Link>
      <Link onClick={onSave}>Save</Link>
      <Link onClick={onQuickSave}>Quick Save</Link>
      <Link>|</Link>
      <Link onClick={() => onToggleAutoSave(!autoSave)} selected={autoSave}>
        AutoSave
      </Link>
      <div style={{ flex: 1 }} />
      <Link>
        c {chars} | w {words}
      </Link>
    </SettingBar>
  );
};
