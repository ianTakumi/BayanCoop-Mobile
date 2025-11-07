export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password: string): boolean => {
  // Must contain at least:
  //  - 1 lowercase letter
  //  - 1 uppercase letter
  //  - 1 number
  //  - 1 special character (includes _ now)
  //  - Minimum length of 8 characters
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_])[A-Za-z\d!@#$%^&*_]{8,}$/;

  return passwordRegex.test(password);
};

export const formatPhoneNumber = (text: string) => {
  // Remove all non-digit characters
  const cleaned = text.replace(/\D/g, "");
  // Limit to 11 digits (09XXXXXXXXX)
  const limited = cleaned.substring(0, 11);
  return limited;
};
