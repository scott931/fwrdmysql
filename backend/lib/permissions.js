/**
 * Safely parse permissions from database
 * Handles various formats: JSON arrays, comma-separated strings, single strings, objects, etc.
 */
const parsePermissions = (permissions) => {
  if (!permissions) return [];

  // If it's already an array, process its contents
  if (Array.isArray(permissions)) {
    return permissions.map(permission => {
      if (permission === 'all') {
        return 'system:full_access';
      }
      return permission;
    });
  }

  // If it's a string, try to parse it as JSON
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      return parsePermissions(parsed); // Recursively process the parsed result
    } catch (error) {
      // Handle legacy format where permissions might be comma-separated strings
      if (permissions === 'all') {
        return ['system:full_access'];
      }
      if (permissions.includes(',')) {
        return permissions.split(',').map(p => p.trim());
      }
      // Single permission
      return [permissions];
    }
  }

  // If it's an object (from MySQL JSON column), convert to array
  if (typeof permissions === 'object' && permissions !== null) {
    // If it's an array-like object, convert to array
    if (Array.isArray(permissions)) {
      return parsePermissions(permissions); // Recursively process the array
    }

    // If it's a single value object, extract the value
    const values = Object.values(permissions);
    if (values.length === 1) {
      const value = values[0];
      if (value === 'all') {
        return ['system:full_access'];
      }
      if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(p => p.trim());
      }
      return [value];
    }

    // If it's an object with multiple values, return the values
    return values;
  }

  return [];
};

module.exports = { parsePermissions };