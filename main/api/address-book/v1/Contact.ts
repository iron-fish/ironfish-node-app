import { z } from "zod";

import Entity from "./Entity";

export const ContactSchema = z.object({
  name: z.string(),
  address: z.string(),
});

interface Contact extends Entity {
  name: string;
  address: string;
  order?: number;
}

export default Contact;
