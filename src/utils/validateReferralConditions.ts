import { DELIVERY_AREA_COORDS } from "@/data/deliveryConsts";

const isPointInPolygon = (point, polygon) => {
  let x = point.lat,
    y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].lat,
      yi = polygon[i].lng;
    let xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

export const validateReferralConditions = ({
  coordinates,
  isAutoDetected,
  deviceId,
  existingDeviceIds = [],
}) => {
  const errors = [];

  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    errors.push("Location coordinates missing.");
  }

  const insideArea = isPointInPolygon(coordinates, DELIVERY_AREA_COORDS);
  if (!insideArea) {
    errors.push("User must be inside the delivery area.");
  }

  if (!isAutoDetected) {
    errors.push("Location must be auto-detected.");
  }

  if (existingDeviceIds.includes(deviceId)) {
    errors.push("Referral from the same device is not allowed.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
