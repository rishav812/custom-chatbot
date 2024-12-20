export const DOCUMENT_RESPONSE_TYPE = {
  pending: "pending",
  deleting: "deleting",
  cancelled: "cancelled",
};

export interface IDocumentList {
  name: string;
  url: string;
  status: string;
  created_ts: Date;
  id?: string;
  user_id?: number;
}
