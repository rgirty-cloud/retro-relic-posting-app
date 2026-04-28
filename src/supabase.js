import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Upload an image for a inventory record to Supabase Storage
 * @param {string} recordId - The ID of the inventory record
 * @param {File} file - The image file to upload
 * @returns {Promise<string|null>} The public URL of the uploaded image, or null on failure
 */
export async function uploadRecordImage(recordId, file) {
  try {
    // Get file extension from original filename
    const ext = file.name.split('.').pop().toLowerCase()
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    
    if (!validExtensions.includes(ext)) {
      console.error('Invalid file type. Supported: jpg, jpeg, png, gif, webp')
      alert('Invalid file type. Please use jpg, jpeg, png, gif, or webp')
      return null
    }

    // Use jpg as fallback for unknown extensions
    const finalExt = ext.length <= 4 ? ext : 'jpg'
    const filePath = `${recordId}/main.${finalExt}`

    // Upload to Supabase Storage with upsert
    const { data, error } = await supabase.storage
      .from('record-images')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('record-images')
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update the inventory record with the image URL
    const { error: updateError } = await supabase
      .from('records')
      .update({ image_url: publicUrl })
      .eq('id', recordId)

    if (updateError) {
      console.error('Error updating record with image URL:', updateError)
      alert('Image uploaded but failed to save URL. Please try again.')
      return null
    }

    return publicUrl
  } catch (err) {
    console.error('Unexpected error during image upload:', err)
    alert('An unexpected error occurred. Please try again.')
    return null
  }
}