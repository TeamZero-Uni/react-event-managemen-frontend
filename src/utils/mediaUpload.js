import { supabase } from './supabaseClient';

export async function uploadFile(file) {
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('event-posters')
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('event-posters')
    .getPublicUrl(fileName);

  console.log("Image URL:", urlData.publicUrl);
  return urlData.publicUrl;
}