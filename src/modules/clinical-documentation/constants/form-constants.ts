import { FormStatus } from "../enums/form-status.enum";
import { FORM_STATUS_DESCRIPTIONS } from "../types/form-status.types";

export const FORM_STATUS_METADATA = {
    [FormStatus.DRAFT]: {
      label: 'Draft',
      color: 'gray',
      icon: 'draft',
      editable: true,
      description: FORM_STATUS_DESCRIPTIONS[FormStatus.DRAFT]
    },
    [FormStatus.COMPLETED]: {
      label: 'Completed',
      color: 'blue',
      icon: 'check',
      editable: true,
      description: FORM_STATUS_DESCRIPTIONS[FormStatus.COMPLETED]
    },
    [FormStatus.SIGNED]: {
      label: 'Signed',
      color: 'green',
      icon: 'signature',
      editable: false,
      description: FORM_STATUS_DESCRIPTIONS[FormStatus.SIGNED]
    },
    [FormStatus.ARCHIVED]: {
      label: 'Archived',
      color: 'purple',
      icon: 'archive',
      editable: false,
      description: FORM_STATUS_DESCRIPTIONS[FormStatus.ARCHIVED]
    },
    [FormStatus.VOIDED]: {
      label: 'Voided',
      color: 'red',
      icon: 'trash',
      editable: false,
      description: FORM_STATUS_DESCRIPTIONS[FormStatus.VOIDED]
    }
  };
  