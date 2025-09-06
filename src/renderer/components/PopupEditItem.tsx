import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';
import '../styles/PopupEditItem.css';

type Inputs = {
  hostname: string;
  ipAddress: string;
};

type PopupEditItemProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialHostname: string;
  initialIpAddress: string;
  onSubmitEdit: (ip: string, hostname: string) => void;
};

function PopupEditItem({
  isOpen,
  setIsOpen,
  initialHostname,
  initialIpAddress,
  onSubmitEdit,
}: PopupEditItemProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Inputs>();

  useEffect(() => {
    if (isOpen) {
      reset({
        hostname: initialHostname,
        ipAddress: initialIpAddress,
      });
    }
  }, [isOpen, initialHostname, initialIpAddress, reset]);

  const onSubmit = (data: Inputs) => {
    onSubmitEdit(data.ipAddress, data.hostname);
    setIsOpen(false);
    reset();
  };

  return (
    <Popup
      open={isOpen}
      modal
      closeOnDocumentClick
      onClose={() => setIsOpen(false)}
    >
      <div className="mui-dialog">
        <button className="mui-dialog-close" onClick={() => setIsOpen(false)}>
          &times;
        </button>

        <div className="mui-dialog-title">Edit Switch</div>

        <form
          className="mui-dialog-content"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
        >
          <label className="mui-label">IP Address</label>
          <input
            className="mui-input"
            {...register('ipAddress', { required: true })}
          />
          {errors.ipAddress && (
            <span className="mui-error">This field is required</span>
          )}

          <label className="mui-label">Hostname</label>
          <input
            className="mui-input"
            {...register('hostname', { required: true })}
          />
          {errors.hostname && (
            <span className="mui-error">This field is required</span>
          )}

          <div className="mui-dialog-actions center">
            <button
              type="button"
              className="mui-button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button className="mui-button primary" type="submit">
              Update Switch
            </button>
          </div>
        </form>
      </div>
    </Popup>
  );
}

export default PopupEditItem;
