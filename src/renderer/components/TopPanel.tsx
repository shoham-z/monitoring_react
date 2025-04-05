import { useForm, SubmitHandler } from 'react-hook-form';
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
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const onSubmit = (
    data: { hostname: any; ipAddress: any },
    close: () => void,
  ) => {
    try {
      console.log(data);
      addSwitch(data.ipAddress, data.hostname);
      close(); // close the popup
      reset(); // optional: reset the form fields
    } catch (err) {
      console.error('Error while adding switch:', err);
      // Optionally: show error message to user
    }
  };

  return (
    <div className="top-panel">
      <Popup
        trigger={<button type="button">Add Switch</button>}
        position="right center"
        modal
        nested
      >
        {(close) => (
          <form
            className="popup-content"
            onSubmit={(e) => {
              e.preventDefault(); // 👈 make sure this is here
              handleSubmit((data) => onSubmit(data, close))(e);
            }}
          >
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
        )}
      </Popup>

      <input type="text" />
    </div>
  );
}

export default TopPanel;
