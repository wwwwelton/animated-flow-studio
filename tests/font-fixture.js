// Controlled HTTP fixture; does not assert live Google availability.
const fs=require('node:fs'),path=require('node:path');
function readTestFont(){
 const override=process.env.AFS_TEST_FONT_PATH;
 const file=override||path.join(__dirname,'fixtures','DejaVuSans.ttf');
 try{return fs.readFileSync(file);}catch(error){
  const hint=override?'Corrija AFS_TEST_FONT_PATH ou remova essa variável para usar a fonte incluída.':'Extraia novamente o pacote completo, incluindo tests/fixtures.';
  throw new Error(`Não foi possível ler a fonte de teste: ${file}. ${hint}`,{cause:error});
 }
}
module.exports=async function fontFixture(page){
 const font=readTestFont();
 let requests=0;
 await page.route('https://fonts.googleapis.com/**',route=>{requests++;return route.fulfill({status:200,contentType:'text/css',headers:{'access-control-allow-origin':'*'},body:'@font-face{font-family:"Inter";src:url(https://fonts.gstatic.com/fixture.ttf) format("truetype");font-weight:400 700;font-style:normal;}'});});
 await page.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/ttf',headers:{'access-control-allow-origin':'*'},body:font}));
 return ()=>requests;
};
module.exports.readTestFont=readTestFont;
