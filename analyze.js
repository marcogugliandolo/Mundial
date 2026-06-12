async function main() {
  const url = "https://cdn.myfonts.net/cdn-cgi/image/width=460,height=auto,fit=contain,format=auto/images/pim//10001/144439_568833b168d29c30bbdca4a137d65479.png";
  const apiUrl = `https://api.ocr.space/parse/imageurl?apikey=helloworld&url=${encodeURIComponent(url)}`;
  const res = await fetch(apiUrl);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
