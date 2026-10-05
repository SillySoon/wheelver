// src/utils/validation.ts

/** Strict check for a 24-character hex ObjectId (Mongoose also accepts any 12-character string). */
export const isValidObjectId = (id: string): boolean => /^[a-f\d]{24}$/i.test(id);
