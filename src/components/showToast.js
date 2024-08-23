import { toast } from 'react-hot-toast';

let toastId;

const showToast = (message, options = {}) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
  toastId = toast(message, options);
};

showToast.success = (message, options = {}) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
  toastId = toast.success(message, options);
};

showToast.error = (message, options = {}) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
  toastId = toast.error(message, options);
};

showToast.warning = (message, options = {}) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
  const warningOptions = {...options}
  warningOptions.icon = '⚠️'
  toastId = toast(message, warningOptions);
};

export default showToast;