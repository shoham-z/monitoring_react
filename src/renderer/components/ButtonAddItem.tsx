/* eslint-disable react/jsx-props-no-spreading */
import { useForm } from 'react-hook-form';
import '../styles/ButtonAddItem.css';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCATION_OPTIONS, LOCATION_OPTION_KEYS } from '../utils';

type Inputs = {
  hostname: string;
  ipAddress: string;
  location: string;
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
  } = useForm<Inputs>({
    defaultValues: {
      ipAddress: '192.168.',
      hostname: '',
      location: 'Ramle',
    },
  });

  const { t } = useTranslation();

  // Reset the form whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: Inputs) => {
    try {
      // Trim values before submitting
      const trimmedIp = data.ipAddress.trim();
      const trimmedHostname = data.hostname.trim();
      const trimmedLocation = data.location.trim();
      callback(trimmedIp, trimmedHostname, trimmedLocation);
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const ipAddressRegister = register('ipAddress', {
    required: t('requiredIP'),
    validate: {
      notEmpty: (value) => isNotEmptyOrWhitespace(value) || t('notEmptyIP'),
      validIPv4: (value) => isValidIPv4(value.trim()) || t('validIPv4'),
    },
  });

  const hostnameRegister = register('hostname', {
    required: t('requiredHostname'),
    validate: {
      notEmpty: (value) =>
        isNotEmptyOrWhitespace(value) || t('requiredHostname'),
    },
  });

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
            <p className="mui-label">{t('addressField')}</p>
            <input
              className="mui-input"
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
            <p className="mui-label">{t('hostnameField')}</p>
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

          <div className="mui-form-group">
            <p className="mui-label">{t('locationField')}</p>
            <select
              className="mui-input"
              {...register('location', {
                required: t('requiredLocation'),
              })}
            >
              {LOCATION_OPTIONS.map((location) => (
                <option key={location} value={location}>
                  {t(LOCATION_OPTION_KEYS[location])}
                </option>
              ))}
            </select>
            {errors.location && (
              <span className="mui-error">{errors.location.message}</span>
            )}
          </div>

          <div className="mui-form-actions">
            <button
              type="button"
              className="mui-button cancel"
              onClick={() => handleClose()}
            >
              {t('cancel')}
            </button>
            <input
              className="mui-button primary"
              type="submit"
              value={t('submit')}
            />
          </div>
        </form>
      </div>
    )
  );
}

export default ButtonAddItem;
