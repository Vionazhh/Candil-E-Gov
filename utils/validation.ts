/**
 * Validation utilities for form validation and data integrity
 * Provides a flexible validation system with reusable rules
 */

/**
 * Single validation rule with validator function and error message
 */
export type ValidationRule = {
  validator: (value: any) => boolean;
  message: string;
};

/**
 * Collection of validation rules for multiple fields
 */
export type ValidationRules = {
  [key: string]: ValidationRule[];
};

/**
 * Validation errors structure matching fields with error messages
 */
export type ValidationErrors = {
  [key: string]: string | undefined;
};

/**
 * Validates a set of values against defined rules
 * @param values Object containing values to validate
 * @param rules Validation rules to apply
 * @returns Object with validation errors (if any)
 */
export const validate = (
  values: Record<string, any>,
  rules: ValidationRules
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    // Find the first rule that fails
    const failedRule = fieldRules.find((rule) => !rule.validator(value));

    if (failedRule) {
      errors[field] = failedRule.message;
    }
  });

  return errors;
};

/**
 * Common reusable validators
 */
export const validators = {
  /**
   * Required field validator
   */
  required: (message = 'This field is required'): ValidationRule => ({
    validator: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    },
    message,
  }),

  /**
   * Email format validator
   */
  email: (message = 'Please enter a valid email address'): ValidationRule => ({
    validator: (value: any) =>
      !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  /**
   * Minimum length validator
   */
  minLength: (
    length: number,
    message = `Must be at least ${length} characters`
  ): ValidationRule => ({
    validator: (value: any) => !value || value.length >= length,
    message,
  }),

  /**
   * Maximum length validator
   */
  maxLength: (
    length: number,
    message = `Must be at most ${length} characters`
  ): ValidationRule => ({
    validator: (value: any) => !value || value.length <= length,
    message,
  }),

  /**
   * Regex pattern validator
   */
  pattern: (
    regex: RegExp,
    message = 'Please enter a valid value'
  ): ValidationRule => ({
    validator: (value: any) => !value || regex.test(value),
    message,
  }),

  /**
   * Field matching validator (e.g., password confirmation)
   */
  match: (
    field: string,
    values: Record<string, any>,
    message = 'Fields do not match'
  ): ValidationRule => ({
    validator: (value: any) => value === values[field],
    message,
  }),
};

/**
 * Checks if a validation errors object contains any errors
 * @param errors Validation errors object
 * @returns True if there are errors, false otherwise
 */
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.values(errors).some((error) => !!error);
};

/**
 * Checks if all required fields have values
 * @param values Object with form values
 * @param requiredFields Array of required field names
 * @returns True if all required fields have values, false otherwise
 */
export const isComplete = (
  values: Record<string, any>,
  requiredFields: string[]
): boolean => {
  return requiredFields.every((field) => {
    const value = values[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  });
};

/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email format is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Validates a password meets minimum requirements
 * @param password The password to validate
 * @param minLength Minimum required length (default: 6)
 * @returns True if the password meets the requirements, false otherwise
 */
export const validatePassword = (password: string, minLength: number = 6): boolean => 
  password.length >= minLength;

/**
 * Validates that a name is not empty and has valid format
 * @param name Name to validate
 * @returns True if name is valid, false otherwise
 */
export function validateName(name: string): boolean {
  return name.trim().length >= 2;
} 