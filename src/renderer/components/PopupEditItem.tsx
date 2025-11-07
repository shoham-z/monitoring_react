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
            placeholder={initialIpAddress}
            {...register('ipAddress', {
              required: 'IP address is required',
              validate: {
                notEmpty: (value) =>
                  isNotEmptyOrWhitespace(value) ||
                  'IP address is required',
                validIPv4: (value) =>
                  isValidIPv4(value.trim()) ||
                  'Please enter a valid IPv4 address (e.g., 192.168.1.1)',
              },
            })}
          />
          {errors.ipAddress && (
            <span className="mui-error">{errors.ipAddress.message}</span>
          )}

          <label className="mui-label">Hostname</label>
          <input
            className="mui-input"
            placeholder={initialHostname}
            {...register('hostname', {
              required: 'Hostname is required',
              validate: {
                notEmpty: (value) =>
                  isNotEmptyOrWhitespace(value) || 'Hostname is required',
              },
            })}
          />
          {errors.hostname && (
            <span className="mui-error">{errors.hostname.message}</span>
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
