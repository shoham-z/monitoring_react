import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Popup from 'reactjs-popup';
import '../styles/PopupEditItem.css';
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

type PopupEditItemProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  initialHostname: string;
  initialIpAddress: string;
  initialLocation: string;
  onSubmitEdit: (ip: string, hostname: string, location: string) => void;
};

function PopupEditItem({
  isOpen,
  setIsOpen,
  initialHostname,
  initialIpAddress,
  initialLocation,
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
        location: initialLocation,
      });
    }
  }, [isOpen, initialHostname, initialIpAddress, initialLocation, reset]);

  const onSubmit = (data: Inputs) => {
    // Trim values before submitting
    const trimmedIp = data.ipAddress.trim();
    const trimmedHostname = data.hostname.trim();
    const trimmedLocation = data.location.trim();
    onSubmitEdit(trimmedIp, trimmedHostname, trimmedLocation);
    setIsOpen(false);
    reset();
  };

  const { t } = useTranslation();

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

  const locationRegister = register('location', {
    required: t('requiredLocation'),
  });

  return (
    <Popup
      open={isOpen}
      modal
      closeOnDocumentClick
      onClose={() => setIsOpen(false)}
    >
      <div className="edit-dialog">
        <button
          className="edit-dialog-close"
          type="button"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>

        <div className="edit-dialog-title">{t('editSwitch')}</div>

        <form
          className="edit-dialog-content"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit)(e);
          }}
        >
          <p className="edit-label">{t('addressField')}</p>
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

          <p className="edit-label">{t('hostnameField')}</p>
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

          <p className="edit-label">{t('locationField')}</p>
          <select
            className="edit-input"
            name={locationRegister.name}
            onChange={locationRegister.onChange}
            onBlur={locationRegister.onBlur}
            ref={locationRegister.ref}
            defaultValue={initialLocation}
          >
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>
                {t(LOCATION_OPTION_KEYS[loc])}
              </option>
            ))}
          </select>
          {errors.location && (
            <span className="edit-error">{errors.location.message}</span>
          )}

          <div className="edit-dialog-actions center">
            <button
              type="button"
              className="edit-button"
              onClick={() => setIsOpen(false)}
            >
              {t('cancel')}
            </button>
            <button className="edit-button primary" type="submit">
              {t('updateSwitch')}
            </button>
          </div>
        </form>
      </div>
    </Popup>
  );
}

export default PopupEditItem;
