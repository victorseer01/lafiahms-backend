interface ProcessingContext {
    data: Record<string, any>;
    rules?: ProcessingRule[];
  }
  
  interface ProcessingRule {
    field: string;
    type: 'transform' | 'calculate' | 'validate';
    rule: any;
  }
  
  export class FormProcessor {
    static processFormData(context: ProcessingContext): Record<string, any> {
      const { data, rules = [] } = context;
      let processedData = { ...data };
  
      for (const rule of rules) {
        switch (rule.type) {
          case 'transform':
            processedData = FormProcessor.applyTransformation(processedData, rule);
            break;
          case 'calculate':
            processedData = FormProcessor.applyCalculation(processedData, rule);
            break;
          case 'validate':
            FormProcessor.applyValidation(processedData, rule);
            break;
        }
      }
  
      return processedData;
    }
  
    private static applyTransformation(data: Record<string, any>, rule: ProcessingRule): Record<string, any> {
      const { field, rule: transform } = rule;
      const value = data[field];
  
      if (value === undefined) return data;
  
      const transformedData = { ...data };
      
      switch (transform.type) {
        case 'uppercase':
          transformedData[field] = String(value).toUpperCase();
          break;
        case 'lowercase':
          transformedData[field] = String(value).toLowerCase();
          break;
        case 'trim':
          transformedData[field] = String(value).trim();
          break;
        case 'number':
          transformedData[field] = Number(value);
          break;
        case 'boolean':
          transformedData[field] = Boolean(value);
          break;
        case 'date':
          transformedData[field] = new Date(value);
          break;
        case 'custom':
          if (typeof transform.function === 'function') {
            transformedData[field] = transform.function(value);
          }
          break;
      }
  
      return transformedData;
    }
  
    private static applyCalculation(data: Record<string, any>, rule: ProcessingRule): Record<string, any> {
      const { field, rule: calculation } = rule;
      const calculatedData = { ...data };
  
      if (typeof calculation.function === 'function') {
        calculatedData[field] = calculation.function(data);
      }
  
      return calculatedData;
    }
  
    private static applyValidation(data: Record<string, any>, rule: ProcessingRule): void {
      const { field, rule: validation } = rule;
      const value = data[field];
  
      if (typeof validation.function === 'function' && !validation.function(value, data)) {
        throw new Error(`Validation failed for field ${field}`);
      }
    }
  
    static sanitizeFormData(data: Record<string, any>): Record<string, any> {
      const sanitized: Record<string, any> = {};
  
      for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined) {
          continue;
        }
  
        if (typeof value === 'string') {
          sanitized[key] = value.trim();
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            typeof item === 'string' ? item.trim() : item
          );
        } else if (typeof value === 'object') {
          sanitized[key] = FormProcessor.sanitizeFormData(value);
        } else {
          sanitized[key] = value;
        }
      }
  
      return sanitized;
    }
  }