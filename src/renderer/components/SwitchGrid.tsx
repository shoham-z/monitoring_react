/* eslint-disable prettier/prettier */
import '../styles/SwitchGrid.css';
import SwitchItem from './SwitchItem';


function SwitchGrid() {


  // send get request to get all switches/items

  // add multiple child objects
  const switchList = [{name:"kaban", reachability:"up", ip:"192.168.1.20"},
    {name:"ramad", reachability:"down", ip:"192.168.1.10"},
    {name:"reshatot", reachability:"up", ip:"192.168.1.30"}];



  return (
    <div className="split switch_div">
      <div className="container_flex" id="container_flex">
      {switchList.map(x=>{
        return <SwitchItem key={x.name} name={x.name} reachability={x.reachability} ip={x.ip}/>
    })}
      </div>
    </div>
  );
}

export default SwitchGrid;
