/**
 * MF-1 Step 1: Idea and Direction Notes (Admin & Creator alignment)
 */

export interface ProjectNote {
  id: string;
  projectId: string;
  senderId: string;
  sender?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  message: string;
  createdAt: string;
}

export interface SendProjectNoteInput {
  message: string;
}
