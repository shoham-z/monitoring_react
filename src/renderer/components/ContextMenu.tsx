/* eslint-disable prettier/prettier */
import { useState, useEffect } from 'react';
import '../styles/ContextMenu.css';


function ContextMenu(props: {top:any, left:any}) {
  const {top, left} = props;
  const [xPos, setXPos] = useState(top);
  const [yPos, setYPos] = useState(left);
  const [showMenu, setShowMenu] = useState(true);


  alert(showMenu)

  useEffect(() => {
    const handleClick = () => {
      if (showMenu) setShowMenu(false);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setXPos(`${e.pageX}px`);
      setYPos(`${e.pageY}px`);
      setShowMenu(true);
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [showMenu]); // Dependency ensures event listeners update when showMenu changes

  return showMenu ? (
    <ul
      className="menu"
      style={{
        top: yPos,
        left: xPos,
        position: "absolute",
      }}
    >
      <li>Login</li>
      <li>Register</li>
      <li>Open Profile</li>
    </ul>
  ) : null;
}

export default ContextMenu;
