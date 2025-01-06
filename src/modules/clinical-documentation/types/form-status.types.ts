import { FormStatus } from "../enums/form-status.enum";

export type FormStatusTransition = {
    [key in FormStatus]: FormStatus[];
  };
  
  export const FORM_STATUS_TRANSITIONS: FormStatusTransition = {
    [FormStatus.DRAFT]: [FormStatus.COMPLETED, FormStatus.VOIDED],
    [FormStatus.COMPLETED]: [FormStatus.SIGNED, FormStatus.DRAFT, FormStatus.VOIDED],
    [FormStatus.SIGNED]: [FormStatus.ARCHIVED, FormStatus.VOIDED],
    [FormStatus.ARCHIVED]: [FormStatus.VOIDED],
    [FormStatus.VOIDED]: []
  };
  
  export const FORM_STATUS_DESCRIPTIONS: Record<FormStatus, string> = {
    [FormStatus.DRAFT]: 'Form is in draft state and can be edited',
    [FormStatus.COMPLETED]: 'Form has been completed but not signed',
    [FormStatus.SIGNED]: 'Form has been signed by authorized personnel',
    [FormStatus.ARCHIVED]: 'Form has been archived and cannot be modified',
    [FormStatus.VOIDED]: 'Form has been voided and is no longer valid'
  };