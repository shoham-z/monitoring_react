import { useState, MouseEvent } from "react";
import { Item, Menu, RightSlot, useContextMenu } from "react-contexify";
import switchImg from "../../img/switch.png";
import "../styles/SwitchItem.css";
import "react-contexify/ReactContexify.css";

function SwitchItem(props: { name: string; reachability: any; ip: any }) {
  const { name, reachability, ip } = props;
  const MENU_ID = "switch-menu"; // Same ID for all switches to allow only one open at a time

  const { show } = useContextMenu({ id: MENU_ID });
  const [editMenuOpen, setEditMenuOpen] = useState(false);

  const handleItemClick = (event) => {
    if (event.id === "edit") {
      setEditMenuOpen(true); // Open the fullscreen edit menu
    }
  };

  function displayMenu(e: MouseEvent) {
    e.preventDefault();
    show({ event: e });
  }

  return (
    <>
      <div className={`switch-item ${reachability === "up" ? "reachable" : "unreachable"}`} onContextMenu={displayMenu}>
        <img src={switchImg} alt="Switch" />
        <p>{name}</p>

        {/* Right-Click Context Menu */}
        <Menu id={MENU_ID} className="context-menu">
          <Item id="ping" onClick={handleItemClick}>
            Ping <RightSlot>Ctrl G</RightSlot>
          </Item>
          <Item id="connect" onClick={handleItemClick}>
            Connect <RightSlot>Ctrl H</RightSlot>
          </Item>
          <Item id="edit" onClick={handleItemClick}>
            Edit
          </Item>
          <Item id="delete" onClick={handleItemClick}>
            Delete
          </Item>
        </Menu>
      </div>

      {/* Fullscreen Edit Menu (Only One Opens at a Time) */}
      {editMenuOpen && (
        <div className="fullscreen-modal">
          <div className="modal-content">
            <h2>Edit Switch</h2>
            <button onClick={() => console.log("Rename clicked")}>Rename</button>
            <button onClick={() => console.log("Change Icon clicked")}>Change Icon</button>
            <button className="cancel" onClick={() => setEditMenuOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SwitchItem;
