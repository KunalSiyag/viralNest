import { extractInstagram } from './instagram';

async function test() {
  const url = 'https://www.instagram.com/reel/DIxUdkPy0ga/';
  console.log(`Extracting: ${url}`);
  try {
    const result = await extractInstagram(url);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

test().then(() => process.exit(0));
