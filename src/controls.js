const finite = (n) => Number.isFinite(n) ? n : 0;

// Input in screen axes: x right, y down. Camera yaw is measured from +Z.
export function screenMovement(x, y, yaw = 0, deadzone = 0) {
  x = finite(x); y = finite(y); yaw = finite(yaw);
  const length = Math.hypot(x, y);
  const zone = Math.min(.95, Math.max(0, finite(deadzone)));
  if (length <= zone || length === 0) return { x: 0, z: 0 };
  const strength = (Math.min(1, length) - zone) / (1 - zone);
  x = x / length * strength; y = y / length * strength;
  return { x: x * Math.cos(yaw) + y * Math.sin(yaw), z: -x * Math.sin(yaw) + y * Math.cos(yaw) };
}

export function joystickVector(clientX, clientY, rect) {
  const radius = Math.max(1, Math.min(rect.width, rect.height) * .38);
  let x = (finite(clientX) - rect.left - rect.width / 2) / radius;
  let y = (finite(clientY) - rect.top - rect.height / 2) / radius;
  const length = Math.hypot(x, y);
  if (length > 1) { x /= length; y /= length; }
  return { x, y };
}
