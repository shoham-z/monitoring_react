import { useForm } from 'react-hook-form';
import '../styles/ButtonAddItem.css';
import { Dispatch, SetStateAction } from 'react';

type Inputs = {
  hostname: string;
  ipAddress: string;
};

function ButtonAddItem(props: {
  callback: any;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { callback, isOpen, setOpen } = props;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  const onSubmit = (data: { hostname: any; ipAddress: any }) => {
    try {
      callback(data.ipAddress, data.hostname);
      setOpen(false);
      reset();
    } catch (err) {
      // alert(`Error while adding switch: ${err}`);
      // Optionally: show error message to user
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    isOpen && (
      <div className="popup-wrapper">
        <form
          className="mui-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit((data) => onSubmit(data))(e);
          }}
        >
          <div className="mui-form-group">
            <label className="mui-label">IP Address</label>
            <input
              className="mui-input"
              defaultValue="192.168."
              {...register('ipAddress', { required: true })}
            />
            {errors.ipAddress && (
              <span className="mui-error">This field is required</span>
            )}
          </div>

          <div className="mui-form-group">
            <label className="mui-label">Hostname</label>
            <input
              className="mui-input"
              {...register('hostname', { required: true })}
            />
            {errors.hostname && (
              <span className="mui-error">This field is required</span>
            )}
          </div>

          <div className="mui-form-actions">
            <button
              type="button"
              className="mui-button cancel"
              onClick={() => handleClose()} // assuming you have a close handler
            >
              Cancel
            </button>
            <input
              className="mui-button primary"
              type="submit"
              value="Submit"
            />
          </div>
        </form>
      </div>
    )
  );
}

export default ButtonAddItem;
