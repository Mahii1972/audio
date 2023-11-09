import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // Access the audio data from request.body
const formData = await request.formData();
const file = formData.get('audio');
    


    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the audio data to a file in the root directory
    const filePath = path.join(process.cwd(), 'audio.wav');
    await fs.promises.writeFile(filePath, buffer);


    return new Response(JSON.stringify({ message: 'Audio data received and saved' }), { status: 200 });
  } catch (error) {
    console.error('Error processing audio data:', error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}