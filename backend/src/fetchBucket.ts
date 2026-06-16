import fs from 'fs';
import path from 'path';

export const fetchFiles = async () => {
  try {
    const baseNames = [
      "parle g", "Parle g", "Parle G", "parle G",
      "parle_g", "Parle_G", "parleg", "Parleg",
      "parle-g", "Parle-g", "Parle-G",
      "parle", "Parle",
      "buscuits", "Buscuits", "biscuits", "Biscuits",
      "parle g buscuits", "Parle G Buscuits", "Parle g buscuits", "parle G buscuits",
      "parle_g_buscuits", "Parle_G_Buscuits", "parle g biscuits", "Parle G Biscuits"
    ];
    const extensions = ["", ".jpg", ".jpeg", ".png", ".jfif", ".webp", ".JPG", ".PNG", ".JPEG", ".svg"];
    
    const validUrls: string[] = [];
    const maxConcurrency = 10;
    
    let promises = [];
    for (const name of baseNames) {
      for (const ext of extensions) {
        const url = `https://kfosvbmzijezatgezbxa.supabase.co/storage/v1/object/public/product-images/${encodeURIComponent(name)}${ext}`;
        promises.push(
          fetch(url, { method: 'HEAD' }).then(res => {
            if (res.status === 200) {
              validUrls.push(url);
            }
          }).catch(() => {})
        );
      }
    }
    
    for (let i = 0; i < promises.length; i += maxConcurrency) {
      await Promise.all(promises.slice(i, i + maxConcurrency));
    }
    
    fs.writeFileSync(path.join(__dirname, '../../valid_urls_5.json'), JSON.stringify(validUrls, null, 2));
  } catch (err: any) {
  }
};
