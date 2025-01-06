export interface IFormComponent {
    id: string;
    type: FormComponentType;
    label: string;
    required?: boolean;
    validation?: IValidationRule[];
    properties?: Record<string, any>;
  }
  
  export interface IValidationRule {
    type: ValidationRuleType;
    value?: any;
    message?: string;
  }
  
  export enum FormComponentType {
    TEXT = 'text',
    NUMBER = 'number',
    DATE = 'date',
    SELECT = 'select',
    MULTI_SELECT = 'multi_select',
    CHECKBOX = 'checkbox',
    RADIO = 'radio',
    TEXTAREA = 'textarea',
    VITALS = 'vitals',
    LAB_RESULT = 'lab_result',
    MEDICATION = 'medication',
    FILE_UPLOAD = 'file_upload'
  }
  
  export enum ValidationRuleType {
    REQUIRED = 'required',
    MIN = 'min',
    MAX = 'max',
    PATTERN = 'pattern',
    CUSTOM = 'custom'
  }