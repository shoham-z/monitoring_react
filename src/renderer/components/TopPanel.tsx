import '../styles/TopPanel.css';
import ButtonAddItem from './ButtonAddItem';

function TopPanel(props: { addSwitch: any; updateFilter: any }) {
  const { addSwitch, updateFilter } = props;

  const inputHandler = (e) => {
    console.log(e.target.value);
    updateFilter(e.target.value);
  };

  return (
    <div className="top-panel">
      <ButtonAddItem addSwitch={addSwitch} />

      <input type="text" onChange={inputHandler} />
    </div>
  );
}

export default TopPanel;
