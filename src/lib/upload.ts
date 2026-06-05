import { supabase } from "@/integrations/supabase/client";

// Uploads bucket is private. We return a long-lived signed URL so edge
// functions (which fetch the file immediately) can read it.
export const uploadFile = async (file: File, userId: string): Promise<string> => {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signErr } = await supabase.storage
    .from("uploads")
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (signErr || !data) throw signErr ?? new Error("Falha ao gerar URL do ficheiro");
  return data.signedUrl;
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const fileMime = (file: File) => file.type || "application/octet-stream";
