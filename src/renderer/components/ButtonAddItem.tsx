import { useForm } from 'react-hook-form';
import '../styles/ButtonAddItem.css';
import { Dispatch, SetStateAction } from 'react';

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

  const onSubmit = (data: Inputs) => {
    try {
      // Trim values before submitting
      const trimmedIp = data.ipAddress.trim();
      const trimmedHostname = data.hostname.trim();
      callback(trimmedIp, trimmedHostname);
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
            <p className="mui-label">IP Address</p>
            <input
              className="mui-input"
              defaultValue="192.168."
              name={ipAddressRegister.name}
              onChange={ipAddressRegister.onChange}
              onBlur={ipAddressRegister.onBlur}
              ref={ipAddressRegister.ref}
            />
            {errors.ipAddress && (
              <span className="mui-error">{errors.ipAddress.message}</span>
            )}
          </div>

          <div className="mui-form-group">
            <p className="mui-label">Hostname</p>
            <input
              className="mui-input"
              name={hostnameRegister.name}
              onChange={hostnameRegister.onChange}
              onBlur={hostnameRegister.onBlur}
              ref={hostnameRegister.ref}
            />
            {errors.hostname && (
              <span className="mui-error">{errors.hostname.message}</span>
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
