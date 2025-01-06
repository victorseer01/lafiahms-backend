export interface ITenant {
  id: string;
  name: string;
  domain: string;
  implementationId?: string;
  subscriptionPlan: string;
  status: string;
  createdAt: Date;
}
