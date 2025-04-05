import '../styles/TopPanel.css';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: { addSwitch: any }) {
  const { addSwitch } = props;

  return (
    <div className="top-panel">
      <ButtonAddItem addSwitch={addSwitch} />

      <input type="text" />
    </div>
  );
}

export default TopPanel;
