import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';
import '../styles/PopupEditItem.css';

type Inputs = {
  hostname: string;
  ipAddress: string;
};

// Validation functions
const isNotEmptyOrWhitespace = (value: string): boolean => {
  return value.trim().length > 0;
};

const isValidIPv4 = (ip: string): boolean => {
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (!ipv4Regex.test(ip)) {
    return false;
  }
  const parts = ip.split('.');
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
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
    // Trim values before submitting
    const trimmedIp = data.ipAddress.trim();
    const trimmedHostname = data.hostname.trim();
    onSubmitEdit(trimmedIp, trimmedHostname);
    setIsOpen(false);
    reset();
  };

  const ipAddressRegister = register('ipAddress', {
    required: 'IP address is required',
    validate: {
      notEmpty: (value) =>
        isNotEmptyOrWhitespace(value) ||
        'IP address cannot be empty or just spaces',
      validIPv4: (value) =>
        isValidIPv4(value.trim()) ||
        'Please enter a valid IPv4 address (e.g., 192.168.1.1)',
    },
  });

  const hostnameRegister = register('hostname', {
    required: 'Hostname is required',
    validate: {
      notEmpty: (value) =>
        isNotEmptyOrWhitespace(value) || 'Hostname is required',
    },
  });

  return (
    <Popup
      open={isOpen}
      modal
      closeOnDocumentClick
      onClose={() => setIsOpen(false)}
    >
      <div onClick={()=>{}}className="edit-dialog">
        <button
          className="edit-dialog-close"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>

        <div className="edit-dialog-title">Edit Switch</div>

        <form
          className="edit-dialog-content"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
        >
          <p className="edit-label">IP Address</p>
          <input
            className="edit-input"
            placeholder={initialIpAddress}
            name={ipAddressRegister.name}
            onChange={ipAddressRegister.onChange}
            onBlur={ipAddressRegister.onBlur}
            ref={ipAddressRegister.ref}
          />
          {errors.ipAddress && (
            <span className="edit-error">{errors.ipAddress.message}</span>
          )}

          <p className="edit-label">Hostname</p>
          <input
            className="edit-input"
            placeholder={initialHostname}
            name={hostnameRegister.name}
            onChange={hostnameRegister.onChange}
            onBlur={hostnameRegister.onBlur}
            ref={hostnameRegister.ref}
          />
          {errors.hostname && (
            <span className="edit-error">{errors.hostname.message}</span>
          )}

          <div className="edit-dialog-actions center">
            <button
              type="button"
              className="edit-button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button className="edit-button primary" type="submit">
              Update Switch
            </button>
          </div>
        </form>
      </div>
    </Popup>
  );
}

export default PopupEditItem;
