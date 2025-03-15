/* eslint-disable prettier/prettier */
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';


function SwitchGrid() {
  // send get request to get all switches/items
  const switchList = [{name:"kaban", reachability:"up"},
                      {name:"ramad", reachability:"down"},
                      {name:"reshatot", reachability:"up"}];

  // add multiple child objects

  return (
    <div className="split switch_div">
      <div className="container_flex" id="container_flex">
      {switchList.map(x=>{
        return <SwitchItem key={x.name} name={x.name} reachability={x.reachability}/>
    })}
      </div>
    </div>
  );
}

export default SwitchGrid;
