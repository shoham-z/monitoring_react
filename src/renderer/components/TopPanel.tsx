import { useState } from 'react';
import { useForm, SubmitHandler } from "react-hook-form"
import Popup from 'reactjs-popup';
import '../styles/TopPanel.css';

type Inputs = {
  hostname: string;
  ipAddress: string;
};

function TopPanel(props: { addSwitch: any }) {
  const { addSwitch } = props;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    addSwitch(data.ipAddress, data.hostname);
  };

  return (
    <div className="top-panel">
      <Popup
        trigger={
          <button type="button" onClick={addSwitch}>
            {' '}
            Add Switch
          </button>
        }
        position="right center"
      >
        <div className="popup-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            <p>Ip Address</p>
            <input
              defaultValue="192.168."
              {...register('ipAddress', { required: true })}
            />
            {errors.ipAddress && <span>This field is required</span>}

            <p>Hostname</p>
            <input {...register('hostname', { required: true })} />

            {errors.hostname && <span>This field is required</span>}

            <input type="submit" />
          </form>
        </div>
      </Popup>

      <input type="text" />
    </div>
  );
}

export default TopPanel;
