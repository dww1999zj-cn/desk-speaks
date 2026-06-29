export interface OfficePick {
  id: string;
  category: string;
  name: string;
  hook: string;
  emoji: string;
  affiliateUrl: string;
}

export interface OfficePickCatalog {
  categories: readonly string[];
  picks: OfficePick[];
}
