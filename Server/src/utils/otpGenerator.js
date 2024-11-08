/**
 * Utility function to generate a 6-digit OTP.
 *
 * @returns {string} - A string representing the 6-digit OTP.
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};

export { generateOTP };
