import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';
import '../styles/ButtonAddItem.css';

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
      <form
        className="popup-content"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
      >
        <p>Ip Address</p>
        <input {...register('ipAddress', { required: true })} />
        {errors.ipAddress && <span>This field is required</span>}

        <p>Hostname</p>
        <input {...register('hostname', { required: true })} />
        {errors.hostname && <span>This field is required</span>}

        <input className="button" type="submit" value="Update Switch" />
      </form>
    </Popup>
  );
}

export default PopupEditItem;
