export type PropertyStatus =
  | "Automation"
  | "Waiting for Reply"
  | "Arranging"
  | "Viewing Confirmed"
  | "V - Shortlisted"
  | "V - Not Interested"
  | "NV - Not Suitable"
  | "Unavailable";

export const PIPELINE_STATUSES: PropertyStatus[] = [
  "Automation",
  "Waiting for Reply",
  "Arranging",
  "Viewing Confirmed",
  "V - Shortlisted",
  "V - Not Interested",
  "NV - Not Suitable",
  "Unavailable",
];

export const CLIENT_VISIBLE_STATUSES: PropertyStatus[] = [
  "Arranging",
  "Viewing Confirmed",
  "V - Shortlisted",
];

export const STATUS_COLORS: Record<PropertyStatus, { bg: string; text: string; border: string }> = {
  "Automation":         { bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
  "Waiting for Reply":  { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200" },
  "Arranging":          { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-200" },
  "Viewing Confirmed":  { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200" },
  "V - Shortlisted":    { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-300" },
  "V - Not Interested": { bg: "bg-red-50",     text: "text-red-600",    border: "border-red-200" },
  "NV - Not Suitable":  { bg: "bg-orange-50",  text: "text-orange-600", border: "border-orange-200" },
  "Unavailable":        { bg: "bg-gray-50",    text: "text-gray-400",   border: "border-gray-100" },
};

export interface ClientSearch {
  id: string;
  client_name: string;
  client_slug: string;
  search_criteria: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  search_id: string;
  status: PropertyStatus;
  project_name: string | null;
  agent_name: string | null;
  agent_number: string | null;
  price: number | null;
  price_condition: string | null;
  search_date: string | null;
  listed_date: string | null;
  street_address: string | null;
  mrt_distance: string | null;
  beds: number | null;
  baths: number | null;
  size_sqft: number | null;
  psf: number | null;
  property_type: string | null;
  floor_level: string | null;
  tenanted: string | null;
  listing_id: string | null;
  source: string | null;
  description: string | null;
  property_link: string | null;
  summary: string | null;
  whatsapp_link: string | null;
  viewing_datetime: string | null;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  notes?: PropertyNote[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  created_at: string;
}

export interface PropertyNote {
  id: string;
  property_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
}
