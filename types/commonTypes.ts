export interface OrganizationDTO {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  timezone: string;
  locale: string;
  defaultCurrency: string;
  memberCount: number;
}
