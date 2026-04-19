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

export async function deleteFileByPublicUrl(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return;

  const marker = '/storage/v1/object/public/event-posters/';
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return;

  const encodedPath = publicUrl.slice(markerIndex + marker.length).split('?')[0];
  const filePath = decodeURIComponent(encodedPath);
  if (!filePath) return;

  const { error } = await supabase.storage
    .from('event-posters')
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
}