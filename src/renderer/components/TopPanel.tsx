import '../styles/TopPanel.css';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: { addSwitch: any; updateFilter: any }) {
  const { addSwitch, updateFilter } = props;

  const inputHandler = (e: { target: { value: any } }) => {
    updateFilter(e.target.value);
  };

  return (
    <div className="top-panel">
      <ButtonAddItem callback={addSwitch} />

      <input type="text" onChange={inputHandler} />
    </div>
  );
}

export default TopPanel;
