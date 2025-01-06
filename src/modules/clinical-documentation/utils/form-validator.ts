import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

export interface ValidationResult {
  isValid: boolean;
  errors?: ErrorObject[] | null;
}

export class FormValidator {
  private static ajv: Ajv;

  private static getValidator(): Ajv {
    if (!FormValidator.ajv) {
      FormValidator.ajv = new Ajv({
        allErrors: true,
        strict: false,
        validateFormats: true
      });
      addFormats(FormValidator.ajv);

      // Add custom formats if needed
      FormValidator.ajv.addFormat('time', /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/);
      FormValidator.ajv.addFormat('phone', /^\+?[\d\s-]{10,}$/);
    }
    return FormValidator.ajv;
  }

  static validateFormData(data: any, schema: any): ValidationResult {
    const validator = FormValidator.getValidator();
    const validate = validator.compile(schema);
    
    const isValid = validate(data);

    return {
      isValid,
      errors: validate.errors
    };
  }

  static validateRequired(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  static validateNumericRange(value: number, min?: number, max?: number): boolean {
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  }

  static validateDateRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
    const valueDate = new Date(date);
    if (minDate && valueDate < minDate) return false;
    if (maxDate && valueDate > maxDate) return false;
    return true;
  }
}