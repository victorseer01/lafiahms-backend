export class FormCalculator {
    static calculateBMI(weight: number, height: number): number {
      return Number((weight / Math.pow(height / 100, 2)).toFixed(2));
    }
  
    static calculateBSA(weight: number, height: number): number {
      // DuBois formula
      return Number((0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725)).toFixed(2));
    }
  
    static calculateAge(birthDate: Date): number {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  
    static calculateGFR(
      creatinine: number,
      age: number,
      isFemale: boolean,
      isBlack: boolean
    ): number {
      // MDRD formula
      let gfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203);
      if (isFemale) gfr *= 0.742;
      if (isBlack) gfr *= 1.212;
      return Number(gfr.toFixed(2));
    }
  }