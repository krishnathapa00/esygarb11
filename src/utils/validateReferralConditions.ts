export const validateReferralConditions = ({
  userLocation,
  isAutoDetected,
  deviceId,
  existingDeviceIds = [],
}) => {
  const errors = [];

  const allowedArea = "New Baneshwor";
  if (!userLocation || !userLocation.includes(allowedArea)) {
    errors.push("User must be inside New Baneshwor.");
  }

  if (!isAutoDetected) {
    errors.push("Location must be auto-detected.");
  }

  if (!isAutoDetected && userLocation) {
    errors.push("Manually typed location is not accepted.");
  }

  if (existingDeviceIds.includes(deviceId)) {
    errors.push("Referral from the same device is not allowed.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
