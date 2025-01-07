import { ValidationRuleType, IValidationRule } from '@/common/interfaces/form-component.interface';

export class FormValidator {
  static validateField(value: any, rules: IValidationRule[]): string | null {
    for (const rule of rules) {
      const error = FormValidator.validateRule(value, rule);
      if (error) {
        return error;
      }
    }
    return null;
  }

  private static validateRule(value: any, rule: IValidationRule): string | null {
    switch (rule.type) {
      case ValidationRuleType.REQUIRED:
        return FormValidator.validateRequired(value, rule);
      case ValidationRuleType.MIN:
        return FormValidator.validateMin(value, rule);
      case ValidationRuleType.MAX:
        return FormValidator.validateMax(value, rule);
      case ValidationRuleType.PATTERN:
        return FormValidator.validatePattern(value, rule);
      case ValidationRuleType.CUSTOM:
        return FormValidator.validateCustom(value, rule);
      default:
        return null;
    }
  }

  private static validateRequired(value: any, rule: IValidationRule): string | null {
    if (value === null || value === undefined || value === '') {
      return rule.message || 'This field is required';
    }
    return null;
  }

  private static validateMin(value: any, rule: IValidationRule): string | null {
    if (typeof value === 'number' && value < rule.value) {
      return rule.message || `Value must be at least ${rule.value}`;
    }
    if (typeof value === 'string' && value.length < rule.value) {
      return rule.message || `Must be at least ${rule.value} characters`;
    }
    return null;
  }

  private static validateMax(value: any, rule: IValidationRule): string | null {
    if (typeof value === 'number' && value > rule.value) {
      return rule.message || `Value must be at most ${rule.value}`;
    }
    if (typeof value === 'string' && value.length > rule.value) {
      return rule.message || `Must be at most ${rule.value} characters`;
    }
    return null;
  }

  private static validatePattern(value: any, rule: IValidationRule): string | null {
    if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
      return rule.message || 'Invalid format';
    }
    return null;
  }

  private static validateCustom(value: any, rule: IValidationRule): string | null {
    if (typeof rule.value === 'function') {
      const isValid = rule.value(value);
      return isValid ? null : rule.message || 'Invalid value';
    }
    return null;
  }
}

// Example validation rules
export const CommonValidationRules = {
  required: (): IValidationRule => ({
    type: ValidationRuleType.REQUIRED,
    message: 'This field is required'
  }),

  email: (): IValidationRule => ({
    type: ValidationRuleType.PATTERN,
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Invalid email address'
  }),

  phone: (): IValidationRule => ({
    type: ValidationRuleType.PATTERN,
    value: /^\+?[\d\s-]{10,}$/,
    message: 'Invalid phone number'
  }),

  minLength: (min: number): IValidationRule => ({
    type: ValidationRuleType.MIN,
    value: min,
    message: `Must be at least ${min} characters`
  }),

  maxLength: (max: number): IValidationRule => ({
    type: ValidationRuleType.MAX,
    value: max,
    message: `Must be at most ${max} characters`
  }),

  numeric: (): IValidationRule => ({
    type: ValidationRuleType.PATTERN,
    value: /^\d+$/,
    message: 'Must be a number'
  }),

  decimal: (): IValidationRule => ({
    type: ValidationRuleType.PATTERN,
    value: /^\d*\.?\d+$/,
    message: 'Must be a decimal number'
  })
};
