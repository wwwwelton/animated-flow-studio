// Controlled HTTP fixture; does not assert live Google availability.
const fs=require('node:fs');
module.exports=async function fontFixture(page){
 const font=fs.readFileSync(process.env.AFS_TEST_FONT_PATH||'/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf');
 let requests=0;
 await page.route('https://fonts.googleapis.com/**',route=>{requests++;return route.fulfill({status:200,contentType:'text/css',headers:{'access-control-allow-origin':'*'},body:'@font-face{font-family:"Inter";src:url(https://fonts.gstatic.com/fixture.ttf) format("truetype");font-weight:400 700;font-style:normal;}'});});
 await page.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/ttf',headers:{'access-control-allow-origin':'*'},body:font}));
 return ()=>requests;
};
